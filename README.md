## Pre Production Dependencies
### Upgrade nodejs For version/release 3
We'll have to upgrade nodejs to version 8. In order to do that ssh into both the application and run
- `yum remove nodesource-release* nodejs`
- `yum clean all`
- `rm -rf /var/cache/yum/*`
- `yum remove nodesource-release* nodejs`
- `rm -rf /etc/yum.repos.d/nodesource-el.repo`

### Define asset host
With changes in existing artowrks email template and introduction of story email templates, we are now rendering barnes logo, twitter and youtube icons from Rails assets folder.

In order to work this properly on Production, we now have to define a new ENV variable `ASSET_HOST` and sets it value to `https://barnes.foc.us`

### Translations Updates
* Email(Header) - "Bookmarked art" -> "Artworks You Discovered"
* Email(Sub Header) - "Thank you for visiting the Barnes today! Here are all the works you bookmarked during your visit" -> "Thank you for visiting the Barnes today! Here are all the works of art you explored using the Barnes Focus guide. Each link will take you to our collection online for more information about each piece."
* Execute `bundle exec rake data:extend_email_translations`. Once this runs successfully on Production, move content inside this method to `add_translations` method.
* Execute `bundle exec rake data:add_culture_to_result_page`. Once this runs successfully on Production, move content inside this method to `add_translations` method.

And then proceed with the deployment

# Installation Instructions
* Git clone
* Install Ruby (using RVM): `rvm install ruby-2.4.3`
* Install Rails: `gem install rails` OR run `bundle`
* Install Yarn (for Mac): `brew install yarn`
* Install Foreman: `gem install foreman`
* `$ bundle`
* `$ yarn install`
* Create Schema: `rake db:create`
* Migration: `rake db:migrate`
* Note: You must have a PSQL server running for the above rake commands to run successfully
* Start server in development mode: `rails server`

## About rake db:seed
In V1, for in-app translations, we used to run `rake db:seed` command followed by `rake db:migrate` (on new env). This did few things for us:
 - Populate `translations` database table

With V2, since most of the screens are new and so are texts on screen, `rake db:seed` is no longer required. Here's what we can do:

### What if I have translations table already populated with V1 data?
In case, if your `translations` table contains data from `rake db:seed` command. Here's what you can do:
 - From rails console: `Translation.delete_all`
 - Run this rake task :
  - `bundle exec rake data:add_translations` OR `rake data:add_translations`

### How I can handle an update in translations table?
Updates are very easy and can be done from Admin panel directly. For e.g., if a text of translation changes from 'A' to 'B', then you can directly go to edit that record inside Admin panel -> do the changes and save it.

### How I can add more to translations?
Adding to translations can be done via one time job (OTJ). Preferably `rake` task. You can refer to file: `/lib/tasks/data.rake` on how translations are added.

### What if I am setting up Barnes App in new ENV?
In this case, we just have to run above rake task `bundle exec rake data:add_translations`

# To Start Server in background
`foreman start -f Procfile.dev -p 3000`

> **Note: If you get error:** `error("cannot load such file -- bundler/dep_proxy (LoadError)")` **while running above command then run:** `gem update --system`

The above command will run two processes simultaneously:
a. `rails server` and
b. `webpack-dev-server` - this will analyse changes in our `app/javascript` folder and rebuild the front end on the fly.

# Environment Variables
Though  `.env` file is committed into the source code but in order to setup everything locally, you'll have to change the path of: `GOOGLE_APPLICATION_CREDENTIALS`.
To do so, the file `SNAP-865144db2e55` lies under: `private` folder

