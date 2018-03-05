json.array! directories do |directory|
	json.partial! 'directory', :directory => directory

	if directory.jedd_directories.length
		json.jedd_directories do
			json.array! directory.jedd_directories do |directory|
				json.extract! directory, :v_user_id, :id,
	              :jedd_directory_id, :name, :tags,
	              :likes_count, :comments_count,
	              :reposts_count, :size, :created_at, :updated_at
			end
		end
	end
	
end