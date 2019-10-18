class PagesController < ApplicationController
  layout 'barnes_snap'
  before_action :generate_session
  def home
	@preferred_language = @@preferred_language
  end
end