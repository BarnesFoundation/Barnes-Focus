require 'uri'
require 'net/http'
require 'net/https'

class StoryFetcher
  def initialize
    @endpoint = "https://api-useast.graphcms.com/v1/cjw53solj3odo01eh6l7trigw/master"
  end

  def has_related_stories? obj_id
    return true
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
    response = response.body.force_encoding 'utf-8' # Another way of doing this: response.body.to_s.encode('UTF-8', invalid: :replace, undef: :replace, replace: '?')
    original_response = JSON.parse(response)

    return parse_response_and_fetch_metadata original_response, obj_id
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
        storyTitle
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

  def parse_response_and_fetch_metadata original_response, searched_object_id
    content, total = Hash.new, 0

    return {content: content, total: total} if original_response["data"]["storiesForObjectIds"].empty? || original_response["data"]["storiesForObjectIds"][0]["relatedStories"].empty?

    related_stories = original_response["data"]["storiesForObjectIds"][0]["relatedStories"]
    story_attrs = related_stories.size > 1 ? related_stories.last : related_stories.first

    content["story_title"] = story_attrs["storyTitle"]
    content["stories"] = Array.new

    [1, 2, 3, 4, 5, 6].each do |i|
      next if !story_attrs.has_key?("objectID"+i.to_s) || story_attrs["objectID"+i.to_s].nil?
      object_id = "objectID#{i.to_s}"

      art_info = ("objectID1" == object_id && searched_object_id == story_attrs[object_id]) ? EsCachedRecord.find_by(image_id: story_attrs["alternativeHeroImageObjectID"]) : EsCachedRecord.find_by(image_id: story_attrs["objectID"+i.to_s])

      h = {
        "image_id"        => story_attrs[object_id],
        "short_paragraph" => story_attrs["shortParagraph"+i.to_s],
        "long_paragraph"  => story_attrs["longParagraph"+i.to_s],
        "art_url"         =>  Image.imgix_url(art_info.es_data['id'], art_info.es_data['imageSecret']),
        "art_info"        => art_info.es_data
      }

      content["stories"].push h
    end

    total = content["stories"].count

    return {content: content, total: total}
  end
end