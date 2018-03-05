# == Schema Information
#
# Table name: posts
#
#  id         :integer          not null, primary key
#  entry_id   :string
#  image      :string
#  published  :datetime
#  title      :string
#  url        :string
#  source_id  :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  summary    :text
#

require 'test_helper'

class PostTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
