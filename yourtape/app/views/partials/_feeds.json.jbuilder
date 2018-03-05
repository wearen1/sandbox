additional_attrs ||= []
excluded_attrs ||= []

yourtape_feeds.each do |f|
  json.set! f.id do
    json.extract! f, *([:tags, :name, :yourtape_source_id] - excluded_attrs + additional_attrs)
  end
end
