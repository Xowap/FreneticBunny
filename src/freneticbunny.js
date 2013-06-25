/*vim: fileencoding=utf8 tw=100 expandtab ts=4 sw=4 */
/*jslint indent: 4, maxlen: 100 */
/*global jQuery,window,FB */

(function ($, window) {
    "use strict";

    function FBPerms(perms) {
        var as_array;

        if (perms !== null) {
            as_array = perms.split(',');
        } else {
            as_array = [];
        }

        this.has = function (perms) {
            var test_array = perms.split(','), valid = true;

            $.each(test_array, function (k, v) {
                if (as_array.indexOf(v) < 0) {
                    valid = false;
                }
            });

            return valid;
        };

        this.split = function () {
            return as_array;
        };
    }

    function FBApiRequest(path, args) {
        var handle_response;

        function AjaxRequest(url) {
            this.run = function () {
                var promise = new $.Deferred();
                $.ajax(url).done(handle_response(promise));
                return promise;
            };
        }

        handle_response = function (promise) {
            return function (response) {
                var data = response.data, next = null;

                if (response.paging && response.paging.next) {
                    next = new AjaxRequest(response.paging.next);
                }

                promise.resolve(data, next);
            };
        };

        this.run = function () {
            var promise = new $.Deferred();

            $.fb.ready(function () {
                FB.api(path, args, handle_response(promise));
            });

            return promise;
        };
    }

    function FBHelper() {
        var self = this,

            // Promises
            pr_loaded = null,
            pr_initialized = new $.Deferred(),
            pr_authenticated = new $.Deferred(),

            // Facebook info
            fb_auth_response = null,
            fb_granted = null,
            fb_status = 'not_autorized',
            fb_server_signed_request,

            // Default settings
            settings = {
                url: '//connect.facebook.net/##LOCALE##/all.js',
                locale: 'en_US',
                status: true,
                xfbml: true,
                oauth: true,
                authResponse: undefined,
                fb_granted: null
            };

        this.setup = function (opts) {
            $.extend(settings, opts);

            fb_granted = new FBPerms(settings.fb_granted);
            fb_auth_response = settings.authResponse;
            fb_server_signed_request = settings.serverSignedRequest;

            if (fb_auth_response && fb_auth_response.accessToken) {
                fb_status = 'connected';
            }
        };

        this.loaded = function () {
            if (pr_loaded === null) {
                pr_loaded = $.getScript(settings.url.replace('##LOCALE##', settings.locale));
            }

            return pr_loaded;
        };

        this.initialized = function () {
            if (pr_initialized.state() === 'pending') {
                this.loaded().done(function () {
                    if (pr_initialized.state() === 'pending') {
                        FB.init({
                            appId: settings.appId,
                            channelUrl: settings.channelUrl,
                            status: settings.status,
                            xfbml: settings.xfbml,
                            oauth: settings.oauth
                        });

                        pr_initialized.resolve();
                    }
                });
            }

            return pr_initialized;
        };

        this.handle_auth_response = function (response) {
            fb_status = response.status;
            fb_auth_response = response.authResponse;
        };

        this.authenticated = function () {
            if (pr_authenticated.state() === 'pending') {
                this.initialized().done(function () {
                    if (pr_authenticated.state() === 'pending') {
                        if (fb_status !== 'connected') {
                            FB.getLoginStatus(function (response) {
                                self.handle_auth_response(response);
                                pr_authenticated.resolve();
                            });
                        } else {
                            pr_authenticated.resolve();
                        }
                    }
                });
            }

            return pr_authenticated;
        };

        this.update_granted = function () {
            var out = new $.Deferred();

            this.authenticated().done(function () {
                FB.api('/me/permissions', function (response) {
                    var new_perms = [];

                    if (!response || !response.data || !response.data[0]) {
                        out.resolve();
                        return;
                    }

                    $.each(response.data[0], function (k, v) {
                        if (v) {
                            new_perms.push(k);
                        }
                    });

                    fb_granted = new FBPerms(new_perms.join(','));

                    out.resolve();
                });
            });

            return out;
        };

        this.connected = function (perms, nologin) {
            var promise = new $.Deferred();

            this.authenticated().done(function () {
                function login() {
                    if (fb_granted.has(perms)) {
                        promise.resolve();
                    } else if (nologin !== true) {
                        FB.login(function (response) {
                            self.handle_auth_response(response);

                            if (response.status !== 'connected') {
                                promise.reject('login_rejection');
                                return;
                            }

                            self.update_granted().done(function () {
                                if (fb_granted.has(perms)) {
                                    promise.resolve();
                                } else {
                                    promise.reject('partial_perms_after_login');
                                }
                            });
                        }, {
                            scope: perms
                        });
                    } else {
                        promise.reject('not_trying_to_log_in');
                    }
                }

                if (!fb_granted.has(perms) && fb_status === 'connected') {
                    self.update_granted().done(login);
                } else {
                    login();
                }
            });

            return promise;
        };

        this.ready = function (fn) {
            this.authenticated().done(fn);
        };

        this.uid = function (async) {
            var out;

            if (async !== true) {
                out = fb_auth_response.userID;
            } else {
                out = new $.Deferred();

                this.connected('installed').done(function () {
                    out.resolve(fb_auth_response.userID);
                });
            }

            return out;
        };

        this.redirect = function (to_url) {
            var form = $('<form />').attr({
                action: to_url,
                method: 'post'
            });

            form.append($('<input />').attr({
                name: 'signed_request',
                value: fb_server_signed_request
            }));

            form.submit();
        };

        this.redirect_to_canvas = function (params) {
            var url = settings.canvasUrl;

            if (params !== undefined) {
                url += '?' + $.param(params);
            }

            if (window.top) {
                window.top.location = url;
            } else {
                window.location = url;
            }
        };

        this.api = function (path, args) {
            return new FBApiRequest(path, args);
        };
    }

    $.extend({
        fb: new FBHelper()
    });
}(jQuery, window));