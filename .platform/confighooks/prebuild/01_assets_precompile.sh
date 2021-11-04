#!/bin/bash
echo "Running assets:precompile"
export $(cat /opt/elasticbeanstalk/deployment/env | xargs)
echo $(ls)
yarn --production
cd /var/app/staging; bundle exec rake assets:precompile
chown -R webapp:webapp /var/app/staging/