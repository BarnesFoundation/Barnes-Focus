class AddSessionIdtoBookmarks < ActiveRecord::Migration[5.1]
  def change
    add_column :bookmarks, :session_id, :integer
    add_index :bookmarks, :session_id
    add_index :bookmarks, [:session_id, :email]
  end
end
