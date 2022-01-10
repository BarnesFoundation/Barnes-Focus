#!/bin/bash
export $(cat /opt/elasticbeanstalk/deployment/env | xargs)

# cd /var/app/staging 
# su webapp -c "yarn --production";

# bundle install
# bundle exec rake assets:precompile
# chown -R webapp:webapp /var/app/staging/