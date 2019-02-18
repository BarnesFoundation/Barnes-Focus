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

    def self.failed_scans
      find_by_sql("
        SELECT * FROM (
          SELECT
            albums.*,
            CAST(
              SUM(
                CASE WHEN photos.result_image_url IS NOT NULL THEN 1 ELSE 0 END
              ) AS INT
            ) AS successful_match
            FROM
              photos
          INNER JOIN albums ON albums.id = photos.album_id
          WHERE photos.response_time NOT LIKE 'null'
          GROUP BY albums.id
          ORDER BY albums.id DESC
        ) Q1 WHERE successful_match = 0
      ")
    end

protected
    def set_name
        self.name = "Album: #{unique_identifier}"
    end
end
