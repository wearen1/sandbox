class CreateFileNodes < ActiveRecord::Migration
  def change
    create_table :jedd_file_nodes do |t|
      t.string :name
      t.string :mime_type
      t.string :preview
      t.text :tags, array: true, default: []

      t.integer :size, :default => 0
      t.integer :likes_count, :default => 0
      t.integer :comments_count, :default => 0
      t.integer :reposts_count, :default => 0

      t.belongs_to :jedd_directory, index: true
      t.belongs_to :v_user, index: true

      t.timestamps null: false
    end
    add_foreign_key :jedd_file_nodes, :jedd_directories
    add_foreign_key :jedd_file_nodes, :v_users
  end
end
