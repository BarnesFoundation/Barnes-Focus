ActiveAdmin.register SnapSearchResult do
  menu false # no longer using this model
  permit_params :id, :password, :password_confirmation
  config.filters = false
  config.per_page = 10

  index do
    selectable_column
    id_column
    column "Clicked Snap" do |obj|
      unless obj.searched_image_url.blank?
        image_tag obj.searched_image_url, class: 'pastec_image_size'
      else
        image_tag obj.searched_image_data, class: 'pastec_image_size'
      end
    end
    column "Images from Training Module" do |obj|
      table do
        obj.api_response["image_ids"].each do |image|
          tr do
            td do
              training_img = TrainingRecord.find_by(identifier: image).try(:image_url)
              image_tag training_img, class: 'pastec_image_size' unless training_img.nil?
            end
          end
        end if obj.api_response["image_ids"].present?
      end
    end
    column "Imgix Image" do |obj|
      table do
        obj.es_response["records"].each do |es_image|
          tr do
            td do
              image_tag Image.imgix_url(es_image['id'], es_image['imageSecret']), class: 'es_image_size'
            end
          end
        end if obj.es_response["records"].present?
      end
    end
    column :api_response
    column :es_response
    column :response_time
    column :created_at
  end

end
