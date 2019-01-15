class AddLangPreftoSessions < ActiveRecord::Migration[5.1]
  def change
    add_column :sessions, :lang_pref, :string
  end
end
