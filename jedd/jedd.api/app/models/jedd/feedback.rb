class Jedd::Feedback < ActiveRecord::Base
  self.table_name = 'jedd_feedbacks'

  belongs_to :source, polymorphic: true
  belongs_to :v_user, :class_name => V::User
end
