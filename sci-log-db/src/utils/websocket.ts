import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {AnyObject} from '@loopback/repository';
import {SciLogDbApplication} from '../application';
import {MongoDataSource} from '../datasources';

export interface WebsocketClient {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  ws?: any;
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  user?: any;
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  config?: any;
}
export interface WebsocketContainer {
  [index: string]: WebsocketClient[];
}

export async function startWebsocket(app: SciLogDbApplication) {
  const Mongo = require('mongodb');
  const WebSocket = require('ws');
  const websocketMap: WebsocketContainer = {};

  const jwtService = await app.get(TokenServiceBindings.TOKEN_SERVICE);

  // console.log(app.restServer)
  const wss = new WebSocket.Server({server: app.restServer.httpServer?.server});

  // console.log(app.restServer)
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  wss.on('connection', function connection(ws: any) {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    ws.on('message', async (message: any) => {
      const msgContainer = JSON.parse(message);
      // eslint-disable-next-line  no-prototype-builtins
      if (msgContainer.hasOwnProperty('message')) {
        // eslint-disable-next-line  no-prototype-builtins
        if (msgContainer['message'].hasOwnProperty('join')) {
          // eslint-disable-next-line  no-prototype-builtins
          if (msgContainer['message'].hasOwnProperty('token')) {
            // msgContainer['message']['token']
            // console.log("retrieving data")
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            let userProfileFromToken: any = null;
            try {
              userProfileFromToken = await jwtService.verifyToken(
                msgContainer['message']['token'],
              );
            } catch (error) {
              ws.send(JSON.stringify({error: 'Token invalid'}));
            }
            if (userProfileFromToken != null) {
              const logbookID: string = msgContainer['message']['join'];
              // eslint-disable-next-line  @typescript-eslint/no-explicit-any
              const config: any = msgContainer['message']['config'];
              // eslint-disable-next-line  no-prototype-builtins
              if (websocketMap.hasOwnProperty(logbookID)) {
                websocketMap[logbookID].push({
                  ws: ws,
                  user: userProfileFromToken,
                  config: config,
                });
              } else {
                websocketMap[logbookID] = [
                  {ws: ws, user: userProfileFromToken, config: config},
                ]; //push({ws: ws, user: userProfileFromToken});
              }
            }
          }
        }
      }
    });

    ws.isAlive = true;
    ws.on('pong', () => {
      heartbeat(ws);
    });

    // handle disconnection
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    ws.on('close', function close(msg: any) {
      // console.log("Disconnected", msg);
      // console.log(websocketMap)
      for (const key in websocketMap) {
        websocketMap[key] = websocketMap[key].filter(client => {
          // console.log(client.ws.readyState)
          return client.ws.readyState === WebSocket.OPEN;
        });
        if (websocketMap[key].length === 0) {
          delete websocketMap[key];
        }
      }
      // console.log(websocketMap)
    });

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    ws.on('error', (err: any) => {
      console.log(err);
    });
  });

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const heartbeat = (ws: any) => {
    ws.isAlive = true;
    // console.log("alive")
  };
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const ping = (ws: any) => {
    ws.send(JSON.stringify({ping: 'ping'}));
    // console.log('server: ping');
  };

  setInterval(() => {
    // console.log("running ping routine")
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    wss.clients.forEach(async (ws: any) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping(() => {
        ping(ws);
      });
    });
  }, 10000);

  const getId = (function () {
    const findParentLogbook = (
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      db: any,
      parentId: string,
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      sendSocketMessage: any,
    ) => {
      const parentDoc = db
        .collection('Basesnippet')
        .findOne({_id: Mongo.ObjectId(parentId)});
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      return parentDoc.then((document: any) => {
        if (document.snippetType === 'logbook') {
          sendSocketMessage(document._id);
          return document._id;
        } else if (document.parentId) {
          findParentLogbook(db, document.parentId, sendSocketMessage).then(
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            (d: any) => {
              // handle case when last parent is not a a logbook (document is null)
              if (d) {
                return d._id;
              } else {
                return null;
              }
            },
          );
        } else {
          return null;
        }
      });
    };
    return {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      parentId: function (db: any, parentId: string, callback: any) {
        return findParentLogbook(db, parentId, callback);
      },
    };
  })();

  const dataSourceSettings: AnyObject = (app.getSync(
    'datasources.mongo',
  ) as MongoDataSource).settings;
  Mongo.MongoClient.connect(dataSourceSettings.url, {
    useUnifiedTopology: dataSourceSettings.useUnifiedTopology,
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  }).then((client: any) => {
    const db = client.db(dataSourceSettings.database);
    const collection = db.collection('Basesnippet');
    const changeStream = collection.watch(); //[{'$match': {'fullDocument.ownerGroup': 'p17301'}}]
    // console.log(collection);
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    changeStream.on('change', function (change: any) {
      if (change.fullDocument) {
        change.fullDocument.ownerGroup = change.fullDocument.readACL?.[0] ?? '';
        change.fullDocument.accessGroups = change.fullDocument.readACL ?? [];
      }
      if (change.operationType !== 'delete') {
        getId.parentId(db, change.documentKey._id, async (id: string) => {
          if (id != null) {
            // console.log("sending data to group ", id);
            // console.log("change: ", change);

            // make sure all subscribers have the permission to read the changestream
            const doc = await collection.findOne({
              _id: Mongo.ObjectId(change.documentKey._id),
            });
            // console.log(websocketMap[id])
            if (typeof websocketMap[id] != 'undefined') {
              // eslint-disable-next-line  @typescript-eslint/no-explicit-any
              websocketMap[id].forEach((c: any) => {
                if (
                  doc['readACL'].some((r: string) => c.user.roles.includes(r))
                ) {
                  if (matchesFilterSettings(doc, c.config))
                    c.ws.send(JSON.stringify({'new-notification': change}));
                }
              });
            }
            // delete field
            // NB: In order to have everyone notified about the deletion, this
            //      cannot be done by simply sending a delete command. Instead
            //      an update of the document is requested and the tags are
            //      set to _delete_.
            // if (change.operationType === 'update') {
            //   const updatedFields = change.updateDescription.updatedFields;
            //   if (updatedFields.deleted) {
            //     console.log('delete');
            //     console.log('updated doc', doc);
            //     if (doc?.versionable) {
            //       const history = await collection.findOne({
            //         parentId: Mongo.ObjectId(doc.parentId),
            //         snippetType: 'history',
            //       });
            //       console.log('history: ', history);
            //       collection.updateOne(
            //         {_id: Mongo.ObjectId(change.documentKey._id)},
            //         {$set: {parentId: Mongo.ObjectId(history._id)}},
            //       );
            //     } else {
            //       collection.deleteOne({
            //         _id: Mongo.ObjectId(change.documentKey._id),
            //       });
            //     }
            //   }
            // }
            // io.to(id).emit('new-notification', change);
          }
        });
      }
    });
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    changeStream.on('error', (err: any) => {
      console.log('Error in ChangeStream:');
      console.log(err);
    });
  });
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
function matchesFilterSettings(snippet: any, config: any): boolean {
  const acceptSnippet = true;
  if (typeof config.filter.tags != 'undefined') {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    config.filter.tags.forEach((tag: any) => {
      if (!snippet.tags.includes(tag)) {
        return false;
      }
    });
  }

  if (typeof config.filter.snippetType != 'undefined') {
    if (!config.filter.snippetType.includes(snippet.snippetType)) {
      return false;
    }
  }
  return acceptSnippet;
}
