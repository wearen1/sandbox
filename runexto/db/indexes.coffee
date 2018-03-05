#mc is a mongo client
module.exports =
  ensure_index_post_text: ->
    posts.ensureIndexAsync
      text: "text"
    ,
      default_language: "ru"
  ensure_unique_index_post_id_and_author: ->
    posts.ensureIndexAsync
      id: 1
      author: 1
    ,
      unique: true
      dropDups: true
  ensure_unique_index_author_info_id_and_source: ->
    authors.ensureIndexAsync
      source: 1
      'info.id': 1
    ,
      unique: true
      dropDups: true
