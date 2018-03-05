class CreateRecommendations < ActiveRecord::Migration
  def change
    create_table :yourtape_recommendations do |t|
      t.belongs_to :yourtape_post, index: true
      t.integer :from_v_user_id, index: true
      t.integer :to_v_user_id, index: true

      t.timestamps null: false
    end
  end
end