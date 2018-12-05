class Album < ApplicationRecord
    validates :name, presence: true

    before_validation :set_name

protected
    def set_name
        self.name = "Album: #{Time.now.strftime('%Y-%m-%d %H:%M:%S')}"
    end
end
