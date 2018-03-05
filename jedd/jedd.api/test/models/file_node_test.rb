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

require 'test_helper'

class FileNodeTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
