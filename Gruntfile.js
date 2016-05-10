module.exports = function (grunt) {

    'use strict';

    // 작업시간 표시
    require('time-grunt')(grunt);

    // 자동으로 grunt 태스크를 로드합니다. grunt.loadNpmTasks 를 생략한다.
    require('jit-grunt')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // html 에서 인클루드를 사용합니다.
        includes: {
            dist: {
                expand: true,
                cwd: 'src/docs/html/',
                src: ['**/*.html'],
                dest: 'dest',
                options: {
                    flatten: true,
                    // debug: true,
                    includePath: 'src/docs/include/'
                }
            }
        },
        // html 구문검사를 합니다.
        htmlhint: {
            options: {
                htmlhintrc: 'grunt/.htmlhintrc'
            },
            dist: [
                'dest/**/*.html',
            ]
        },

        // CSS를 만듭니다.
        sass: {
            options: {
                sourceComments: false,
                sourceMap: true,
                outputStyle: 'expanded' // nested, expanded, compact, compressed
            },
            dist: {
                expand: true,
                cwd: 'src/scss/',
                src: ['**/*.{sass,scss}'],
                dest: 'dest/css/',
                ext: '.css'
            }
        },

        // 벤더프리픽스를 추가합니다.
        postcss: {
            options: {
                processors: [
                    require('autoprefixer')({
                        browsers: [
                            'Android 2.3',
                            'Android >= 4',
                            'Chrome >= 20',
                            'Firefox >= 24',
                            'Explorer >= 8',
                            'iOS >= 6',
                            'Opera >= 12',
                            'Safari >= 6'
                        ]
                    })
                ]
            },
            dist: {
                src: 'dest/css/*.css',
            }
        },
        
        // css 의 속성을 정렬해줍니다.
        csscomb: {
            options: {
                config: 'grunt/.csscomb.json'
            },
            dist: {
                expand: true,
                cwd: 'dest/css/',
                src: ['*.css', '!*.min.css'],
                dest: 'dest/css/'
            }
        },

        // css 를 압축합니다.
        cssmin: {
            options: {
                // noAdvanced: true
                compatibility: 'ie9',
                keepSpecialComments: '*',
                sourceMap: true,
                advanced: false
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dest/css',
                    src: ['*.css', '!*.min.css'],
                    dest: 'dest/css',
                    ext: '.min.css'
                }]
            }
        },

        // 자바스크립트 구문검사를 합니다.
        jshint: {
            options: {
                jshintrc: 'grunt/.jshintrc',
                // force: true, // error 검출시 task를 fail 시키지 않고 계속 진단
                reporter: require('jshint-stylish') // output을 수정 할 수 있는 옵션
            },
            grunt: {
                src: ['Gruntfile.js']
            },
            dist: {
                src: 'src/js/site/*.js'
            }
        },

        // 파일을 합칩니다.
        concat: {
            options: {
                // separator: ';',
                stripBanners: false,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            dist: {
                src: 'src/js/site/*.js',
                dest: 'dest/js/site.js'
            }
        },

        // 압축합니다.
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            dist: {
                src: 'dest/js/site.js',
                dest: 'dest/js/site.min.js'
            }
        },

        // 폴더 및 파일을 삭제합니다.
        clean: {
            dist: {
                files: [{
                    dot: true,
                    nonull: true,
                    src: [
                        'dest'
                    ]
                }]
            },
        },

        // 폴더 및 파일을 복사합니다.
        copy: {
            dist: {
                files: [ 
                    // fonts
                    // {
                    //     expand: true,
                    //     cwd: 'src/fonts/',
                    //     src: '**',
                    //     dest: 'dest/fonts/'
                    // },
                ]
            }
        },

        // 이미지를 최적화 합니다.
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/images/',
                    src: '**/*.{png,jpeg,jpg,gif}',
                    dest: 'dest/images/'
                }]
            }
        },

        // 병렬로 작업을 실행합니다.
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            dist: [
                'copy',
                'imagemin'
            ]
        },

        // 감시를 합니다.
        watch: {
            options: { livereload: true },
            gruntfile: {
                files: ['Gruntfile.js'],
                tasks: ['jshint:grunt'],
            },
            html: {
                files: ['src/docs/**/*.html'],
                tasks: ['includes','htmlhint'],
            },
            sass: {
                files: ['src/scss/**/*.{sass,scss}'],
                tasks: ['sass','postcss','csscomb','cssmin'],
            },
            jsnt: {
                files: ['src/js/**/*.js'],
                tasks: ['jshint','concat','uglify'],
            },
            img: {
                files: ['src/images/**/*.{gif,jpeg,jpg,png}'],
                tasks: ['newer:imagemin'],
            },
            // fonts: {
            //     files: ['src/fonts/**/*'],
            //     tasks: ['newer:copy'],
            // }
        },

        // 서버를 열어서 브라우져에서 확인합니다.
        connect: {
            server: {
                options: {
                    port: 9000,
                    hostname: 'localhost',
                    livereload: 35729,
                    // keepalive: true,
                    base: 'dest',
                    open: 'http://<%= connect.server.options.hostname %>:<%= connect.server.options.port %>/category1/page-01.html'
                }
            }
        },

    });

    // 작업을 로드합니다.
    // grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('serve', function (target) {
      if (target === 'dist') {
          return grunt.task.run(['connect', 'watch']);
      }

      grunt.task.run([
        'default',
        'connect',
        'watch'
      ]);

    });

    // html task
    grunt.registerTask('html', [
            'includes',
            'htmlhint'
        ]
    );

    // css task
    grunt.registerTask('css', [
            // 'clean',
            'sass',
            'postcss',
            // 'csslint',
            'csscomb',
            'cssmin'
        ]
    );

    // javascript task
    grunt.registerTask('jsnt', [
            'jshint',
            'concat',
            'uglify'
        ]
    );

    grunt.registerTask('default', [
        'clean',
        'html',
        'css',
        'jsnt',
        'concurrent',
    ]);


};
