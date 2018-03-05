# extract user feeds as array

json.yourtape_feeds do
  json.array! @yourtape_feeds do |f|
    json.extract! f, *[:id, :name, :yourtape_source_id, :tags]
  end
end

# json.feeds do
#   json.partial! 'partials/feeds', :feeds => @feeds
# end

json.yourtape_sources do
  json.partial! 'partials/sources', :yourtape_sources => @yourtape_sources
end
