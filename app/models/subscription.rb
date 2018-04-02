class Subscription < ApplicationRecord
  validates :email, presence: true
end
