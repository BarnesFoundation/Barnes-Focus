ActiveAdmin.register_page "Dashboard" do

  menu priority: 1, label: proc{ I18n.t("active_admin.dashboard") }

  content title: proc{ I18n.t("active_admin.dashboard") } do
    # Here is an example of a simple dashboard with columns and panels.
    #
    columns do
      column do
        panel "Recent Searches" do
          table do
            tr do
              th '#'
              th 'Searched Image'
              th 'Images from API'
              th 'ES Images'
              th 'API Response'
              th 'Elastic Search Result'
            end
            SnapSearchResult.recent.map do |img|
              tr do
                td img.id
                td image_tag img.searched_image_url, class: 'pastec_image_size'
                td do
                  table do
                    img.api_response["image_ids"].each do |image|
                      tr do
                        td do
                          image_tag TrainingRecord.find_by(identifier: image).try(:image_url), class: 'pastec_image_size'
                        end
                      end
                    end if img.api_response["image_ids"].present?
                  end

                end

                td do
                  table do
                    img.es_response["records"].each do |es_image|
                      tr do
                        td do
                          image_tag "https://barnes-image-repository.s3.amazonaws.com/images/" + es_image['id'].to_s + "_" + es_image['imageSecret'] + "_n.jpg", class: 'es_image_size'
                        end
                      end
                    end if img.es_response["records"].present?
                  end
                end

                td img.api_response.to_s
                td img.es_response.to_s
              end
            end
          end
        end
      end
    end
  end # content
end
