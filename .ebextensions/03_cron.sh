files:
  "/opt/elasticbeanstalk/hooks/appdeploy/post/01_cron.sh":
    mode: "000755"
    owner: root
    group: root
    content: |
      #!/usr/bin/env bash
      # Using similar syntax as the appdeploy pre hooks that is managed by AWS
      set -xe

      EB_SCRIPT_DIR=$(/opt/elasticbeanstalk/bin/get-config container -k script_dir)
      EB_SUPPORT_DIR=$(/opt/elasticbeanstalk/bin/get-config container -k support_dir)
      EB_DEPLOY_DIR=$(/opt/elasticbeanstalk/bin/get-config container -k app_deploy_dir)

      . $EB_SUPPORT_DIR/envvars
      . $EB_SCRIPT_DIR/use-app-ruby.sh

      cd $EB_DEPLOY_DIR
      su -c "bundle exec whenever --update-cron"
      su -c "crontab -l"
