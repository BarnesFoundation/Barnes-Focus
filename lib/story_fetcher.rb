require 'uri'
require 'net/http'
require 'net/https'

class StoryFetcher
  def initialize
    @endpoint = "https://api-useast.graphcms.com/v1/cjw53solj3odo01eh6l7trigw/master"
  end

  def find_by_object_id obj_id
    params = "
      {
        storiesForObjectIds(where: {objectID: #{obj_id}}) {
          id
          objectID
          #{related_stories}
        }
      }
    "

    response = query_grapql params
    resp = response.body.force_encoding 'utf-8' # Another way of doing this: response.body.to_s.encode('UTF-8', invalid: :replace, undef: :replace, replace: '?')

    return JSON.parse(resp)
  end

  def find_by_room_id room_id
    params = "
      {
        storiesForRoomIds(where: {roomID: #{room_id}}) {
          id
          roomID
          #{related_stories}
        }
      }
    "

    response = query_grapql params
    resp = response.body.force_encoding 'utf-8'

    return JSON.parse(resp)
  end

  def related_stories
    return "
      relatedStories {
        id
        alternativeHeroImageObjectID
        objectID1
        shortParagraph1
        {html}
        longParagraph1
        {html}
        objectID2
        shortParagraph2
        {html}
        longParagraph2
        {html}
        objectID3
        shortParagraph3
        {html}
        longParagraph3
        {html}
        objectID4
        shortParagraph4
        {html}
        longParagraph4
        {html}
        objectID5
        shortParagraph5
        {html}
        longParagraph5
        {html}
        objectID6
        shortParagraph6
        {html}
        longParagraph6
        {html}
      }
    "
  end

  def query_grapql params
    uri = URI.parse(@endpoint + "?query=" + params)
    req = Net::HTTP::Post.new(uri.to_s)

    https_request = Net::HTTP.new(uri.host, uri.port).tap do |http|
      http.use_ssl = true
    end

    response = https_request.request(req)
    return response
  end
end