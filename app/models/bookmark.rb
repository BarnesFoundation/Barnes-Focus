class Bookmark < ApplicationRecord
  validates :image_id, presence: true

  attr_accessor :newsletter

  scope :recent_bookmarks, -> { where(created_at: Time.now.utc - 3.hours..Time.now.utc) }
  scope :ready_to_deliver, -> { where(mail_sent: false) }
  scope :stories_to_deliver, -> { where(story_read: true, story_mail_sent: false) }
end
