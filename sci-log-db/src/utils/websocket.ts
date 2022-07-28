import {TokenService} from '@loopback/authentication';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {SciLogDbApplication} from '../application';

export interface WebsocketClient {
  ws?: any,
  user?: any,
  config?: any
}
export interface WebsocketContainer {
  [index: string]: WebsocketClient[];
}


export async function startWebsocket(app: SciLogDbApplication) {
  const Mongo = require('mongodb');
  const WebSocket = require('ws');
  var websocketMap: WebsocketContainer = {};

  let jwtService: TokenService;
  jwtService = await app.get(TokenServiceBindings.TOKEN_SERVICE);

  // console.log(app.restServer)
  let wss = new WebSocket.Server({server: app.restServer.httpServer?.server});

  // console.log(app.restServer)
  wss.on("connection", function connection(ws: any) {
    ws.on('message', async (message: any) => {
      let msgContainer = JSON.parse(message);
      if (msgContainer.hasOwnProperty('message')) {
        if (msgContainer['message'].hasOwnProperty('join')) {
          if (msgContainer['message'].hasOwnProperty('token')) {
            // msgContainer['message']['token']
            // console.log("retrieving data")
            let userProfileFromToken: any = null;
            try {
              userProfileFromToken = await jwtService.verifyToken(msgContainer['message']['token']);
            } catch (error) {
              ws.send(JSON.stringify({'error': 'Token invalid'}));
            }
            if (userProfileFromToken != null) {
              let logbookID: string = msgContainer['message']['join'];
              let config: any = msgContainer['message']['config'];
              if (websocketMap.hasOwnProperty(logbookID)) {
                websocketMap[logbookID].push({ws: ws, user: userProfileFromToken, config: config})
              } else {
                websocketMap[logbookID] = [{ws: ws, user: userProfileFromToken, config: config}];//push({ws: ws, user: userProfileFromToken});
              }
            }

          }
        }
      }

    });

    ws.isAlive = true
    ws.on('pong', () => {heartbeat(ws)})

    // handle disconnection
    ws.on("close", function close(msg: any) {
      // console.log("Disconnected", msg);
      // console.log(websocketMap)
      for (let key in websocketMap) {
        websocketMap[key] = websocketMap[key].filter(client => {
          // console.log(client.ws.readyState)
          return (client.ws.readyState == WebSocket.OPEN);
        })
        if (websocketMap[key].length == 0) {
          delete websocketMap[key];
        }
      }
      // console.log(websocketMap)
    });

    ws.on("error", (err: any) => {
      console.log(err);
    })
  });

  const heartbeat = (ws: any) => {
    ws.isAlive = true
    // console.log("alive")
  }
  const ping = (ws: any) => {
    ws.send(JSON.stringify({'ping': 'ping'}));
    // console.log('server: ping');
  }

  const interval = setInterval(() => {
    // console.log("running ping routine")
    wss.clients.forEach(async (ws: any) => {
      if (ws.isAlive === false) {
        return ws.terminate()
      }

      ws.isAlive = false
      ws.ping(() => {ping(ws)})
    })
  }, 10000)

  var getId = (function () {
    let findParentLogbook = (db: any, parentId: string, sendSocketMessage: any) => {
      const parentDoc = db.collection("Basesnippet").findOne({'_id': Mongo.ObjectId(parentId)});
      return parentDoc.then((document: any) => {
        if (document.snippetType == 'logbook') {
          sendSocketMessage(document._id);
          return document._id;
        } else if (document.parentId) {
          findParentLogbook(db, document.parentId, sendSocketMessage).then((document: any) => {
            // handle case when last parent is not a a logbook (document is null)
            if (document) {
              return document._id;
            } else {
              return null
            }
          });
        } else {
          return null;
        }
      });
    }
    return {
      parentId: function (db: any, parentId: string, callback: any) {
        return findParentLogbook(db, parentId, callback);
      }
    }
  })();

  Mongo.MongoClient.connect("mongodb://localhost:27017", {useUnifiedTopology: true})
    .then((client: any) => {
      const db = client.db("scilog");
      const collection = db.collection("Basesnippet");
      const changeStream = collection.watch();//[{'$match': {'fullDocument.ownerGroup': 'p17301'}}]
      // console.log(collection);
      changeStream.on("change", function (change: any) {
        if (change.operationType != 'delete') {
          getId.parentId(db, change.documentKey._id, (async (id: string) => {
            if (id != null) {
              console.log("sending data to group ", id);
              console.log("change: ", change);

              // make sure all subscribers have the permission to read the changestream
              let doc = await collection.findOne({'_id': Mongo.ObjectId(change.documentKey._id)});
              doc["accessGroups"].push(doc["ownerGroup"]);
              // console.log(websocketMap[id])
              if (typeof (websocketMap[id]) != 'undefined') {
                websocketMap[id].forEach((client: any) => {
                  if (doc["accessGroups"].some((r: string) => client.user.roles.includes(r))) {
                    if (matches_filter_settings(doc, client.config))
                      client.ws.send(JSON.stringify({'new-notification': change}));
                  }
                })
              }
              // delete field
              // NB: In order to have everyone notified about the deletion, this
              //      cannot be done by simply sending a delete command. Instead
              //      an update of the document is requested and the tags are
              //      set to _delete_.
              if (change.operationType == 'update') {
                let updatedFields = change.updateDescription.updatedFields
                if (updatedFields.deleted) {
                  console.log("delete");
                  console.log("updated doc", doc);
                  if (doc?.versionable) {
                    let history = await collection.findOne({'parentId': Mongo.ObjectId(doc.parentId), 'snippetType': 'history'});
                    console.log('history: ', history)
                    collection.updateOne({'_id': Mongo.ObjectId(change.documentKey._id)}, {$set: {'parentId': Mongo.ObjectId(history._id)}});
                  } else {
                    collection.deleteOne({"_id": Mongo.ObjectId(change.documentKey._id)});
                  }
                }
              }
              // io.to(id).emit('new-notification', change);

            }
          }));
        }
      });
      changeStream.on("error", (err: any) => {
        console.log("Error in ChangeStream:")
        console.log(err);
      })
    });
}

function matches_filter_settings(snippet: any, config: any): boolean {
  let accept_snippet = true;
  if (typeof config.filter.tags != "undefined") {
    config.filter.tags.forEach((tag: any) => {
      if (!snippet.tags.includes(tag)) {
        return false;
      }
    })
  }

  if (typeof config.filter.snippetType != 'undefined') {
    if (!config.filter.snippetType.includes(snippet.snippetType)) {
      return false;
    }
  }
  return accept_snippet;
}
