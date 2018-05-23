# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
AdminUser.create!(email: 'admin@barnesfoundation.org', password: 'b@rne$', password_confirmation: 'b@rne$') if Rails.env.test?
AdminUser.create!(email: 'puneet@happyfuncorp.com', password: 'b@rne$', password_confirmation: 'b@rne$') if Rails.env.test?

screen_1_slider_1 = Translation.find_or_create_by(screen_text: "Welcome_screen	", display_order: 1)
Translation.create(
  screen_text: "It's a snap!",
  parent_id: screen_1_slider_1.id,
  english_translation: "It's a snap!",
  unique_identifier: 'text_1'
)
Translation.create(
  screen_text: "Take a photo of any work of art to get information about it.",
  parent_id: screen_1_slider_1.id,
  english_translation: "Take a photo of any work of art to get information about it.",
  unique_identifier: 'text_2'
)

screen_1_slider_2 = Translation.find_or_create_by(screen_text: "Language_choice", display_order: 2)
Translation.create(
  screen_text: "Please select your language.",
  parent_id: screen_1_slider_2.id,
  english_translation: "Please select your language.",
  unique_identifier: 'text_1'
)

screen_1_slider_2_1 = Translation.find_or_create_by(screen_text: "Language_selector", display_order: 3)
Translation.create(
  screen_text: "Please select your language.",
  parent_id: screen_1_slider_2_1.id,
  english_translation: "Please select your language.",
  unique_identifier: 'text_1'
)
Translation.create(
  screen_text: "We are using Google to help us automatically translate our text.",
  parent_id: screen_1_slider_2_1.id,
  english_translation: "We are using Google to help us automatically translate our text.",
  unique_identifier: 'text_2'
)

screen_1_slider_2_2 = Translation.find_or_create_by(screen_text: "Languages", display_order: 4)
Translation.create(
  screen_text: "English (default)",
  parent_id: screen_1_slider_2_2.id,
  english_translation: "English (default)",
  unique_identifier: 'text_1'
)
Translation.create(
  screen_text: "中文",
  parent_id: screen_1_slider_2_2.id,
  english_translation: "Chinese",
  unique_identifier: 'text_2'
)
Translation.create(
  screen_text: "Français",
  parent_id: screen_1_slider_2_2.id,
  english_translation: "French",
  unique_identifier: 'text_3'
)
Translation.create(
  screen_text: "Deutsch",
  parent_id: screen_1_slider_2_2.id,
  english_translation: "German",
  unique_identifier: 'text_4'
)
Translation.create(
  screen_text: "Italiano",
  parent_id: screen_1_slider_2_2.id,
  english_translation: "Italian",
  unique_identifier: 'text_5'
)
Translation.create(
  screen_text: "日本語",
  parent_id: screen_1_slider_2_2.id,
  english_translation: "Japanese",
  unique_identifier: 'text_6'
)
Translation.create(
  screen_text: "한국어",
  parent_id: screen_1_slider_2_2.id,
  english_translation: "Korean",
  unique_identifier: 'text_7'
)
Translation.create(
  screen_text: "Русский",
  parent_id: screen_1_slider_2_2.id,
  english_translation: "Russian",
  unique_identifier: 'text_8'
)
Translation.create(
  screen_text: "Español",
  parent_id: screen_1_slider_2_2.id,
  english_translation: "Spanish",
  unique_identifier: 'text_9'
)

screen_1_slider_2_3 = Translation.find_or_create_by(screen_text: "Language_button", display_order: 5)
Translation.create(
  screen_text: "Selected",
  parent_id: screen_1_slider_2_3.id,
  english_translation: "Selected",
  unique_identifier: 'text_4'
)

screen_1_slider_3 = Translation.find_or_create_by(screen_text: "Connect_wireless	", display_order: 6)
Translation.create(
  screen_text: "Get connected.",
  parent_id: screen_1_slider_3.id,
  english_translation: "Get connected.",
  unique_identifier: 'text_1'
)
Translation.create(
  screen_text: "For best connectivity, please connect to our free wifi: BarnesPublic.",
  parent_id: screen_1_slider_3.id,
  english_translation: "For best connectivity, please connect to our free wifi: BarnesPublic.",
  unique_identifier: 'text_2'
)

screen_1_slider_4 = Translation.find_or_create_by(screen_text: "Instruction_snap	", display_order: 7)
Translation.create(
  screen_text: "Take a photo to learn more about a work of art in our collection.",
  parent_id: screen_1_slider_4.id,
  english_translation: "Take a photo to learn more about a work of art in our collection.",
  unique_identifier: 'text_1'
)

