/**
 * Created by eadm on 15.04.15.
 */
(function(){
    'use strict';
    var refresh = 50;//Время обновления страницы
    var noise = false;
    var PAGE_SIZE = 50;
    var ANIM_SPEED = 150;

    var app = angular.module('yourtape', ['ngRoute', 'ngCookies', 'ngSanitize', 'pascalprecht.translate', 'ngAnimate']).
        config(function ($routeProvider) {
            $routeProvider
                .when('/', {controller: MainCtrl, templateUrl: 'temps/body.html'});
        });

    app.directive('post', function() {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: 'temps/post.html'
        };
    });

    app.directive('window', function () {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: function(elem, attr) {
                return 'temps/window/' + attr.type + '.html';
            }
        }
    });

    //directive to edit content in div blocks with contenteditable and change its ng-model
    app.directive("contenteditable", function() {
        return {
            restrict: "A",
            require: "ngModel",
            link: function(scope, element, attrs, ngModel) {
                function read() {
                    ngModel.$setViewValue(element.text());
                }
                ngModel.$render = function() {
                    element.html(ngModel.$viewValue || "");
                };
                element.bind("keydown keyup", function(e) {
                    if(e.which === 13) {
                        e.preventDefault();
                    } else {
                        scope.$apply(read);
                    }
                });
            }
        };
    });

    app.filter('filterHash', function() { // for filtering hash objects
        return function(items, callback) {
            var filtered = {};

            angular.forEach(items, function(item, key) {
                if (callback && callback(item)) {
                    filtered[key] = item;
                }
            });

            return filtered;
        };
    });

    app.config(function ($translateProvider, $locationProvider) {
        $locationProvider.html5Mode({ enabled: true, requireBase: true });

        $translateProvider.translations('en', {
            feed:            'Feed',
            recommendations: 'Recommendations',
            world:           'World',

            sources:         'Sources',
            filters:         'Filters',

            add:             'add',
            cancel:          'cancel',
            done:            'done',
            delete:          'delete',
            edit:            'edit',
            add_tag:         'Add tag...',

            recommend:       'recommend',
            recommend_title: 'Choose users',

            search:          'Search',

            from:            'from',
            suggestion_title:'Suggest to follow',

            follow:          'follow',
            unfollow:        'unfollow'
        });

        $translateProvider.translations('ru', {
            feed:            'Лента',
            recommendations: 'Рекомендации',
            world:           'Мир',

            sources:         'Источники',
            filters:         'Фильтры',

            add:             'добавить',
            cancel:          'отмена',
            done:            'готово',
            delete:          'удалить',
            edit:            'изменить',
            add_tag:         'Добавить тег...',

            recommend:       'рекомендовать',
            recommend_title: 'Выберите получателей',

            search:          'Поиск',

            from:            'от',
            suggestion_title:'Предлагаем подписаться',

            follow:          'подписаться',
            unfollow:        'отписаться'
        });

        $translateProvider.preferredLanguage('en');
    });

    function MainCtrl($scope, $sce, $http, $translate, $timeout, $compile, $cookies){

        var Tab = function (name, data) {
            this.name = name;
            this.feeds = [];
            this.posts = [];
            this.search = "";

            this.sample = {
                counter: 0,
                source_id: -1,
                sync: 0,
                last_id: 0
            };

            for (var key in data) {
                this[key] = data[key];
            }
        };

        Tab.prototype.checkPost = function (item) {
            if (!this.sample) {
                return true;
            }

            if (!this.filteredFeeds[item[this.filter.filter_id]]) { //source_id for 'feed' & from_id for others
                return false;
            }

            if (!this.sample.source_id || this.sample.source_id == -1) {
                return true;
            }

            if (this.sample.source_id == item[this.filter.filter_id]) {
                return true;
            } else {
                return false;
            }
        };
        Tab.prototype.filterPost = function (item, id, total) {
            var is = this.checkPost(item);
            if ((id == 0 || this.sample.last_id == 0 || this.sample.last_id > item.id) && is === true) {
                this.sample.last_id = item.id;
            }
            if (total.length - 1 == id) { // end of array while filtering
                this.onRepeat();
            }
            return is;
        };
        Tab.prototype.filterFeed = function (item) {
            if (item.name.indexOf(this.search) == -1) {
                return false;
            }
            return true;
        },
        Tab.prototype.onRepeat = function () {
            var self = this;
            if (this.sample.sync == this.filteredPosts.length || this.sample.source_id == -1 || this.feeds[this.sample.source_id].end) { // if we load all posts of this feed
                // console.log("WTF: ", this.sample.sync, " - ", this.filteredPosts.length);
                return false;
            }
            // console.log("onRepeat: ", this.sample.sync, " -> ", this.filteredPosts.length);
            this.sample.sync = this.filteredPosts.length;

            var cnt = PAGE_SIZE - this.sample.sync;
            if (cnt <= 0) {
                return false;
            }

            var last = this.sample.last_id;
            this.sample.last_id = 0;
            var data = {
                last_id: last,
                count: cnt
            };
            return data;
        }
        Tab.prototype.onPage = function () {
            var args = {
                last_id: this.sample.last_id
            };
            this.sample.last_id = 0;
            if (this.sample.source_id != -1) {
                if (this.feeds[this.sample.source_id].end) {
                    return false;
                }
                args.from_id = this.sample.source_id;
            }
            return args;
        };
        Tab.prototype.chooseFeed = function (source_id, item) {
            if (this.sample.source_id === source_id) {
                this.sample.source_id = -1;
                return false;
            } else {
                this.sample.source_id = source_id;
                return true;
            }
        };


        // abstract tabs
        $scope.tabs = {};
        $scope.tabs.state = 0;
        $scope.tabs.items = [ new Tab('feed', {
            tags: [],
            editable: true,
            state: 0, // state for editable,
            filter: {
                filter_id: 'source_id'
            },
            onStart: function () {
                var self = this;
                self.isReady = false;
                $http({
                    url: '/profile.json',
                    method: 'GET'
                }).then(function (r) {
                    if (r.error) {
                        console.log(r);
                        return null;
                    } else {
                        $scope.user = r.data;
                        return r.data.id;
                    }
                }).catch(function (e) {
                    console.log(e);
                    return null;
                }).then(function(uid){
                    if (!uid) return;
                    getData($http, 0, uid, {}, function(err, data){
                        // console.log(data);
                        if (!err){
                            self.feeds = data.feeds;
                            self.posts = data.posts;
                            getTags(self, data.feeds);
                        } else {
                            console.log(err);
                        }
                        self.isReady = true;
                    });
                });
            },
            onRepeat: function () {
                var self = this;
                var args = Tab.prototype.onRepeat.call(self); // call super function
                if (!args) return;

                args.from_id = self.sample.source_id;

                getData($http, 0, $scope.user.id, args, function (err, data) {
                    if (!err) {
                        if (data.posts.length !== args.count) {
                            self.feeds[self.sample.source_id].end = true;
                        }
                        console.log("want: " + args.count + " | got: " + data.posts.length + " | ?end: " + self.feeds[self.sample.source_id].end);
                        Array.prototype.push.apply(self.posts, data.posts);
                    } else {
                        console.log(err);
                    }
                });
            },
            onPage: function () {
                var self = this;
                var args = Tab.prototype.onPage.call(self);
                if (!args) return;
                getData($http, 0, $scope.user.id, args, function (err, data) {
                    if (!err) {
                        if (data.posts.length !== PAGE_SIZE) {
                            self.feeds[self.sample.source_id].end = true;
                        }
                        Array.prototype.push.apply(self.posts, data.posts);
                    }
                    // console.log("onRepeat", arguments);
                });
            },
            filterFeed: function (item) {
                var self = $scope.tabs.items[0];
                if (item.name.indexOf(self.search) == -1) {
                    return false;
                }

                if (!self.sample) {
                    return true;
                }

                if (!self.sample.tags || self.sample.tags.length === 0) {
                    return true;
                }


                if (self.sample.tags.inArrays(null, item.tags)) {
                    return true;
                } else {
                    return false;
                }
            },
            filterPost: function (item, id, total) {
                return Tab.prototype.filterPost.call($scope.tabs.items[0], item, id, total);
            },
            checkPost: function (item) {
                return Tab.prototype.checkPost.call($scope.tabs.items[0], item);
            },
            chooseTag: function (tag) {
                if(!this.sample.tags) this.sample.tags = [];

                var i = this.sample.tags.indexOf(tag); //add selected tag to sample
                if (i === -1) {
                    this.sample.tags.push(tag);
                    // if (!this.feeds[this.sample.source_id].tags.inArray(null, tag)) { //if selected feed dsn't have selected tag: deselect this feed
                    //     this.sample.source_id = -1;
                    // }
                } else {
                    this.sample.tags.splice(i, 1);
                }

                if (this.sample.source_id != -1 && !this.feeds[this.sample.source_id].tags.inArrays(null, this.sample.tags)) {
                    this.sample.source_id = -1;  //if selected feed dsn't meet all filter rules deselect it
                }
            },
            getPlaceholder: function () {
                return "No posts. Add some sources to fill this space";
            },
            deleteFeeds: function () {
                for (var key in this.feeds) {
                    if (this.feeds[key].selected) {

                        $http({
                            url: '/feeds/' + this.feeds[key].feed_id + '.json',
                            method: 'DELETE'
                        }).then(function (r) {
                            if (r.error) {
                                console.log(r);
                            }
                        }).catch(console.log);

                        if (this.sample.source_id == key) this.sample.source_id = -1;
                        delete this.feeds[key];
                    }
                }
            }

        }), new Tab('world', {
            filter: {
                filter_id: 'from_id'
            },
            feed: {
                sub: function () {
                    var tab = $scope.tabs.items[1];
                    var self = this;
                    if (this.info.isSub) { //if we want to unfollow
                        delete tab.feeds[self.info.user_id];
                        self.info = undefined;

                        $http({
                            url: '/subscriptions/' + tab.sample.source_id + '.json',
                            method: 'DELETE'
                        }).then(function (r) {
                            if (r.error) {
                                console.log(r);
                            } else {
                                // OK
                            }
                        }).catch(console.log);

                        tab.sample.source_id = -1;
                    } else { //if we want to follow
                        $http({
                            url: '/subscriptions.json',
                            method: 'POST',
                            data: {
                                user_id: self.info.user_id
                            }
                        }).then(function (r) {
                            if (r.error) {
                                console.log(r);
                            } else {
                                self.info.sub_count ++;
                                self.info.isSub = true;
                                delete tab.suggestions[self.info.user_id];
                                if (Object.keys(tab.suggestions).length == 0) { // delete suggestions if it empty
                                    tab.suggestions = undefined;
                                }

                                tab.feeds[self.info.user_id] = self.info.user;
                                for (var key in self.backup.sources) {
                                    tab.sources[key] =  self.backup.sources[sources];
                                }
                                Array.prototype.push.apply(tab.posts, self.backup.posts);
                                delete self.backup;
                                tab.sample.source_id = self.info.user_id;
                            }
                        }).catch(console.log);
                    }
                },
                toggle: function () {
                    $cookies['isHideSuggestions'] = this.isHideSuggestions = !this.isHideSuggestions;
                },
                isHideSuggestions: $cookies['isHideSuggestions']
            },
            onStart: function () {
                var self = this;
                self.isReady = false;

                getData($http, 1, 0, {}, function (err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        self.feeds = data.subscriptions || {};
                        self.sources = data.sources || {};
                        self.posts = data.posts || [];
                        self.suggestions = data.suggestions;

                        self.isReady = true;
                    }
                });
            },
            chooseFeed: function (source_id, item) {
                var self = this;
                if (!Tab.prototype.chooseFeed.call(self, source_id)) {
                    self.feed.info = undefined;
                    return;
                }

                this.closeFeed();

                self.feed.info = {
                    user: item,
                    user_id: source_id,
                    isSub: true
                };
                // console.log(self.posts.length);
                $http({
                    url: '/tapes/' + source_id + '/stats.json',
                    method: 'GET'
                }).then(function (r) {
                    if (r.error) {
                        console.log(r);
                    } else {
                        self.feed.info.sub_count = r.data.subscribers_count;
                        self.feed.info.feeds_count = r.data.feeds_count;
                        self.feed.info.isSub = r.data.in_subscriptions;
                    }
                }).catch(console.log);
            },
            onRepeat: function () {
                var self = this;
                var args = Tab.prototype.onRepeat.call(self); // call super function
                if (!args) return;

                getData($http, 0, self.sample.source_id, args, function (err, data) {
                    if (!err) {
                        if (data.posts.length !== args.count) {
                            self.feeds[self.sample.source_id].end = true;
                        }
                        for (var key in data.sources) {
                            self.sources[key] = data.sources[key];
                        }
                    } else { console.log(err); }
                });
            },
            onPage: function () {
                var self = this;
                var args = Tab.prototype.onPage.call(self); // call super function
                if (!args) return;

                delete args.from_id;

                getData($http, (self.sample.source_id == -1 ? 1 : 0), self.sample.source_id, args, function (err, data) {
                    if (!err) {
                        if (data.posts.length !== PAGE_SIZE) {
                            self.feeds[self.sample.source_id].end = true;
                        }
                        Array.prototype.push.apply(self.posts, data.posts);
                        for (var key in data.sources) {
                            self.sources[key] = data.sources[key];
                        }
                    }
                });
            },
            filterPost: function (item, id, total) {
                var self = $scope.tabs.items[1];
                return Tab.prototype.filterPost.call(self, item, id, total) || (self.feed.info && !self.feed.info.isSub);
            },
            filterFeed: function (item) {
                return Tab.prototype.filterFeed.call($scope.tabs.items[1], item);
            },
            openFeed: function (user_id, item) {
                var f = false; // flag shows is we come from another suggested feed
                if (this.feed.info) {
                    if (this.feed.info.user_id == user_id) return;
                    f = true;
                }

                var self = this;
                self.isReady = false;
                self.sample.source_id = -1;
                self.feed.info = {
                    'user_id': user_id,
                    user: item
                };
                $http({
                    url: '/tapes/' + user_id + '/stats.json',
                    method: 'GET'
                }).then(function (r) {
                    if (r.error) {
                        console.log(r);
                    } else {
                        self.feed.info.sub_count = r.data.subscribers_count;
                        self.feed.info.feeds_count = r.data.feeds_count;
                        self.feed.info.isSub = r.data.in_subscriptions;
                    }
                }).catch(console.log);

                getData($http, 0, user_id, {}, function (e, data) {
                    // console.log(data);
                    if (!f) {
                        self.feed.backup = { // keeping current data
                            sources: self.sources,
                            posts: self.posts
                        };
                    }
                    self.sources = data.feeds;
                    self.posts = data.posts;
                    self.isReady = true;
                    // console.log(self);
                });
            },
            closeFeed: function () {
                if (!this.feed.backup) return;
                this.sources = this.feed.backup.sources;
                this.posts = this.feed.backup.posts;
                delete this.feed.info;
            },
            getPlaceholder: function () {
                return (this.sample.source_id == -1) ? 'No posts. Follow somebody to fill this space' : 'Selected user dsn\'t have posts in his feed.';
            }

        }), new Tab('recommendations', {
            filter: {
                filter_id: 'from_id'
            },
            onStart: function () {
                var self = this;
                self.isReady = false;

                getData($http, 2, 0, {}, function (err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        self.feeds = data.recommendators;
                        self.posts = data.posts;

                        self.sources = data.sources;
                        self.isReady = true;
                    }
                });
            },
            onRepeat: function () {
                var self = this;
                var args = Tab.prototype.onRepeat.call(self); // call super function
                if (!args) return;

                getData($http, 2, self.sample.source_id, args, function (err, data) {
                    if (!err) {
                        if (data.posts.length !== PAGE_SIZE) {
                            self.feeds[self.sample.source_id].end = true;
                        }
                        Array.prototype.push.apply(self.posts, data.posts);
                        for (var key in data.sources) {
                            self.sources[key] = data.sources[key];
                        }
                    }
                });
            },
            onPage: function () {
                var self = this;
                var args = Tab.prototype.onPage.call(self); // call super function
                if (!args) return;

                getData($http, 2, self.sample.source_id, args, function (err, data) {
                    if (!err) {
                        if (data.posts.length !== PAGE_SIZE && self.sample.source_id != -1) {
                            self.feeds[self.sample.source_id].end = true;
                        }
                        Array.prototype.push.apply(self.posts, data.posts);
                        for (var key in data.sources) {
                            self.sources[key] = data.sources[key];
                        }
                    }
                });
            },
            filterPost: function (item, id, total) {
                var self = $scope.tabs.items[2];
                var is = self.checkPost(item);
                if ((id == 0 || self.sample.last_id == 0 || self.sample.last_id > item.recommendation_id) && is === true) {
                    self.sample.last_id = item.recommendation_id;
                }
                if (total.length - 1 == id) { // end of array while filtering
                    self.onRepeat();
                }
                return is;
            },
            filterFeed: function (item) {
                return Tab.prototype.filterFeed.call($scope.tabs.items[2], item);
            },
            getPlaceholder: function () {
                return 'You dn\'t have recommended posts.';
            }

        })];

        $scope.tabs.changeTab = function (index) {
            if (this.state == index) return;
            this.state = index;
            if (this.items[this.state].onStart) {
                this.items[this.state].onStart();
            }
        }

        $scope.tabs.items[0].onStart();

        // modal windows
        var windowMgr = new WindowMgr($scope, $compile);

        $scope.share = function (postID) {
            windowMgr.addWindow('share', {
                'postID': postID,
                friends: $scope.friends,

                moveTo: function (from, i, to) {
                    to.push(from[i]);
                    from.splice(i, 1);
                },
                share: function (next) {
                    var self = this;
                    if(!self.selected || self.selected.length == 0) return false;
                    self.block = true; // block content while sending data

                    var ids = [];
                    for (var i = self.selected.length; i--;) {
                        ids.push(self.selected[i].id);
                    }
                    $http({
                        url: '/feeds/recommendations.json',
                        method: 'POST',
                        data: {
                            post_id: self.postID,
                            to: ids
                        }
                    }).then(function (r) {
                        if (!r.error) {
                            next();
                        } else {
                            self.block = false;
                            console.log("Error");
                        }
                    }).catch(function (e) {
                        self.block = false;
                    });
                }
            }, function (scope) {
                scope.options.selected = [];
                $http({
                    url: '/contacts.json',
                    method: 'GET'
                }).then(function (r) {
                    if (r.error) {
                        console.log(r);
                    } else {
                        scope.options.friends = r.data;
                    }
                }).catch(console.log);
            } ,function () {
                $(".window").css({width: '278px'});
                // $(".selected-list").mCustomScrollbar({theme: "dark-thin"});
                $(".friends-list").mCustomScrollbar({theme: "dark-thin"});
            });
        }

        $scope.edit = function (item) {
            windowMgr.addWindow('edit', {
                original: item, //pointer to original object
                'item': $.extend(true, {}, item), //copy item to change copy,

                addTag: function (e) {
                    if (e.which === 13 && e.currentTarget.value.length > 0) {
                        var i = 0;
                        if (!this.item.tags) {
                            this.item.tags = [];
                        } else
                        for (i = this.item.tags.length; i--; ) {
                            if(this.item.tags[i] == e.currentTarget.value) break;
                        }
                        if(i === -1){
                            this.item.tags.push(e.currentTarget.value);
                        }
                        e.currentTarget.value = "";
                    }
                },
                removeTag: function (i) {
                    this.item.tags.splice(i, 1);
                },
                save: function (next) {
                    var self = this;
                    self.block = true;

                    $http({
                        url: '/feeds/' + self.item.feed_id + '.json',
                        method: 'PUT',
                        data: {
                            name: self.item.name,
                            tags: self.item.tags
                        }
                    }).then(function (r) {
                        if (r.error) {
                            self.block = false;
                        } else {
                            self.original.name = self.item.name;
                            self.original.tags = self.item.tags;
                            self.block = false;

                            getTags($scope.tabs.items[0], $scope.tabs.items[0].feeds);

                            next();
                        }
                    }).catch(function (e) {
                        self.block = false;
                    });
                }
            });
        };

        $scope.openSourceWindow = function () {
            windowMgr.addWindow('add_source', {
                url: "",
                onKeyPress: function (e) {
                    if(e.which === 13) {
                        var input_ = $(e.currentTarget);
                        var body_ = $(input_[0].parentNode);
                        var link_ = body_.find('.item');
                        var error_ = body_.find('.error');

                        this.load(function () {
                            error_.slideUp(ANIM_SPEED);
                            input_.prop('disabled', true);
                            link_.css({marginTop: '-16px'});
                            return function () {
                                $(input_[0].parentNode.parentNode).find('.preview').slideDown(ANIM_SPEED);
                                link_.css({marginTop: '0'});
                                body_.find('.line').animate({margin: "8px -16px -16px -16px", backgroundColor: "rgba(31, 31, 31, 0.1)", padding: "0 16px"}, ANIM_SPEED);
                            }
                        }, function (err_msg) { //handling error
                            link_.css({marginTop: '0'});
                            input_.prop('disabled', false);
                            error_.text(err_msg);
                            error_.slideDown(ANIM_SPEED);
                        });
                    }
                },
                load: function (animation, err) {
                    var preview = this;
                    animation = animation();
                    $http({
                        url: '/feeds/preview.json',
                        method: "POST",
                        data: {'url': preview.url},
                        headers: { 'Content-Type': 'application/json' }
                    }).then(function(r){
                        if(!r.data.error) {
                            preview.data = r.data;
                            preview.onComplete = true;
                            animation();
                        } else {
                            err(r.data.error);
                        }
                    }).catch(console.log);
                },
                add: function (next) {
                    var self = this;
                    self.block = true;

                    var feeds = [];
                    var local = [];
                    if (self.data.feeds.length > 1) {
                        for (var i = self.data.feeds.length; i--;) {
                            if(self.data.feeds[i].isSelected) {
                                feeds.push({
                                    'url': self.data.feeds[i].feed_url,
                                    'tags': self.data.feeds[i].tags
                                });
                                local.push({
                                    name: self.data.feeds[i].title,
                                    image: self.data.image,
                                    tags: []
                                });
                            }
                        }
                    } else {
                        feeds.push({
                            'url': self.data.feeds[0].feed_url,
                            'tags': self.data.feeds[0].tags
                        });
                        local.push({
                            name: self.data.feeds[0].title,
                            image: self.data.image,
                            tags: []
                        });
                    }

                    $http({
                        url: '/feeds.json',
                        method: "POST",
                        data: {
                            'feeds': feeds
                        },
                        headers: { 'Content-Type': 'application/json' }
                    }).then(function(r){
                        if(!r.error) {
                            //push data to rest group
                            console.log(r.data);
                            for (var i = r.data.length; i--;) {
                                targetGroup[r.data[i]] = local[i];
                            }
                            self.block = false;
                            next();
                        } else {
                            console.log(r);
                            self.block = false;
                        }
                    }).catch(function (e) {
                        console.log(e);
                        self.block = false;
                    });
                },
                targetGroup: $scope.tabs.items[$scope.tabs.state].feeds
            });
        };

        $scope.onRender = function () {
            $("#content").mCustomScrollbar({
                theme: "dark-thin",
                scrollInertia: 800,
                callbacks: {
                    onTotalScroll: function () {
                        $scope.tabs.items[$scope.tabs.state].onPage();
                    }
                },
                autoHideScrollbar: true
            });
            $("#sub_list").mCustomScrollbar({theme: "dark-thin"});

            $(document).click(function () {
                if ($scope.onDocumentClicked) {
                    $scope.onDocumentClicked();
                }
            });
        }
    }

    /////////////////POST RENDER
    app.directive('render', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            terminal: true,
            transclude: false,
            link: function(scope) {
                if(scope.onRender) $timeout(function () {scope.onRender(scope);}, 0);
            }
        };
    }]);
    /////////////////POST RENDER

    //Time difference(for post) directive
    app.directive('timeDifference', ['$interval', '$compile', function($interval, $compile){
        return {
            restrict: 'C',
            transclude: true,
            scope: true,
            link: function(scope, element, attrs){
                element.text(scope.$parent.post.published.fromNow());
                $interval(function(){
                    element.text(moment(scope.$parent.post.published).fromNow());
                }, 6e4);
            }
        };
    }]);

    var getTags = function (tab, data) {
        tab.tags = [];
        for (var feed in data) {
            tab.tags.pushUnique(null, data[feed].tags);
        }
    };

    var getData = function ($http, type, uid, args, cb) {
        var url = "";
        switch (type) {
            case 0:
                url = '/tapes/' + uid + '.json?';
                break;
            case 1:
                url = '/feeds/world.json?';
                break;
            case 2:
                url = '/feeds/recommendations.json';
                break;
        }

        $http({
            url: url + $.param(args),
            method: 'GET'
        }).then(function (r) {
            if (r.error) {
                console.log(r);
            } else {
				if (r.data['posts']) {
					r.data.posts = r.data.posts.map(function(post){
						post.published = moment(post.published);
						return post;
					});
				}
              cb(null, r.data);
            }
        }).catch(function (e) {
            console.log(e);
            cb(e.error, null);
        });
    };
})();
