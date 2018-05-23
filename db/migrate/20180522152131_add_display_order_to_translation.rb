class AddDisplayOrderToTranslation < ActiveRecord::Migration[5.1]
  def change
    add_column :translations, :display_order, :integer
    add_column :translations, :unique_identifier, :string
    add_index :translations, :display_order
    add_index :translations, :unique_identifier
  end
end
