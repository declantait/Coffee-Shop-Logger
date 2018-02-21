$(function() {
    $('[type=submit]').on('click', function(e) {

        // store with dummy latitude, longitude, and image
        shopList.addShop($('#name').val(), $('#address').val(), '######', '######', '########');
        $('input:text').val(''); // reset form elements of type text after the input data has been stored
        return false;
    });
    $('#shops').on('click', '.delete', function(e) {
        shopList.deleteShop(parseInt($(this).parent().find('.key').text()));
        return false;
    });
    $('#shops').on('click', '.update', function(e) {
        var name = $(this).parent().find('.name').text();
        var address = $(this).parent().find('.address').text();
        var key = parseInt($(this).parent().find('.key').text()); // key that identifies the record is within the invisble span
        shopList.updateShop(name, address, key); // does not edit latitude and longitude
        return false;
    });
    shopList.open(); // open displays the data previously saved
});

shopList = {};

shopList.open = function() {
    if (localStorage.shopList) {
        this.list = JSON.parse(localStorage.shopList); // read from persistient storage
    } else {
        this.list = {} // creates an empty data structure
    }
    shopList.getAllShops(); // Refresh the screen
};

shopList.addShop = function(name, address, lat, lng, imageURI) {
    console.log(arguments.callee.name, arguments); // handy for debugging functions
    key = new Date().getTime();
    this.list[key] = {
        'name': name,
        'address': address,
        'lat': lat,
        'lng': lng,
		'image': imageURI
    };
    localStorage.shopList = JSON.stringify(this.list);
    this.getAllShops(); // Refresh the screen
	
    // attempt to update record when position available
    if (navigator.geolocation) {
        var timeoutVal = 55000; // 50 seconds for GPS or other geolocation to work
        var maximumAgeVal = 60000 // 60 seconds
        navigator.geolocation.getCurrentPosition(
            function(position) {
                updatePosition(position, key)
            }, displayError);
    } else {
        alert("Geolocation is not supported by this browser or device");
    }
	
	// camera
	navigator.camera.getPicture(cameraSuccess, cameraFail, {
		quality: 100, 
		destinationType: Camera.DestinationType.FILE_URI 
	});
	
	function cameraSuccess(imageURI) {
		console.log("imageURI: " + imageURI);
		console.log(key); // calling list key
		shopList.pictureSuccess(imageURI, key);
	}
	
	function cameraFail(message) {
		alert('Failed because: ' + message);
	}
	
};
// http://stackoverflow.com/questions/22032361/how-to-pass-a-second-parameter-to-geolocation-success-function 

function updatePosition(position, key) {
    //console.log("update position is being called");
    console.log(arguments);
    console.log(position.coords.latitude, position.coords.longitude);
    console.log(key); // when GPS called and record to be updated
    console.log(new Date().getTime()); // when GPS returned
    shopList.positionSuccess(position.coords.latitude, position.coords.longitude, key);
}

function displayError(error) {
    var errors = {
        1: 'Geolocation Permission denied',
        2: 'Position unavailable',
        3: 'Geolocation Request timeout - is your GPS ***really*** switched on?'
    };
    alert("Error: " + errors[error.code]);
    console.log("Error: " + errors[error.code]);
};

// delete
shopList.deleteShop = function(key) {
    delete this.list[key];
    localStorage.shopList = JSON.stringify(this.list);
    this.getAllShops(); // Refresh the screen
};

// updateShop - no longer deals with latitude and longitude
shopList.updateShop = function(name, address, key) {
    console.log(arguments); // handy for debugging functions
    this.list[key]['name'] = name; // partial update of three properties
    this.list[key]['address'] = address;
    localStorage.shopList = JSON.stringify(this.list);
    this.getAllShops();
    //console.log("updated")
};

// positionSuccess - method just deals with latitude and longitude
shopList.positionSuccess = function(lat, lng, key) {
    console.log(arguments); // handy for debugging functions
    this.list[key]['lat'] = lat;
    this.list[key]['lng'] = lng;
    localStorage.shopList = JSON.stringify(this.list);
    this.getAllShops();
};

// pictureSuccess - method deals with images
shopList.pictureSuccess = function(imageURI, key) {
	console.log(arguments); // handy for debugging functions
	this.list[key]['image'] = imageURI;
	localStorage.shopList = JSON.stringify(this.list); 
	this.getAllShops();
}

// read each item from list and render on display
shopList.getAllShops = function() {
    $('#shops').html('');
    for (var key in this.list) {
        renderShop(key, this.list[key]);
    }
};

// helper
function renderShop(key) {
    var li = '<li>'+ '<img src = "' + shopList.list[key]["image"] + '" height = 100 width = 60> <br>' + ' <b>Name:</b>' + shopList.list[key]["name"] + '<br> <b>Address:</b>' + shopList.list[key]["address"] + '<br> <b>Coords:</b>' + 'lat: ' + shopList.list[key]["lat"] + '<br>lng: ' + shopList.list[key]["lng"] + '<br><a href="#" class="delete">[Delete]</a><br>' + "" + '<span class="key">'+key+'</span></li>';
    $('#shops').append(li);
}