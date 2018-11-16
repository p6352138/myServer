#!/bin/sh
cd ./game-server/tools
node updateServerConfig.js $1 $2 $3
echo 'update servers config done.'
