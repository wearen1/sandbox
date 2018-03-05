# Be sure to restart your server when you modify this file.

Rails.application.config.session_store :redis_session_store, {
  :key => '_s',
  :redis => {
    :db => 0,
    :expire_after => 30.days,
    :key_prefix => 'v:session:',
    :host => 'localhost', # Redis host name, default is localhost
    :port => 6379   # Redis port, default is 6379
  }
}
