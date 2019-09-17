class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

private
  def generate_session
    # ideally we should not use reset_session for capturing scanned history. If we do, we may lost all the scanned history captured by the user before
    # Just placing it here so we know how to handle reset_session for future cases
	# reset_session
	
	puts "Entered generate_session!"

	# Return true if the session already exists
	return true if session[ :user_scanned_history ]
	
	puts "No session existed so creating one"

	# Otherwise continue to generate it
	session[ :user_scanned_history ] = JSON.generate []
	
	# Locate the session since it's now been generated
	session = ActiveRecord::SessionStore::Session.find_by_session_id( request.session_options[:id] )
	
	if session

		# Modern browsers order the languages by preference, so the first element would be the most preferred
		accept_language_header = request.headers.fetch('HTTP_ACCEPT_LANGUAGE')
		preferred_language = HTTP::Accept::Languages.parse(accept_language_header)[0]

		puts "The preferred language to be stored in the session is #{preferred_language.locale}"		
	else
		puts "Couldn't retrieve the session"
	end
	
    return true
  end
end
