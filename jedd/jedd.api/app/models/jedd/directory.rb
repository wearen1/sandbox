# == Schema Information
#
# Table name: jedd_directories
#
#  id                :integer          not null, primary key
#  jedd_directory_id :integer
#  name              :string
#  vspace_user_id    :integer
#  tags              :text             default([]), is an Array
#  likes_count       :integer          default(0)
#  comments_count    :integer          default(0)
#  reposts_count     :integer          default(0)
#  size              :integer          default(0)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#

class Jedd::Directory < ActiveRecord::Base
  self.table_name = 'jedd_directories'

  belongs_to :jedd_directory
  belongs_to :v_user, :class_name => V::User

  has_many :jedd_reposts
  has_many :feedbacks, :as => :source
  has_many :vspace_users, :through => :jedd_reposts
  has_many :jedd_directories, :foreign_key => 'jedd_directory_id', :source => 'jedd_directory', :class_name => Jedd::Directory
  has_many :jedd_file_nodes, :class_name => Jedd::FileNode, :foreign_key => 'jedd_directory_id'

	protected
	def move_to(parent_directory)
		self.jedd_directory = parent_directory
	end
end
