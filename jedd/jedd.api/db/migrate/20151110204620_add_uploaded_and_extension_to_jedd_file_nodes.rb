class AddUploadedAndExtensionToJeddFileNodes < ActiveRecord::Migration
  def change
    add_column :jedd_file_nodes, :extension, :string
  end
end
