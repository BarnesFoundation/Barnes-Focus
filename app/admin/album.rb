ActiveAdmin.register Album, as: 'Scanned Sessions' do
    remove_filter :photos
    actions :all, except: [:new, :edit, :destroy]
    config.per_page = [25,50,100,200]

    scope :all, default: true
    scope :succeed
    scope :failed_attempts

    index default: true do
        id_column
        column :name
        column "Scanned Image" do | resource |
            successful_attempted_scanned_image = resource.photos.successful_attempt.first
            if successful_attempted_scanned_image
                successful_attempt_imgage_url = successful_attempted_scanned_image.searched_image_s3_url.present? ? successful_attempted_scanned_image.searched_image_s3_url : successful_attempted_scanned_image.searched_image_blob
                image_tag successful_attempt_imgage_url, class: 'pastec_image_size'
            else
                last_scanned_image = resource.photos.order_by_scanned_time.first
                if last_scanned_image
                    last_scanned_image_url = last_scanned_image.searched_image_s3_url.present? ? last_scanned_image.searched_image_s3_url : last_scanned_image.searched_image_blob
                    image_tag last_scanned_image_url, class: 'pastec_image_size'
                end
            end
        end
        column "Catchoom Response" do | resource |
            successful_attempted_scanned_image = resource.photos.successful_attempt.first
            if successful_attempted_scanned_image
                image_tag successful_attempted_scanned_image.result_image_url, class: 'pastec_image_size'
            else
                "No Result"
            end
        end
        column "total scan attempt" do | resource |
            resource.photos.count
        end
        column :created_at do | resource |
            resource.created_at.present? ? ApplicationHelper.date_time_in_eastern( resource.created_at ) : nil
        end
        actions
    end

    show do
        panel "Scanned Session Images" do
            div class: 'owl-carousel owl-theme' do
                scanned_images = resource.photos
                scanned_images.each do | photo |
                    div class: "item", style: 'width: 400px;' do
                        div do
                            if photo.searched_image_s3_url.blank?
                                image_tag photo.searched_image_blob, class: 'pastec_image_size'
                            else
                                image_tag photo.searched_image_s3_url, class: 'pastec_image_size'
                            end
                        end
                        div class: 'history-header' do
                            span class: 'history-header-title' do
                                "Response Time"
                            end
                            span class: 'history-header-info' do
                                photo.response_time
                            end
                        end
                        div class: 'history-header' do
                            span class: 'history-header-title' do
                                "Captured At"
                            end
                            span class: 'history-header-info' do
                                photo.created_at.present? ? ApplicationHelper.date_time_in_eastern( photo.created_at ) : nil
                            end
                        end
                        
                    end
                end
            end
        end

        panel "Matched Info from ES and Catchoom" do
            table_for resource.photos.successful_attempt do
                column "Scanned Image" do | photo |
                    if photo.searched_image_s3_url.blank?
                        image_tag photo.searched_image_blob, class: 'pastec_image_size'
                    else
                        image_tag photo.searched_image_s3_url, class: 'pastec_image_size'
                    end
                end
                column "Response from ES" do | photo |
                    photo.es_response
                end
                column "Search Engine" do | photo |
                    photo.search_engine
                end
                column "Response Time" do | photo |
                    photo.response_time
                end
                column "Result from Catchoom" do | photo |
                    photo.result_image_url.present? ? image_tag(photo.result_image_url, class: 'pastec_image_size') : ''
                end
                column "Captured At" do | photo |
                    photo.created_at.present? ? ApplicationHelper.date_time_in_eastern( photo.created_at ) : nil
                end
            end
        end

        attributes_table do
            row :id
            row :name
            row :unique_identifier
            row :created_at do
                resource.created_at.present? ? ApplicationHelper.date_time_in_eastern( resource.created_at ) : nil
            end
        end
    end

    controller do
        def index
            index! do | wants |
                wants.csv do
                    ImportScannedSessionsJob.perform_later(params[:scope])
                    flash[:notice] = "Your request for CSV is in queue. You'll receive an email with a link to CSV"
                    redirect_to '/admin/scanned_sessions'
                end
                wants.xml do
                    flash[:error] = "XML downloads are currently not supported. Try CSV donwload instead!"
                    redirect_to '/admin/scanned_sessions'
                end
            end
        end
    end
end