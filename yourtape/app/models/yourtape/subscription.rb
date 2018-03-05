# == Schema Information
#
# Table name: subscriptions
#
#  id            :integer          not null, primary key
#  user_id       :integer
#  subscriber_id :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class ::Yourtape::Subscription < ActiveRecord::Base
  self.table_name = 'yourtape_subscriptions'

  belongs_to :v_user,
             :foregin_key => 'v_user_id',
             :class_name => 'V::User'

  belongs_to :yourtape_subscriber,
             :foreign_key => 'subscriber_v_user_id',
             :class_name => 'V::User'
end
