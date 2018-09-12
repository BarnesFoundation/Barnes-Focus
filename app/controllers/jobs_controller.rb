class JobsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_request_headers

  def update_es_cache
    EsCachedRecord.find_in_batches(EsCachedRecord.count) do | es_records |
      es_records.each { |es_record|
        es_record.es_data = EsCachedRecord.connect_with_es_endpoint(es_record.image_id)
        es_record.last_es_fetched_at = DateTime.now
        es_record.save
      }
    end

    head :ok, content_type: "text/html"
  end

  def compose_bookmarks
    bookmarks = Bookmark.recent_bookmarks.ready_to_deliver

    if bookmarks.any?
      bookmarks.group_by(&:email).each do | mail, bukmarks |
        language = bukmarks.last.language
        language = language || 'en'
        els_arr = Array.new
        bukmarks.each { | obj |
          els_obj = BarnesElasticSearch.instance.get_object(obj.image_id)

          next if els_obj.nil?
          els_arr.push els_obj
        }

        begin
          BookmarkNotifierMailer.send_activity_email(mail, els_arr, language).deliver_now
          bukmarks.each {|b| b.update_attributes(mail_sent: true)}
        rescue Exception => ex
          p "Unable to send email due to #{ex.to_s}"
        end
      end
    end

    head :ok, content_type: "text/html"
  end

  private
  def set_request_headers
    @request_headers = {
      'HTTP_X_AWS_SQSD_MSGID': request.headers['HTTP_X_AWS_SQSD_MSGID'], 
      'HTTP_X_AWS_SQSD_RECEIVE_COUNT': request.headers['HTTP_X_AWS_SQSD_RECEIVE_COUNT'], 
      'HTTP_X_AWS_SQSD_FIRST_RECEIVED_AT': request.headers['HTTP_X_AWS_SQSD_FIRST_RECEIVED_AT'], 
      'HTTP_X_AWS_SQSD_SENT_AT': request.headers['HTTP_X_AWS_SQSD_SENT_AT'], 
      'HTTP_X_AWS_SQSD_QUEUE': request.headers['HTTP_X_AWS_SQSD_QUEUE'], 
      'HTTP_X_AWS_SQSD_PATH': request.headers['HTTP_X_AWS_SQSD_PATH'], 
      'HTTP_X_AWS_SQSD_SENDER_ID': request.headers['HTTP_X_AWS_SQSD_SENDER_ID'], 
      'HTTP_X_AWS_SQSD_SCHEDULED_AT': request.headers['HTTP_X_AWS_SQSD_SCHEDULED_AT'], 
      'HTTP_X_AWS_SQSD_TASKNAME': request.headers['HTTP_X_AWS_SQSD_TASKNAME']
    }
  end
end
