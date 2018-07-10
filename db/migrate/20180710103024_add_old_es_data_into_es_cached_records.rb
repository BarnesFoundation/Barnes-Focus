class AddOldEsDataIntoEsCachedRecords < ActiveRecord::Migration[5.1]
  def change
    add_column :es_cached_records, :old_es_data, :text
  end
end
