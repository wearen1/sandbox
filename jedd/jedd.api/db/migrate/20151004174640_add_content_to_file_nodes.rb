class AddContentToFileNodes < ActiveRecord::Migration
  def change
	  add_column :jedd_file_nodes, :content, :string
  end
end
