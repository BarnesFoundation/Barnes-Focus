require 'elasticsearch'

class BarnesElasticSearch
  def initialize
    @elastic_search = Elasticsearch::Client.new(hosts:{
        host: Rails.application.secrets[:elasticsearch_host] ,
        port: Rails.application.secrets[:elasticsearch_port],
        user: Rails.application.secrets[:elasticsearch_user],
        password: Rails.application.secrets[:elasticsearch_password],
        scheme:'https'
      })
  end

  ALL_MORE_LIKE_THIS_FIELDS = [
    'tags.tag.*',
    'tags.category.*',
    'color.palette-color-*',
    'color.average-*',
    'color.palette-closest-*',
    'title.*',
    'people.*',
    'people',
    'medium.*',
    'shortDescription.*',
    'longDescription.*',
    'visualDescription.*',
    'culture.*',
    'space',
    'light_desc_*',
    'color_desc_*',
    'comp_desc_*',
    'generic_desc_*',
    'period',
    'curvy',
    'vertical',
    'diagonal',
    'horizontal',
    'light'
  ]

  MORE_LIKE_THIS_FIELDS = [
    'people',
    'generic_desc_*',
    'curvy',
    'vertical',
    'diagonal',
    'horizontal',
    'light',
    'line'
  ]
end