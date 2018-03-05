class SourcesController < ApplicationController
  respond_to :json
  layout false

  def index
	  @yourtape_feeds = current_user.yourtape_feeds
    source_ids = @yourtape_feeds.map { |f| f.yourtape_source_id }.uniq
    @sources = Yourtape::Source::Base.where(:id => source_ids)
  end

  def update
    Yourtape::Feed.update(params[:id], :tags => params[:tags], :name => params[:name])
    render :json => {}, :status => :ok
  end

  def preview
    s = Yourtape::Source::Base.new_by_url(:url => params[:url])
    @preview = s.preview(request.user_agent)
    @error = 'No feeds found' if @preview[:yourtape_feeds].empty?
  rescue Exception => e
    pp e
    @error = 'Invalid URL'
  end
  
  def delete
    Yourtape::Feed.destroy(params[:id])
    render :status => 200, :json => {}
  end

  def create
    feeds_to_add = params[:yourtape_feeds]
      .select { |f| !f[:url].nil? }
      .map { |f| f[:url] = URI.parse(f[:url]); f }
      .select {|f| f[:url].exists? }

    results = feeds_to_add.map do |f|
      site_url = f[:url].clone
      site_url.path = ''
      
      source = Yourtape::Source::Base.where(:url => URI.normalize(f[:url].to_s).to_s).first
      pp source
      
      if source.nil?
        source = current_user.yourtape_sources.new_by_url(:url => f[:url].to_s)
        preview = source.preview(request.user_agent)
        
        source.url = f[:url].to_s
        source.image = preview[:image]
        source.site_url = site_url.to_s

        source.title = preview[:yourtape_feeds].first.title || preview[:og][:title]
        
        source.description = preview[:yourtape_feeds].first.description

        source.save

        Thread.new { source.update_posts! }
      end
        
      feed = current_user.yourtape_feeds.find_or_create_by(:yourtape_source => source)
	    feed.name = source.title
	    feed.save
      {
        :yourtape_feed => feed,
        :yourtape_source => source
      }
    end

    @yourtape_feeds = results.map { |f| f[:yourtape_feed] }
    @yourtape_sources = results.map { |f| f[:yourtape_source] }
  end
end
