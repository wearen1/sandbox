# == Schema Information
#
# Table name: recommendations
#
#  id         :integer          not null, primary key
#  post_id    :integer
#  from_id    :integer
#  to_id      :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

require 'test_helper'

class RecommendationTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
