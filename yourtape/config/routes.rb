Rails.application.routes.draw do
  get '/profile(/:id)' => 'sessions#show'
  get '/contacts' => 'sessions#contacts'

  scope '/session' do
    get '/pass' => 'sessions#pass'
  end

  scope '/feeds' do
    get '/' => 'sources#index'
    post '/' => 'sources#create'
    delete '/:id' => 'sources#delete'

    put '/:id' => 'sources#update'
    post '/preview' => 'sources#preview'
    get '/world' => 'tapes#world'

    resources :recommendations
    resources :posts do
      resources :comments
    end
  end

  resources :subscriptions
  resources :tapes do
    get '/stats' => 'tapes#stats'
    get '*path' => 'tapes#index'
  end

  root 'tapes#index'
end
