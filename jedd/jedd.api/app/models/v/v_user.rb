# == Schema Information
#
# Table name: users
#
#  id                :integer          not null, primary key
#  nick              :string
#  email             :string
#  password          :string
#  first_name        :string
#  last_name         :string
#  avatar            :string
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  external_token_id :integer
#  notification_id   :integer
#  status            :integer
#


class V::User
  has_many :jedd_directories

  # after_create :create_jedd_root_directory
  # has_many :reposted_jedd_directories, :through => :jedd_reposts, :class_name => 'Directory', :source => :jedd_directories

  # private
  # def save_password_as_hash
  #   if self.password.length > 0
  #     self.password = BCrypt::Password.create(self.password)
  #   end
  # end

  # def create_jedd_root_directory
  # 	self.jedd_directories.create(:name => self.nick)
  # end
end