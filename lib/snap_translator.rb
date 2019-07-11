require 'nokogiri'

module SnapTranslator
  def translate_short_desc text, preferred_language
    return text if text.blank?

    # Strip unwanted content
    begin
      document = Nokogiri::HTML(text)
      document.remove_namespaces!
      short_description = document.xpath("//p")[0].content

      return short_description if preferred_language && preferred_language.downcase == 'en'

      # Configure language translator
      translator = GoogleTranslate.new preferred_language
      text = translator.translate(text) if !text.blank? || !text.nil?
      text = CGI::unescapeHTML(text)
    rescue Exception => error
      p error
      text = text if text
    end

    return text
  end
  module_function :translate_short_desc

  def translate_story_content text, preferred_language
    return {"html" => text} if text.blank?

    # Configure language translator
    translator = GoogleTranslate.new preferred_language
    if !text.blank? || !text.nil?
      text = translator.translate(text)
      text = CGI::unescapeHTML(text)
    end

    return {"html" => text}
  end
  module_function :translate_story_content

  def translate_story_title title, preferred_language
    translator = GoogleTranslate.new preferred_language
    title = translator.translate(title) if !title.blank? || !title.nil?

    return title
  end
  module_function :translate_story_title
end