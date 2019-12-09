require 'elasticsearch'
require 'jbuilder'

class BarnesElasticSearch
  include Singleton

  def initialize
    @elastic_search = Elasticsearch::Client.new(hosts:{
        host: Rails.application.secrets[:elasticsearch][:host] ,
        port: Rails.application.secrets[:elasticsearch][:port],
        user: Rails.application.secrets[:elasticsearch][:user],
        password: Rails.application.secrets[:elasticsearch][:password],
        scheme:'https'
    })
  end

  def find_all offset=0, limit=50
    results = []
    api = @elastic_search.search index: 'collection', body: fetch_all( offset, limit )

    if api && api[ 'hits' ] && api[ 'hits' ][ 'hits' ].length > 0
      results = api[ 'hits' ][ 'hits' ].map { |result| result[ '_source' ] }
    end

    results
  end

  def total
    total   = 0
    results = @elastic_search.count index: 'collection'
	
	if results && results[ 'count' ] && results[ 'count' ] > 0
	   total = results[ 'count' ]
    end

    total
  end

  def get_object object_id
    search_result = @elastic_search.search index: "collection", body: get_image_query(object_id)
    if search_result && search_result['hits']['hits'].length > 0
      search_result['hits']['hits'][0]['_source']
    else
      nil
    end
  end

  def get_room_objects room, viewed_images
    search_result = @elastic_search.search index: 'collection', body: get_room_query(room, viewed_images)
    if search_result && search_result['hits']['hits'].length > 0
      return search_result['hits']['hits']
    else
      return nil
    end
  end

  private

  @@es_fields = [
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
	'culture',
	'visualDescription'
  ]

  ## Builds query for retrieving specified object id from Elastic Search 
  def get_image_query object_id
	query = Jbuilder.encode do |json|
	  json.from 0
	  json.size 25
	  json._source do
	     json.array! @@es_fields
	  end
      json.query do
        json.bool do
          json.filter do
            json.exists do
              json.field "imageSecret"
            end
          end
          json.must do
            json.match do
              json._id  object_id
            end
          end
        end
      end
    end
  end

  ## Builds query for retrieving object ids from room in Elastic Search
  def get_room_query room_id, viewed_image_ids
    query = Jbuilder.encode do |json|
      json.from 0
      json.size 3
      json.query do
        json.bool do
          json.filter do
            json.exists do
              json.field "imageSecret"
            end
          end
          # Room must match provided room id
          json.must do
            json.match do
              json.room  room_id
            end
          end
          # Image ids must not match one's we've already seen
          if viewed_image_ids.length > 0
            json.must_not do
              json.array!(viewed_image_ids) do |image_id|
                json.match do
                  json._id image_id
                end
              end
            end
          end
        end
      end
    end
  end

  def fetch_all offset, limit

	
	query = Jbuilder.encode do |json|
	  json.from offset
	  json.size limit
	  json._source do
	     json.array! @@es_fields
	  end
      json.query do
        json.bool do
          json.filter do
            json.exists do
              json.field "imageSecret"
            end
          end
        end
      end
    end
  end

end