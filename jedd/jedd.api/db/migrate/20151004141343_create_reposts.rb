class CreateReposts < ActiveRecord::Migration
  def change
    create_table :jedd_reposts do |t|
      t.belongs_to :v_user
      t.belongs_to :jedd_directory
      
      t.timestamps
    end
  end
end