## What's not in ENV file?
There are certain variables that are created for us by Beanstalk while we are setting up the Rails application. And some of ENV variables are created by us.
Some of those ENV variable changes its value based on Web/Worker Apps. Let's take a look at those:
 - **AWS_ENV**: Generated by us. For Web App it's value will be `web` and for Worker App it's value will be `worker`. Locally: `web` (optional)
 - **PROCESS_ACTIVE_ELASTIC_JOBS**: Generated by us. Required for Worker App. Default value: `true`. Locally not required.
 - **BUNDLE_WITHOUT**: System generated. Default value: `test:development`. Locally not required
 - **NODE_ENV**: We are no longer using this ENV variable. Can be removed. Default value: `production`. Locally not required
 - **RAILS_ENV**: System generated. Default value: `production`. Locally not required
 - **RAILS_LOG_TO_STDOUT**: Generated by us. Default value: `enabled`. Locally not required
 - **RAILS_SERVE_STATIC_FILES**: Generated by us. Default value: `enabled`. Default value: `enabled`
 - **RAILS_SKIP_ASSET_COMPILATION**: System generated. Default value: `false`. Locally not required
 - **RAILS_SKIP_MIGRATIONS**: System generated. Default value: `false`. Locally not required
 - **RDS_DB_NAME**, **RDS_HOSTNAME**, **RDS_PASSWORD**, **RDS_PORT**, **RDS_USERNAME**: Database settings needed to Connect Barnes App with PostgreSQL Database.
 - **SECRET_KEY_BASE**: System generated. Not required locally.
 - **ASSET_HOST**: Required to render images for emails

