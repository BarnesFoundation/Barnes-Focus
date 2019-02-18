require 's3_store'

class ImportScannedSessionsJob < ApplicationJob
    queue_as ENV['SQS_QUEUE'].to_sym

    def perform( scope_type )
        begin
            @query = nil
            @dump_type = ''

            case scope_type
            when "succeed"
                @query = Album.succeed
                @query = @query.order("albums.id DESC")
                @dump_type = "succeeded scans"
            when "failed_attempts"
                @query = Album.failed_scans # return ids
                @dump_type = "failed scans"
            else
                @query = Album.all
                @query = @query.order("albums.id DESC")
                @dump_type = "everything"
            end

            filename = "#{SecureRandom.hex}-scanned-sessions.csv"

            CSV.open( "#{Rails.root}/tmp/#{filename}", 'w' ) do |csv|
                csv.add_row ["scanned_session_id", "user_session_id", "s3_url_scanned_image", "catchoom_image_url", "image_id", "art_url", "imageSecret", "ensembleIndex", "created_at"]

                if @query.is_a?(Array)
                    @query.in_groups_of(1000, false) {|album_ids|
                        Album.where(id: album_ids).find_each do | album |
                            csv.add_row fetch_row_data(album)
                        end
                    }
                else
                    @query.find_each do | album |
                        csv.add_row fetch_row_data(album)
                    end
                end
            end

            f = S3Store.new( File.open("#{Rails.root}/tmp/#{filename}") ).store
            file_url = f.url
            File.delete("#{Rails.root}/tmp/#{filename}")

            UserMailer.send_csv(file_url, @dump_type).deliver_now
        rescue Exception => e
            UserMailer.send_error_trail(e.message, e.backtrace.join("\n")).deliver_now
        end
    end

    def fetch_row_data album
        session             = ActiveRecord::SessionStore::Session.find_by_id(album.session_id)
        album.photos.each do | photo |
            begin
                es_data = (photo.es_response.nil? || photo.es_response.blank?) ? nil : JSON.parse(photo.es_response)["data"]["records"][0]
                values = [
                    album.id,
                    session.present? ? session.session_id : nil,
                    photo.searched_image_s3_url,
                    photo.result_image_url,
                    es_data.nil? ? nil : es_data["id"],
                    es_data.nil? ? nil : es_data["art_url"],
                    es_data.nil? ? nil : es_data["imageSecret"],
                    es_data.nil? ? nil : es_data["ensembleIndex"],
                    photo.created_at.strftime("%Y-%m-%d %H:%M:%S.%L")
                ]

                return values
            rescue JSON::ParserError
                p 'unable to parse photo object as it does not contain valid json data'
                next
            end
        end
    end
end