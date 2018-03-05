# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150826150835) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "v_background_images", force: :cascade do |t|
    t.string   "name"
    t.string   "url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "v_external_tokens", force: :cascade do |t|
    t.string   "vk_id"
    t.string   "vk_access_token"
    t.string   "fb_id"
    t.string   "fb_access_token"
    t.string   "tw_id"
    t.string   "tw_token"
    t.string   "tw_token_secret"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
    t.integer  "v_user_id"
  end

  add_index "v_external_tokens", ["fb_id"], name: "index_v_external_tokens_on_fb_id", using: :btree
  add_index "v_external_tokens", ["tw_id"], name: "index_v_external_tokens_on_tw_id", using: :btree
  add_index "v_external_tokens", ["v_user_id"], name: "index_v_external_tokens_on_v_user_id", using: :btree
  add_index "v_external_tokens", ["vk_id"], name: "index_v_external_tokens_on_vk_id", using: :btree

  create_table "v_notifications", force: :cascade do |t|
    t.string   "service_name"
    t.string   "title"
    t.string   "message"
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
    t.integer  "v_user_id"
  end

  add_index "v_notifications", ["service_name"], name: "index_v_notifications_on_service_name", using: :btree
  add_index "v_notifications", ["v_user_id"], name: "index_v_notifications_on_v_user_id", using: :btree

  create_table "v_preferences", force: :cascade do |t|
    t.integer  "v_user_id"
    t.integer  "v_theme_id"
    t.integer  "v_background_image_id"
    t.datetime "created_at",            null: false
    t.datetime "updated_at",            null: false
  end

  add_index "v_preferences", ["v_background_image_id"], name: "index_v_preferences_on_v_background_image_id", using: :btree
  add_index "v_preferences", ["v_theme_id"], name: "index_v_preferences_on_v_theme_id", using: :btree
  add_index "v_preferences", ["v_user_id"], name: "index_v_preferences_on_v_user_id", using: :btree

  create_table "v_schema_migrations", id: false, force: :cascade do |t|
    t.string "version", null: false
  end

  add_index "v_schema_migrations", ["version"], name: "unique_v_schema_migrations", unique: true, using: :btree

  create_table "v_themes", force: :cascade do |t|
    t.string   "css_url"
    t.string   "js_url"
    t.json     "params"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "v_users", force: :cascade do |t|
    t.string   "nick"
    t.string   "email"
    t.string   "password"
    t.string   "first_name"
    t.string   "last_name"
    t.string   "avatar"
    t.integer  "status"
    t.datetime "created_at",          null: false
    t.datetime "updated_at",          null: false
    t.integer  "v_external_token_id"
    t.integer  "v_notification_id"
  end

  add_index "v_users", ["v_external_token_id"], name: "index_v_users_on_v_external_token_id", using: :btree
  add_index "v_users", ["v_notification_id"], name: "index_v_users_on_v_notification_id", using: :btree

  create_table "yourtape_comments", force: :cascade do |t|
    t.integer  "v_user_id"
    t.integer  "yourtape_post_id"
    t.string   "text"
    t.integer  "target_comment_id"
    t.datetime "created_at",        null: false
    t.datetime "updated_at",        null: false
  end

  add_index "yourtape_comments", ["v_user_id"], name: "index_yourtape_comments_on_v_user_id", using: :btree
  add_index "yourtape_comments", ["yourtape_post_id"], name: "index_yourtape_comments_on_yourtape_post_id", using: :btree

  create_table "yourtape_feeds", force: :cascade do |t|
    t.string   "name"
    t.integer  "v_user_id"
    t.integer  "yourtape_source_id"
    t.text     "tags",               default: [],              array: true
    t.datetime "created_at",                      null: false
    t.datetime "updated_at",                      null: false
  end

  add_index "yourtape_feeds", ["yourtape_source_id"], name: "index_yourtape_feeds_on_yourtape_source_id", using: :btree

  create_table "yourtape_posts", force: :cascade do |t|
    t.string   "entry_id"
    t.string   "image"
    t.datetime "published"
    t.string   "title"
    t.string   "url"
    t.integer  "yourtape_source_id"
    t.text     "summary"
    t.datetime "created_at",         null: false
    t.datetime "updated_at",         null: false
  end

  add_index "yourtape_posts", ["entry_id", "yourtape_source_id"], name: "index_yourtape_posts_on_entry_id_and_yourtape_source_id", using: :btree
  add_index "yourtape_posts", ["yourtape_source_id"], name: "index_yourtape_posts_on_yourtape_source_id", using: :btree

  create_table "yourtape_recommendations", force: :cascade do |t|
    t.integer  "yourtape_post_id"
    t.integer  "from_v_user_id"
    t.integer  "to_v_user_id"
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
  end

  add_index "yourtape_recommendations", ["from_v_user_id"], name: "index_yourtape_recommendations_on_from_v_user_id", using: :btree
  add_index "yourtape_recommendations", ["to_v_user_id"], name: "index_yourtape_recommendations_on_to_v_user_id", using: :btree
  add_index "yourtape_recommendations", ["yourtape_post_id"], name: "index_yourtape_recommendations_on_yourtape_post_id", using: :btree

  create_table "yourtape_schema_migrations", id: false, force: :cascade do |t|
    t.string "version", null: false
  end

  add_index "yourtape_schema_migrations", ["version"], name: "unique_yourtape_schema_migrations", unique: true, using: :btree

  create_table "yourtape_sources", force: :cascade do |t|
    t.string   "url"
    t.string   "title"
    t.string   "site_url"
    t.string   "description"
    t.string   "image"
    t.string   "type"
    t.json     "og"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  create_table "yourtape_subscriptions", force: :cascade do |t|
    t.integer  "v_user_id"
    t.integer  "v_subscriber_user_id"
    t.datetime "created_at",           null: false
    t.datetime "updated_at",           null: false
  end

  add_index "yourtape_subscriptions", ["v_subscriber_user_id"], name: "index_yourtape_subscriptions_on_v_subscriber_user_id", using: :btree

  add_foreign_key "v_external_tokens", "v_users"
  add_foreign_key "v_notifications", "v_users"
  add_foreign_key "v_users", "v_external_tokens"
  add_foreign_key "v_users", "v_notifications"
  add_foreign_key "yourtape_comments", "v_users"
  add_foreign_key "yourtape_comments", "yourtape_posts"
  add_foreign_key "yourtape_posts", "yourtape_sources"
  add_foreign_key "yourtape_subscriptions", "v_users"
end
