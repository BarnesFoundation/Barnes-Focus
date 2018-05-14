files:
  "/opt/elasticbeanstalk/hooks/appdeploy/post/50_restart_delayed_job.sh":
    mode: "000755"
    owner: root
    group: root
    encoding: plain
    content: |
      #!/usr/bin/env bash

      EB_SCRIPT_DIR=$(/opt/elasticbeanstalk/bin/get-config container -k script_dir)
      EB_APP_CURRENT_DIR=$(/opt/elasticbeanstalk/bin/get-config container -k app_deploy_dir)
      EB_APP_USER=$(/opt/elasticbeanstalk/bin/get-config container -k app_user)
      EB_SUPPORT_DIR=$(/opt/elasticbeanstalk/bin/get-config container -k support_dir)
      EB_APP_PIDS_DIR=$(/opt/elasticbeanstalk/bin/get-config container -k app_pid_dir)

      . $EB_SUPPORT_DIR/envvars
      . $EB_SCRIPT_DIR/use-app-ruby.sh

      cd $EB_APP_CURRENT_DIR

      # Switch to the webapp user.  Worker shouldn't be run as root.
      su -s /bin/bash -c "bundle exec bin/delayed_job --pid-dir=$EB_APP_PIDS_DIR restart" $EB_APP_USER
