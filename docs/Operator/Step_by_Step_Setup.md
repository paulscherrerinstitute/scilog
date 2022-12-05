# Step by Step manual to Setup SciCat without Containers

## Setup Backend

### Mongo

The first part is to setup a Mongo DB, if not yet existing. You will need at least version 4.4 . In the simplest case a simple
```
yum install mongodb-server
```
(on RedHat systems) or similar will suffice.

A production ready setup however may require to setup a replicated DB server. Follow the Mongo DB Manuals in this case. E.g. at PSI we operate a 3 fold relicated Mongo DB server. A convenient option is to use the [Percona distribution(https://www.percona.com)

The needed database will be created automatically when the API server starts.

### API Server

#### Prerequisites

First you need to have node/npm installed, follow instructions at https://nodejs.org/en/download/

```
npm version 6 or higher
Node version 14 or higher
```

#### Get code
```
git clone https://github.com/paulscherrerinstitute/scilog.git
cd scilog
git checkout main
```

#### Start Backend
```
# adjust configuration if needed (functionalAccounts.json), see section below
cd sci-log-db
npm install
npm run test
npm run start
```

After that the API server is running on http://localhost:3000 . You can check that it is working by navigating to the [API explorer](http://localhost:3000/explorer)

#### Add Mongo indices

Just execute the commands in file sci-log-db/createIndexCommands.txt in a Mongo shell connected to your scilog repository.

#### Start Frontend
In a separate terminal type the following commands
```
# you may want to adjust the configuration before (scilog/src/assets/config.json), see below
cd scilog
npm install
npm run test
npm run start
```

After that the frontend can be reached at http://localhost:4200

### Setup configuration

There are the following configuration files that need to be adjusted to your situation.

#### Backend

1. `sci-log-db/functionalAccounts.json` : defines the functional accounts, such as admin, beamline accounts etc
2. `sci-log-db/datasource.json` : defines the connection to the Mongo DB , default settings are in the code
3. `oidc.json` : TODO

```
# Example functionalAccounts.json with admin and one beamline account
[{
        "username": "scilog-admin",
        "firstName": "Admin",
        "lastName": "Scilog",
        "password": "...",
        "email": "scilog-admin@gmail.com",
        "roles": [
            "admin",
            "any-authenticated-user"
        ]
    },
    {
        "username": "swissfelaramis-alvra",
        "firstName": "Aramis",
        "lastName": "Alvra",
        "password": "...",
        "email": "swissfelaramis-alvra@gmail.com",
        "roles": [
            "swissfelaramis-alvra",
            "any-authenticated-user"
        ]
        "location": "/PSI/SWISSFEL/ARAMIS-ALVRA
    },

]


# Example datasource.json for connection to replica set cluster ()
{
    "name": "mongo",
    "connector": "mongodb",
    "url":"mongodb://scilogMaster:your-PWo@my-cluster-name-rs0.mongo.svc.cluster.local/scilog-development?replicaSet=rs0&authSource=scilog-development",
    "host": "",
    "port": "",
    "user": "",
    "password": "",
    "database": "scilog-development",
    "useNewUrlParser": true,
    "useUnifiedTopology": true
}


### Example OIDC configuration oidc.json
{
    "session": false,
    "provider": "oidc",
    "authScheme": "openid connect",
    "module": "passport-openidconnect",
    "failureFlash": true,
    "issuer": "https://kc.development.psi.ch/auth/realms/awi",
    "authorizationURL": "https://kc.development.psi.ch/auth/realms/awi/protocol/openid-connect/auth",
    "tokenURL": "https://kc.development.psi.ch/auth/realms/awi/protocol/openid-connect/token",
    "userInfoURL": "https://kc.development.psi.ch/auth/realms/awi/protocol/openid-connect/userinfo",
    "clientID": "scilog",
    "clientSecret": "yourSecretHere",
    "callbackURL": "http://localhost:3000/auth/keycloak/callback/",
    "scope": ["email", "profile", "openid"],
    "successRedirect": "http://localhost:4200/login",
    "skipUserProfile": false
}
```
#### Frontend

1. `scilog/src/assets/config.json` : defines the API server endpoint and OIDC connection details

```
# Example config.json file
{
    "lbBaseURL": "http://localhost:3000/",
    "oAuth2Endpoint": {
        "authURL": "auth/thirdparty/keycloak",
        "displayText": "keycloak IDP"
    }
}
```




