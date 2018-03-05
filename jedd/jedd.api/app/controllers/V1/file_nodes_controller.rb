##
# @author Mark Gubarev
#
# Adds working with virtual files in user storage

class V1::FileNodesController < ApplicationController
	respond_to :json
	layout false
	skip_before_action :verify_authenticity_token

	def index
		@file_nodes = Jedd::Directory.find(parent_params[:directory_id]).jedd_file_nodes
	end

	def create
		return forbidden unless can_upload?

		pp file_node_create_params

		@file_node = Jedd::Directory.find(
				parent_params[:directory_id]
			).jedd_file_nodes.create(
				file_node_create_params.merge({:v_user_id => current_user.id})
			)
	end

	def update
		@file_node = Jedd::FileNode.find(params[:id])

		if params[:jedd_directory_id]
			@new_parent_directory = Jedd::Directory.find(params[:directory_id])
			pp @new_parent_directory.v_user_id == @file_node.v_user_id
			pp @file_node
			return unless @new_parent_directory.v_user_id == @file_node.v_user_id
		end

		@file_node.update(file_node_update_params)
	end

  def show
		@file_node = FileNode.find(params[:id])

		if params[:jedd_directory_id]
			@new_parent_directory = Directory.find(params[:directory_id])
			return unless @new_parent_directory.vspace_user_id == @file_node.vspace_user_id
		end
  end

	def upload
		@file_node = FileNode.find(params[:file_id])

		s3 = Aws::S3::Client.new
		bucket = Aws::S3::Bucket.new(:name => 'v-fs', :client => s3)

		obj = bucket.object(
				'/v-fs/vspace_user/' + params[:profile_id] +
        '/directory/' + params[:directory_id] + '/' +
        params[:file_node][:content].original_filename
		)
		obj.put(:body => params[:file_node][:content].tempfile,
		        :acl => 'public-read',
		        :content_type => params[:file_node][:content].content_type)

		@file_node.content = obj.public_url
		@file_node.uploaded = true

		@file_node.save

		render :status => :ok, :body => @file_node.content
	end

	private
	def file_node_create_params
		params.require(:file_node).permit(:content, :name, :mime_type, :description, :tags => [])
	end

	def file_node_update_params
		params.require(:file_node).permit(:name, :description, :mime_type, :tags => [])
	end

	def parent_params
		params.permit(:vspace_user_id, :directory_id)
	end

	def can_upload?
		current_user.nick == params[:v_user_nick]
	end
end
