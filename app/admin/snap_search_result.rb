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
    column "Pastec Image" do |obj|
      table do
        obj.pastec_response["image_ids"].each do |pastec_image|
          tr do
            td do
              image_tag TrainingRecord.find_by(identifier: pastec_image).try(:image_url), class: 'pastec_image_size'
            end
          end
        end if obj.pastec_response["image_ids"].present?
      end
    end
    column "ES Image" do |obj|
      table do
        obj.es_response["records"].each do |es_image|
          tr do
            td do
              image_tag "https://barnes-image-repository.s3.amazonaws.com/images/" + es_image['id'] + "_" + es_image['imageSecret'] + "_n.jpg", class: 'es_image_size'
            end
          end
        end if obj.es_response["records"].present?
      end
    end
    column :pastec_response
    column :es_response
    column :created_at
  end

end
