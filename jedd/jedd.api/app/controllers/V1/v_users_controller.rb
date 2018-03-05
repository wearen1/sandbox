class V1::VUsersController < ApplicationController
	respond_to :json
	layout false

	def show
		if params[:nick] == 'current'
			@v_user = current_user
		else
			@v_user = V::User.find_by_nick(params[:nick])
		end
	end

	def search
		if params[:nick]
			@v_user = V::User.find_by_nick(params[:nick])
			return not_found unless @v_user
		else
			not_found
		end
	end
end
