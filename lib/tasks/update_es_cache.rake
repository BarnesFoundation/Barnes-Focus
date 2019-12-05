namespace :update_es_cache do
  desc "This cron runs every 5 in morning (EST) and force update es cache"
  task perform: :environment do
    total_records = BarnesElasticSearch.instance.total

    p 'There are in total ' + total_records.to_s + ' records present on ES server'

    batch_size = 500 # this can be managed from ENV variable as well
    number_of_loops = total_records / batch_size
    number_of_loops += 1 if total_records % batch_size > 0

    count = start = 0

    while count < number_of_loops
      results = BarnesElasticSearch.instance.find_all start, batch_size

      results.each do | result |

        es_cached_record = EsCachedRecord.find_by image_id: result[ 'id' ]
        es_cached_record = EsCachedRecord.new image_id: result[ 'id' ] if es_cached_record.nil?

        es_cached_record.es_data = result
        es_cached_record.last_es_fetched_at = DateTime.now
        es_cached_record.save
      end

      start += 500
      count += 1
    end
    p 'Execution finished'
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