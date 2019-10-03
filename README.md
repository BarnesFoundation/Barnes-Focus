
# The Barnes Focus Application

  

The Barnes Focus application is an image-recognition based web application for mobile devices. It allows on-site visitors to the Barnes Foundation to use their mobile devices to point-and-scan our various artwork paintings and objects in order to pull up information and related stories about them.

  

The high-level technical stack is the following

- React JavaScript/SASS for the front end of the application

- The Image Recognition API by Catchoom, where query images are sent to directly from the mobile device in order to receive a response on which artwork was identified (in which case the ID of the object is returned)

- Ruby on Rails for the web server and worker environment (Ruby 2.5.0)

- PostgreSQL for the database

- Google Tag Manager/Analytics for analytics and event capturing

- GraphCMS for writing and storing the related story entries that an artwork is associated with

  

## Installation Instructions

  

Below are the instructions for successfully cloning and getting this repository running locally

  

This application uses Node v8 and PostgreSQL so those will need to be installed prior to running the below steps.

- We suggest [NVM](https://github.com/nvm-sh/nvm) for managing your Node versions easily

- Follow steps here for installing [PostgreSQL](http://postgresguide.com/setup/install.html)

  

1. Clone this repository

2. Install Ruby Version Manager [RVM](https://rvm.io/)

3. Using RVM, run

	`rvm install ruby-2.5.0`

4. Install the needed gems using

	`bundle`

5. Install [Yarn](https://yarnpkg.com/lang/en/docs/install/) and run

	`yarn install`

6. Install Foreman using

	`gem install foreman`

  

By this point, you have the needed components for building and running the application. **Ensure that your PostgreSQL server is up and running by this step**

  

1. Create the database schema by running this command

	`rake db:create`

2. Start the migrations using

	`rake db:migrate`

  
  

## Populate the Elastic Search cache table

Whether you're working locally or setting up a new install of the application, your Elastic Search cache table (named `es_cached_records`) will need to be populated with records. These records are a cache of our entire artwork collection meta data from our Elastc Search server.

  

The web server must be running to complete either of the below steps. Either will result in the table being populated

  

- Using Postman or any ARC client, make a POST request to this url

	`http://localhost:3000/jobs/update_es_cache`

  

OR

  

- In the command line, run

	`bundle exec rake update_es_cache:perform`

  
  

## Populate the Translations table

If this application is being setup for the first time, you can just run
`bundle exec rake data:add_translations`


**If there's already data in your translations table from a prior version of Focus and you're upgrading to this one, do the following -- but this will likely not be the case**

In case local `translations` table contains data from the `rake db:seed` command, here's what you can do

- From the rails console, run the below command and then exit the Ruby console 
`Translation.delete_all`

- From the terminal, run this rake task 
 `bundle exec rake data:add_translations`

  

### How I can handle an update in translations table?

Updates are very easy and can be done from Admin panel directly. For e.g., if a text of translation changes from 'A' to 'B', then you can directly go to edit that record inside Admin panel -> do the changes and save it.

  
### How I can add more to translations?

Adding to translations can be done via one time job (OTJ). Preferably `rake` task. You can refer to file: `/lib/tasks/data.rake` on how translations are added.
  

## Run the application

Use the below command to start the web server
`foreman start -f Procfile.dev -p 3000`
  
It will run two processes simultaneously

1. `rails server`

2. `webpack-dev-server` - this will analyse changes in our `app/javascript` folder and rebuild the front end on the fly


## Environment Variables

You can find `localhost.env.development` file is committed into the `private` folder but in order to setup everything locally, you'll have to:

- Move this file into root and rename to `.env`

- Change the path of: `GOOGLE_APPLICATION_CREDENTIALS`. - To do so, the file `SNAP-865144db2e55` lies under: `private` folder


### What's not in ENV file?

There are certain variables that are created for us by Beanstalk while we are setting up the Rails application. And some of ENV variables are created by us.

Some of those ENV variable changes its value based on Web/Worker Apps. Let's take a look at those:

-  **AWS_ENV**: Generated by us. For Web App it's value will be `web` and for Worker App it's value will be `worker`. Locally: `web` (optional)

-  **PROCESS_ACTIVE_ELASTIC_JOBS**: Generated by us. Required for Worker App. Default value: `true`. Locally not required.
-  **BUNDLE_WITHOUT**: System generated. Default value: `test:development`. Locally not required
-  **NODE_ENV**: We are no longer using this ENV variable. Can be removed. Default value: `production`. Locally not required
-  **RAILS_ENV**: System generated. Default value: `production`. Locally not required
-  **RAILS_LOG_TO_STDOUT**: Generated by us. Default value: `enabled`. Locally not required
-  **RAILS_SERVE_STATIC_FILES**: Generated by us. Default value: `enabled`. Default value: `enabled`
-  **RAILS_SKIP_ASSET_COMPILATION**: System generated. Default value: `false`. Locally not required
-  **RAILS_SKIP_MIGRATIONS**: System generated. Default value: `false`. Locally not required
-  **RDS_DB_NAME**, **RDS_HOSTNAME**, **RDS_PASSWORD**, **RDS_PORT**, **RDS_USERNAME**: Database settings needed to Connect Barnes App with PostgreSQL Database.
-  **SECRET_KEY_BASE**: System generated. Not required locally.
-  **ASSET_HOST**: Required to render images for emails. E.g. values: http://localhost:3000
-  **STORY_PARAGRAPH_TO_USE**: Required to define which paragrpah to use for story. Possible values: `long` or `short`


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

>  `staged` option performs a standard deployment, bypassing AWS CodeCommit

  
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

*  `environment` under `branch-defaults ~> snap-dev` and use `barnes-snap-dev-env`

*  `application_name` under `global` and use `barnes-snap-dev`

* Assuming, you are on `snap-dev` and want to deploy to dev app (worker environment). To do so, change:

*  `environment` under `branch-defaults ~> snap-dev` and use `barnes-snap-dev-worker-env`

*  `application_name` under `global` and use `barnes-snap-dev`

* Assuming, you are on `master` and want to deploy to production app (web environment). To do so, change:

*  `environment` under `branch-defaults ~> master` and use `barnes-snap-dev-production`

*  `application_name` under `global` and use `barnes-snap`

* Assuming, you are on `master` and want to deploy to production app (worker environment). To do so, change:

*  `environment` under `branch-defaults ~> master` and use `barnes-snap-dev-production-worker-env`

*  `application_name` under `global` and use `barnes-snap`

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

You'll need `sudo` access and then you'll be able to access console. Below commands shall do that
  
current\]$ sudo su

\[root@ip-172-31-36-219 current\]# bundle exec rails c production

Loading production environment (Rails 5.1.5)

irb(main):001:0>