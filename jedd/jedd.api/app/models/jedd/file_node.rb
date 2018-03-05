# == Schema Information
#
# Table name: jedd_file_nodes
#
#  id                :integer          not null, primary key
#  name              :string
#  mime_type         :string
#  preview           :string
#  tags              :text             default([]), is an Array
#  size              :integer          default(0)
#  likes_count       :integer          default(0)
#  comments_count    :integer          default(0)
#  reposts_count     :integer          default(0)
#  jedd_directory_id :integer
#  vspace_user_id    :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  content           :string
#

class Jedd::FileNode < ActiveRecord::Base
  self.table_name = 'jedd_file_nodes'
  after_initialize :generate_upload_access_code

  belongs_to :jedd_directory
  belongs_to :vspace_user
  has_many :feedbacks, :as => :source

  def generate_upload_access_code
    unless self.upload_access_code
     if self.new_record?
      self.upload_access_code = SecureRandom.hex(32)
     else
      self.update(:upload_access_code => SecureRandom.hex(32))       
     end
    end
  end

	# mount_uploader :content, ContentUploader
end
