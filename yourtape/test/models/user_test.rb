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

require 'test_helper'

class UserTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
