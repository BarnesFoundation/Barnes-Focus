ActiveAdmin.register Album, as: 'Scanned Sessions' do
    actions :all, except: [:new, :edit, :destroy]
    config.per_page = 10

    index do
        selectable_column
        id_column
        column :name
        column :unique_identifier
        column :created_at do | resource |
            resource.created_at.present? ? ApplicationHelper.date_time_in_eastern( resource.created_at ) : nil
        end
        actions
    end

    show do
        attributes_table do
            row :id
            row :name
            row :unique_identifier
            row :created_at do
                resource.created_at.present? ? ApplicationHelper.date_time_in_eastern( resource.created_at ) : nil
            end
        end

        panel "Scanned Sessions" do
            table_for resource.photos.order_by_scanned_time do
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
    end
end