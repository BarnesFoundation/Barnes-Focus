#!/usr/bin/env bash
echo "Starting yarn steps..."; mkdir -p /home/my_random_dir_1
curl --silent --location https://rpm.nodesource.com/setup_12.x | sudo bash -
yum -y install nodejs
wget https://dl.yarnpkg.com/rpm/yarn.repo -O /etc/yum.repos.d/yarn.repo;

echo "Installing packages with bundle and yarn"
su webapp -c "bundle install";
yum -y install yarn;
su webapp -c "yarn --production";

echo "Performing permissions work"
chown -R webapp:webapp .bundle; 
chmod -R 777 .bundle;
chown -R webapp:webapp vendor; 
chmod -R 777 vendor;


echo "Permission for home/webapp"
mkdir -p /home/webapp
chown webapp:webapp /home/webapp; 
chmod 700 /home/webapp;

echo "Making environment variables available"
export $(cat /opt/elasticbeanstalk/deployment/env | xargs)
/opt/elasticbeanstalk/bin/get-config environment | jq -r 'to_entries | .[] | "export \(.key)=\"\(.value)\""' > /etc/profile.d/env_vars.sh