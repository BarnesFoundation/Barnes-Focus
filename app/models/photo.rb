class Photo < ApplicationRecord
    belongs_to :album

    scope :order_by_scanned_time, -> { order("created_at DESC") }
    scope :successful_attempt, -> { where("result_image_url IS NOT NULL") }
end
