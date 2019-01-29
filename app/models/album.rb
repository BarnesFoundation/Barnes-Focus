class Album < ApplicationRecord
    validates :name, :unique_identifier, presence: true

    before_validation :set_name

    has_many :photos, dependent: :destroy

    scope :recent, ->(per_page) { order("id desc").limit(per_page || 10) }
    scope :succeed, -> { joins(:photos).merge(Photo.successful_attempt) }

protected
    def set_name
        self.name = "Album: #{unique_identifier}"
    end
end
