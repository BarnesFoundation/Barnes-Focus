class CreatePhotos < ActiveRecord::Migration[5.1]
  def change
    create_table :photos do |t|
      t.belongs_to :album
      t.text :searched_image_blob
      t.text :searched_image_s3_url
      t.string :es_response
      t.string :search_engine
      t.string :response_time
      t.timestamps
    end
  end
end
