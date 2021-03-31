require 'nokogiri'

module SnapTranslator
  def translate_short_desc text, preferred_language
    return text if text.nil? || text.empty? || text.blank?

    # Strip unwanted content
    begin
      # document = Nokogiri::HTML(text)
      # document.remove_namespaces!
      # short_description = document.xpath("//p")[0].content

      return text if preferred_language && preferred_language.downcase == 'en'

      # Configure language translator
      translator = GoogleTranslate.new preferred_language
      text = translator.translate(text)
      text = CGI::unescapeHTML(text) if !text.nil?
    rescue Exception => error
      p error
      text = text if text
    end

    return text
  end
  module_function :translate_short_desc

  def translate_story_content text, preferred_language
    return {"html" => text} if text.nil? || text.empty? || text.blank?
    return {"html" => text} if preferred_language.downcase == 'en'
    # Configure language translator
    translator = GoogleTranslate.new preferred_language
    text = translator.translate(text)
    text = CGI::unescapeHTML(text) if !text.nil?

    return {"html" => text}
  end
  module_function :translate_story_content

  def translate_story_title title, preferred_language
    return title if title.nil? || title.empty? || title.blank?
    return title if preferred_language.downcase == 'en'

    translator = GoogleTranslate.new preferred_language
    title = translator.translate(title)

    return title
  end
  module_function :translate_story_title
end