# == Schema Information
#
# Table name: feeds
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  source_id  :integer
#  tags       :text             default([]), is an Array
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  name       :string
#


  class ::Yourtape::Feed < ActiveRecord::Base
    self.table_name = 'yourtape_feeds'

    # TODO: add relation to shared repo if not exists
    belongs_to :v_user,
               :foreign_key => 'v_user_id',
               :class_name => 'V::User'

    belongs_to :yourtape_source,
               :foreign_key => 'yourtape_source_id',
               :class_name => '::Yourtape::Source::Base'

    has_many :yourtape_posts,
             :through => :yourtape_source
  end