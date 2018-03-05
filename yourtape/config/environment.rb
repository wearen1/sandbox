# Load the Rails application.
require File.expand_path('../application', __FILE__)

# Initialize the Rails application.
Rails.application.initialize!

# Run shared migrations
pp 'Running shared migrations'
V::Shared::Migrations.up