# == Schema Information
#
# Table name: comments
#
#  id                :integer          not null, primary key
#  user_id           :integer
#  post_id           :integer
#  text              :string
#  target_comment_id :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#

class ::Yourtape::Comment < ActiveRecord::Base
  self.table_name = 'yourtape_comments'

  # TODO: add comments to shared repo
  belongs_to :v_user,
             :foreign_key => 'v_user_id',
             :class_name => 'V::User'

  belongs_to :yourtape_post,
             :foreign_key => 'yourtape_post_id',
             :class_name => '::Yourtape::Post'

  belongs_to :target_yourtape_comment,
             :foreign_key => 'target_comment_id',
             :class_name => '::Yourtape::Comment'
end
