additional_attrs ||= []
excluded_attrs ||= []

yourtape_users.each do |u|
  json.set! u.id do
    json.merge! u.attributes.extract!(* ([:nick, :email, :first_name, :last_name, :avatar, :status] + additional_attrs - excluded_attrs).map(&:to_s))
    json.name "#{ u.first_name } #{ u.last_name }" if additional_attrs.include? :name
    json.image u.avatar if additional_attrs.include? :image
  end
end
