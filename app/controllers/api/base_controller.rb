class Api::BaseController < ApplicationController
  protect_from_forgery with: :null_session

private
  def capture_scanned_history image_id
    if session[ :user_scanned_history ].present?
      user_scanned_history = JSON.parse session[ :user_scanned_history ]
      user_scanned_history.push image_id
      user_scanned_history = JSON.generate( user_scanned_history )
      session[ :user_scanned_history ] = user_scanned_history
    else
      session[ :user_scanned_history ] = JSON.generate( [image_id] )
    end
  end
end