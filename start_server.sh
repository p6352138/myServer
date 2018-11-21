#!/bin/sh
sh ./update_servers_config.sh $1 $2 $3
cd ./game-server
pomelo start -e production -D
