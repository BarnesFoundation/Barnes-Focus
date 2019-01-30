class DropUnusedTables < ActiveRecord::Migration[5.1]
  def change
    drop_table :snap_search_results do |t|
      t.string :searched_image_url
      t.text :api_response
      t.text :es_response
      t.timestamps null: false
      t.text :response_time
      t.text :searched_image_data
    end

    drop_table :delayed_jobs do |table|
      table.integer :priority, default: 0, null: false # Allows some jobs to jump to the front of the queue
      table.integer :attempts, default: 0, null: false # Provides for retries, but still fail eventually.
      table.text :handler,                 null: false # YAML-encoded string of the object that will do work
      table.text :last_error                           # reason for last failure (See Note below)
      table.datetime :run_at                           # When to run. Could be Time.zone.now for immediately, or sometime in the future.
      table.datetime :locked_at                        # Set when a client is working on this object
      table.datetime :failed_at                        # Set when all retries have failed (actually, by default, the record is deleted instead)
      table.string :locked_by                          # Who is working on this object (if locked)
      table.string :queue                              # The name of the queue this job is in
      table.timestamps null: true
    end

    drop_table :training_records do |table|
      t.integer :identifier
      t.string :image_url
      t.string :title
      t.string :artist
      t.string :accession
      t.string :aasm_state
      t.text :pastec_response
      t.timestamps
    end
  end
end
