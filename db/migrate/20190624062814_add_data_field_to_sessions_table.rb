class AddDataFieldToSessionsTable < ActiveRecord::Migration[5.1]
  def change
    add_column :sessions, :blob, :jsonb, null: false, default: '{}'
    add_index :sessions, :blob, using: :gin
  end
end
