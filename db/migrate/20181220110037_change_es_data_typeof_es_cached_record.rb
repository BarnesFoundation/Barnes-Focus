class ChangeEsDataTypeofEsCachedRecord < ActiveRecord::Migration[5.1]
  reversible do |change|
    change.up   {
      change_column :es_cached_records, :es_data, 'jsonb USING CAST(es_cached_records.es_data AS jsonb)'
      add_index :es_cached_records, :es_data
    }
    change.down { change_column :es_cached_records, :es_data, 'json USING CAST(es_cached_records.es_data AS json)' }
  end
end
