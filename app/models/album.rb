class Album < ApplicationRecord
    validates :name, :unique_identifier, presence: true

    before_validation :set_name

    has_many :photos, dependent: :destroy

    scope :recent, -> { order("id desc").limit(10) }

protected
    def set_name
        self.name = "Album: #{Time.now.strftime('%Y-%m-%d %H:%M:%S')}"
    end
end
