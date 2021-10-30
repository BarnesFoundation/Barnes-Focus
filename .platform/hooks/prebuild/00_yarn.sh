#!/usr/bin/env bash
echo "Starting yarn steps..."; mkdir -p /home/my_random_dir_1
curl --silent --location https://rpm.nodesource.com/setup_12.x | sudo bash -
yum -y install nodejs
wget https://dl.yarnpkg.com/rpm/yarn.repo -O /etc/yum.repos.d/yarn.repo;

echo "Installing packages"
yum -y install yarn;

echo $PWD; yarn; echo $(ls)
chown webapp:webapp .bundle/config; mkdir -p /home/webapp
chown webapp:webapp /home/webapp; chmod 700 /home/webapp; echo $(ls /var/app/staging)

echo "Making environment variables available"
export $(cat /opt/elasticbeanstalk/deployment/env | xargs)