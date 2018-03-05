class CreateSources < ActiveRecord::Migration
  def change
    create_table :yourtape_sources do |t|
      t.string :url
      t.string :title
      t.string :site_url
      t.string :description
      t.string :image
      t.string :type
      t.json   :og

      t.timestamps null: false
    end
  end
end