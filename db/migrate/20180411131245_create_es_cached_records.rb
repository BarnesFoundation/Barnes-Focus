class CreateEsCachedRecords < ActiveRecord::Migration[5.1]
  def change
    create_table :es_cached_records do |t|
      t.string :image_id, null: false
      t.text :es_data
      t.datetime :last_es_fetched_at
      t.timestamps
    end
    add_index :es_cached_records, :image_id
    add_index :es_cached_records, :last_es_fetched_at

    drop_table(:uploads, if_exists: true)
  end
end
