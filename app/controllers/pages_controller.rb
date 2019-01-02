class PagesController < ApplicationController
  layout 'barnes_snap'
  before_action :generate_session

  def home
  end
end
