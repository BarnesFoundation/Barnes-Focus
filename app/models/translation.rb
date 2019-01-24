class Translation < ApplicationRecord
  validates :screen_text, presence: true
  before_save :set_english_translation

  scope :all_parents, -> { where(parent_id: nil) }
  scope :all_childrens, ->(parent_id) { where(parent_id: parent_id) }

  class << self
    def search language='en'
      column_name = db_column_for?(language)
      translations = {}

      all_parents.order( 'display_order ASC' ).each do | main_text |
        header = format(main_text.screen_text)
        translations[ header ] = {}
        all_childrens( main_text.id ).order('unique_identifier ASC').each do | content |
          translations[ header ][ content.unique_identifier ] = {
            screen_text: format(content.screen_text),
            translated_content: content.send(column_name).blank? ? format(content.english_translation) : format(content.send(column_name))
          }
        end
      end

      translations
    end

    def find_by_header_text_and_language header_text, language='en'
      column_name = db_column_for?(language)
      translations = {}

      where(screen_text: header_text).each do | main_text |
        header = format(main_text.screen_text)
        translations[ header ] = {}

        all_childrens( main_text.id ).each do | content |
          translations[ header ][ content.unique_identifier ] = {
            screen_text: format(content.screen_text),
            translated_content: content.send(column_name).blank? ? format(content.english_translation) : format(content.send(column_name))
          }
        end
      end

      translations
    end

    def db_column_for?(language)
      h = {
        'en' => :english_translation,
        'zh' => :chinese_translation,
        'fr' => :french_translation,
        'de' => :german_translation,
        'it' => :italian_translation,
        'ja' => :japanese_translation,
        'ko' => :korean_translation,
        'ru' => :russian_translation,
        'es' => :spanish_translation
      }
      return h[language]
    end

    def format text
      text.gsub("\t", '')
    end
  end

  protected

  def set_english_translation
    self.english_translation = screen_text if english_translation.nil? || english_translation.blank?
  end
end