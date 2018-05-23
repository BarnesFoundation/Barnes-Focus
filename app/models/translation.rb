class Translation < ApplicationRecord
  scope :all_parents, -> { where(parent_id: nil) }
  scope :all_childrens, ->(parent_id) { where(parent_id: parent_id) }

  class << self
    def search language='en'
      column_name = db_column_for?(language)
      translations = {}

      all_parents.order( 'display_order ASC' ).each do | main_text |
        translations[ main_text.screen_text ] = []
        all_childrens( main_text.id ).each do | content |
          all_contents = {}
          all_contents[ content.unique_identifier ] = {
            screen_text: content.screen_text,
            translated_content: content.send(column_name)
          }
          translations[ main_text.screen_text ] << all_contents
        end
      end

      translations
    end

    def db_column_for?(language)
      h = {
        'en' => :english_translation,
        'ch' => :chinese_translation,
        'fr' => :french_translation,
        'gr' => :german_translation,
        'it' => :italian_translation,
        'ja' => :japanese_translation,
        'kr' => :korean_translation,
        'rs' => :russian_translation,
        'sp' => :spanish_translation
      }
      return h[language]
    end
  end
end