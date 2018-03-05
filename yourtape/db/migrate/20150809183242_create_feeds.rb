class CreateFeeds < ActiveRecord::Migration
  def change
    create_table :yourtape_feeds do |t|
      t.string :name
      t.belongs_to :v_user
      t.belongs_to :yourtape_source, :index => true
      t.text :tags, array: true, default: []

      t.timestamps null: false
    end
  end
end