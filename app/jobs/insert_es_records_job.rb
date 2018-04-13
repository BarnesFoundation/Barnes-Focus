class InsertEsRecordsJob < ApplicationJob
  queue_as :image_processing_queue

  def perform csv_path
    image_ids = []
    CSV.foreach(csv_path) do |rows|
      image_ids << rows[0]
    end

    image_ids.each do |image_id|
      es_cached_record = EsCachedRecord.find_by image_id: image_id
      es_cached_record = EsCachedRecord.new(image_id: image_id) if es_cached_record.nil?
      es_cached_record.es_data = EsCachedRecord.connect_with_es_endpoint(image_id)
      es_cached_record.last_es_fetched_at = DateTime.now
      es_cached_record.save
    end
  end
end