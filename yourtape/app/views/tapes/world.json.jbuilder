json.yourtape_subscriptions do
  json.partial! 'partials/users', :v_users => @subscriptions_from, :additional_attrs => [:image, :name]
end

# json.feeds do
#   json.partial! 'partials/feeds', :feeds => @tape[:feeds], :additional_attrs => [:id]
# end

json.yourtape_suggestions do
  json.partial! 'partials/users', :yourtape_users => @yourtape_suggestions, :additional_attrs => [:image, :name]
end

json.yourtape_sources do
  json.partial! 'partials/sources', :yourtape_sources => @yourtape_tape[:yourtape_sources]
end

json.yourtape_posts do
  json.partial! 'partials/posts', :yourtape_posts => @yourtape_tape[:yourtape_posts], :additional_attrs => [:feed_id, :from_id]
end
