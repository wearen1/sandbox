require 'test_helper'

class SessionsControllerTest < ActionController::TestCase
  test "should get pass" do
    get :pass
    assert_response :redirect
  end

  # test "should get show" do
  #   get :show
  #   assert_response :success
  # end

  # test "should get contacts" do
  #   get :contacts
  #   assert_response :success
  # end

end
