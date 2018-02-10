Rails.application.routes.draw do
  root to: "pages#home"

  namespace :api, defaults: { format: :json } do
    resources :snaps, only: [ :show ] do
      collection do
        get 'search'
      end
    end
  end

  get '*path', to:  "pages#home"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
