class AddFieldsToFileNodes < ActiveRecord::Migration
  def change
    add_column :jedd_file_nodes, :description, :string
    add_column :jedd_file_nodes, :uploaded, :boolean, :default => false
  end
end
