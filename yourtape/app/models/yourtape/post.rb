# == Schema Information
#
# Table name: posts
#
#  id         :integer          not null, primary key
#  entry_id   :string
#  image      :string
#  published  :datetime
#  title      :string
#  url        :string
#  source_id  :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  summary    :text
#

class ::Yourtape::Post < ActiveRecord::Base
  self.table_name = 'yourtape_posts'

  belongs_to :yourtape_source,
             :foreign_key => 'yourtape_source_id',
             :class_name => '::Yourtape::Source::Base'
end
