class CreateSubscriptions < ActiveRecord::Migration
  def change
    create_table :yourtape_subscriptions do |t|
      t.belongs_to :v_user
      t.integer :v_subscriber_user_id, :index => true

      t.timestamps null: false
    end
    add_foreign_key :yourtape_subscriptions, :v_users
  end
end