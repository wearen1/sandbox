# == Schema Information
#
# Table name: recommendations
#
#  id         :integer          not null, primary key
#  post_id    :integer
#  from_id    :integer
#  to_id      :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class ::Yourtape::Recommendation < ActiveRecord::Base
  self.table_name = 'yourtape_recommendations'

  belongs_to :yourtape_post,
             :foreign_key => 'yourtape_post_id',
             :class_name => '::Yourtape::Post'

  belongs_to :from_v_user,
             :foreign_key => 'from_v_user_id',
             :class_name => 'V::User'

  belongs_to :to_v_user,
             :foreign_key => 'to_v_user_id',
             :class_name => 'V::User'
end
