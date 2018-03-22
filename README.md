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

**Note: If you get error:** `error("cannot load such file -- bundler/dep_proxy (LoadError)")` **while running above command then run:** `gem update --system`

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