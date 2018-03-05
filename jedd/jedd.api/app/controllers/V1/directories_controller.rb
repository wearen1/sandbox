# coding: UTF-8
# :markup: RDoc

# :category: JSON Endpoint
#
# CGI escapes +text+

##
# Adds working with virtual directories in user storage

class V1::DirectoriesController < ApplicationController
	respond_to :json
	skip_before_action :verify_authenticity_token

	##
	# Lists the content of 'root' directory of certain profile
	#
	# + GET /profile/:profile_id/directories.json +
	#
	# params:
	# * profile_id - id of profile(user)

	def index
		@directories = []
		root_directory = Jedd::Directory.joins(:v_user).where(:v_users => {:nick => params[:v_user_nick]}).includes(:jedd_file_nodes).first
		# root_directory = V::User.find_by_nick(params[:v_user_nick]).jedd_directories.where(:jedd_directory_id => nil).joins(:jedd_directories => [:jedd_file_nodes]).first
		not_found unless root_directory

		if root_directory
			@directories << root_directory
		end
	end

	def show
		@directory = Jedd::Directory.where(:id => params[:id]).first or not_found
		@directories = [ @directory ]
	end

	def create
		@v_user = V::User.find_by_nick(params[:v_user_nick])
		return forbidden unless @v_user == current_user

		@directories = []
		current_directory = @v_user.jedd_directories.where(:id => params[:jedd_directory_id]).first or not_found
		
		pp current_directory

		if current_directory
			@directories << @v_user.jedd_directories.create(directory_params.merge(:v_user => @v_user))
		else
			not_found
		end
	end

	def update
		@directory = Jedd::Directory.find(params[:id])
		if directory_update_params[:jedd_directory_id]
		 @new_parent_directory = Jedd::Directory.find(directory_update_params[:jedd_directory_id])
			return unless @new_parent_directory.v_user_id == @directory.v_user_id
		end

		if @directory.jedd_directory_id
			@directory.update(directory_update_params)
		end
	end

	protected
	##
	# Restricts params to following list:
	#   :profile_id

	def directory_params
		params.require(:directory).permit(:name, :jedd_directory_id)
	end

	def directory_update_params
		params.require(:directory).permit(:name, :jedd_directory_id)
	end

end
