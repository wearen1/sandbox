# == Schema Information
#
# Table name: external_tokens
#
#  id               :integer          not null, primary key
#  vk_id            :string
#  vk_access_token  :string
#  fb_id            :string
#  fb_access_token  :string
#  fb_refresh_token :string
#  tw_id            :string
#  tw_token         :string
#  tw_token_secret  :string
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  user_id          :integer
#

require 'test_helper'

class ExternalTokenTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
