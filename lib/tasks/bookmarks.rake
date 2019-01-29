require 'barnes_elastic_search'

namespace :bookmarks do
  desc "This task is managed by whenever gem, runs in every 3 hours and bundles all the bookmarks by email and send mail"
  task compose: :environment do
    bookmarks = Bookmark.where("email IS NOT NULL").ready_to_deliver.order('created_at DESC')

    if bookmarks.any?
      bookmarks.group_by(&:email).each do | mail, bukmarks |
        next if mail.blank?

        repeated_arts         = Hash.new
        repeated_arts[mail]   = Array.new
        latest_bookmark_entry = bukmarks.first
        time_in_seconds       = ENV['LATEST_BOOKMARK_ENTRY_THRESHOLD'].present? ? ENV['LATEST_BOOKMARK_ENTRY_THRESHOLD'].to_i : 10800

        if latest_bookmark_entry.created_at.utc < time_in_seconds.seconds.ago.utc
          language = latest_bookmark_entry.language
          language = language || 'en'
          language = language.downcase
          els_arr = Array.new

          bukmarks.each { | obj |
            next if repeated_arts[email].include?(obj.image_id)
            els_obj = BarnesElasticSearch.instance.get_object(obj.image_id)

            next if els_obj.nil?
            els_arr.push els_obj
            repeated_arts[email].push els_obj.image_id
          }
        end

        begin
          unless mail.blank?
            BookmarkNotifierMailer.send_activity_email(mail, els_arr, language).deliver_now
            bukmarks.each {|b| b.update_attributes(mail_sent: true)}
          end
        rescue Exception => ex
          p "Unable to send email due to #{ex.to_s}"
        end
      end
    end
  end
end