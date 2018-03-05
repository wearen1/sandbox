class TapesController < ApplicationController
	respond_to :json, :html
	layout false

  def index
		@yourtape_feeds = current_user.yourtape_feeds
    # render :html => 'public/index.html'
  end

	def show
		last_id = params[:last_id]
		posts_count = params[:count]
		yourtape_from_source_id = params[:from_id]

		v_user = (V::User.select(:id).find(params[:id]) || current_user)
		@yourtape_tape = get_tape_by_v_user_id(user.id, yourtape_from_source_id, last_id, posts_count)
    tmp_sources = @yourtape_tape[:yourtape_sources].to_a

		pp @yourtape_tape.to_h

    @yourtape_tape[:yourtape_feeds] = @yourtape_tape[:yourtape_feeds].map do |f|
      f.source = tmp_sources.find {|s| s.id == f.yourtape_source_id }
      f
    end
	end

	def stats
		v_user = V::User.find(params[:tape_id])
		@stats = {
			:subscribers_count => Yourtape::Subscription.where(:v_user => v_user).count,
			:in_subscriptions => current_user.subscriptions.exists?(:v_user => v_user),
			:feeds_count => v_user.yourtape_feeds.count
		}
	end

	def world
		last_id = params[:last_id]
		posts_count = params[:count]

		subscription_ids = current_user.yourtape_subscriptions.joins(:v_user)
			.select('v_users.id as v_user_id').pluck(:v_user_id)
		@subscriptions_from = V::User.where(:id => subscription_ids)
		@yourtape_tape = get_tape_by_v_user_id(subscription_ids, nil, last_id, posts_count)
		# TODO: add contacts
		@suggestions = V::User
			.where.not(:id => current_user.id)
			.where.not(:id => current_user.yourtape_subscriptions.joins(:v_user)
			.select('v_users.id as id'))
	end

	private
	def get_tape_by_v_user_id(v_user_ids, yourtape_from_feed_id=nil, last_post_id=nil, count=50)
		count ||= 50
		count = 50 if count.to_i > 50 || count.to_i < 0
		unless yourtape_from_feed_id.class == Array
      yourtape_from_feed_id = [] << yourtape_from_feed_id
		end
		@yourtape_feeds = Yourtape::Feed.where(:v_user_id => v_user_ids).select(:id, :yourtape_source_id, :tags, :name)
    @yourtape_feeds = @yourtape_feeds.where(:id => yourtape_from_feed_id) if yourtape_from_feed_id
		feed_ids = @yourtape_feeds.pluck(:id)

		@posts = Yourtape::Post
				         .joins(:yourtape_source => [:yourtape_feeds])
				         .where(:yourtape_feeds => { :id => feed_ids })
				         .where.not(:summary => '')
                 .order(:published => :desc)

		# @posts = @posts.where(:feeds => { :id => from_id }) if from_id
		@posts = @posts.select('yourtape_feeds.id as feed_id, yourtape_feeds.v_user_id as v_from_user_id, yourtape_posts.*')
		@posts = @posts.where('yourtape_posts.entry_id < ?', last_post_id) if last_post_id
		@posts = @posts.limit(count)


		
    source_ids = (@posts.pluck(:yourtape_source_id) + @yourtape_feeds.pluck(:yourtape_source_id)).uniq
		@sources = Yourtape::Source::Base.where(:id => source_ids)
		return {
			:yourtape_posts => @posts,
			:yourtape_sources => @sources,
			:yourtape_feeds => @yourtape_feeds
		}
	end
end
