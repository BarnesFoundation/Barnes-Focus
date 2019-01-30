class AddSessionIdIntoAlbum < ActiveRecord::Migration[5.1]
  def change
    add_column :albums, :session_id, :integer
    add_index :albums, :session_id
    add_index :albums, [:unique_identifier, :session_id]
  end
end
