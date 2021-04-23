# Deployment on Elastic Beanstalk

This application is meant to be deployed on AWS infrastructure. It is currently already deployed on AWS. For the sake of documentation and in case a future need arises, these services on the Amazon Web Services platform are used
- S3 - repository for hosting the image captures by users of the application
- RDS - the database for storing application and session information is meant to be hosted on AWS RDS PostgreSQL
- SNS - delayed job queueing is handled via AWS SNS queues from which the worker environment processes them from

For setting up a completely new application, you'll need to setup allocate resources on the above services for everything to function correctly. At the moment, the application architecture is already deployed so no need for anything right now.

## Prerequisite

* Access to Barnes AWS console with a username and password 
[https://barnesfoundation.signin.aws.amazon.com/console](https://barnesfoundation.signin.aws.amazon.com/console)

* An assigned `access-key-id` and `aws-secret-key`

* The AWS CLI needs to be installed on your workstation and initialized with your account

* Copy the `barnes-snap-keypair` file from under the `private` folder into your local `~/.ssh` folder and provide write permission using `chmod`

## Initialize Elastic Beanstalk on your newly cloned repository

If you've cloned the repository and have no `.elasticbeanstalk` folder, then do the following. From your repository, in the terminal execute

`eb init -i` 

This will ask few questions:

* Select a default region
* Select an application to use
* Select Ruby version - 2.5
* Select the default environment

Skip or deny any questions regarding version control and branch information. This will create the `.elasticbeanstalk` folder and a `config.yml` inside of it.

## Executing a Deployment

Make changes as per your deployment needs to the `config.yml` prior to deploying. For example, you may need to modify the application name to point to the development appplication if that's where you're deploying to. Same thing for production.

Push your ready code to GitHub. Then you can run deploy to the appropriate environment using 

`eb deploy [environment_name] --staged`

## Running Rails Console

You can SSH into an environment using 

`eb ssh [environment_name]`

The environment will need to have been configured for SSH along with your local CLI so you may need to follow the terminal prompt for additional steps.

The application is located at **`/var/app/current`** as root.

If you need to access the Ruby console, you can use
`bundle exec rails c production`

If you get a permission error when trying to access the console, change the user with `sudo su`.