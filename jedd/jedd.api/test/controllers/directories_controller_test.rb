require 'test_helper'

class DirectoriesControllerTest < ActionController::TestCase
	test "should list profile directories" do
		mark = users(:mark)

		sign_in mark

		get :index, :profile_id => mark.id, :format => :json

		pp response.body

		assert_response :success
		# assert_json_match profile_pattern, response.body
	end
end
