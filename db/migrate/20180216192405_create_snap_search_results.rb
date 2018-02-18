class CreateSnapSearchResults < ActiveRecord::Migration[5.1]
  def change
    create_table :snap_search_results do |t|
      t.string :searched_image_url
      t.text :pastec_response
      t.text :es_response
      t.timestamps
    end
  end
end
