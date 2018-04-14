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

  desc "this task is a backup of delayed job which insert entries into es cached records"
  task backup: :environment do
    csv_path = ''
    image_ids = []
    CSV.foreach(csv_path) do |rows|
      image_ids << rows[0]
    end

    image_ids.each do |image_id|
      es_cached_record = EsCachedRecord.find_by image_id: image_id
      next if es_cached_record.present?
      es_cached_record = EsCachedRecord.new(image_id: image_id)
      es_cached_record.es_data = EsCachedRecord.connect_with_es_endpoint(image_id)
      es_cached_record.last_es_fetched_at = DateTime.now
      es_cached_record.save
    end
  end
end