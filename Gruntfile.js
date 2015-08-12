module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ngtemplates: {
            ngCrud: {
                src: 'src/crud/templates/**.html',
                dest: 'tmp/crud/templates.js',
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeComments: true
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> Universidad de Los Andes */\n'
            },
            ngCrud: {
                src: [
                    'src/crud/js/crud.mod.js',
                    'src/crud/js/crud.svc.js',
                    'src/crud/js/crud.dir.js',
                    'src/crud/js/crud.ctrl.js',
                    'tmp/crud/templates.js'
                ],
                dest: 'dist/ngcrud.min.js'
            },
            ngCrudMock: {
                src: [
                    'src/mocks/js/mocks.mod.js'
                ],
                dest: 'dist/ngcrud-mocks.min.js'
            }
        },
        concat: {
            dist: {
                src: [
                    'src/crud/js/crud.mod.js',
                    'src/crud/js/crud.svc.js',
                    'src/crud/js/crud.dir.js',
                    'src/crud/js/crud.ctrl.js',
                    'tmp/crud/templates.js'
                ],
                dest: '/home/afesguerra/Documentos/netbeans/crud-example/MusicStore.web/src/main/webapp/src/shared/ngcrud.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-angular-templates');

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['ngtemplates', 'uglify']);

    grunt.registerTask('dev', ['ngtemplates', 'concat']);

};
