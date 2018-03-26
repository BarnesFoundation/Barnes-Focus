
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
`{PATH_TO_PROJECT}$ eb init -i`

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

### Troubleshooting
> If you get `ERROR: ServiceError - User: arn:aws:iam::RAND-ID:user/NAME is not authorized to perform: codecommit:ListRepositories` - That means you do not have sufficient privileges. Please get in touch with the respective AWS person and/or create/update policy by yourself (this needs caution).

> If you get `ERROR: InvalidParameterValueError - "Error making request to CodeCommit: Repository names are restricted to alphanumeric characters, plus '.', '_', and '-' (Service: AWSCodeCommit; Status Code: 400; Error Code: InvalidRepositoryNameException; Request ID: b3132904-2e87-11e8-807f-2370ad651bbe)"` OR `ERROR: InvalidParameterValueError - "Error making request to CodeCommit: Could not retrieve e95846ca5ad9ea9572259975ee1e1305ec6bb64f (Service: AWSCodeCommit; Status Code: 400; Error Code: CommitIdDoesNotExistException; Request ID: 57a9b5e8-2e88-11e8-a82e-9d34cd5e2cd7)"` then look for `/.elasticbeanstalk/config.yml`. It could be possible that due to `eb init`, config.yml was changed.

> If deployment fails with reason: `your yarn packages are out of date`, open /.ebextensions/yarn.config file and edit this in below way:

    commands:
      ##### everything remains same till here #####
      
      04_yarn_install:
        cwd: /tmp
        test: '[ ! -f /usr/bin/yarn ] && echo "yarn not installed"'
        command: 'sudo yum -y install yarn'

      05_yarn_upgrade:
        cwd: /tmp
        command: 'sudo yum -y yarn upgrade --latest'

> NOTE: commit this file into the source code and re-run `eb deploy --staged` command. Once completed successfully, you'll then have to remove `05_yarn_upgrade` block from this file again and re-commit this file, otherwise every time you deploy, it will try to upgrade yarn, which will increase the deployment time

## Running Rails Console

You can SSH into the web server with: `eb ssh [environment_name]`
> The Rails application is located at **`/var/app/current`**

## Accessing Database (for SQL Queries)

## Managing Add-ons