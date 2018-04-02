ActiveAdmin.register SnapSearchResult do
  permit_params :id, :password, :password_confirmation
  config.filters = false
  config.per_page = 10

  index do
    selectable_column
    id_column
    column "Clicked Snap" do |obj|
      image_tag obj.searched_image_url, class: 'pastec_image_size'
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
    column "ES Image" do |obj|
      table do
        obj.es_response["records"].each do |es_image|
          tr do
            td do
              image_tag "https://barnes-image-repository.s3.amazonaws.com/images/" + es_image['id'].to_s + "_" + es_image['imageSecret'] + "_n.jpg", class: 'es_image_size'
            end
          end
        end if obj.es_response["records"].present?
      end
    end
    column :api_response
    column :es_response
    column :created_at
  end

end
