namespace :data do
  desc 'backup es_data column to old_es_data column'
  task backup_es_cached_records: :environment do
    EsCachedRecord.find_each do | es_cached_record |
      es_cached_record.old_es_data = es_cached_record.es_data
      es_cached_record.save
    end
  end

  desc "regenerate translations for v2"
  task regenrate_translations: :environment do
    screen_1 = Translation.find_or_create_by(screen_text: "Welcome_screen", display_order: 1)
    Translation.create(
      screen_text: "Are you at the Barnes?",
      parent_id: screen_1.id,
      english_translation: "Are you at the Barnes?",
      unique_identifier: 'text_1'
    )
    Translation.create(
      screen_text: "Yes",
      parent_id: screen_1.id,
      english_translation: "Yes",
      unique_identifier: 'text_2'
    )
    Translation.create(
      screen_text: "No",
      parent_id: screen_1.id,
      english_translation: "No",
      unique_identifier: 'text_3'
    )

    screen_2 = Translation.find_or_create_by(screen_text: "Visit_soon", display_order: 2)
    Translation.create(
      screen_text: "The Barnes Focus app is meant for use at the Barnes.",
      parent_id: screen_2.id,
      english_translation: "The Barnes Focus app is meant for use at the Barnes.",
      unique_identifier: 'text_1'
    )
    Translation.create(
      screen_text: "Please come visit us soon.",
      parent_id: screen_2.id,
      english_translation: "Please come visit us soon.",
      unique_identifier: 'text_2'
    )
    Translation.create(
      screen_text: "Visit us online",
      parent_id: screen_2.id,
      english_translation: "Visit us online",
      unique_identifier: 'text_3'
    )

    screen_3_1 = Translation.find_or_create_by(screen_text: "Result_page", display_order: 3)
    Translation.create(
      screen_text: "Share",
      parent_id: screen_3_1.id,
      english_translation: "Share",
      unique_identifier: 'text_1'
    )
    Translation.create(
      screen_text: "Also in this Room",
      parent_id: screen_3_1.id,
      english_translation: "Also in this Room",
      unique_identifier: 'text_2'
    )

    screen_3_2 = Translation.find_or_create_by(screen_text: "Result_page_Language_Selector", display_order: 4)
    Translation.create(
      screen_text: "English",
      parent_id: screen_3_2.id,
      english_translation: "English",
      unique_identifier: 'text_1'
    )
    Translation.create(
      screen_text: "Español",
      parent_id: screen_3_2.id,
      english_translation: "Spanish",
      unique_identifier: 'text_2'
    )
    Translation.create(
      screen_text: "Français",
      parent_id: screen_3_2.id,
      english_translation: "French",
      unique_identifier: 'text_3'
    )
    Translation.create(
      screen_text: "Deutsch",
      parent_id: screen_3_2.id,
      english_translation: "German",
      unique_identifier: 'text_4'
    )
    Translation.create(
      screen_text: "Italiano",
      parent_id: screen_3_2.id,
      english_translation: "Italian",
      unique_identifier: 'text_5'
    )
    Translation.create(
      screen_text: "Русский",
      parent_id: screen_3_2.id,
      english_translation: "Russian",
      unique_identifier: 'text_6'
    )
    Translation.create(
      screen_text: "中文",
      parent_id: screen_3_2.id,
      english_translation: "Chinese",
      unique_identifier: 'text_7'
    )
    Translation.create(
      screen_text: "日本語",
      parent_id: screen_3_2.id,
      english_translation: "Japanese",
      unique_identifier: 'text_8'
    )
    Translation.create(
      screen_text: "한국어",
      parent_id: screen_3_2.id,
      english_translation: "Korean",
      unique_identifier: 'text_9'
    )

    screen_4 = Translation.find_or_create_by(screen_text: "No_Result_page", display_order: 5)
    Translation.create(
      screen_text: "No results found.",
      parent_id: screen_4.id,
      english_translation: "No results found.",
      unique_identifier: 'text_1'
    )
    Translation.create(
      screen_text: "Use the scan button to focus on a work of art.",
      parent_id: screen_4.id,
      english_translation: "Use the scan button to focus on a work of art.",
      unique_identifier: 'text_2'
    )

    screen_5 = Translation.find_or_create_by(screen_text: "Bookmark_capture", display_order: 5)
    Translation.create(
      screen_text: "To receive all the artworks you are seeing today, please enter your email address.",
      parent_id: screen_5.id,
      english_translation: "To receive all the artworks you are seeing today, please enter your email address.",
      unique_identifier: 'text_1'
    )
    Translation.create(
      screen_text: "Email address",
      parent_id: screen_5.id,
      english_translation: "Email address",
      unique_identifier: 'text_2'
    )
    Translation.create(
      screen_text: "We will only use your email to send you the links to the works you've seen. You won't be joined to any other list.",
      parent_id: screen_5.id,
      english_translation: "We will only use your email to send you the links to the works you've seen. You won't be joined to any other list.",
      unique_identifier: 'text_3'
    )
    Translation.create(
      screen_text: "Thank you. After your visit, look for an email in your inbox with links to all the works of art you've seen today.",
      parent_id: screen_5.id,
      english_translation: "Thank you. After your visit, look for an email in your inbox with links to all the works of art you've seen today.",
      unique_identifier: 'text_4'
    )

    email_header = Translation.find_or_create_by(screen_text: "Email", display_order: 101)
    Translation.create(
      screen_text: 'Bookmarked art',
      parent_id: email_header.id,
      english_translation: 'Bookmarked art',
      unique_identifier: 'text_1'
    )
    Translation.create(
      screen_text: 'Thank you for visiting the Barnes today! Here are all the works you bookmarked during your visit',
      parent_id: email_header.id,
      english_translation: 'Thank you for visiting the Barnes today! Here are all the works you bookmarked during your visit',
      unique_identifier: 'text_2'
    )
  end
end