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
    search_result = @elastic_search.search index: "collection_*", body: get_image_query(object_id)
    if search_result && search_result['hits']['hits'].length > 0
      search_result['hits']['hits'][0]['_source']
    else
      nil
    end
  end

  private
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
end