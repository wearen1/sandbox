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
#  type        :string
#

require 'open-uri'
require 'addressable/uri'

Feedjira::Feed.add_common_feed_element('icon', :as => :image)
Feedjira::Feed.add_common_feed_element('url', :as => :image)

class Yourtape::Source::Base < ActiveRecord::Base
  self.table_name = 'yourtape_sources'

  has_many :v_users,
           :through => :yourtape_feeds,
           :class_name => '::V::User'

  has_many :yourtape_feeds,
           :foreign_key => 'yourtape_source_id',
           :class_name => '::Yourtape::Feed',
           :dependent => :destroy

  has_many :v_posts,
           :foreign_key => 'yourtape_source_id',
           :class_name => '::Yourtape::Post',
           :dependent => :destroy

  attr_accessor :parsed_url
  validates_presence_of :url

  
  def self.new_by_url(params)
    type = Yourtape::Source::RSS
    
    if (/(.*\/|^)(vk\.com|vkontakte\.ru)\/(.*)$/ =~ params[:url])
      type = Yourtape::Source::VK
    end

    raise 'invalid type' unless type
    type.new(params)
  end
  
  def update_posts!
    raise 'abstract method'
  end
  
  def preview(ua=DEFAULT_UA)
    raise "abstract method"
  end
  
  private
  DEFAULT_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36'
  
  def save_posts!(posts)
    ::Yourtape::Post.transaction do
      posts.map do |p|
        p.save
      end
    end
  end
end