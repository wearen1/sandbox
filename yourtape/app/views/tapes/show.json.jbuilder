@yourtape_tape[:yourtape_feeds].each do |f|
  json.feeds do
    json.set! f.source.id do
      json.feed_id f.id
      json.extract! f, :tags
      json.extract! f.source, :url, :title, :site_url, :image
      json.name f.yourtape_source.title
    end
  end
end

json.posts do
  json.partial! 'partials/posts', :yourtape_posts => @yourtape_tape[:yourtape_posts], :additional_attrs => [:yourtape_feed_id]
end
