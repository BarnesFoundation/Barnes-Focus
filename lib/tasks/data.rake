namespace :data do
  desc 'backup es_data column to old_es_data column'
  task backup_es_cached_records: :environment do
    EsCachedRecord.find_each do | es_cached_record |
      es_cached_record.old_es_data = es_cached_record.es_data
      es_cached_record.save
    end
  end
end