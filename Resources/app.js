var _ = require("underscore")._;

if (Ti.version < 1.8 ) {
	alert('Sorry - this application template requires Titanium Mobile SDK 1.8 or later');
}
else {
	//add a single variable to the global scope to which we may choose to
	//intentionally add items to
	var globals = {};
	
	//create a private scope to prevent further polluting the global object
	(function() {
		
		var setupApp = function() {
			//create our global tab group	
			globals.tabs = new AppTabGroup(
				{
					title: 'Todo',
					icon: 'images/KS_nav_ui.png',
					window: new ListWindow({
						title: 'Todo',
						backgroundColor: '#fff',
						navBarHidden: false,
						isDone: false,
						activity: {
							onCreateOptionsMenu: function(e) {
								var menu = e.menu;
							    var menuItem = menu.add({ title: "Add Task" });
							    menuItem.setIcon("images/ic_menu_add.png");
							    menuItem.addEventListener("click", function(e) {
							        new AddWindow().open();
							    });
							}
						}
					})
				},
				{
					title: 'Done',
					icon: 'images/KS_nav_views.png',
					window: new ListWindow({
						title: 'Done',
						backgroundColor: '#fff',
						navBarHidden: false,
						isDone: true
					})
				}
			);			
		}
		
		var AppTabGroup = require('ui/AppTabGroup').AppTabGroup,
			ListWindow = require('ui/ListWindow').ListWindow,
			AddWindow = require('ui/AddWindow').AddWindow,
			LoginWindow = require('ui/LoginWindow').LoginWindow;
		
		// Wire up the REST API and OAuth to run before showing any pages
		var forcetk = require('forcetkTN').forcetk;
		
		// The callback url is specified in the Connected App configured in
		// the Force.com platform
		var callbackUrl = "sfdc://success";

		// Initialize the REST client using the client-id from the Connected App
		// configured in the Force.com platform
		globals.client = new forcetk.Client("3MVG9A2kN3Bn17hupqqk7YYhDRnqZgZ_fwrzJ8.8N8_RZiflFCd7nHfy2JoXmP7t20mHRz1_pZl0zUGPTFO5J");

		// Get the authorization url in case we need to login.
		var authorizeUrl = globals.client.getAuthorizeUrl(callbackUrl);
		
		// Check for a stored refresh token. If we have one, then we should be
		// able to acquire a valid oauth token using it.
		var refresh_token = Ti.App.Properties.getString("refreshToken");

		// Define a callbac that can be used from the login window and from
		// the refresh token flow
		globals.sessionCallback = function(oauthResponse) {
			// Hydrate the forceTK client with valid oauth data
			globals.client.setSessionToken(oauthResponse.access_token, null,
				oauthResponse.instance_url);
	        globals.client.setAuthResponse(oauthResponse);
	        Ti.API.debug("String refresh token.");
	        // Save off the refresh token for use in subsequent app launches.
            Ti.App.Properties.setString("refreshToken", oauthResponse.refresh_token);
            globals.client.setRefreshToken(oauthResponse.refresh_token);
            // Finish setting up the original app UI
			setupApp();
			globals.tabs.open();
		};

		// This is where we check to see if we need to present the login window
		// or try to refresh the token that we have already
		if (refresh_token != null) {
			Ti.API.debug("Refresh token stored.");
			// REquest a new access_token using the refresh token
			globals.client.setRefreshToken(refresh_token);
			globals.client.refreshAccessToken(globals.sessionCallback);
		} else {
			Ti.API.debug("No Refresh token stored.");
			// Show the web view and navigate to the Force.com authentication page
			new LoginWindow({ 
				authUrl:authorizeUrl, 
				callbackUrl:callbackUrl
			}).open();
		}
		
	})();	
	
	
	globals.logout = function() {
		// Boiler plate for "logging out", essentially, just remove
		// the refresh token from properties.

        // Delete the saved refresh token
        Ti.App.Properties.removeProperty("refreshToken");
	    globals.client.setRefreshToken(null);
	}
}