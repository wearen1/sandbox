# == Schema Information
#
# Table name: notifications
#
#  id         :integer          not null, primary key
#  from       :string
#  title      :string
#  message    :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  user_id    :integer
#

require 'test_helper'

class NotificationTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
