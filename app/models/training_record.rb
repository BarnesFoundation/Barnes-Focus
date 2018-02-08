require 'pastec'

class TrainingRecord < ApplicationRecord

  include AASM

  aasm do
    state :new, :initial => true
    state :indexed

    event :index do
      transitions :from => :new, :to => :indexed do
        guard do
          run_index
        end
      end
    end

    event :remove_from_index do
      transitions :from => :indexed, :to => :new do
        guard do
          run_remove_from_index
        end
      end
    end

  end


  def run_index
    pastec_response = Pastec.new.index_image(self.image_url, self.identifier)
    if pastec_response.is_a?(Hash)
      self.update_column(:pastec_response, pastec_response.to_json)
      return true if pastec_response['type'] == 'IMAGE_ADDED'
    end
    return false
  end

  def run_remove_from_index
    pastec_response = Pastec.new.remove_image(self.identifier)
    if pastec_response.is_a?(Hash)
      self.update_column(:pastec_response, pastec_response.to_json)
      return true if pastec_response['type'] == 'IMAGE_REMOVED'
    end
    return false
  end


  class << self
    def delta_index
      ids_in = Pastec.new.ids_in_index
      puts "ids_in => #{ids_in}"
      all_ids = TrainingRecord.select('DISTINCT(identifier)').collect(&:identifier)
      ids_not_in = (all_ids - ids_in)
      puts "ids_not_in => #{ids_not_in.inspect}"
      trs = TrainingRecord.where(identifier: ids_not_in)
      trs.find_each do |tr|
        if tr.indexed?
          puts "it may fail as local status seems out of sync; todo: force fix status to new in this case automatically; and run index"
        end
        tr.index!
      end
    end

  end

end
