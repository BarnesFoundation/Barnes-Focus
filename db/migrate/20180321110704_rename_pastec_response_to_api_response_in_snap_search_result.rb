class RenamePastecResponseToApiResponseInSnapSearchResult < ActiveRecord::Migration[5.1]
  def change
    rename_column :snap_search_results, :pastec_response, :api_response
  end
end
