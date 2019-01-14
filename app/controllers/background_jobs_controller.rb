require 'barnes_elastic_search'

class BackgroundJobsController < ApplicationController
  protect_from_forgery with: :null_session
end