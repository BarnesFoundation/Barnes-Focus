require 'uri'
require 'net/http'
require 'resolv-replace'

class StoryFetcher
  UNIQUE_SEPARATOR = "***"

  def initialize
	@endpoint = ENV['GRAPHCMS_ENDPOINT']
  end

  def has_story? obj_id
    params = "
      {
        storiesForObjectIds(where: {objectID: #{obj_id}}) {
          id
          objectID
          relatedStories {
            id
          }
        }
      }
    "

    response = query_grapql params
    response_body = response.body.force_encoding 'utf-8'
    response_body = JSON.parse(response_body)

    return { story_id: nil, has_story: false } if response_body["data"]["storiesForObjectIds"].empty? || response_body["data"]["storiesForObjectIds"][0]["relatedStories"].empty?

    story_id = response_body["data"]["storiesForObjectIds"][0]["relatedStories"][0]["id"]
    return { story_id: story_id, has_story: true }
  end

  def find_by_object_id obj_id, preferred_lang = 'en'
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

    return parse_response_and_fetch_metadata original_response, obj_id, preferred_lang
  end

  def find_by_title title, preferred_lang = 'en'
    params = "
      {
        storiesForObjectIds(where: {relatedStories_some: {storyTitle: \"#{CGI::escape(title).gsub('%22', '%5C%22')}\"}}) {
          id
          objectID
          #{related_stories}
        }
      }
    "

    response = query_grapql params
    response = response.body.force_encoding 'utf-8' # Another way of doing this: response.body.to_s.encode('UTF-8', invalid: :replace, undef: :replace, replace: '?')
    original_response = JSON.parse(response)

    return parse_response_and_fetch_metadata original_response, nil, preferred_lang
  end

  def find_by_room_id room_id, preferred_lang
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
    original_response = JSON.parse(response)

    return parse_response_and_fetch_metadata original_response, room_id, preferred_lang
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
    begin
      uri = URI.parse(@endpoint + "?query=" + params)
    rescue URI::InvalidURIError
      uri = URI.parse(URI.escape(@endpoint + "?query=" + params))
    end

    req = Net::HTTP::Post.new(uri.to_s)
    response = nil

    Net::HTTP.start(uri.host, uri.port, :use_ssl => uri.scheme == 'https') do |http|
      response = http.request req
    end

    return response
  end

  def get_stories(story_attrs, searched_object_id, translatable_content)
    stories = Array.new.tap do |s|
      [1, 2, 3, 4, 5, 6].each do |i|
        next if !story_attrs.has_key?("objectID"+i.to_s) || story_attrs["objectID"+i.to_s].nil?
        object_id = "objectID#{i.to_s}"
  
        img_id = ("objectID1" == object_id && searched_object_id.to_s == story_attrs[object_id].to_s) ? story_attrs["alternativeHeroImageObjectID"] : story_attrs["objectID"+i.to_s]
       
        h = {
          "image_id"        => img_id,
          "short_paragraph" => story_attrs["shortParagraph"+i.to_s],
          "long_paragraph"  => story_attrs["longParagraph"+i.to_s],
          "detail"          => nil
        }

        paragraphs = translatable_content.find { |t| t["img_id"].to_s == h["img_id"].to_s}

        if paragraphs && ENV['STORY_PARAGRAPH_TO_USE'].present?
          case ENV['STORY_PARAGRAPH_TO_USE']
          when 'short'
            h["short_paragraph"] = {"html" => paragraphs["content"]}
          when 'long'
            h["long_paragraph"] = {"html" => paragraphs["content"]}
          end
        end

        s.push h
      end
    end 
  end

  def get_stories_details(stories, arts)
    stories.tap do |s|
      s.map do |story|
        story["detail"] = arts.find { |art| art["id"].to_s == story["image_id"].to_s}
      end
    end
  end

  def get_translatable_content(story_attrs, searched_object_id, preferred_lang)
    translatable_content = Hash.new.tap do |t|
      [1, 2, 3, 4, 5, 6].each do |i|
        next if !story_attrs.has_key?("objectID"+i.to_s) || story_attrs["objectID"+i.to_s].nil?
        object_id = "objectID#{i.to_s}"
  
        img_id = ("objectID1" == object_id && searched_object_id.to_s == story_attrs[object_id].to_s) ? story_attrs["alternativeHeroImageObjectID"] : story_attrs["objectID"+i.to_s]
  
        if ENV.has_key?('STORY_PARAGRAPH_TO_USE') && ENV['STORY_PARAGRAPH_TO_USE'] == 'short' && preferred_lang != "en"
          t[img_id] = "#{UNIQUE_SEPARATOR} #{story_attrs['shortParagraph'+i.to_s]['html']}"
        end
  
        if ENV.has_key?('STORY_PARAGRAPH_TO_USE') && ENV['STORY_PARAGRAPH_TO_USE'] == 'long' && preferred_lang != "en"
          t[img_id] =  "#{UNIQUE_SEPARATOR} #{story_attrs['longParagraph'+i.to_s]['html']}"
        end
      end
    end

    if !translatable_content.empty?
      translatable_text = translatable_content.values.join(" ")
      translatable_text = SnapTranslator.translate_story_content(translatable_text, preferred_lang)["html"]
      translatable_text = translatable_text.split("#{UNIQUE_SEPARATOR}").drop(1).map(&:lstrip)

      keys = translatable_content.keys

      translatable_content = Hash[keys.zip(translatable_text)]
    end

    return translatable_content
  end

  def parse_response_and_fetch_metadata original_response, searched_object_id, preferred_lang
    content, total, unique_identifier = Hash.new, 0, nil

    return {unique_identifier: unique_identifier, content: content, total: total} if original_response["data"]["storiesForObjectIds"].empty? || original_response["data"]["storiesForObjectIds"][0]["relatedStories"].empty?

    related_stories = original_response["data"]["storiesForObjectIds"][0]["relatedStories"]
    story_attrs = related_stories.size > 1 ? related_stories.last : related_stories.first
    translatable_content = get_translatable_content(story_attrs, searched_object_id, preferred_lang)
    stories = get_stories(story_attrs, searched_object_id, translatable_content)
    arts = EsCachedRecord.fetch_all(stories.map{|s| s["image_id"]})

    content["story_title"] = preferred_lang == "en" ? story_attrs["storyTitle"] : SnapTranslator.translate_story_title(story_attrs["storyTitle"], preferred_lang)
    content["original_story_title"] = story_attrs["storyTitle"]
    content["stories"] = get_stories_details(stories, arts)

    unique_identifier = story_attrs["id"]
    total = content["stories"].count

    return {unique_identifier: unique_identifier, content: content, total: total}
  end
end