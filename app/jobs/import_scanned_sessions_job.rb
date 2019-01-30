require 's3_store'

class ImportScannedSessionsJob < ApplicationJob
    queue_as ENV['SQS_QUEUE'].to_sym

    def perform( scope_type )
        @query = nil

        case scope_type
        when "succeed"
            @query = Album.succeed
        when "failed_attempts"
            @query = Album.failed_attempts
        else
            @query = Album.all
        end

        @query = @query.where("session_id IS NOT NULL").order("session_id DESC")
        filename = "#{SecureRandom.hex}-scanned-sessions.csv"

        CSV.open( "#{Rails.root}/tmp/#{filename}", 'w' ) do |csv|
            csv.add_row ["session_id", "s3_url_scanned_image", "catchoom_image_url", "image_id", "art_url", "imageSecret", "ensembleIndex"]

            @query.each do | album |
                session             = ActiveRecord::SessionStore::Session.find_by_id(album.session_id)
                album.photos.each do | photo |
                    es_data = (photo.es_response.nil? || photo.es_response.blank?) ? nil : JSON.parse(photo.es_response)["data"]["records"][0]
                    values = [
                        session.session_id,
                        photo.searched_image_s3_url,
                        photo.result_image_url,
                        es_data.nil? ? '' : es_data["id"],
                        es_data.nil? ? '' : es_data["art_url"],
                        es_data.nil? ? '' : es_data["imageSecret"],
                        es_data.nil? ? '' : es_data["ensembleIndex"]
                    ]

                    csv.add_row values
                end
            end
        end

        f = S3Store.new( File.open("#{Rails.root}/tmp/#{filename}") ).store
        file_url = f.url
        File.delete("#{Rails.root}/tmp/#{filename}")

        UserMailer.send_csv(file_url).deliver_now
    end
end