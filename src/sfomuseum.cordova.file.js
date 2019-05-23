var sfomuseum = sfomuseum || {};
sfomuseum.cordova = sfomuseum.cordova || {};

sfomuseum.cordova.file = (function(){

    var self = {

	'readAsDataURL': function(rel_path, on_success, on_error){

	    var make_data = function(bytes){

		var blob = new Blob(bytes);
		var reader = new FileReader();
		
		reader.onloadend = function(){
		    on_success(this.result);
		};
		
		reader.readAsDataURL(blob);
	    };

	    this.read(rel_path, make_data, on_error);
	},
	
	'read': function (rel_path, on_success, on_error){

	    // I know you're supposed to use cdvfile:// but for the life ome I can't
	    // get it to work... (20190523/thisisaaronland)
	    // https://github.com/apache/cordova-plugin-file#cdvfile-protocol

	    // in a browser context, none of these things work...
	    // var path_chicken = "cdvfile://localhost/bundle/wasm/chicken.wasm";	// nope ERROR 5
	    // var path_chicken = "cdvfile://localhost/www/wasm/chicken.wasm";		// nope ERROR 5
	    // var path_chicken = "cdvfile://localhost/wasm/chicken.wasm";		// nope ERROR 5
	    // var path_chicken = "cdvfile://wasm/chicken.wasm";			// nope ERROR 5

	    // console.log("DEVICE", device);
	    
	    // Electron reports itself as browser but because it's Chrome ends up
	    // setting cordova.file.applicationDirectory as 'file://'

	    if ((device.platform == "browser") && (device.model == "Firefox")){

		var root = cordova.file.applicationDirectory;
		var uri_path = root + rel_path;

		// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
		// https://developer.mozilla.org/en-US/docs/Web/API/Response

		fetch(uri_path).then(response =>
		    response.arrayBuffer()
		).then(bytes =>
		    on_success(bytes)
		).catch(err => {
		    on_error(err);
		});
		
		return;
	    }

	    // and of course Chrome (Electron) ends up making the path this:
	    // file:///www/wasm/chicken.wasm
	    // and failing with this:
	    // FileError - code: "Missing Command Error"

	    var abs_path = cordova.file.applicationDirectory + "www/" + rel_path;
	    
	    var on_fail = function(e){
		console.log("Failed to load file", rel_path, e);
		on_error(e);
	    };
	    
	    var on_read = function(path){

		path.file(function(file) {
		    
		    var reader = new FileReader();
		    
		    reader.onloadend = function(e) {		    
			on_success(this.result);
		    }

		    reader.readAsArrayBuffer(file);
		});
	    };
	    
	    window.resolveLocalFileSystemURL(abs_path, on_read, on_fail);
	}
	
    }

    return self;

})();
