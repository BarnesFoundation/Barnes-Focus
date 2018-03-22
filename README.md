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
* Select the default environment - You can change this later by typing `eb use [environment_name]`
* Select a repository (when running the init for 2nd time). For first time, you'll be asked to enter a repository name
* Select/Enter branch name

First you'll need to commit and push your changes. Then you can run: `eb deploy [environment_name]`

Once you enter the required details, console will be prompted with below message:

**Note: Elastic Beanstalk now supports AWS CodeCommit; a fully-managed source control service. To learn more, see Docs: https://aws.amazon.com/codecommit/
Do you wish to continue with CodeCommit? (y/N) (default is n):**

### Troubleshooting
> If you get `ERROR: ServiceError - User: arn:aws:iam::RAND-ID:user/NAME is not authorized to perform: codecommit:ListRepositories` - That means you do not have sufficient privileges. Please get in touch with the respective person and/or create/update policy by yourself (this needs caution).

## Running Rails Console

You can SSH into the web server with: `eb ssh [environment_name]`
> The Rails application is located at **`/var/app/current`**

## Accessing Database (for SQL Queries)

## Managing Add-ons