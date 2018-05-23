Rails.application.routes.draw do
  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)
  health_check_routes
  root to: "pages#home"

  namespace :api, defaults: { format: :json } do
    resources :snaps, only: [ :show ] do
      collection do
        post 'search'
        get 'languages'
      end
    end
    resources :bookmarks, only: [:index, :create]
    resources :translations, only: [:index]
  end

  post 'background_jobs/bookmarks'        => 'background_jobs/bookmarks'
  post 'background_jobs/update_es_cache'  => 'background_jobs/update_es_cache'
  get '*path', to:  "pages#home"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
