class CreateSubscriptions < ActiveRecord::Migration[5.1]
  def change
    create_table :subscriptions do |t|
      t.string :email, null: false, default: ""
      t.boolean :is_subscribed, default: false
      t.timestamps
    end
    add_index :subscriptions, :email
    add_index :subscriptions, :is_subscribed
  end
end
