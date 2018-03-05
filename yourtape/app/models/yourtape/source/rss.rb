# == Schema Information
#
# Table name: sources
#
#  id          :integer          not null, primary key
#  url         :string
#  title       :string
#  site_url    :string
#  description :string
#  image       :string
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  og          :json
#

require 'open-uri'
require 'addressable/uri'

Feedjira::Feed.add_common_feed_element('icon', :as => :image)
Feedjira::Feed.add_common_feed_element('url', :as => :image)

class Yourtape::Source::RSS < Yourtape::Source::Base
  def update_posts!
    p = @preview[:yourtape_feeds] || preview[:yourtape_feeds] rescue preview[:yourtape_feeds]
    entries = p.first.entries

    if entries.length > 0
      existing_posts = Yourtape::Post.select(:entry_id)
        .where(:yourtape_source_id => self.id, :entry_id => entries.map(&:entry_id))
        .order(:created_at => :desc)
        .limit(100)
        .map(&:entry_id)
      
      posts = entries.select { |e| !existing_posts.include?(e.entry_id) }.map do |e|
        Yourtape::Post.new(
          :yourtape_source_id => self.id,
          :entry_id => e[:entry_id],
          :image => e[:image],
          :published => e[:published],
          :title => e[:title],
          :url => e[:url],
          :summary => e[:summary] || e[:content]
        )
      end

      save_posts!(posts)
    end
  end

  def preview(ua=DEFAULT_UA)
    rss_urls = []
    doc      = nil
    image    = nil

    prepare_url
    
    doc = open(@parsed_url.to_s, 'User-Agent' => ua, :allow_redirections => :all)

    rss_urls << @parsed_url if /(xml|rss)$/ =~ doc.content_type
    doc = Nokogiri::HTML(open(@host_url.to_s, 'User-Agent' => ua, :allow_redirections => :all))
    image = extract_image(ua, doc)

    if rss_urls.empty?
      if doc/'link[@type*="application/rss"]'
        rss_urls = (doc/'link[@type*="application/rss"]').map do |l|
          rss_url = URI.parse(l[:href])
          if rss_url.relative?
            URI.join(@host_url, rss_url.to_s)
          else
            rss_url
          end
        end
      end
    end
    @preview =  {
      :image => image,
      :yourtape_feeds => rss_urls.map { |u| extract_summary Feedjira::Feed.fetch_and_parse(u.to_s) },
      :og    => extract_og(doc)
    }
  end
  
  private
  def extract_summary(feed)
    feed.entries.map! do |e|
      doc = Nokogiri::HTML(e.summary)
      e.summary = doc.text.strip
      e
    end
    feed
  end

  def extract_image(ua=DEFAULT_UA, doc=nil)
    doc ||= Nokogiri::HTML(open(@host_url.to_s, 'User-Agent' => ua, :allow_redirections => :all))

    apple_icons = extract_apple_icons(doc)
    image = apple_icons.last.to_s if apple_icons.length > 0

    image = extract_og(doc)[:image] unless image and URI.parse(image).exists?(:head)
    unless image and URI.parse(image).exists?(:head)
      unless (doc/'link[@type*="application/rss"]').empty?
        rss_first_url = URI.parse((doc/'link[@type*="application/rss"]').first[:href])
        if rss_first_url.relative? then
          rss_first_url = URI.join(@host_url, rss_first_url)
        end
        if rss_first_url.exists?
          feed = Feedjira::Feed.fetch_and_parse rss_first_url.to_s
          image = feed.image rescue nil
        end
      end
    end
    unless image and URI.parse(image).exists?(:head)
      img_url = @parsed_url
      img_url.path = '/favicon.ico'
      if img_url.exists?(:head) then image = img_url.to_s end
    end
    image
  end

  def prepare_url
    return unless self.url
    invalid_url_error = ArgumentError.new('URL does not exists')

    @parsed_url = URI.parse(self.url)
    @parsed_url = URI.parse(Addressable::URI.parse(@parsed_url.add_scheme.to_s).normalize.to_s)

    @parsed_url.scheme = 'https' unless @parsed_url.exists?
    if (@parsed_url.to_s =~ URI::regexp).nil? and !@parsed_url.exists? then throw invalid_url_error end

    @host_url = @parsed_url.clone
    @host_url.path = ''
  end

  def extract_apple_icons(doc)
    (doc/'link[@rel="apple-touch-icon"]').sort do |x,y|
      if x.attr('sizes') and y.attr('sizes')
        /(\d*)x/.match(x.attr('sizes'))[1].to_i <=> /(\d*)x/.match(y.attr('sizes'))[1].to_i
      else
        0
      end
    end
    .map { |i| URI.parse(i[:href].strip) }
    .compact
    .map { |i| if i.relative? then URI.join(@parsed_url, i) else i end }
    .select { |i| i.exists?(:head) }
  end

  def extract_og(doc)
    og_tags = {
      :description => (doc.at('meta[@property="og:description"]') or {'content' => nil})['content'],
      :type => (doc.at('meta[@property="og:type"]') or { 'content' => nil })['content'],
      :image => (doc.at('meta[@property="og:image"]') or { 'content' => nil })['content'],
      :site_name => (doc.at('meta[@property="og:site_name"]') or { 'content' => nil })['content'],
      :title => (doc.at('meta[@property="og:title"]') or { 'content' => nil })['content'],
      :url => (doc.at('meta[@property="og:url"]') or { 'content' => nil })['content']
    }
  end

end
