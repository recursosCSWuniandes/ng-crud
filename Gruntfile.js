module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ngtemplates: {
            CrudModule: {
                src: 'src/templates/**.html',
                dest: 'tmp/templates.js',
                htmlmin: {
                    collapseBooleanAttributes:      true,
                    collapseWhitespace:             true,
                    removeComments:                 true
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: ['src/js/crud.mod.js','src/js/crud.svc.js','src/js/crud.dir.js','src/js/crud.ctrl.js','tmp/templates.js'],
                dest: 'dist/ngcrud.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-angular-templates');

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['ngtemplates', 'uglify']);

};