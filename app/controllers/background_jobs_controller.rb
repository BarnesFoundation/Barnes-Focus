require 'barnes_elastic_search'

class BackgroundJobsController < ApplicationController
  protect_from_forgery with: :null_session

  def bookmarks
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
    head :ok, content_type: "text/html"
  end

  def update_es_cache
    EsCachedRecord.find_in_batches(batch_size: 500) do | es_records |
      es_records.each { |es_record|
        es_record.es_data = EsCachedRecord.connect_with_es_endpoint(es_record.image_id)
        es_record.last_es_fetched_at = DateTime.now
        es_record.save
      }
    end
    head :ok, content_type: "text/html"
  end
end