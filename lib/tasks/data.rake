namespace :data do
  desc 'backup es_data column to old_es_data column'
  task backup_es_cached_records: :environment do
    EsCachedRecord.find_each do | es_cached_record |
      es_cached_record.old_es_data = es_cached_record.es_data
      es_cached_record.save
    end
  end

  desc "In App translations"
  task add_translations: :environment do
    #====================== screen 1 ======================#
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
    translation_1_1 = Translation.find_by(parent_id: screen_1.id, unique_identifier: 'text_1')
    translation_1_1.update_attributes(screen_text: "Are you at", english_translation: "Are you at")
    translation_1_3 = Translation.find_by(parent_id: screen_1.id, unique_identifier: 'text_3')
    translation_1_3.update_attributes(unique_identifier: 'text_4')
    translation_1_2 = Translation.find_by(parent_id: screen_1.id, unique_identifier: 'text_2')
    translation_1_2.update_attributes(unique_identifier: 'text_3')
    Translation.create(
      screen_text: "the Barnes?",
      parent_id: screen_1.id,
      english_translation: "the Barnes?",
      unique_identifier: 'text_2'
    )

    #====================== screen 2 ======================#
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

    #====================== screen 3 ======================#
    screen_3 = Translation.find_or_create_by(screen_text: "Result_page", display_order: 3)
    Translation.create(
      screen_text: "Share",
      parent_id: screen_3.id,
      english_translation: "Share",
      unique_identifier: 'text_1'
    )
    Translation.create(
      screen_text: "Also in this Room",
      parent_id: screen_3.id,
      english_translation: "Also in this Room",
      unique_identifier: 'text_2'
    )
    Translation.create(
      screen_text: "Artist",
      parent_id: screen_3.id,
      english_translation: "Artist",
      unique_identifier: 'text_3'
    )
    Translation.create(
      screen_text: "Title",
      parent_id: screen_3.id,
      english_translation: "Title",
      unique_identifier: 'text_4'
    )
    Translation.create(
      screen_text: "Date",
      parent_id: screen_3.id,
      english_translation: "Date",
      unique_identifier: 'text_5'
    )
    Translation.create(
      screen_text: "Medium",
      parent_id: screen_3.id,
      english_translation: "Medium",
      unique_identifier: 'text_6'
    )
    Translation.create(
      screen_text: "Dimensions",
      parent_id: screen_3.id,
      english_translation: "Dimensions",
      unique_identifier: 'text_7'
    )
    Translation.create(
      screen_text: "Disclaimer",
      parent_id: screen_3.id,
      english_translation: "Disclaimer",
      unique_identifier: 'text_8'
    )
    Translation.create(
      screen_text: "Please note that not all records are complete as research on the collection is ongoing.",
      parent_id: screen_3.id,
      english_translation: "Please note that not all records are complete as research on the collection is ongoing.",
      unique_identifier: 'text_9'
    )

    #====================== screen 4 ======================#
    screen_4 = Translation.find_or_create_by(screen_text: "Result_page_Language_Selector", display_order: 4)
    Translation.create(
      screen_text: "English",
      parent_id: screen_4.id,
      english_translation: "English",
      unique_identifier: 'text_1'
    )
    Translation.create(
      screen_text: "Español",
      parent_id: screen_4.id,
      english_translation: "Spanish",
      unique_identifier: 'text_2'
    )
    Translation.create(
      screen_text: "Français",
      parent_id: screen_4.id,
      english_translation: "French",
      unique_identifier: 'text_3'
    )
    Translation.create(
      screen_text: "Deutsch",
      parent_id: screen_4.id,
      english_translation: "German",
      unique_identifier: 'text_4'
    )
    Translation.create(
      screen_text: "Italiano",
      parent_id: screen_4.id,
      english_translation: "Italian",
      unique_identifier: 'text_5'
    )
    Translation.create(
      screen_text: "Русский",
      parent_id: screen_4.id,
      english_translation: "Russian",
      unique_identifier: 'text_6'
    )
    Translation.create(
      screen_text: "中文",
      parent_id: screen_4.id,
      english_translation: "Chinese",
      unique_identifier: 'text_7'
    )
    Translation.create(
      screen_text: "日本語",
      parent_id: screen_4.id,
      english_translation: "Japanese",
      unique_identifier: 'text_8'
    )
    Translation.create(
      screen_text: "한국어",
      parent_id: screen_4.id,
      english_translation: "Korean",
      unique_identifier: 'text_9'
    )

    #====================== screen 5 ======================#
    screen_5 = Translation.find_or_create_by(screen_text: "No_Result_page", display_order: 5)
    Translation.create(
      screen_text: "No results found.",
      parent_id: screen_5.id,
      english_translation: "No results found.",
      unique_identifier: 'text_1'
    )
    Translation.create(
      screen_text: "Use the scan button to focus on a work of art.",
      parent_id: screen_5.id,
      english_translation: "Use the scan button to focus on a work of art.",
      unique_identifier: 'text_2'
    )
    txt_5_1 = Translation.find_by(parent_id: screen_5.id, unique_identifier: 'text_1')
    txt_5_1.update_attributes(
      screen_text: "No results found.",
      english_translation: "No results found."
    )
    txt_5_2 = Translation.find_by(parent_id: screen_5.id, unique_identifier: 'text_2')
    txt_5_2.update_attributes(
      screen_text: "Use the scan button to",
      english_translation: "Use the scan button to"
    )
    Translation.create(
      screen_text: "focus on a work of art.",
      parent_id: screen_5.id,
      english_translation: "focus on a work of art.",
      unique_identifier: 'text_3'
    )

    #====================== screen 6 ======================#
    screen_6 = Translation.find_or_create_by(screen_text: "Bookmark_capture", display_order: 6)
    Translation.create(
      screen_text: "To receive all the artworks you are seeing today, please enter your email address.",
      parent_id: screen_6.id,
      english_translation: "To receive all the artworks you are seeing today, please enter your email address.",
      unique_identifier: 'text_1'
    )
    Translation.create(
      screen_text: "Email address",
      parent_id: screen_6.id,
      english_translation: "Email address",
      unique_identifier: 'text_2'
    )
    Translation.create(
      screen_text: "We will only use your email to send you the links to the works you've seen. You won't be joined to any other list.",
      parent_id: screen_6.id,
      english_translation: "We will only use your email to send you the links to the works you've seen. You won't be joined to any other list.",
      unique_identifier: 'text_3'
    )
    Translation.create(
      screen_text: "Thank you. After your visit, look for an email in your inbox with links to all the works of art you've seen today.",
      parent_id: screen_6.id,
      english_translation: "Thank you. After your visit, look for an email in your inbox with links to all the works of art you've seen today.",
      unique_identifier: 'text_4'
    )
    Translation.create(
      screen_text: "Something doesn't look right. Try entering your email again.",
      parent_id: screen_6.id,
      english_translation: "Something doesn't look right. Try entering your email again.",
      unique_identifier: 'text_5'
    )
    screen_6_5 = Translation.find_by(parent_id: screen_6.id, unique_identifier: 'text_5')
    screen_6_5.update_attributes(
      screen_text: "Something doesn't look right.",
      english_translation: "Something doesn't look right."
    )
    Translation.create(
      screen_text: "Try entering your email again.",
      parent_id: screen_6.id,
      english_translation: "Try entering your email again.",
      unique_identifier: 'text_6'
    )
    Translation.create(
      screen_text: "Save",
      parent_id: screen_6.id,
      english_translation: "Save",
      unique_identifier: 'text_7'
    )

    #====================== screen 7 ======================#
    screen_7 = Translation.find_or_create_by(screen_text: "About", display_order: 7)
    Translation.create(
      screen_text: "About",
      parent_id: screen_7.id,
      english_translation: "About",
      unique_identifier: 'text_1'
    )
    Translation.create(
      screen_text: "Barnes Focus was created by the Knight Center for Digital Innovation in Audience Engagement at the Barnes.",
      parent_id: screen_7.id,
      english_translation: "Barnes Focus was created by the Knight Center for Digital Innovation in Audience Engagement at the Barnes.",
      unique_identifier: 'text_2'
    )
    Translation.create(
      screen_text: "Version 2.0",
      parent_id: screen_7.id,
      english_translation: "Version 2.0",
      unique_identifier: 'text_3'
    )
    Translation.create(
      screen_text: "Terms & Conditions",
      parent_id: screen_7.id,
      english_translation: "Terms & Conditions",
      unique_identifier: 'text_4'
    )

    #====================== screen 8 ======================#
    screen_8 = Translation.find_or_create_by(screen_text: "UnSupported_OS_Browser_Screen", display_order: 8)
    Translation.create(
      screen_text: "Please use Safari while we work on compatibility with other browsers.",
      parent_id: screen_8.id,
      english_translation: "Please use Safari while we work on compatibility with other browsers.",
      unique_identifier: 'text_1'
    )
    Translation.create(
      screen_text: "We're sorry, the version of iOS on your iPhone is not supported.",
      parent_id: screen_8.id,
      english_translation: "We're sorry, the version of iOS on your iPhone is not supported.",
      unique_identifier: 'text_2'
    )

    #====================== screen 9 ======================#
    screen_9 = Translation.find_or_create_by(screen_text: "Orientation_Error_Screen", display_order: 9)
    Translation.create(
      screen_text: "This app is best viewed in Portrait mode.",
      parent_id: screen_9.id,
      english_translation: "This app is best viewed in Portrait mode.",
      unique_identifier: 'text_1'
    )

    #====================== others ======================#
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

  desc "extending translations for story emails"
  task extend_email_translations: :environment do
    email_header = Translation.find_by(screen_text: "Email", display_order: 101)

    if email_header
      Translation.create(
        screen_text: 'Stories You Have Unlocked',
        parent_id: email_header.id,
        english_translation: 'Stories You Have Unlocked',
        unique_identifier: 'text_3'
      )
      Translation.create(
        screen_text: 'Unlock more stories on your next visit. Get 20% off your next visit.',
        parent_id: email_header.id,
        english_translation: 'Unlock more stories on your next visit. Get 20% off your next visit.',
        unique_identifier: 'text_4'
      )
      Translation.create(
        screen_text: 'Promo Code',
        parent_id: email_header.id,
        english_translation: 'Promo Code',
        unique_identifier: 'text_5'
      )
      Translation.create(
        screen_text: 'Buy Tickets',
        parent_id: email_header.id,
        english_translation: 'Buy Tickets',
        unique_identifier: 'text_6'
      )
    end
  end

  desc "adding culture to result page"
  task add_culture_to_result_page: :environment do
    screen_3 = Translation.find_by(screen_text: "Result_page", display_order: 3)

    if screen_3
      Translation.create(
        screen_text: "Culture",
        parent_id: screen_3.id,
        english_translation: "Culture",
        unique_identifier: 'text_10'
      )
    end
  end

  desc "add text to bookmark capture"
  task additions_to_bookmark_and_resultpage: :environment do
    screen_6 = Translation.find_by(screen_text: "Bookmark_capture", display_order: 6)

    Translation.create(
      screen_text: "Send Me My Scans",
      parent_id: screen_6.id,
      english_translation: "Send Me My Scans",
      unique_identifier: 'text_8'
    )

    screen_3 = Translation.find_by(screen_text: "Result_page", display_order: 3)
    Translation.create(
      screen_text: "In This Room",
      parent_id: screen_3.id,
      english_translation: "IN THIS ROOM",
      unique_identifier: 'text_11'
    )
  end

  def stream_query_rows(sql_query, options="WITH CSV HEADER")
    conn = ActiveRecord::Base.connection.raw_connection
    conn.copy_data "COPY (#{sql_query}) TO STDOUT #{options};" do
      while row = conn.get_copy_data
        yield row
      end
    end
  end

  namespace :scanned_sessions do
    task export: :environment do
      sql = "SELECT albums.id, albums.session_id, photos.searched_image_s3_url AS s3_url_scanned_image, photos.result_image_url AS catchoom_image_url,
          (CASE WHEN photos.es_response = 'undefined'
          THEN NULL
          ELSE (((photos.es_response::json->>'data')::json->>'records')::json->>0)::json->>'id'
          END) AS image_id,
          (CASE WHEN photos.es_response = 'undefined'
          THEN NULL
          ELSE (((photos.es_response::json->>'data')::json->>'records')::json->>0)::json->>'art_url'
          END) AS art_url,
          (CASE WHEN photos.es_response = 'undefined'
          THEN NULL
          ELSE (((photos.es_response::json->>'data')::json->>'records')::json->>0)::json->>'imageSecret'
          END) AS imageSecret,
          (CASE WHEN photos.es_response = 'undefined'
          THEN NULL
          ELSE (((photos.es_response::json->>'data')::json->>'records')::json->>0)::json->>'ensembleIndex'
          END) AS ensembleIndex, photos.created_at
        FROM albums
        JOIN photos ON albums.id = photos.album_id
        LEFT OUTER JOIN sessions ON albums.session_id = sessions.id
        ORDER BY albums.id DESC"

      stream_query_rows(sql, "WITH CSV HEADER") do |row_from_db|
        p row_from_db
        csv << row_from_db
      end
    end

    task export_to_csv: :environment do
      start_time = Time.now.utc
      sql = "SELECT albums.id, albums.session_id, photos.searched_image_s3_url AS s3_url_scanned_image, photos.result_image_url AS catchoom_image_url,
          (CASE WHEN photos.es_response = 'undefined'
          THEN NULL
          ELSE (((photos.es_response::json->>'data')::json->>'records')::json->>0)::json->>'id'
          END) AS image_id,
          (CASE WHEN photos.es_response = 'undefined'
          THEN NULL
          ELSE (((photos.es_response::json->>'data')::json->>'records')::json->>0)::json->>'art_url'
          END) AS art_url,
          (CASE WHEN photos.es_response = 'undefined'
          THEN NULL
          ELSE (((photos.es_response::json->>'data')::json->>'records')::json->>0)::json->>'imageSecret'
          END) AS imageSecret,
          (CASE WHEN photos.es_response = 'undefined'
          THEN NULL
          ELSE (((photos.es_response::json->>'data')::json->>'records')::json->>0)::json->>'ensembleIndex'
          END) AS ensembleIndex, photos.created_at
        FROM albums
        JOIN photos ON albums.id = photos.album_id
        LEFT OUTER JOIN sessions ON albums.session_id = sessions.id
        ORDER BY albums.id DESC
      "

      file = "#{SecureRandom.hex}-scanned-sessions.csv"

      PgCsv.new(:sql => sql).export(file, :header => true)

      f = S3Store.new( File.open(file) ).store
      file_url = f.url
      File.delete(file)

      end_time = Time.now.utc
      total_copy_time = end_time - start_time
      p "Total time consumed by the copy SQL (in HH:MM:SS): #{Time.at(total_copy_time.round.abs).utc.strftime '%H:%M:%S'}"
    end
  end
end