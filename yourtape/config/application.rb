require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

class Application < Rails::Application
  # Set custom migrations table name
  ActiveRecord::Base.schema_migrations_table_name = "yourtape_schema_migrations"
  # Load configuration from V::Shared
  config.database_configuration = V::Shared::Config.static["database"]

  # Settings in config/environments/* take precedence over those specified here.
  # Application configuration should go into files in config/initializers
  # -- all .rb files in that directory are automatically loaded.

  # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
  # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
  # config.time_zone = 'Central Time (US & Canada)'

  # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
  # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
  # config.i18n.default_locale = :de

  # Do not swallow errors in after_commit/after_rollback callbacks.
  config.eager_load_paths << V::Shared::Models.path

  # config.autoload_paths << V::Shared::Models.path
  # config.active_record.table_name_prefix = 'jedd_'

  # Do not swallow errors in after_commit/after_rollback callbacks.
  config.middleware.insert_before ActionDispatch::Cookies,
                                  "Rack::Middleware::SessionInjector",
                                  :key => V::Shared::Config.static["rails"]["sessions"]["key"],
                                  :token_key => V::Shared::Config.static["rails"]["sessions"]["injector_key"],
                                  :token_lifetime => V::Shared::Config.static["rails"]["sessions"]["token_lifetime"].to_i.seconds,
                                  :die_on_handshake_failure => false
  config.time_zone = V::Shared::Config.static["rails"]["time_zone"]
  config.i18n.default_locale = :ru
  config.active_record.default_timezone = :local
  config.active_record.raise_in_transactional_callbacks = true
end
