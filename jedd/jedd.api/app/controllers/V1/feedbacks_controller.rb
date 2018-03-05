# coding: UTF-8
# :markup: RDoc

# :category: JSON Endpoint
#
# CGI escapes +text+

##
# Adds working with virtual directories in user storage

class FeedbacksController < ApplicationController
	respond_to :json
	skip_before_action :verify_authenticity_token
  #
	# def index
	# 	@feedbacks = []
	# 	root_directory = User.find(params[:vspace_user_id]).jedd_directories.where(:jedd_directory_id => nil).first
  #
	# 	if root_directory
	# 		@directories << root_directory
	# 	end
	# end
  #
	# def show
	# 	@directories = [ Directory.where(:id => params[:id]).first ]
	# end
  #
	# def create
	# 	@directories = []
  #
	# 	current_directory = current_user.jedd_directories.where(:id => params[:id]).first
	# 	if current_directory
	# 		@directories << current_directory.jedd_directories.create(directory_params.merge(:vspace_user => current_user))
	# 	end
	# end
  #
	# def update
	# 	@directory = Directory.find(params[:id])
	# 	if directory_update_params[:jedd_directory_id]
	# 	 @new_parent_directory = Directory.find(directory_update_params[:jedd_directory_id])
	# 		return unless @new_parent_directory.vspace_user_id == @directory.vspace_user_id
	# 	end
  #
	# 	if @directory.jedd_directory_id
	# 		@directory.update(directory_update_params)
	# 	end
	# end
  #
	# protected
	# ##
	# # Restricts params to following list:
	# #   :profile_id
  #
	# def directory_params
	# 	params.require(:directory).permit(:name)
	# end
  #
	# def directory_update_params
	# 	params.require(:directory).permit(:name, :jedd_directory_id)
	# end
end
