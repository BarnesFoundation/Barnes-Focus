require 'barnes_elastic_search'

class Api::BookmarksController < ApplicationController
  def index
  end

  def create
  end

private
  def bookmark_params
    params.require(:bookmark).permit(:email, :image_id, :received_on)
  end
end
