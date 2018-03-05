module.exports =
  routes:
    search:
      path: '/'
      route: require './search'
    oauth:
      path: '/oauth'
      route: require './oauth'
    me:
      path: '/me'
      route: require './me'
    allow:
      path: '/allow'
      route: require './allow'
  angular_routes: ['search', 'bookmarks', 'login']
  middlewares: require './middlewares'
