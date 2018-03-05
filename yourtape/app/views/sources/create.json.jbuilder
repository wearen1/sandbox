json.yourtape_feeds do
  json.array! @yourtape_feeds do |f|
    json.extract! f, *[:id, :name, :yourtape_source_id, :tags]
  end
end

json.sources do
  json.partial! 'partials/sources', :yourtape_sources => @yourtape_sources
end
