class Story < ApplicationRecord
  before_create :set_slug

protected
  def set_slug
    self.slug = title.to_s.parameterize
  end
end
