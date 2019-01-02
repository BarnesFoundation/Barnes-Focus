class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

private
  def generate_session
    # ideally we should not use reset_session for capturing scanned history. If we do, we may lost all the scanned history captured by the user before
    # Just placing it here so we know how to handle reset_session for future cases
    # reset_session
    return true if session[ :user_scanned_history ]
    session[ :user_scanned_history ] = JSON.generate []
    return true
  end
end
