// Include our config file
Ti.include('../config.js');

// Define the variable win to contain the current window
var win = Ti.UI.currentWindow;

// Create a user variable to hold some information about the user
var user = {
	uid: Titanium.App.Properties.getInt("userUid"),
	sessid: Titanium.App.Properties.getString("userSessionId"),
	session_name: Titanium.App.Properties.getString("userSessionName"),
	name: Titanium.App.Properties.getString("userName"),
}

// Create the scrollview
var view = Titanium.UI.createScrollView({
	contentWidth:'auto',
	contentHeight:'auto',
	showVerticalScrollIndicator:true,
	showHorizontalScrollIndicator:true,
	top: 0,
});

// Add our scrollview to the window
win.add(view);

// Define the name of the view (view as in Drupal's view)
var drupal_view = "flag_bookmarks_tab";

// Define the url which contains the full url
// in this case, we'll connecting to http://example.com/api/rest/views/flag_bookmarks_tab.json?args=USERID
var url = REST_PATH + 'views/' + drupal_view +'.json?args='+ user.uid;

// Create a conection inside the variable connection
var xhr = Titanium.Network.createHTTPClient();

// Open the connection
xhr.open("GET",url);

// Send the connection
xhr.send();

// When the connection loads we do:
xhr.onload = function() {
	// Save the status of the connection in a variable
	// this will be used to see if we have a connection (200) or not
	var statusCode = xhr.status;
	
	// Check if we have a connection
	if(statusCode == 200) {
		
		// Save the responseText from the connection in the response variable
		var response = xhr.responseText;
		
		// Parse (build data structure) the JSON response into an object (data)
		var result = JSON.parse(response);
		
		/**
		 * Create a new array "results"
		 * This is necessary because we need to create an object
		 * to send to the Table we're creating with the results
		 * the table will have the title and the nid of every result
		 * and we'll use the nid to move to another window when we click
		 * on it. 
		 */
		var results = new Array();
		
		// Start loop
		for(var key in result) {
			// Create the data variable and hold every result
			var data = result[key];
			
			/**
			 * To see how the array is built by Services in Drupal
			 * go to drupanium debug and use the views debug page
			 * you'll see that the array is something like:
			 * 
			 * 0 => array(
			 * 	title => some title
			 * 	date => some date
			 *  user => the user uid
			 *  type => the node type
			 *  nid => the node nid
			 *  vid => the node vid
			 * )
			 */
			
			// Uncomment the next line to see the full object in JSON format 
			// alert(result[key]); 
			
			// Uncomment the next line to see an example of how to get the title of every result
			// alert(data.title);
			
			/**
			 * We start adding the results one by one to our array "results"
			 * it consists of title, nid and the property hasChild 
			 * in title we get the node title with data.title
			 * in nid we save the node nid with data.nid (we walk the array)
			 */
			results[key] = {title: data.node_title, hasChild:true, nid:data.nid};
		}
		
		// Create a new table to hold our results
		// We tell Titanium to use our array results as the Property "data"
		// See http://developer.appcelerator.com/apidoc/mobile/latest/Titanium.UI.TableView-object
		// Specially the properties
		var table = Titanium.UI.createTableView({data:results});
		
		// add a listener for click to the table
		// so every row is clickable 
		table.addEventListener('click',function(e) {
			
			// Define a new Window "nodeWindow"
            var nodeWindow = Titanium.UI.createWindow({
            	// the window is not here, but in the file get-node-by-nid.js
            	// so we load it
            	url:'get-node-by-nid.js',
            	
            	// define some basic properties
            	backgroundColor:'#fff',
            	
            	// Define the title of our new window using the node title
            	// e.rowData contains the information we defined when we passed it
            	// to Titanium.UI.createTableView using the property "data"
            	// so e.rowData.title = data.title for each of the rows in the table
            	title:e.rowData.node_title,
            	
            	// The same for the nid
            	// We send the nid as an property in this window and the 
            	// get-node-by-nid file will recognize it and use it
            	nid:e.rowData.nid,
            	
            	// a boolean indicating if the view should receive touch events (true, default) or forward them to peers (false)
            	touchEnabled: true
            });
            
            // order the app to open the nodeWindow window in the current Tab
            Titanium.UI.currentTab.open(nodeWindow,{animated:true});
        });
		
		// add our table to the view
		view.add(table);
		
	}
	else {
		// Create a label for the node title
		var errorMessage = Ti.UI.createLabel({
			// The text of the label will be the node title (data.title)
			text: "Please check your internet connection.",
			color:'#000',
			textAlign:'left',
			font:{fontSize:24, fontWeight:'bold'},
			top:25,
			left:15,
			height:18
		});
		
		// Add the error message to the window
		win.add(errorMessage);
	}
}