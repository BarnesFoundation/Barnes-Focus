require 'uri'
require 'net/http'
require 'resolv-replace'

class StoryFetcher
  UNIQUE_SEPARATOR = "***"

  def initialize
    @endpoint = ENV['GRAPHCMS_ENDPOINT']
  end

  def has_story? obj_id
    response = GraphCms::Client.query(
      GraphCms::StoriesForObjectIdsQuery, variables: { objectID: obj_id.to_i }
    )

    return { story_id: nil, has_story: false } if  response.original_hash["data"]["storiesForObjectIds"].empty? || response.original_hash["data"]["storiesForObjectIds"][0]["relatedStories"].empty?

    story_id = response.original_hash["data"]["storiesForObjectIds"][0]["relatedStories"][0]["id"]
    return { story_id: story_id, has_story: true }
  end

  def find_by_object_id obj_id, preferred_lang = 'en'
    response = GraphCms::Client.query(
      GraphCms::RelatedStoriesByObjIdQuery, variables: { objectID: obj_id.to_i }
    )

    return parse_response_and_fetch_metadata response.original_hash, obj_id, preferred_lang
  end

  def find_by_title title, preferred_lang = 'en'
    response = GraphCms::Client.query(
      GraphCms::RelatedStoriesByTitleQuery, variables: { storyTitle: "#{CGI::escape(title).gsub('%22', '%5C%22')}"}
    )

    return parse_response_and_fetch_metadata response.original_hash, nil, preferred_lang
  end

  def find_by_room_id room_id, preferred_lang
    response = GraphCms::Client.query(
      GraphCms::RelatedStoriesByRoomIdQuery, variables: { roomId: room_id.to_i }
    )

    return parse_response_and_fetch_metadata response.original_hash, room_id, preferred_lang
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

  def get_stories(story_attrs, searched_object_id, translatable_content)
    stories = Array.new

    [1, 2, 3, 4, 5, 6].each do |i|
      next if !story_attrs.has_key?("objectID"+i.to_s) || story_attrs["objectID"+i.to_s].nil?

      img_id = ("objectID1" == object_id && searched_object_id.to_s == story_attrs[object_id].to_s) ? story_attrs["alternativeHeroImageObjectID"] : story_attrs["objectID"+i.to_s]

      h = {
        "image_id"        => img_id,
        "short_paragraph" => story_attrs["shortParagraph"+i.to_s],
        "long_paragraph"  => story_attrs["longParagraph"+i.to_s],
        "detail"          => nil
      }

      stories.push h
    end
    return stories
  end

  def get_stories_details(stories, arts, translatable_content)
    stories.each do |story|
      arts.map {|art|
        story["detail"] = art if story["image_id"].to_s == art["id"].to_s
      }

      translatable_content.each { |img_id, content|
        story["short_paragraph"] = {"html" => content} if story["image_id"].to_s == img_id.to_s && ENV['STORY_PARAGRAPH_TO_USE'].present? && ENV['STORY_PARAGRAPH_TO_USE'] == 'short'
        story["long_paragraph"] = {"html" => content} if story["image_id"].to_s == img_id.to_s && ENV['STORY_PARAGRAPH_TO_USE'].present? && ENV['STORY_PARAGRAPH_TO_USE'] == 'long'
      }
    end

    return stories
  end

  def get_translatable_content(story_attrs, searched_object_id, preferred_lang)
    translatable_content = {}

    [1, 2, 3, 4, 5, 6].each do |i|
      next if !story_attrs.has_key?("objectID"+i.to_s) || story_attrs["objectID"+i.to_s].nil?
      object_id = "objectID#{i.to_s}"

      img_id = ("objectID1" == object_id && searched_object_id.to_s == story_attrs[object_id].to_s) ? story_attrs["alternativeHeroImageObjectID"] : story_attrs["objectID"+i.to_s]

      if ENV.has_key?('STORY_PARAGRAPH_TO_USE') && ENV['STORY_PARAGRAPH_TO_USE'] == 'short' && preferred_lang != "en"
        translatable_content[img_id] = "#{UNIQUE_SEPARATOR} #{story_attrs['shortParagraph'+i.to_s]['html']}"
      end

      if ENV.has_key?('STORY_PARAGRAPH_TO_USE') && ENV['STORY_PARAGRAPH_TO_USE'] == 'long' && preferred_lang != "en"
        translatable_content[img_id] =  "#{UNIQUE_SEPARATOR} #{story_attrs['longParagraph'+i.to_s]['html']}"
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
    content["story_title"] = preferred_lang == "en" ? story_attrs["storyTitle"] : SnapTranslator.translate_story_title(story_attrs["storyTitle"], preferred_lang)
    content["original_story_title"] = story_attrs["storyTitle"]
    stories = get_stories(story_attrs, searched_object_id, translatable_content)
    arts = EsCachedRecord.fetch_all(stories.map{|s| s["image_id"]})
    content["stories"] = get_stories_details(stories, arts, translatable_content)

    unique_identifier = story_attrs["id"]
    total = content["stories"].count

    return {unique_identifier: unique_identifier, content: content, total: total}
  end
end