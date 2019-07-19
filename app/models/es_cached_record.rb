require 'barnes_elastic_search'

class EsCachedRecord < ApplicationRecord
  validates :image_id, presence: true

  @es_fields = [
    'id',
    'imageSecret',
    'title',
    'shortDescription',
    'people',
    'classification',
    'locations',
    'medium',
    'url',
    'invno',
    'displayDate',
    'dimensions',
    'objRightsTypeID',
    'creditLine',
    'room',
    'ensembleIndex',
    'curatorialApproval',
    'birthDate',
    'deathDate',
    'nationality',
    'culture'
  ]

  ## Determines whether a cached record has expired data or not
  def not_expired?
    expired = false

    # If last fetch time isn't blank
    unless last_es_fetched_at.blank?
      expired = true if last_es_fetched_at.between?(DateTime.now - 4.hours)
    end
    return expired
  end

  ## Returns the cached data for a provided image id 
  def self.search img_id
    searched_data = nil

    # Search for the record, create new one if none exists
    es_cached_record = find_by image_id: img_id #find_or_create_by image_id: img_id
    es_cached_record = new(image_id: img_id) if es_cached_record.nil?

    # If it's a new record or has no es data
    if es_cached_record.new_record? || es_cached_record.es_data.blank?

      # Query elastic search for the data and save it
      searched_data = connect_with_es_endpoint(img_id)
      es_cached_record.es_data = searched_data
      es_cached_record.last_es_fetched_at = DateTime.now
      es_cached_record.save
    else
      searched_data = es_cached_record.es_data
    end

    unless searched_data.nil?
      # Build the image url for the record
      searched_data['art_url'] = Image.imgix_url(searched_data['id'], searched_data['imageSecret'])
    end

    return searched_data
  end

  def self.fetch_all image_ids
    arts = where(image_id: image_ids).collect(&:es_data)

    arts.each do |art|
      art['art_url'] = Image.imgix_url(art['id'], art['imageSecret'])
    end

    return arts if image_ids.size == arts.size

    original_ids = arts.map { |art| art["id"].to_s }
    ids_not_found = image_ids - original_ids

    if ids_not_found.any?
      ids_not_found.each do | art_id |
        arts.push search(art_id)
      end
    end

    return arts.compact
  end

  ## Retrieves the object data from elastic search for a provided image id
  def self.connect_with_es_endpoint image_id
    # Query elastic search and extract the desired fields
    searched_data = BarnesElasticSearch.instance.get_object(image_id)
    searched_data = searched_data.slice(*@es_fields) unless searched_data.nil?

    return searched_data
  end

  def self.keep_es_fields result_hash
    result_hash.slice( *@es_fields )
  end

  ## While you're in this room feature ##
  ## this method accepts two parameters. (1) image_id and (2) viewed images ##
  def self.find_similar_arts image_id, viewed_images = [], limit = ENV['SIMILAR_ARTS_MAX_LIMIT'] || 3
    similar_art_objects = []

    @es_cached_record = find_by image_id: image_id

    if @es_cached_record && @es_cached_record.es_data.present?
      given_value = @es_cached_record.es_data[ "ensembleIndex" ]

      if given_value.present? && (!given_value.to_i.eql?(0) || !given_value.blank?)
        # calculate lower bound for given value
        # formula is: LB = x % 4 == 0 ? ((x-1) /4 * 4 + 1) : (x /4 * 4 + 1)
        lower_bound = given_value.to_i
        lower_bound = lower_bound % 4 == 0 ? ( ( ( ( lower_bound - 1 ) / 4 ) * 4 )+ 1 ) : ( ( ( lower_bound / 4 ) * 4 ) + 1 )

        # cacluate upper bound for given value
        # formula is: UB = x % 4 == 0 ?  ((x-1) / 4 + 1) * 4 :  ((x / 4 + 1) * 4)
        upper_bound = given_value.to_i
        upper_bound = upper_bound % 4 == 0 ? ( ( ( upper_bound - 1 ) / 4 + 1 ) * 4 ) : ( ( upper_bound / 4 + 1 ) * 4 )

        # querying table against `ensembleIndex` of es_data
        es_cached_records = all
        es_cached_records = es_cached_records.where.not( image_id: viewed_images ) if viewed_images.present?

        es_cached_records = es_cached_records.where( "(es_data ->> 'ensembleIndex')::int >= ?", lower_bound )
        es_cached_records = es_cached_records.where( "(es_data ->> 'ensembleIndex')::int <= ?", upper_bound )

        # querying table against `shortDescription` of es_data
        es_cached_records = es_cached_records.where( "es_data ->> 'shortDescription' != ?", '' )

        es_cached_records = es_cached_records.limit(limit)
        similar_art_objects = similar_art_objects.push es_cached_records.collect(&:es_data)
        similar_art_objects = similar_art_objects.flatten
        similar_art_objects.map { | similar_art_object |
          similar_art_object['art_url'] = Image.imgix_url(similar_art_object['id'], similar_art_object['imageSecret']) # To-Do: Duplicate code
        }
        similar_art_objects = similar_art_objects.map { | similar_art_object | similar_art_object.slice( 'id', 'art_url' ) }
      end
    end

    return similar_art_objects
  end
end
