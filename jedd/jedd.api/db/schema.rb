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

ActiveRecord::Schema.define(version: 20151111220053) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "jedd_directories", force: :cascade do |t|
    t.integer  "jedd_directory_id"
    t.string   "name"
    t.integer  "v_user_id"
    t.text     "tags",              default: [],              array: true
    t.integer  "likes_count",       default: 0
    t.integer  "comments_count",    default: 0
    t.integer  "reposts_count",     default: 0
    t.integer  "size",              default: 0
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
  end

  add_index "jedd_directories", ["jedd_directory_id"], name: "index_jedd_directories_on_jedd_directory_id", using: :btree
  add_index "jedd_directories", ["v_user_id"], name: "index_jedd_directories_on_v_user_id", using: :btree

  create_table "jedd_feedbacks", force: :cascade do |t|
    t.string   "type"
    t.string   "text"
    t.boolean  "positive"
    t.integer  "source_id"
    t.string   "source_type"
    t.integer  "v_user_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  add_index "jedd_feedbacks", ["source_type", "source_id"], name: "index_jedd_feedbacks_on_source_type_and_source_id", using: :btree
  add_index "jedd_feedbacks", ["v_user_id"], name: "index_jedd_feedbacks_on_v_user_id", using: :btree

  create_table "jedd_file_nodes", force: :cascade do |t|
    t.string   "name"
    t.string   "mime_type"
    t.string   "preview"
    t.text     "tags",               default: [],                 array: true
    t.integer  "size",               default: 0
    t.integer  "likes_count",        default: 0
    t.integer  "comments_count",     default: 0
    t.integer  "reposts_count",      default: 0
    t.integer  "jedd_directory_id"
    t.integer  "v_user_id"
    t.datetime "created_at",                         null: false
    t.datetime "updated_at",                         null: false
    t.string   "content"
    t.string   "description"
    t.boolean  "uploaded",           default: false
    t.string   "upload_access_code"
    t.string   "extension"
  end

  add_index "jedd_file_nodes", ["jedd_directory_id"], name: "index_jedd_file_nodes_on_jedd_directory_id", using: :btree
  add_index "jedd_file_nodes", ["v_user_id"], name: "index_jedd_file_nodes_on_v_user_id", using: :btree

  create_table "jedd_reposts", force: :cascade do |t|
    t.integer  "v_user_id"
    t.integer  "jedd_directory_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

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

  add_foreign_key "jedd_directories", "jedd_directories"
  add_foreign_key "jedd_directories", "v_users"
  add_foreign_key "jedd_feedbacks", "v_users"
  add_foreign_key "jedd_file_nodes", "jedd_directories"
  add_foreign_key "jedd_file_nodes", "v_users"
  add_foreign_key "v_external_tokens", "v_users"
  add_foreign_key "v_notifications", "v_users"
  add_foreign_key "v_users", "v_external_tokens"
  add_foreign_key "v_users", "v_notifications"
end
