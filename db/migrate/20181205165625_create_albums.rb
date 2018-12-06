class CreateAlbums < ActiveRecord::Migration[5.1]
  def change
    create_table :albums do |t|
      t.string :name, null: false, default: ""
      t.string :unique_identifier, null: false
      t.timestamps
    end
    add_index :albums, :unique_identifier
  end
end