screen_1_slider_4_1 = Translation.find_or_create_by(screen_text: "Photo_Button_Label", display_order: 8)
Translation.create(
  screen_text: "Take photo",
  parent_id: screen_1_slider_4_1.id,
  english_translation: "Take photo",
  unique_identifier: 'text_1'
)

screen_search = Translation.find_or_create_by(screen_text: "Snap_searching	", display_order: 9)
Translation.create(
  screen_text: "Searching",
  parent_id: screen_search.id,
  english_translation: "Searching",
  unique_identifier: 'text_1'
)
Translation.create(
  screen_text: "Please wait while we search our database.",
  parent_id: screen_search.id,
  english_translation: "Please wait while we search our database.",
  unique_identifier: 'text_2'
)

snap_top = Translation.find_or_create_by(screen_text: "Snap_succeed_top", display_order: 10)
Translation.create(
  screen_text: "Swipe for visually similar works.",
  parent_id: snap_top.id,
  english_translation: "Swipe for visually similar works.",
  unique_identifier: 'text_1'
)

snap_result = Translation.find_or_create_by(screen_text: "Snap_succeed_bottom", display_order: 11)
Translation.create(
  screen_text: "Albert Barnes taught people to look at works of art primarily in terms of their visual relationships.",
  parent_id: snap_result.id,
  english_translation: "Albert Barnes taught people to look at works of art primarily in terms of their visual relationships.",
  unique_identifier: 'text_1'
)
Translation.create(
  screen_text: "Swipe for visually similar works.",
  parent_id: snap_result.id,
  english_translation: "Swipe for visually similar works.",
  unique_identifier: 'text_2'
)

snap_fail = Translation.find_or_create_by(screen_text: "Snap_fail", display_order: 12)
Translation.create(
  screen_text: "Try again! We couldn’t match that work of art.",
  parent_id: snap_fail.id,
  english_translation: "Try again! We couldn’t match that work of art.",
  unique_identifier: 'text_1'
)
Translation.create(
  screen_text: "Tip: Our snap app is most successful at recognizing two-dimensional works of art like paintings.",
  parent_id: snap_fail.id,
  english_translation: "Tip: Our snap app is most successful at recognizing two-dimensional works of art like paintings.",
  unique_identifier: 'text_2'
)

know_more = Translation.find_or_create_by(screen_text: "Art_team_alert", display_order: 13)
Translation.create(
  screen_text: "Want to know even more?",
  parent_id: know_more.id,
  english_translation: "Want to know even more?",
  unique_identifier: 'text_1'
)
Translation.create(
  screen_text: "Find a member of our Art Team and start a conversation about any work that interests you. Our Art Team is wearing special black T-shirts.",
  parent_id: know_more.id,
  english_translation: "Find a member of our Art Team and start a conversation about any work that interests you. Our Art Team is wearing special black T-shirts.",
  unique_identifier: 'text_2'
)

share = Translation.find_or_create_by(screen_text: "Share / Bookmark icons", display_order: 14)
Translation.create(
  screen_text: "Share it",
  parent_id: share.id,
  english_translation: "Share it",
  unique_identifier: 'text_1'
)
Translation.create(
  screen_text: "Bookmark it",
  parent_id: share.id,
  english_translation: "Bookmark it",
  unique_identifier: 'text_2'
)

bookmark = Translation.find_or_create_by(screen_text: "Bookmark_capture", display_order: 15)
Translation.create(
  screen_text: "Information about the art you bookmark will be emailed to you after your visit.",
  parent_id: bookmark.id,
  english_translation: "Information about the art you bookmark will be emailed to you after your visit.",
  unique_identifier: 'text_1'
)
Translation.create(
  screen_text: "Email address",
  parent_id: bookmark.id,
  english_translation: "Email address",
  unique_identifier: 'text_2'
)
Translation.create(
  screen_text: "Sign up for the Barnes newsletter",
  parent_id: bookmark.id,
  english_translation: "Sign up for the Barnes newsletter",
  unique_identifier: 'text_3'
)

reset_experience = Translation.find_or_create_by(screen_text: "Manual_reset", display_order: 16)
Translation.create(
  screen_text: "You are about to reset the Snap experience.",
  parent_id: reset_experience.id,
  english_translation: "You are about to reset the Snap experience.",
  unique_identifier: 'text_1'
)
Translation.create(
  screen_text: "Warning: This will erase your bookmarked artwork, email address, and language preferences.",
  parent_id: reset_experience.id,
  english_translation: "Warning: This will erase your bookmarked artwork, email address, and language preferences.",
  unique_identifier: 'text_2'
)

reset_footer = Translation.find_or_create_by(screen_text: "Footer", display_order: 16)
Translation.create(
  screen_text: "Reset Experience",
  parent_id: reset_footer.id,
  english_translation: "Reset Experience",
  unique_identifier: 'text_1'
)