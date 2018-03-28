
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

# To Start Server in background
`foreman start -f Procfile.dev -p 3000`

> **Note: If you get error:** `error("cannot load such file -- bundler/dep_proxy (LoadError)")` **while running above command then run:** `gem update --system`

The above command will run two processes simultaneously:
a. `rails server` and
b. `webpack-dev-server` - this will analyse changes in our `app/javascript` folder and rebuild the front end on the fly.

# Environment Variables
Though  `.env` file is committed into the source code but in order to setup everything locally, you'll have to change the path of: `GOOGLE_APPLICATION_CREDENTIALS`.
To do so, the file `SNAP-865144db2e55` lies under: `private` folder

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
* Select the default environment - You can change this later by typing `eb use [environment_name]`
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

To change which branch to deploy on Dev server, open `.elasticbeanstalk/config.yml`

      branch-defaults:
        elastic-beanstalk-setup:
          environment: barnes-snap-dev-env
          group_suffix: null
      environment-defaults:
        barnes-snap-dev-env:
          branch: snap-dev
          repository: null
        barnes-snap-stage-env:
          branch: snap-dev
          repository: null
      global:
        application_name: barnes-snap-dev
        branch: stage
        default\_ec2\_keyname: barnes-snap-keypair
        default_platform: Ruby 2.4 (Puma)
        default_region: us-east-1
        include\_git\_submodules: true
        instance_profile: null
        platform_name: null
        platform_version: null
        profile: eb-cli
        repository: origin
        sc: git@github.com:BarnesFoundation/barnes-snap.git
        workspace_type: Application
- Change the branch-name under `environment-defaults` and re-run `eb deploy --staged`
- Replace this file with the one in your local environment and you are all set to deploy `snap-dev` to Dev server

To deploy an existing app to Beanstalk, from console:

    eb deploy --staged

* This deploys `snap-dev` branch to `barnes-snap-dev` app. URL: http://barnes-snap-dev-env.us-east-1.elasticbeanstalk.com/

* You'll need `barnes-snap-keypair` to deploy. The relevant files can be found under `private` folder. Copy this into `~/.ssh` folder (local) and give these 2 files necessary write permission using `chmod`

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
> The Rails application is located at **`/var/app/current`**

You'll need `sudo` access and then you'll be able to access console. Below commands shall do that:

    current\]$ sudo su
    \[root@ip-172-31-36-219 current\]# bundle exec rails c production
    Loading production environment (Rails 5.1.5)
    irb(main):001:0>

## Accessing Database (for SQL Queries)
