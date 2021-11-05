#!/bin/bash
export $(cat /opt/elasticbeanstalk/deployment/env | xargs)

cd /var/app/staging 
yarn --production

bundle exec rake assets:precompile
chown -R webapp:webapp /var/app/staging/