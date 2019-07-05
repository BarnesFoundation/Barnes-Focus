Rails.application.routes.draw do
  apipie
  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)
  health_check_routes
  root to: "pages#home"

  namespace :api, defaults: { format: :json } do
    resources :snaps, only: [ :show ] do
      collection do
        post 'storeSearchedResult'
        post 'getArtworkInformation'
        post :mark_story_as_read
        get :getArtworkInformation
        get 'languages'
        get :similar_arts
        get :find_stories_by_object_id
        get :find_stories_by_room_id
      end
    end
    resources :bookmarks, only: [:index, :create] do
      collection do
        post :set_language
      end
    end
    resources :translations, only: [:index]
    resources :stories, only: [:show], param: :slug
  end

  post 'jobs/update_es_cache'             => 'jobs/update_es_cache'
  post 'jobs/send_bookmarks_email'        => 'jobs/send_bookmarks_email'
  post 'jobs/send_stories_email'          => 'jobs/send_stories_email'
  post 'jobs/clear_sessions'              => 'jobs/clear_sessions'
  post 'jobs/cleanup_bookmarks'           => 'jobs/cleanup_bookmarks'
  get '*path', to:  "pages#home"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
