#!/bin/sh
cd ./web-server
forever stop app.js
forever stop appDbUpdate.js