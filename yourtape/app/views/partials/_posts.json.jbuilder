additional_attrs ||= []
excluded_attrs ||= []

json.array!(yourtape_posts) do |p|
  json.extract! p, *(p.attributes.keys.map(&:to_sym) - [:updated_at, :created_at, :id, :entry_id] + additional_attrs - excluded_attrs)
  json.id p.entry_id
end
