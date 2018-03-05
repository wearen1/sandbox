# == Schema Information
#
# Table name: jedd_reposts
#
#  id                :integer          not null, primary key
#  vspace_user_id    :integer
#  jedd_directory_id :integer
#  created_at        :datetime
#  updated_at        :datetime
#

class Repost < ActiveRecord::Base
  self.table_name = 'jedd_reposts'
  
  belongs_to :vspace_user
  belongs_to :jedd_directory, :class_name => 'Directory'
end
