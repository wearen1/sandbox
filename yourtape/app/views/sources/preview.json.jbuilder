unless @error
  json.image @preview[:image]
  json.og @preview[:og]
  json.yourtape_feeds do
    json.array!(@preview[:yourtape_feeds]) do |f|
      json.extract! f, :title, :feed_url, :url, :description
      json.image f.image rescue nil
    end
  end
else
  json.error @error
end
