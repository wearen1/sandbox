json.yourtape_recommendators do
  json.partial! 'partials/users', :v_users => @v_recommendators, :additional_attrs => [:image, :name], :excluded_attrs => [:email]
end

json.yourtape_sources do
  json.partial! 'partials/sources', :yourtape_sources => @yourtape_sources
end

json.yourtape_posts do
  json.array!(@yourtape_recommendations) do |r|
    json.extract! r, :v_from_user_id
    json.recommendation_id r.id
    json.merge! r.post.attributes
  end
end
