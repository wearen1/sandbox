class SessionsController < ApplicationController
  respond_to :json
  layout false

  def pass
    # render :text => session.to_json, :status => 200, :content_type => 'application/json'
    puts "session is: #{ session[:user] }"
    redirect_to '/'
  end

  def show
    @current_user = current_user
  end

	def contacts
		@friends = V::User.where.not(:id => current_user.id)
	end
end