exports.LoginWindow = function(args) {
	var self = Ti.UI.createWindow(args);
	var webview = Ti.UI.createWebView({ url:args.authUrl });
	webview.userAgent = "Mozilla/5.0 (iPad; U; CPU OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Mobile";
	
	// This listener is used to detect when the user has authenticated and the valid
	// oauth data has been sent to the web view on the url.  The callback is not a valid
	// protocol so we prevent the final navigation, store off the url param data and 
	// close the window. Finally, we call the sessionCallback function, defined in the
	// app.js initial load sequence, to signal that the app can continue to load.
	webview.addEventListener('beforeload', function(event) {
		if (event.url.substring(0, args.callbackUrl.length) == args.callbackUrl) {
			
			webview.stopLoading(true);

			var pairs = event.url.split("#")[1].split("&");
			var oauthResponse = {};
			for (var i=0;i<pairs.length;i++) {
				pair = pairs[i].split("=");
				oauthResponse[pair[0]] = unescape(pair[1]);
			}
			self.close();
			globals.sessionCallback(oauthResponse);
		}
	})
	self.add(webview);
	
	return self;	
}