#globals
lib = require appRoot + '/lib'
db = require appRoot + '/db'
api = require appRoot + '/api'

#log
log = lib.log()

#locals
_ = lib.get '_'
moment = lib.get 'moment'
Promise = lib.get 'bluebird'
mongodb = lib.get 'mongodb'
request = Promise.promisify lib.get 'request'
xml2json = lib.get 'xml2json'
Twitter = lib.get 'nodeTwitter'
wiki = lib.get 'wiki'
wiki.verbose = false

ObjectID = mongodb.ObjectID

Promise.promisifyAll Twitter
#Promise.promisifyAll wiki


#ClientErrorFn
ClientError = (e)->
  e.code >= 400 and e.code < 500

#api query class for socials
class QueryAPI
  constructor: ()->

  wiki:
    articles: (session, query)->
      log.trace session

      if session.geo and !session.user and session.country_short is 'RU' || session.settings.lang is 'ru'
        wiki.apiUrl = 'http://ru.wikipedia.org/w/api.php'
      else
        wiki.apiUrl = 'http://en.wikipedia.org/w/api.php'

      getProps = (pageId)->
        return request wiki.apiUrl + '?action=query&pageids=' + pageId + '&prop=pageprops&format=json'
        .spread (res, body)->
          body = JSON.parse body
          return encodeURIComponent body.query.pages[pageId].pageprops.page_image

      wiki.searchAsync query, 3
      .then (articles)->
        articleTasks = _.map articles, (article)->
          wiki.pageAsync article
        Promise.all articleTasks
        .then (pages)->
          page = pages[0]
          return false unless page?

          Promise.promisifyAll page
          Promise.props
            summary: page.summaryAsync()
            content: page.contentAsync()
            images: page.imagesAsync()
          .then (pageData)->
            if (pageData and (newLineIndex = pageData.content.indexOf '\n')) isnt -1
              pageData.summary = pageData.summary.replace '\n', '<br/><br/>'
              pageData.content = pageData.content.replace '\n', '<br/><br/>'
            getProps page.pageId
            .then (imageName)->
              pageData.title = page.title
              pageData.url = decodeURIComponent page.url
              pageData.image = _.find pageData.images, (image)->
                return image.indexOf(imageName) isnt -1
              return pageData
  fb:
    groups: (session, query)->
      return false unless session.oauth?.fb?

      access_token = session.oauth.fb.access_token

      return api.fb.executeMethod 'search',
        q: query
        limit: 3
        type: 'group'
        access_token: access_token
      .then (response)->
        group_ids = _.pluck response.data, 'id'

        group_data = group_ids.map (group_id)->
          return api.fb.executeMethod group_id,
            access_token: access_token

        return Promise.all group_data
        .then (results)->
          return results

    events: (session, query)->
      return false unless session.oauth?.fb?

      access_token = session.oauth.fb.access_token

      return api.fb.executeMethod 'search',
        q: query
        limit: 3
        type: 'event'
        access_token: access_token
      .then (response)->
        event_ids = _.pluck response.data, 'id'

        event_data = event_ids.map (event_id)->
          return api.fb.executeMethod event_id,
            access_token: access_token

        Promise.all event_data
        .then (results)->
          return results
  vk:
    getExtendedGroupInfo: (session, group_ids)->
      api.vk.executeMethod
        method: 'groups.getById'
        params:
          group_ids: group_ids
          fields: 'city,country,place,description,wiki_page,members_count,
            counters,start_date,finish_date,can_post,can_see_all_posts,
            activity,status,contacts,links,fixed_post,verified,site'
          access_token: session.oauth.vk.access_token
          v: config.api.vk.v
      .then (response)->
        return response.response

    groups: (session, query)->
      return false unless session.oauth?.vk?

      access_token = session.oauth.vk.access_token

      api.vk.executeMethod
        method: 'groups.search'
        params:
          q: query
          count: 3
          sort: 0
          access_token: access_token
          v: config.api.vk.v
      .then (res)->
        #vk is awesome with such namings
        response = res.response

        if response?.items?
          group_ids = _
          .reduce response.items, (arr, next)->
            arr.push next.screen_name
            return arr
          , []

          return api.vk.executeMethod
            method: 'groups.getById'
            params:
              group_ids: group_ids.join ','
              fields: 'members_count'
          .then (response)->
            return response.response
        else
          return res
      .catch (e)->
        log.error 'error while querying vk:', e
        return e

    events: (session, query)->
      return false unless session.oauth?.vk?

      access_token = session.oauth.vk.access_token

      api.vk.executeMethod
        method: 'groups.search'
        params:
          q: query
          type: 'event'
          future: 1
          sort: 0
          offset: 0
          count: 3
          access_token: access_token
          v: config.api.vk.v
      .then (res)->
        #vk is awesome with such repeatings
        response = res.response

        if response?.items?
          group_ids = _
          .reduce response.items, (arr, next)->
            arr.push next.screen_name
            return arr
          , []

          return api.vk.executeMethod
            method: 'groups.getById'
            params:
              group_ids: group_ids.join ','
              fields: 'members_count'
          .then (response)->
            return response.response
        else
          return res
      .catch (e)->
        log.error 'error while querying vk:', e
        return e

    posts: (session, query, options)->
      options = _.defaults
        count: 15
      , options

      log.debug options

      query = query.replace /post_link/gmi, ''
      Promise.props
        phrase: posts.findAsync
          $text:
            $search: "\"#{query}\""
            # $language: session.settings.lang
          type: switch session.settings.search.sources.posts_of
            when "groups" then "group"
            when "people" then "human"
        words: posts.findAsync
          $text:
            $search: "#{query}"
            # $language: session.settings.lang
          type: switch session.settings.search.sources.posts_of
            when "groups" then "group"
            when "people" then "human"
      ,
        score:
          $meta: 'textScore'
      .then (collections)->
        collections.phrase.sortAsync
          score:
            $meta: 'textScore'
        collections.words.sortAsync
          score:
            $meta: 'textScore'
        result =
          phrase: collections.phrase
          words: collections.words
        Promise.props result
      .then (collections)->
        collections.phrase.skipAsync options.page * options.count
        result = collections
      .then (collections)->
        collections.phrase.limitAsync options.count
        collections.words.limitAsync options.count
        result =
          phrase: collections.phrase
          words: collections.words
        Promise.props result
      .then (collections)->
        collections.phrase.sortAsync
          likes: -1
          reposts: -1
        collections.words.sortAsync
          likes: -1
          reposts: -1
        result =
          words: collections.words
          phrase: collections.phrase
        Promise.props result
      .then (collections)->
        result =
          words: collections.words.toArrayAsync()
          phrase: collections.phrase.toArrayAsync()
        Promise.props result
      .then (collections)->
        posts = collections.phrase

        if posts.length < options.count
          posts = posts.concat(collections.words.slice(0, options.count - posts.length))

        authorsArray = []
        _.forEach posts, (post)->
          post.date = moment(post.date).fromNow()
          authorsArray.push new ObjectID post.author if authorsArray.indexOf post.author isnt -1
          post.author = authorsArray.indexOf post.author
        authors.findAsync
          _id:
            $in: authorsArray
        .then (authors)->
          authors.toArrayAsync()
        .then (authors)->
          _.map posts, (post)->

            _.forEach post.links, (link)->
              post.text = post.text.replace '$post_link', link

            # if post.text.indexOf '$post_link' isnt -1 and post.links.length

            post.author = author = _.find authors, (a)->
              a._id.toString() is authorsArray[post.author].toString()

            post.href = "https://vk.com/#{author.info.screen_name}?w=wall#{(if author.info.type is 'group' then '-' else '') + author.info.id}_#{post.id}"

            return post

          # if authorsArray.indexOf(post.author.toString()) isnt -1
          #   post.author = authorsArray.indexOf post.author.toString()
          # else
          #   authorsArray.push post.author.toString()
          #   post.author = authorsArray.length - 1
          # return post

        # authorsArray = _.map authorsArray, (author)->
        #   new ObjectID author

        # authors.findAsync
        #   _id:
        #     $in: authorsArray
        # .then (data)->
        #   data.toArrayAsync()
        # .then (authors)->
        #   _.forEach authors, (author)->
        #     _.forEach posts, (post)->
        #       post.author = author if author._id.toString() is authorsArray[post.author]?.toString()
        # .then (authors)->
        #   return {
        #     posts: posts
        #     authors: authors
        #   }

        # access_token = session.oauth.vk.access_token

        # api.vk.executeMethod
        #   method: 'groups.search'
        #   params:
        #     q: query
        #     count: 3
        #     sort: 0
        #     access_token: access_token
        #     v: vkAPIVersion
        # .then (res)->
        #   #vk is awesome with such namings
        #   response = res.response

        #   if response?.items?
        #     group_ids = _
        #     .reduce response.items, (arr, next)->
        #       arr.push next.screen_name
        #       return arr
        #     , []

        #     return api.vk.executeMethod
        #       method: 'groups.getById'
        #       params:
        #         group_ids: group_ids.join ','
        #         fields: 'members_count'
        #     .then (response)->
        #       return response.response
        #   else
        #     return res
        # .catch (e)->
        #   log.error 'error while querying vk:', e
        #   return e

  tw:
    users: (session, query)->
      return false unless session.oauth?.tw?

      twitterClient = new Twitter.RestClient config.api.tw.id,
        config.api.tw.secret,
        session.oauth.tw.token,
        session.oauth.tw.token_secret

      return twitterClient.usersSearchAsync
        q: encodeURIComponent query
        page: 1
        count: 3

    tweets: (session, query)->
      return false unless session.oauth?.tw?

      twitterClient = new Twitter.RestClient config.api.tw.id,
        config.api.tw.secret,
        session.oauth.tw.token,
        session.oauth.tw.token_secret

      return twitterClient.searchTweetsAsync
        q: encodeURIComponent query
        result_type: 'popular'

module.exports = QueryAPI
