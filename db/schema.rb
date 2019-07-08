# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20190708114049) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "admin_users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet "current_sign_in_ip"
    t.inet "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_admin_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_admin_users_on_reset_password_token", unique: true
  end

  create_table "albums", force: :cascade do |t|
    t.string "name", default: "", null: false
    t.string "unique_identifier", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "session_id"
    t.index ["session_id"], name: "index_albums_on_session_id"
    t.index ["unique_identifier", "session_id"], name: "index_albums_on_unique_identifier_and_session_id"
    t.index ["unique_identifier"], name: "index_albums_on_unique_identifier"
  end

  create_table "bookmarks", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "image_id", default: "", null: false
    t.boolean "mail_sent", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "language"
    t.integer "session_id"
    t.boolean "story_read", default: false
    t.boolean "story_mail_sent", default: false
    t.index ["email"], name: "index_bookmarks_on_email"
    t.index ["image_id"], name: "index_bookmarks_on_image_id"
    t.index ["language"], name: "index_bookmarks_on_language"
    t.index ["mail_sent"], name: "index_bookmarks_on_mail_sent"
    t.index ["session_id", "email"], name: "index_bookmarks_on_session_id_and_email"
    t.index ["session_id"], name: "index_bookmarks_on_session_id"
    t.index ["story_read", "story_mail_sent"], name: "index_bookmarks_on_story_read_and_story_mail_sent"
    t.index ["story_read"], name: "index_bookmarks_on_story_read"
  end

  create_table "es_cached_records", force: :cascade do |t|
    t.string "image_id", null: false
    t.jsonb "es_data"
    t.datetime "last_es_fetched_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "old_es_data"
    t.index ["es_data"], name: "index_es_cached_records_on_es_data"
    t.index ["image_id"], name: "index_es_cached_records_on_image_id"
    t.index ["last_es_fetched_at"], name: "index_es_cached_records_on_last_es_fetched_at"
  end

  create_table "photos", force: :cascade do |t|
    t.bigint "album_id"
    t.text "searched_image_blob"
    t.text "searched_image_s3_url"
    t.string "es_response"
    t.string "search_engine"
    t.string "response_time"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "result_image_url"
    t.index ["album_id"], name: "index_photos_on_album_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.string "session_id", null: false
    t.json "data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "lang_pref"
    t.jsonb "blob", default: "{}", null: false
    t.index ["blob"], name: "index_sessions_on_blob", using: :gin
    t.index ["session_id"], name: "index_sessions_on_session_id", unique: true
    t.index ["updated_at"], name: "index_sessions_on_updated_at"
  end

  create_table "stories", force: :cascade do |t|
    t.string "title"
    t.string "slug"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_stories_on_slug"
    t.index ["title"], name: "index_stories_on_title"
  end

  create_table "subscriptions", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.boolean "is_subscribed", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_subscriptions_on_email"
    t.index ["is_subscribed"], name: "index_subscriptions_on_is_subscribed"
  end

  create_table "translations", force: :cascade do |t|
    t.integer "parent_id"
    t.text "screen_text", default: ""
    t.text "english_translation"
    t.text "chinese_translation"
    t.text "french_translation"
    t.text "german_translation"
    t.text "italian_translation"
    t.text "japanese_translation"
    t.text "korean_translation"
    t.text "russian_translation"
    t.text "spanish_translation"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "display_order"
    t.string "unique_identifier"
    t.index ["display_order"], name: "index_translations_on_display_order"
    t.index ["parent_id"], name: "index_translations_on_parent_id"
    t.index ["unique_identifier"], name: "index_translations_on_unique_identifier"
  end

end
