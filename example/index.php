<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Frenetic Bunny Demo</title>

		<script src="../src/freneticbunny.js"></script>
		<script>
		// This gives the settings
		$.fb.setup({
			appId: 42, // That's your app ID from your dev interface
			channelUrl: '//mywebsite.com/channel.html', // see https://developers.facebook.com/docs/reference/javascript/#channel
			locale: 'en_US',
			serverSignedRequest: <?php echo json_encode($_REQUEST['signed_request']); ?>
		});

		// And this initializes Facebook
		$.fb.initialized();

		// Note that this is a jQuery promise, so you can actually do react to the load
		$.fb.initialized().done(function () {
			alert('Facebook is initialized');
		});

		// Here we react to a click to the link to display the name
		$(document).on('click', '#display-name', function (e) {
			e.preventDefault();

			// This gets a promise that we have the permission "installed", which is the base permission
			$.fb.connected('installed').done(function () {
				// Now that we're sure that we have the rights, we can just do a query to the API
				FB.api('/me', function (response) {
					// And if we're here we're supposed to have the name available
					alert('Hi ' + response.name);
				});
			});
		});

		$(document).on('click', '#display-email', function (e) {
			e.preventDefault();

			// Please note that the permission list has changed here
			$.fb.connected('email').done(function () {
				FB.api('/me', function (response) {
					alert('Hi ' + response.email);
				});
			});
		});
		</script>
	</head>

	<body>
		<div id="fb-root"></div>

		<h1>Frenetic Bunny Demo</h1>

		<ul>
			<li><a id="display-name" href="#">Display my name</a></li>
			<li><a id="display-email" href="#">Display my email</a></li>
		</ul>
	</body>
</html>
