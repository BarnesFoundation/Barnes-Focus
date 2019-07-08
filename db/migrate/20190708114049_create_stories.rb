class CreateStories < ActiveRecord::Migration[5.1]
  def change
    create_table :stories do |t|
      t.string :title
      t.string :slug
      t.timestamps
    end
    add_index :stories, :title
    add_index :stories, :slug
  end
end
