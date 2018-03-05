Rails.application.routes.draw do
  # Jedd API
  scope '/api' do
    # API first version
    namespace :v1 do
      
      # get '/v_users/search' => 'v_users#search'
      
      resources :v_users, :param => :nick do
    		resources :reposts
    		resources :directories do
          # Social actions
          resource :like
          resources :comments
          resource :repost

          # JeddFileNodes
          resources :file_nodes do
            # Social actions
            resource :like
            resources :comments
          end
          
    		end
    	end
    end

    # Near future
    scope '/v2' do

    end

  end
  

	# get '/contacts' => 'sessions#contacts'

	scope '/session' do
		get '/pass' => 'sessions#pass'
	end




	# scope '/feeds' do
	# 	get '/' => 'sources#index'
	# 	post '/' => 'sources#create'
	# 	delete '/:id' => 'sources#delete'
	#
	# 	put '/:id' => 'sources#update'
	# 	post '/preview' => 'sources#preview'
	# 	get '/world' => 'tapes#world'
	#
	# 	resources :recommendations
	# 	resources :posts do
	# 		resources :comments
	# 	end
	# end

	# resources :subscriptions
	# resources :tapes do
	# 	get '/stats' => 'tapes#stats'
	# 	get '*path' => 'tapes#index'
	# end

	root 'jedd#index'
end


  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
