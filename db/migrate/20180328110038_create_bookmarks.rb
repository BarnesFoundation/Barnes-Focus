class CreateBookmarks < ActiveRecord::Migration[5.1]
  def change
    create_table :bookmarks do |t|
      t.string :email, null: false, default: ""
      t.string :image_id, null: false, default: ""
      t.datetime :received_on
      t.boolean :mail_sent, default: false
      t.timestamps
    end
    add_index :bookmarks, :email
    add_index :bookmarks, :image_id
    add_index :bookmarks, :received_on
    add_index :bookmarks, :mail_sent
  end
end
