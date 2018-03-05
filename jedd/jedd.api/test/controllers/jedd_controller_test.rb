require 'test_helper'

class JeddControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
  end

end
