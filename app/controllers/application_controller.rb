class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  @@preferred_language = nil

private

  @@supported_languages = [ 'En', 'Es', 'Fr', 'De', 'It', 'Ru', 'Zh', 'Ja', 'Ko' ]

  def generate_session
    # ideally we should not use reset_session for capturing scanned history. If we do, we may lost all the scanned history captured by the user before
    # Just placing it here so we know how to handle reset_session for future cases
	# reset_session
	
	# Return true if the session already exists
	return true if session[ :user_scanned_history ]
	

	# Otherwise continue to generate it
	session[ :user_scanned_history ] = JSON.generate []
	
	# Since this block is entered when a session needs to be generated, we set the language preference here
	set_language_preference()
	
    return true
  end

  ### Utilizes the HTTP accept-language header to automatically detect and set the language for the session
  def set_language_preference
	# Locate the session since it's now been generated
	session = ActiveRecord::SessionStore::Session.find_by_session_id( request.session_options[:id] )
	
	if session

		accept_language_header = request.headers.fetch('HTTP_ACCEPT_LANGUAGE')

		# Modern browsers order the languages by preference, so the first element would be the most preferred. We then strip the dash if it's there
		pl = HTTP::Accept::Languages.parse(accept_language_header)[0].locale

		# Check if the language is hyphenated 
		if pl.index('-')

			# Remove it as we only support base language codes
			pl = pl.slice(0..(pl.index('-') - 1))
		end

		# Find the language that is in our supported languages list
		found_language = @@supported_languages.find do |language| language.downcase == pl
		end 

		# If we do support the language, set it
		if found_language
			@@preferred_language = found_language
			session.update_column(:lang_pref, found_language.downcase)
		end
	end

  end

end