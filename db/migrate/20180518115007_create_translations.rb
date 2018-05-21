class CreateTranslations < ActiveRecord::Migration[5.1]
  def change
    create_table :translations do |t|
      t.integer :parent_id
      t.text :screen_text, null: :false, default: ""
      t.text :english_translation
      t.text :chinese_translation
      t.text :french_translation
      t.text :german_translation
      t.text :italian_translation
      t.text :japanese_translation
      t.text :korean_translation
      t.text :russian_translation
      t.text :spanish_translation
      t.timestamps
    end
    add_index :translations, :parent_id
  end
end
