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

  def get_object object_id
    search_result = @elastic_search.search index: "collection", body: get_image_query(object_id)
    if search_result && search_result['hits']['hits'].length > 0
      search_result['hits']['hits'][0]['_source']
    else
      nil
    end
  end

  def get_room_objects room
    search_result = @elastic_search.search index: 'collection', body: get_room_query(room)
    if search_result && search_result['hits']['hits'].length > 0
      return search_result['hits']['hits']
    else
      return nil
    end
  end

  private

  ## Builds query for retrieving specified object id from Elastic Search 
  def get_image_query object_id
    query = Jbuilder.encode do |json|
      json.from 0
      json.size 25
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

  def get_room_query room_id
    query = Jbuilder.encode do |json|
      json.from 0
      json.size 25
      json.query do
        json.bool do
          json.filter do
            json.exists do
              json.field "imageSecret"
            end
          end
          json.must do
            json.match do
              json.room room_id
            end
          end
        end
      end
    end
  end

end