#!/bin/sh
cd ./web-server
forever start app.js
forever start appDbUpdate.js