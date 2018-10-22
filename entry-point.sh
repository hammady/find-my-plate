#!/bin/bash
set -xe
ls /app
/app/wait-for-it.sh mongo:27017 -s -t 10
exec "$@"
