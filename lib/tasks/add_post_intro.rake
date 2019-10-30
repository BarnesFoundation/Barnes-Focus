namespace :christask do
	desc "Adding the post-intro line to the translations"
	task add: :environment do 

	email_header = Translation.find_or_create_by(screen_text: "Email", display_order: 101)
	Translation.create(
		screen_text: 'Get more art in your inbox. Sign up for Barnes emails to stay on top of special offers and happenings all year round.',
		parent_id: email_header.id,
		english_translation: 'Get more art in your inbox. Sign up for Barnes emails to stay on top of special offers and happenings all year round.',
		unique_identifier: 'text_7'
	)
	end
end