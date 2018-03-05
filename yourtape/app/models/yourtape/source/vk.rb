class ::Yourtape::Source::VK < Source::Base
  
  def preview(ua=DEFAULT_UA)
    begin
      group_info = (API.vk.groups.getById(
        :group_id => /(.*\/|^)vk\.com\/(.*)$/.match(self.url)[2],
        :fields => ['description']
        )
      )[0]
      
      pp group_info

      tmp_preview = {
        :id => group_info['id'],
        :image => group_info['photo_100'],
        :screen_name => group_info['screen_name'],
        :type => group_info['type'],
        :og => nil,
        :yourtape_feeds => [
          ::Yourtape::Source::PreviewFeed.new({
            :description => group_info[:description],
            :title => group_info[:name],
            :url => 
          })
        ]
      }
      
      pp group_info
      
      pp tmp_preview
      
      ::Yourtape::Source::Preview.new(tmp_preview)
    rescue VK::APIError => e
      pp e
      @preview = nil
    rescue Faraday::ConnectionFailed => e
      pp e
      @preview = nil
    end
  end
  
  def update_posts!
    p = preview
    owner_id = preview[:id].to_i
    owner_id *= -1 if %w[group, page].include?(p[:type])
    
    entries = (API.vk.wall.get(
      :owner_id => owner_id,
      :count => '100',
      :filter => 'owner'
      )
    )['items']

    if entries.length > 0
      existing_posts = ::Yourtape::Post.select(:entry_id)
        .where(:source_id => self.id, :entry_id => entries.map { |e| e['id'] } )
        .order(:created_at => :desc)
        .map(&:entry_id)
      
      posts = entries.select { |e|
        !existing_posts.include?(e['id'].to_s) and
        e['text'].length > 0 and
        e['post_type'] == 'post'
      }.map do |e|
        
        ::Yourtape::Post.new(
          :source_id => self.id,
          :entry_id => e['id'],
          :image => nil,
          :published => Time.at(e['date']).to_datetime.in_time_zone(Time.zone),
          :title => e['text'].split('. ')[0],
          :url => "#{ VK_SITE_URL }/#{ p[:screen_name] }?w=wall#{ owner_id.to_s }_#{ e['id'] }",
          :summary => e['text']
        )
      end
      
      save_posts!(posts)
    end

  end

  private
  VK_SITE_URL = 'https://vk.com'
end