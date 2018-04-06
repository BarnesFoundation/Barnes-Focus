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
              th 'ES Images'
              th 'API Response'
              th 'Elastic Search Result'
              th 'Response Time'
            end
            SnapSearchResult.recent.map do |img|
              tr do
                td img.id
                td do
                  unless img.searched_image_url.blank?
                    image_tag img.searched_image_url, class: 'pastec_image_size'
                  else
                    image_tag img.searched_image_data, class: 'pastec_image_size'
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
                td img.response_time
              end
            end
          end
        end
      end
    end
  end # content
end
