require 's3_store'

class ImportScannedSessionsJob < ApplicationJob
  queue_as ENV['SQS_QUEUE'].to_sym

  def perform( scope_type )
    begin
      start_time = Time.now.utc
      @dump_type = "everything"

      sql = "SELECT albums.id, albums.session_id, photos.searched_image_s3_url AS s3_url_scanned_image, photos.result_image_url AS catchoom_image_url,
          (CASE WHEN photos.es_response = 'undefined'
          THEN NULL
          ELSE (((photos.es_response::json->>'data')::json->>'records')::json->>0)::json->>'id'
          END) AS image_id,
          (CASE WHEN photos.es_response = 'undefined'
          THEN NULL
          ELSE (((photos.es_response::json->>'data')::json->>'records')::json->>0)::json->>'art_url'
          END) AS art_url,
          (CASE WHEN photos.es_response = 'undefined'
          THEN NULL
          ELSE (((photos.es_response::json->>'data')::json->>'records')::json->>0)::json->>'imageSecret'
          END) AS imageSecret,
          (CASE WHEN photos.es_response = 'undefined'
          THEN NULL
          ELSE (((photos.es_response::json->>'data')::json->>'records')::json->>0)::json->>'ensembleIndex'
          END) AS ensembleIndex, photos.created_at
        FROM albums
        JOIN photos ON albums.id = photos.album_id
        LEFT OUTER JOIN sessions ON albums.session_id = sessions.id
        ORDER BY albums.id DESC
      "

      file = "#{SecureRandom.hex}-scanned-sessions.csv"

      PgCsv.new(:sql => sql).export(file, :header => true)

      f = S3Store.new( File.open(file) ).store
      file_url = f.url
      File.delete(file)

      end_time = Time.now.utc
      total_copy_time = end_time - start_time

      UserMailer.send_csv(file_url, @dump_type, Time.at(total_copy_time.round.abs).utc.strftime('%H:%M:%S')).deliver_now
    rescue Exception => e
      UserMailer.send_error_trail(e.message, e.backtrace.join("\n")).deliver_now
    end
  end
end