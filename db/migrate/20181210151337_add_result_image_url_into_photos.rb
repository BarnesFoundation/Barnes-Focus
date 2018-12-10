class AddResultImageUrlIntoPhotos < ActiveRecord::Migration[5.1]
  def change
    add_column :photos, :result_image_url, :string
  end
end
