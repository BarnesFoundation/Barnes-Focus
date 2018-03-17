Rails.application.routes.draw do
  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)
  root to: "pages#home"

  namespace :api, defaults: { format: :json } do
    resources :snaps, only: [ :show ] do
      collection do
        post 'search'
        get 'languages'
      end
    end
  end

  get '*path', to:  "pages#home"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
