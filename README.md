 - Install latest rails version 
    - gem install rails
 - Install yarn 
    - brew install yarn
 - Install foreman 
    - gem install foreman
 - bundle install
 - yarn install
 - rake db:migrate
 
 To start server in background
   - foreman start -f Procfile.dev -p 3000
   - If you ger error("cannot load such file -- bundler/dep_proxy (LoadError)") while running above command then run "gem update --system"
   - It will run two processes simultaneously: <b>rails s</b> and <b>webpack-dev-server</b> that will analyse changes in our app/javascript folder and rebuild the front end on the fly.


 Deployment on Heroku:
 - Note: GOOGLE_APPLICATION_CREDENTIALS as json file can not be added in heroku so add these three params in heroku
    - GOOGLE_ACCOUNT_TYPE=service_account
    - GOOGLE_PRIVATE_KEY=XXX
    - GOOGLE_CLIENT_EMAIL=XXX
 
 
