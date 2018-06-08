class ManageBookmarks < ActiveRecord::Migration[5.1]
  def change
    remove_column :bookmarks, :received_on, :datetime
    add_column :bookmarks, :language, :string
    add_index :bookmarks, :language
  end
end
