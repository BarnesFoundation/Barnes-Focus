#!/bin/sh
echo "Bundle install and yarn install"
su webapp -c "yarn --production";

echo "Performing permissions work"
# chown -R webapp:webapp .bundle; 
chmod -R 777 .bundle;
# chown -R webapp:webapp vendor; 
chmod -R 777 vendor;

echo "Permission for home/webapp"
mkdir -p /home/webapp
chmod 700 /home/webapp;


echo "Making environment variables available"
export $(cat /opt/elasticbeanstalk/deployment/env | xargs)
