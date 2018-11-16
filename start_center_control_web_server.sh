#!/bin/sh
cd ./web-server
#forever start app.js
#forever start appDbUpdate.js
pm2 start ecosystem_center_control.config.js --env production