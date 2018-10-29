ActiveAdmin.register_page "Dashboard" do

  menu priority: 1, label: proc{ I18n.t("active_admin.dashboard") }

  content title: proc{ I18n.t("active_admin.dashboard") } do
    # Here is an example of a simple dashboard with columns and panels.
    #
    columns do
      column do
        panel 'Recent Searches' do
          table do

            # Header row
            tr do
              th '#'
              th 'Query Image'
              th 'Reference Image'
              th 'API Response'
              th 'Elastic Search Response'
              th 'Response Time'
            end

            # Map the Snap Search Result fields
            SnapSearchResult.recent.map do |snap_result|
              tr do

                # Id cell
                td snap_result.id

                # Query image cell
                td do
                  if snap_result.searched_image_url.present?
                    image_tag snap_result.searched_image_url, class: 'pastec_image_size'
                  else
                    image_tag snap_result.searched_image_data, class: 'pastec_image_size'
                  end
                end

                # Reference image cell
                td do
                  if !snap_result.searched_image_data.nil?
                    image_tag snap_result.searched_image_data
                  elsif snap_result.es_response.present?
                    es_image = snap_result.es_response['records'][0]
                    image_tag Image.imgix_url(es_image['id'], es_image['imageSecret']), class: 'es_image_size' 
                  else 
                    es_image = nil
                  end
                end

                # API response cell
                td snap_result.api_response.to_s

                # Elastic Search response cell
                td snap_result.es_response.to_s

                # Response time cell
                td snap_result.response_time
              end
            end
          end
        end
      end
    end
  end
end

                  ### Unnecessary table for display all matched items for a search
                  # table do
                    # snap_result.es_response["records"].each do |es_image|
                      # tr do
                        # td do
                          # image_tag Image.imgix_url(es_image['id'], es_image['imageSecret']), class: 'es_image_size'
                        # end
                      # end
                    # end if snap_result.es_response["records"].present?
                  # end
