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

require 'test_helper'

class DirectoryTest < ActiveSupport::TestCase
  test "the " do
    # users(:mark).jedd_directories
    # assert true
  end
end
