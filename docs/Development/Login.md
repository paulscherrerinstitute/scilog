# Login

Two login routes are provided - for functional accounts and for AD/LDAP logins.

TODO: Update the following

The login method needs to be defined in the client configuartion (environment file) usign the field `externalAuthEndpoint`. For example `externalAuthEndpoint: "/auth/msad"`.
See [loopback docs](https://loopback.io/doc/en/lb3/Third-party-login-using-Passport.html)

For non-third party logins defined, no UserIdentity is created.  These are special users for admin purposes including beamline specific users for ingestion etc.
These users should be defined in a seperate secrets repo in a file called functionalAccounts.json and are read by createFunctionalAccounts.js in catamel e.g.
```
    [{
        "account": "admin",
        "password": "pass",
        "email": "admin@domain.com",
        "role": "admin",
        "global": true
    }, {
        "account": "ingestor",
        "password": "pass",
        "email": "ingestor@domain.com",
        "role": "ingestor",
        "global": true
    }]
```
