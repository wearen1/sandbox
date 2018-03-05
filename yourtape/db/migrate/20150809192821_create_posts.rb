class CreatePosts < ActiveRecord::Migration
  def change
    create_table :yourtape_posts do |t|
      t.string :entry_id
      t.string :image
      t.datetime :published
      t.string :title
      t.string :url
      t.references :yourtape_source, index: true
      t.text :summary

      t.timestamps null: false
    end
    add_foreign_key :yourtape_posts, :yourtape_sources
    add_index :yourtape_posts, [:entry_id, :yourtape_source_id]
  end
end
