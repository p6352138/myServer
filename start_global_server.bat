@echo off
call ./update_servers_config.bat %1 %2 %3
::cd ./game-server
pomelo start -e global_dev -d ./game-server
