#!/bin/sh
cd ./game-server/tools
node updateServerConfig.js $1 $2
echo 'update servers config done.'
