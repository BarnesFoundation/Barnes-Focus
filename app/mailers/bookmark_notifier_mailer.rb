class BookmarkNotifierMailer < ApplicationMailer
  def send_activity_email email, els_arr_of_objs, lang
    @els_arr = els_arr_of_objs
    @translations = Translation.find_by_header_text_and_language 'Email', lang
    mail(to: email, subject: 'Thank you for visiting the Barnes today!')
  end

  def send_stories_email email, stories, lang
    @stories = stories
    @lang = lang
    @translations = Translation.find_by_header_text_and_language 'Email', @lang
    mail(to: email, subject: "Stories you've unlocked at the Barnes yesterday")
  end
end
