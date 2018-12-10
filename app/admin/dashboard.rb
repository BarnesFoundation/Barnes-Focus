ActiveAdmin.register_page "Dashboard" do

  menu priority: 1, label: proc{ I18n.t("active_admin.dashboard") }

  content title: proc{ I18n.t("active_admin.dashboard") } do

    columns do
      column do
        panel 'Recent Searches' do
          table do
            tr do
              th 'Name'
              th 'Unique Identifier'
              th 'Scanned Session'
            end

            Album.recent.each do | album |
              tr do
                td album.name
                td album.unique_identifier
                td do
                  table do
                    album.photos.each do | photo |
                      tr do
                        td do
                          if photo.searched_image_s3_url.blank?
                            image_tag photo.searched_image_blob, class: 'pastec_image_size'
                          else
                            image_tag photo.searched_image_s3_url, class: 'pastec_image_size'
                          end
                        end
                        td photo.es_response
                        td photo.search_engine
                        td photo.response_time
                        td do
                          if photo.result_image_url.present?
                            image_tag photo.result_image_url, class: 'pastec_image_size'
                          end
                        end
                      end
                    end
                  end
                end
              end              
            end
          end
        end
      end
    end
  end
end