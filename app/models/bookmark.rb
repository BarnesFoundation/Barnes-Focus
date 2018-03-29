class Bookmark < ApplicationRecord
  validates :email, :image_id, presence: true
end
