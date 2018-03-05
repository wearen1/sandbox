ENV['RAILS_ENV'] ||= 'test'
require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'
require 'json_expressions/minitest'

module SignInHelper
	def sign_in(user)
		session[:user_id] = user.id
	end
end

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  fixtures :all

  include SignInHelper

  # Add more helper methods to be used by all tests here...
end
