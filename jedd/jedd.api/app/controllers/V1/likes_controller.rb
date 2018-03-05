class LikesController < ApplicationController
	respond_to :json
	skip_before_action :verify_authenticity_token

  def show
    @likes = Like.all or not_found
    if like_show_params[:file_id]
      file_node = FileNode.new(:id => like_show_params[:file_id])
      @likes = @likes.where(:source_id => like_show_params[:file_id], :source => file_node)
    else
      if like_show_params[:directory_id]
        directory = Directory.new(:id => like_show_params[:directory_id])
        @likes = @likes.where(:source_id => like_show_params[:file_id], :source => directory)
      else
        not_found
      end
    end
    if like_show_params[:own] == 'true'
      @likes = @likes.where(:vspace_user_id => current_user.id)
    end
  end

	def create
		@user = User.find(like_create_params[:vspace_user_id]) or not_found
		if like_create_params[:file_id]
			@source = FileNode.where({:id => like_create_params[:file_id], :vspace_user => @user}).first or not_found
		else
			@source = Directory.where({:id => like_create_params[:directory_id], :vspace_user => @user}).first or not_found
		end
    
    if Like.exists?(:source => @source, :positive => true, :vspace_user => current_user)
      # If like already exists
      render :status => 422
    else
      # Create if not
      @like = Like.create(:source => @source, :positive => true, :vspace_user => current_user)      
    end
	end

	def destroy
    likes = Like.all
    
    if like_destroy_params[:file_id]
      file_node = FileNode.new(:id => like_destroy_params[:file_id])
      likes = likes.where(:source_id => like_show_params[:file_id], :source => file_node)
    else
      if like_destroy_params[:directory_id]
        directory = Directory.new(:id => like_destroy_params[:directory_id])
        likes = likes.where(:source_id => like_destroy_params[:file_id], :source => directory)
      else
        not_found
      end
    end
    
    likes = likes.limit(1)
    @like = likes.first or not_found
    
    if @like.vspace_user_id == current_user.id or @like.vspace_user_id.nil?
      @like.destroy
    else
      forbidden
    end
    
	end

	private
	def like_show_params
		params.permit(:directory_id, :file_id, :vspace_user_id, :own)
	end
  
	def like_create_params
		params.permit(:directory_id, :file_id, :vspace_user_id)
	end
  
  def like_destroy_params
    params.permit(:id, :file_id, :vspace_user_id, :directory_id)
  end
end