
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

You now have the needed components for building and running the application. **Ensure that your PostgreSQL server is up and running by this step.**

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

**If there's already data in your translations table from a prior version of Focus and you're upgrading to this one, do the following. This will likely not be the case**

In case your local `translations` table contains data from the `rake db:seed` command, here's what you can do

- From the rails console, run the below command and then exit the Ruby console 
`Translation.delete_all`

- From the terminal, run this rake task 
 `bundle exec rake data:add_translations`

### How I can modify or update a specific translation in the translations table?

Updates and modifications can be done from the Administrative panel directly. For example., if a text of translation needs to be changed from *Thank you for visiting the Barnes* to *Thank you for joining us at the Barnes*, then you can go to that record on the Administrative Panel -> Translations > appropriate screen/record, make the changes and then save it.
  
### How I can add additional translations?

Adding to the translations can be done via a one-time job. Preferably, a `rake` task. You can refer to file: `/lib/tasks/data.rake` on how translations are added.


## Run the application

Use the below command to start the web server
`foreman start -f Procfile.dev -p 3000`
  
It will run two processes simultaneously

1. `rails server`

2. `webpack-dev-server` - this will analyse changes in our `app/javascript` folder and rebuild the front end on the fly


## Environment Variables

You can find the `localhost.env.development` file is committed into the `private` folder but in order to setup everything locally, you'll have to:

- Copy this file into root and rename to `.env`
- Change the path of: `GOOGLE_APPLICATION_CREDENTIALS`. - To do so, the file `SNAP-865144db2e55` lies under: `private` folder

If you need to add new environment variables, be sure to add a value into the `localhost.env.development` file so it's known in the repository as well.