class AddUploadAccessCodeToFileNode < ActiveRecord::Migration
  def change
    add_column :jedd_file_nodes, :upload_access_code, :string
  end
end
