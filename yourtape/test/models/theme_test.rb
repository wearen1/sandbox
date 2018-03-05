# == Schema Information
#
# Table name: themes
#
#  id         :integer          not null, primary key
#  css_url    :string
#  js_url     :string
#  params     :json
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

require 'test_helper'

class ThemeTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
