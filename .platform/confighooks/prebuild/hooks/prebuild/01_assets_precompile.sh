#!/bin/sh
echo "Bundle install and yarn install"
su webapp -c "yarn --production";

echo "Permission for home/webapp"
mkdir -p /home/webapp
chmod 700 /home/webapp;