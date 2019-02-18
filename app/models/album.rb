class Album < ApplicationRecord
    validates :name, :unique_identifier, presence: true

    before_validation :set_name

    has_many :photos, dependent: :destroy

    scope :recent, ->(per_page) { order("id desc").limit(per_page || 10) }
    scope :succeed, -> { joins(:photos).merge(Photo.successful_attempt) }

    def self.failed_attempts # we are not using this for dump csv mailer. Only used inside admin
        ids = all.pluck(:id) - succeed.pluck(:album_id)
        where(id: ids)
    end

    def self.failed_scans # to use in scanned sessions
      all.pluck(:id) - succeed.pluck(:album_id)
    end

protected
    def set_name
        self.name = "Album: #{unique_identifier}"
    end
end
