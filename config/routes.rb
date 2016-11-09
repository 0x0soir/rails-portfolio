Rails.application.routes.draw do
  get '/', to: 'index#index'
  get '/index', to: 'index#index'
  get '/about', to: 'portfolio#about'
  get '/projects', to: 'portfolio#projects'
end
