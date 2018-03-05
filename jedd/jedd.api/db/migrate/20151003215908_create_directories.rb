class CreateDirectories < ActiveRecord::Migration
  def change
    create_table :jedd_directories do |t|
      t.belongs_to :jedd_directory, index: true
      t.string :name
      t.belongs_to :v_user, index: true
      t.text :tags, array: true, default: []

      t.integer :likes_count, :default => 0
      t.integer :comments_count, :default => 0
      t.integer :reposts_count, :default => 0
      t.integer :size, :default => 0
      
      t.timestamps null: false
    end
    add_foreign_key :jedd_directories, :jedd_directories
    add_foreign_key :jedd_directories, :v_users
  end
end