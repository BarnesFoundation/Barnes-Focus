namespace :update_es_cache do
  desc "This cron runs every 5 in morning (EST) and force update es cache"
  task perform: :environment do
    EsCachedRecord.find_in_batches(batch_size: 500) do | es_records |
      es_records.each { |es_record|
        es_record.es_data = EsCachedRecord.connect_with_es_endpoint(es_record.image_id)
        es_record.last_es_fetched_at = DateTime.now
        es_record.save
      }
    end
  end
end