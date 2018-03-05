class CommentsController < ApplicationController
	respond_to :json
	skip_before_action :verify_authenticity_token

  def index
    @comments = Comment.all
    
    @comments = Comment.all or not_found
    if comment_show_params[:file_id]
      file_node = FileNode.new(:id => comment_show_params[:file_id])
      @comments = @comments.where(:source_id => comment_show_params[:file_id], :source => file_node)
    else
      if comment_show_params[:directory_id]
        directory = Directory.new(:id => comment_show_params[:directory_id])
        @comments = @comments.where(:source_id => comment_show_params[:file_id], :source => directory)
      else
        not_found
      end
    end
    if comment_show_params[:own] == 'true'
      @comments = @comments.where(:vspace_user_id => current_user.id)
    end
  end

	def create
		@user = User.find(comment_create_params[:vspace_user_id]) or not_found
		if comment_create_params[:file_id]
			@source = FileNode.where({:id => comment_create_params[:file_id], :vspace_user => @user}).first or not_found
		else
			@source = Directory.where({:id => comment_create_params[:directory_id], :vspace_user => @user}).first or not_found
		end
    
    @comment = Comment.create(:source => @source, :positive => true, :vspace_user => current_user, :text => comment_create_params[:text])

    unless @comment.valid?
      render :status => 422, :json => { :error => @comment.errors.full_messages }
    end
	end

	def destroy
    comments = Comment.all
    
    if comment_destroy_params[:file_id]
      file_node = FileNode.new(:id => comment_destroy_params[:file_id])
      comments = comments.where(:source_id => comment_destroy_params[:file_id], :source => file_node)
    else
      if comment_destroy_params[:directory_id]
        directory = Directory.new(:id => comment_destroy_params[:directory_id])
        comments = comments.where(:source_id => comment_destroy_params[:file_id], :source => directory)
      else
        not_found
      end
    end
    
    comments = comments.where(:id => comment_destroy_params[:id])
    comments = comments.limit(1)
    @comment = comments.first or not_found
    
    if @comment.vspace_user_id == current_user.id or (file_node || directory).vspace_user_id == current_user.id
      @comment.destroy
    else
      forbidden
    end
    
	end
  
  def update
    comments = Comment.all
    
    if comment_update_params[:file_id]
      file_node = FileNode.new(:id => comment_update_params[:file_id])
      comments = comments.where(:source => file_node)
    else
      if comment_update_params[:directory_id]
        directory = Directory.new(:id => comment_update_params[:directory_id])
        comments = comments.where(:source => directory)
      else
        not_found
      end
    end
    
    comments = comments.where(:id => comment_update_params[:id])
    comments = comments.limit(1)
    @comment = comments.first or not_found
    
    if @comment.vspace_user_id == current_user.id
      @comment.update(comment_update_params[:comment])

      unless @comment.valid?
        render :status => 422, :json => { :error => @comment.errors.full_messages }
      end
    else
      forbidden
    end
    
  end

	private
	def comment_show_params
		params.permit(:directory_id, :file_id, :vspace_user_id, :own)
	end
  
	def comment_create_params
		params.permit(:directory_id, :file_id, :vspace_user_id, :text)
	end
  
	def comment_update_params
		params.permit(:id, :directory_id, :file_id, :vspace_user_id, :comment => [:text])
	end
  
  def comment_destroy_params
    params.permit(:id, :file_id, :vspace_user_id, :directory_id)
  end
end
