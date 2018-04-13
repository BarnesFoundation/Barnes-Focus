require 'barnes_elastic_search'

namespace :update_es_cache do
  desc "This cron runs every 5 in morning (EST) and force update es cache"
  task perform: :environment do
    EsCachedRecord.find_in_batches(batch_size: 500) do | es_records |
      es_records.each { |es_record|
        searched_data = BarnesElasticSearch.instance.get_object(es_record.image_id)
        searched_data = searched_data.slice(
          'id', 'imageSecret', 'title', 'shortDescription', 'people', 'classification', 'locations', 'medium', 'url', 'invno', 'displayDate'
        )
        es_record.es_data = searched_data
        es_record.last_es_fetched_at = DateTime.now
        es_record.save
      }
    end
  end
end