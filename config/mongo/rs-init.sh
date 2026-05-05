#!/bin/bash

mongo <<EOF
var config = {
    "_id": "rs0",
    "members": [
        {"_id": 0, "host": "mongo:27017"}
    ]
};
rs.initiate(config, { force: true });
rs.status();
EOF
