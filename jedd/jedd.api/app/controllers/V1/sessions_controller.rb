class SessionsController < ApplicationController
  respond_to :json
  layout false

	def pass
		redirect_to '/'
  end

  def show
		@current_user = current_user
  end

  def contacts
		@friends = User.where.not(:id => current_user.id)
  end
end
