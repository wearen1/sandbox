require "application_responder"

class ApplicationController < ActionController::Base
  self.responder = ApplicationResponder
  respond_to :json

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :null_session

  protected
  def not_found
	  raise ActionController::RoutingError.new('Not Found')
	end

  def forbidden
    raise ActionController::RoutingError.new('Forbidden')
  end

  def current_user
    V::User.first
  end

end
