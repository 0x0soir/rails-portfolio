Rails.application.routes.draw do
  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)
  get '/', to: 'index#index'
  get '/index', to: 'index#index'
  get '/about', to: 'portfolio#about'
  get '/projects', to: 'portfolio#projects'
end
