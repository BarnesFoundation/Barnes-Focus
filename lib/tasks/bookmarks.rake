require 'barnes_elastic_search'

namespace :bookmarks do
  desc "This task is managed by whenever gem, runs in every 3 hours and bundles all the bookmarks by email and send mail"
  task compose: :environment do
    bookmarks = Bookmark.recent_bookmarks.ready_to_deliver

    if bookmarks.any?
      bookmarks.group_by(&:email).each do | mail, bukmarks |
        els_arr = Array.new
        bukmarks.each { | obj |
          els_obj = BarnesElasticSearch.instance.get_object(obj.image_id)
          next if els_obj.nil?
          els_arr.push els_obj
        }

        begin
          BookmarkNotifierMailer.send_activity_email(mail, els_arr).deliver_now
          bukmarks.each {|b| b.update_attributes(mail_sent: true)}
        rescue Exception => ex
          p "Unable to send email due to #{ex.to_s}"
        end
      end
    end
  end
end