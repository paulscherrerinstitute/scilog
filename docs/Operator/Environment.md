#  Environment files

TODO make this file obsolete


The following  files provide the environment dependent configuration information for backend and frontend:

* datasources.json - This sets up your connection to Mongo and should follow the syntax outlined in loopback
* scilog/src/assets/config.json . Configuration of the frontend

Example
```
{
    "lbBaseURL": "http://localhost:3000/",
    "oAuth2Endpoint": {
        "authURL": "auth/thirdparty/keycloak",
        "displayText": "keycloak IDP"
    }
}
```