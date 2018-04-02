class BookmarkNotifierMailer < ApplicationMailer
  def send_activity_email email, els_arr_of_objs
    @els_arr = els_arr_of_objs
    mail(to: email, subject: 'Thank you for visiting the Barnes today!')
  end
end
