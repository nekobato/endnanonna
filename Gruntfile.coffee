module.exports = (grunt) ->
  grunt.initConfig

    pkg: grunt.file.readJSON 'package.json'

    coffee:
      options:
        sourceMap: yes
      compile:
        files: [{
          expand: yes
          cwd: 'assets/coffee'
          src: [ '*.coffee' ]
          dest: 'dist/javascripts'
          ext: '.js'
        }]

    sass:
      options:
        style: 'compressed'
        noCache: true
        trace: true
      dist:
        files: [{
          expand: true
          cwd: 'assets/sass'
          src: [ '*.sass' ]
          dest: 'dist/stylesheets'
          ext: '.css'
        }]

    watch:
      options:
        dateFormat: (time) ->
          grunt.log.writeln "The watch finished in #{time}ms at #{new Date().toLocaleTimeString()}"
      coffee:
        files: ['assets/**/*.coffee']
        tasks: ['coffee']
      sass:
        files: ['assets/**/*.sass']
        tasks: ['sass']

  # compile
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-sass'
  # server
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.registerTask 'build', ['coffee', 'sass']
  grunt.registerTask 'default', ['build', 'watch']
