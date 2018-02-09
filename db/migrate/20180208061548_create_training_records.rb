class CreateTrainingRecords < ActiveRecord::Migration[5.1]
  def change
    create_table :training_records do |t|
      t.integer :identifier
      t.string :image_url
      t.string :title
      t.string :artist
      t.string :accession
      t.string :aasm_state
      t.text :pastec_response

      t.timestamps
    end

    add_index :training_records, :aasm_state
    add_index :training_records, :identifier, unique: true
  end

end
