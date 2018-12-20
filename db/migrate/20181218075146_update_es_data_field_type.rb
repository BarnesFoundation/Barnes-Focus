class UpdateEsDataFieldType < ActiveRecord::Migration[5.1]
  reversible do |change|
    change.up   { change_column :es_cached_records, :es_data, 'json USING CAST(es_cached_records.es_data AS json)' }
    change.down { change_column :es_cached_records, :es_data, 'text USING CAST(es_cached_records.es_data AS text)' }
  end
end