# Deployment on Elastic Beanstalk
## Prerequisite
* Access to Barnes AWS console: [https://barnesfoundation.signin.aws.amazon.com/console](https://barnesfoundation.signin.aws.amazon.com/console)
* AWS username & Password
* AWS `access-key-id` and `aws-secret-key`
* Install Beanstalk toolbelt: `brew install aws-elasticbeanstalk`. After installation: `eb --version` to validate

## Deploying for the first time
`{PATH_TO_PROJECT}$ eb init`

This will ask few question/s:
* Select a default region
* Select an application to use
* Select Ruby version - We're using 2.4 with Puma
* Select the default environment
* Select a repository (when running the init for 2nd time). For first time, you'll be asked to enter a repository name. **NOTE: We have skipped this step as we do not want to use CodeCommit repository that Beanstalk gives. We are using Git here**
* Select/Enter branch name - This can be skipped too

> Tip: First you'll need to commit and push your changes to git. Then you can run: `eb deploy [environment_name] --staged`
> `staged` option performs a standard deployment, bypassing AWS CodeCommit

Once you enter the required details, console will be prompted with below message:

**Note: Elastic Beanstalk now supports AWS CodeCommit; a fully-managed source control service. To learn more, see Docs: https://aws.amazon.com/codecommit/
Do you wish to continue with CodeCommit? (y/N) (default is n):** As mentioned, choose `n`

## Deploying an existing app to Beanstalk
If you are deploying an existing app to Beanstalk, it is possible that `.elasticbeanstalk` folder is missing from your local repo. In order to deploy, fire your terminal and type:

    `eb init -i`
> NOTE: -i option force setup options to appear

Select these options:

    region: us-east-1 : US East (N. Virginia)
    application to use: barnes-snap-dev
    It appears you are using Ruby. Is this correct?: Y
    platform version: Ruby 2.4 (Puma)
    Elastic Beanstalk now supports AWS CodeCommit; a fully-managed source control service. Do you wish to continue with CodeCommit?: n
    Do you want to set up SSH for your instances?: n

This will initialise .elasticbeanstalk folder and create `config.yml` file

We have 2 applications hosted on ElasticBeanstalk
* barnes-snap-dev
	* barnes-snap-dev-env, and
	* barnes-snap-dev-worker-env
* barnes-snap
	* barnes-snap-production, and
	* barnes-snap-production-worker-env

To deploy to these applications and environments following things needs to be taken care of:
* You must be on the same git branch to deploy. We are using `snap-dev` to deploy on `barnes-snap-dev` and `master` to deploy on `barnes-snap`
* Both your web and worker env should use the latest code

We will use `.elasticbeanstalk/config.yml` to deploy. If this file is not present, then copy the contents of below into that file (**DO NOT COMMIT THIS FILE INTO SOURCE CODE**)

    branch-defaults:
      master:
        environment: barnes-snap-production
        group_suffix: null
      snap-dev:
        environment: barnes-snap-dev-env
        group_suffix: null
    environment-defaults:
      barnes-snap-dev-env:
        branch: snap-dev
        repository: null
      barnes-snap-dev-worker-env:
        branch: snap-dev
        repository: null
      barnes-snap-production:
        branch: master
        repository: null
      barnes-snap-production-worker-env:
        branch: master
        repository: null
    global:
      application_name: barnes-snap
      default_ec2_keyname: barnes-snap-keypair
      default_platform: Ruby 2.4 (Puma)
      default_region: us-east-1
      include_git_submodules: true
      instance_profile: null
      platform_name: null
      platform_version: null
      profile: eb-cli
      repository: origin
      sc: git@github.com:BarnesFoundation/barnes-snap.git
      workspace_type: Application

Before we run `eb deploy`, let's configure this file for our purpose
- Assuming, you are on `snap-dev` and want to deploy to dev app (web environment). To do so, change:
	* `environment` under `branch-defaults ~> snap-dev` and use `barnes-snap-dev-env`
	* `application_name` under `global` and use `barnes-snap-dev`
* Assuming, you are on `snap-dev` and want to deploy to dev app (worker environment). To do so, change:
	* `environment` under `branch-defaults ~> snap-dev` and use `barnes-snap-dev-worker-env`
	* `application_name` under `global` and use `barnes-snap-dev`
* Assuming, you are on `master` and want to deploy to production app (web environment). To do so, change:
	* `environment` under `branch-defaults ~> master` and use `barnes-snap-dev-production`
	* `application_name` under `global` and use `barnes-snap`
* Assuming, you are on `master` and want to deploy to production app (worker environment). To do so, change:
	* `environment` under `branch-defaults ~> master` and use `barnes-snap-dev-production-worker-env`
	* `application_name` under `global` and use `barnes-snap`

Save changes as per deployment needs and run `eb deploy --staged`

**NOTE**: You'll need `barnes-snap-keypair` to deploy. The relevant files can be found under `private` folder. Copy this into `~/.ssh` folder (local) and give these 2 files necessary write permission using `chmod`

### Troubleshooting
> If you get `ERROR: ServiceError - User: arn:aws:iam::RAND-ID:user/NAME is not authorized to perform: codecommit:ListRepositories` - That means you do not have sufficient privileges. Please get in touch with the respective AWS person and/or create/update policy by yourself (this needs caution).

> If you get `ERROR: InvalidParameterValueError - "Error making request to CodeCommit: Repository names are restricted to alphanumeric characters, plus '.', '_', and '-' (Service: AWSCodeCommit; Status Code: 400; Error Code: InvalidRepositoryNameException; Request ID: b3132904-2e87-11e8-807f-2370ad651bbe)"` OR `ERROR: InvalidParameterValueError - "Error making request to CodeCommit: Could not retrieve e95846ca5ad9ea9572259975ee1e1305ec6bb64f (Service: AWSCodeCommit; Status Code: 400; Error Code: CommitIdDoesNotExistException; Request ID: 57a9b5e8-2e88-11e8-a82e-9d34cd5e2cd7)"` then look for `/.elasticbeanstalk/config.yml`. It could be possible that due to `eb init`, config.yml was changed.

> If deployment fails with reason: `your yarn packages are out of date`, solve that in below way:

    # approach-1
    {PATH_TO_APP}$ eb ssh
    {SERVER}$ eb --version

check the version of this output with the version installed on your local machine. If versions are different, then either you can:

    # open package.json file, and add/update:
    "yarn": "YARN_VERSION"

commit this file and re-deploy. OR you can `ssh` into server and run:

    $ npm install -g yarnpkg@1.2.1
    # replace this version with the correct one

> NOTE: commit this file into the source code and re-run `eb deploy --staged` command. Once completed successfully, you'll then have to remove `05_yarn_upgrade` block from this file again and re-commit this file, otherwise every time you deploy, it will try to upgrade yarn, which will increase the deployment time

## Running Rails Console

You can SSH into the web server with: `eb ssh [environment_name]`
**NOTE**: `eb ssh` always ssh on the selected environment (based on Current Working Git Branch). So, if you would like to ssh into Production App (Web Environment), switch git branch to `master`, refer to the `.elasticbeanstalk/config.yml`

> The Rails application is located at **`/var/app/current`**

You'll need `sudo` access and then you'll be able to access console. Below commands shall do that:

    current\]$ sudo su
    \[root@ip-172-31-36-219 current\]# bundle exec rails c production
    Loading production environment (Rails 5.1.5)
    irb(main):001:0>