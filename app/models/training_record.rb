require 'pastec'

class TrainingRecord < ApplicationRecord

  include AASM

  aasm do
    state :new, :initial => true
    state :indexed    
  end

end
