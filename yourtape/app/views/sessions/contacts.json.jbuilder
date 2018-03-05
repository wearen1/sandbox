json.array!(@friends) do |u|
	json.extract! u, :id, :nick, :avatar, :first_name, :last_name
end
