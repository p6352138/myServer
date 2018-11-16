#!/bin/sh
cd ./web-server
#forever stop app.js
#forever stop appDbUpdate.js
pm2 stop ecosystem.config.js --env production