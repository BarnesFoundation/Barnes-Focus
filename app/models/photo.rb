class Photo < ApplicationRecord
    belongs_to :album

    scope :order_by_scanned_time, -> { order("created_at DESC") }
end
