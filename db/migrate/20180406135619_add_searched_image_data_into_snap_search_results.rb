class AddSearchedImageDataIntoSnapSearchResults < ActiveRecord::Migration[5.1]
  def change
    add_column :snap_search_results, :searched_image_data, :text
  end
end
