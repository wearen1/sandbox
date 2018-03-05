class RecommendationsController < InheritedResources::Base
  layout false
  actions :index, :create, :delete
  respond_to :json

  def index
		last_id = yourtape_recommendation_params[:last_id].to_i if yourtape_recommendation_params[:last_id] rescue nil
		yourtape_posts_count = 50
    yourtape_posts_count = yourtape_recommendation_params[:count].to_i if yourtape_recommendation_params[:count] rescue 50
		v_from_user_id = yourtape_recommendation_params[:from_id].to_i if yourtape_recommendation_params[:from_id] rescue nil
    
    yourtape_posts_count = 50 if yourtape_posts_count > 50 or yourtape_posts_count < 0
    
    @yourtape_recommendations = current_user.yourtape_received_recommendations.joins(:yourtape_post => [:yourtape_source])
    
    @yourtape_recommendations = @yourtape_recommendations.where('yourtape_recommendations.id < ?', last_id) if last_id
    @yourtape_recommendations = @yourtape_recommendations.where(:v_from_user_id => v_from_user_id) if v_from_user_id
    @yourtape_recommendations = @yourtape_recommendations.limit(yourtape_posts_count) if yourtape_posts_count
    @yourtape_recommendations = @yourtape_recommendations.select('yourtape_recommendations.id, yourtape_post_id, v_from_user_id, yourtape_sources.id as yourtape_source_id')

    post_ids = @yourtape_recommendations.pluck(:post_id).uniq
    youratpe_posts = Yourtape::Post.where(:id => post_ids)
    
    @yourtape_recommendations = @yourtape_recommendations.map do |r|
      r.yourtape_post = youratpe_posts.find {|p| p.id == r.post_id}
      r
    end

    v_recommendator_ids = @yourtape_recommendations.map {|r| r.v_from_user_id}.uniq
    yourtape_source_ids = @yourtape_recommendations
      .map { |r| r.yourtape_post.yourtape_source_id }

    @v_recommendators = V::User.where(:id => v_recommendator_ids)
    @yourtape_sources = Yourtape::Source::Base.where(:id => yourtape_source_ids)
  end

  def create
    yourtape_recommendation_params[:to].each do |uid|
      current_user.yourtape_given_recommendations.create(
        :post_id => yourtape_recommendation_params[:post_id],
        :to_id => uid
        )
    end

    render :json => {}, :status => 200
  end

  private
    def yourtape_recommendation_params
      params.permit(:format, :post_id, :last_id, :count, :from_id, :to => [])
    end
end
