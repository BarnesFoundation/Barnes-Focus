class BookmarkNotifierMailer < ApplicationMailer
  def send_activity_email email, els_arr_of_objs, lang
    @els_arr = els_arr_of_objs
    @translations = Translation.find_by_header_text_and_language 'Email', lang
    mail(to: email, subject: 'Thank you for visiting the Barnes today!')
  end
end
