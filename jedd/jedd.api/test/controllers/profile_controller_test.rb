require 'test_helper'

class ProfileControllerTest < ActionController::TestCase
	test "should show profile" do
		mark = users(:mark)
		profile_pattern = mark.slice(:id, :nick, :avatar, :first_name, :last_name, :status).as_json

		sign_in mark
		get :show, :id => session[:user_id], :format => :json
		assert_response :success
		assert_json_match profile_pattern, response.body
	end

end
