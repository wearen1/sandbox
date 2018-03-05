class CreateFeedbacks < ActiveRecord::Migration
  def change
    create_table :jedd_feedbacks do |t|
      t.string :type
      t.string :text
      t.boolean :positive
      t.references :source, polymorphic: true, index: true
      t.references :v_user, index: true

      t.timestamps null: false
    end
    add_foreign_key :jedd_feedbacks, :v_users
  end
end
