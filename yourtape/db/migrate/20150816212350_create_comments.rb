class CreateComments < ActiveRecord::Migration
  def change
    create_table :yourtape_comments do |t|
      t.references :v_user, index: true
      t.references :yourtape_post, index: true
      t.string :text
      t.belongs_to :target_comment

      t.timestamps null: false
    end
    add_foreign_key :yourtape_comments, :v_users
    add_foreign_key :yourtape_comments, :yourtape_posts
  end
end
