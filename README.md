FreneticBunny
=============

Introduction
------------

Frennetic Bunny is a Facebook helper for jQuery. It was made out of frustration trying to connect a user within a
Facebook application.

Licence
-------

Copyright © 2013 Rémy Sanchez <remy.sanchez@hyperthese.net>

This work is free. You can redistribute it and/or modify it under the
terms of the Do What The Fuck You Want To Public License, Version 2,
as published by Sam Hocevar. See <http://www.wtfpl.net/> for more details.

Structure
---------

This library allows you to get a jQuery promise at different stages of the Facebook initialization process, to make sure
that you get what you need, while keeping a totally asynchronous loading. The stages are the following:

<dl>
  <dt>`$.fb.loaded()`</dt>
  <dd>The Facebook javascript file has been loaded</dd>
  <dt>`$.fb.initialized()`</dt>
  <dd>FB.init() was called</dd>
  <dt>`$.fb.authenticated()`</dt>
  <dd>At this stage, the library knows if the user has installed the app or not.</dd>
  <dt>`$.fb.connected(perms)`</dt>
  <dd>Returns a promise that ensures that the user gives the asked permissions.</dd>
</dl>

If you call any of those methods, it will implicitly trigger all the steps required in order to reach that stage. It
means that is you did not load Facebook yet, calling `$.fb.connected()` will load & init Facebook on its own. This can
be a way of lazy loading the Facebook API only when needed.

There is also a simple shortcut named `$.fb.ready(fn)` that works exactly the way you think: it will execute `fn` only
when Facebook has been loaded.

Before calling any of those methods though, you have to setup the thing. Typically:

```javascript
// This gives the settings
$.fb.setup({
	appId: 42, // That's your app ID from your dev interface
	channelUrl: '//mywebsite.com/channel.html', // see https://developers.facebook.com/docs/reference/javascript/#channel
	locale: 'en_US',
	serverSignedRequest: <?php echo json_encode($_REQUEST['signed_request']); ?>
});

// And this initializes Facebook
$.fb.initialized();
```

Going further
-------------

There is a `example/index.php` that will show you a bit how to use the library. Otherwise feel free to contact me
directly.
