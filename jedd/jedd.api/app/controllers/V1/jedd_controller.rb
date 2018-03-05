class JeddController < ApplicationController
	respond_to :html
  	layout false

	def index
		render :text => "Index Jedd page", :status => 200
  end
end

