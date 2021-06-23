require "google/cloud/translate"

class GoogleTranslate
  attr_accessor :project_id , :target_language

  def initialize(language)
    self.project_id = ENV['GC_PROJECT_ID']
    self.target_language = language
    @google_translate = Google::Cloud::Translate.new project: project_id, keyfile: "#{Rails.root || '.'}/private/snap-198215-dea896d15e75.json"
  end

  def translate text
    translated_text = @google_translate.translate text, to: self.target_language

    #if origin language and target is not detected then return same text
    translated_text.detected? ? "#{translated_text}" : text

    rescue Google::Cloud::InvalidArgumentError
      puts "target language is invalid"
      text
  end

  def supported_languages(local_culture="en")
    @google_translate.languages local_culture
  end
end