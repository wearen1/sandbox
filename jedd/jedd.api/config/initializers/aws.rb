Aws.config.update({
    region: V::Shared::Config.static["aws"]["region"],
    credentials: Aws::Credentials.new(
		    V::Shared::Config.static["aws"]["access_key_id"],
		    V::Shared::Config.static["aws"]["secret_access_key"])
})

