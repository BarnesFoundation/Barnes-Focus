class AddStoryContentIntoBookmarks < ActiveRecord::Migration[5.1]
  def change
    add_column :bookmarks, :story_read, :boolean, default: false
    add_column :bookmarks, :story_mail_sent, :boolean, default: false

    add_index :bookmarks, :story_read
    add_index :bookmarks, [:story_read, :story_mail_sent]
  end
end
