module.exports = (grunt)->
  grunt.initConfig
    coffeelint:
      app: [
        'app.coffee', 'routes/**/*.coffee', 'test/*.coffee', 'lib/**/*.coffee'
      ]
      options:
        max_line_length:
          level: 'ignore'
    find:
      coffee:
        name: '*.coffee'
        prune: ['node_modules', 'deprecated', 'Gruntfile.*']
        expand: true
        dest: './'
        ext: '.js'
        config: 'coffee.all.files'
      coffeeMore:
        name: '*.coffee'
        prune: ['node_modules', 'deprecated', 'Gruntfile.*']
        expand: true
        dest: './'
        ext: '.js'
        config: 'closure-compiler.backend.files.js'
    'closure-compiler':
      backend:
        closurePath: '/usr/local/opt/closure-compiler/libexec'
        options:
          compilation_level: 'ADVANCED_OPTIMIZATIONS'
          language_in: 'ECMASCRIPT5_STRICT'

  npmTasks = [
    'grunt-find'
    'grunt-coffeelint'
    'grunt-contrib-clean'
    'grunt-contrib-coffee'
    'grunt-closure-compiler'
  ]

  grunt.loadNpmTasks i for i in npmTasks
  grunt.registerTask 'default', ['find', 'coffeelint', 'coffee']
