additional_attrs ||= []
excluded_attrs ||= []

yourtape_sources.each do |s|
  json.set! s.id do
    json.merge! s.attributes.merge(:name => s.title).except(*[ :id, :updated_at, :created_at, :title ].map(&:to_s))
  end
end
