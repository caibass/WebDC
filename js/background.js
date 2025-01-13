
importScripts("lib/config.js");
importScripts("lib/chrome.js");
importScripts("lib/runtime.js");
importScripts("lib/common.js");

// var appid;

// chrome.runtime.onConnect.addListener(function() {
// 	chrome.window.create('Main.html', {
// 		id: 'mainwin',
// 		frame: "none",	
// 		bounds: {
// 			width: 840,
// 			height: 660
// 		},
// 		minWidth: 840,
// 		minHeight: 660,
// 		alwaysOnTop: true
// 	}, function(w){ appid =w.id});
// });

// chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
// 	if(request.launch == true && request.senderName == "DocumateOcr")
// 	{	  
// 		if (appid =='mainwin')
// 		{
// 			chrome.app.window.get(appid).focus();
// 		}
// 	  	sendResponse();
// 	}	
// });


