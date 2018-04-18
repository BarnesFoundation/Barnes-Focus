class AddResponseTimeToSnapSearchResult < ActiveRecord::Migration[5.1]
  def change
    add_column :snap_search_results, :response_time, :text
  end
end
