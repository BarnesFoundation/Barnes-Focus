require 'rake'
require 'barnes_elastic_search'

class JobsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_request_headers

  def update_es_cache
    total_records = BarnesElasticSearch.instance.total

    p 'There are in total ' + total_records.to_s + ' records present on ES server'

    batch_size = 500 # this can be managed from ENV variable as well
    number_of_loops = total_records / batch_size
    number_of_loops += 1 if total_records % batch_size > 0

    count = start = 0

    while count < number_of_loops
      results = BarnesElasticSearch.instance.find_all start, batch_size

      results.each do | result |
        result = EsCachedRecord.keep_es_fields result

        es_cached_record = EsCachedRecord.find_by image_id: result[ 'id' ]
        es_cached_record = EsCachedRecord.new image_id: result[ 'id' ] if es_cached_record.nil?

        es_cached_record.es_data = result
        es_cached_record.last_es_fetched_at = DateTime.now
        es_cached_record.save
      end

      start += 500
      count += 1
    end
    p 'Execution finished'
    head :ok, content_type: "text/html"
  end

  def clear_sessions
    system `bin/rake db:sessions:trim`
    head :ok, content_type: "text/html"
  end

  def send_bookmarks_email
    bookmarks = Bookmark.where("email IS NOT NULL").ready_to_deliver.order('created_at DESC')

    if bookmarks.any?
      bookmarks.group_by(&:email).each do | mail, bukmarks |
        next if mail.blank?

        unique_arts           = Hash.new
        unique_arts[mail]     = Array.new
        latest_bookmark_entry = bukmarks.first
        time_in_seconds       = ENV['LATEST_BOOKMARK_ENTRY_THRESHOLD'].present? ? ENV['LATEST_BOOKMARK_ENTRY_THRESHOLD'].to_i : 10800

        if latest_bookmark_entry.created_at.utc < time_in_seconds.seconds.ago.utc
          language = latest_bookmark_entry.language
          language = language || 'en'
          language = language.downcase
          els_arr = Array.new

          bukmarks.each { | obj |
            next if unique_arts[mail].include?(obj.image_id)
            els_obj = BarnesElasticSearch.instance.get_object(obj.image_id)

            next if els_obj.nil?
            els_arr.push els_obj
            unique_arts[mail].push obj.image_id
          }

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

      p 'done sending bookmark emails'
    end

    head :ok, content_type: "text/html"
  end

  def send_stories_email
    stories_in_bookmarks = Bookmark.where("email IS NOT NULL").stories_to_deliver.order('created_at DESC')

    if stories_in_bookmarks.any?

    end

    head :ok, content_type: "text/html"
  end

  def cleanup_bookmarks
    p 'Fetching bookmarks for blank/null emails'
    bookmarks_with_blank_emails = Bookmark.where("email IS NULL OR email = ''").where("DATE(bookmarks.created_at) < ?", (Time.now.utc - 30.days).to_date)

    p 'There are total ' + bookmarks_with_blank_emails.count.to_s + ' bookmark entries where email is not present. Purging those entries now'
    bookmarks_with_blank_emails.delete_all

    p 'Fetching bookmarks where mail_sent flag is true'
    bookmarks_with_sent_emails = Bookmark.where(mail_sent: true).where("DATE(bookmarks.created_at) < ?", (Time.now.utc - 30.days).to_date)

    p 'There are total ' + bookmarks_with_sent_emails.count.to_s + ' bookmark entries where email_sent flag is true. Purging those entries now'
    bookmarks_with_sent_emails.delete_all

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
