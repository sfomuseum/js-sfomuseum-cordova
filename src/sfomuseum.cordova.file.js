var sfomuseum = sfomuseum || {};
sfomuseum.cordova = sfomuseum.cordova || {};

sfomuseum.cordova.file = (function(){

    var self = {

	'readAsArrayBuffer': function(rel_path, on_success, on_error){
	    return this.readAs(rel_path, "buffer", on_success, on_error);
	},

	'readAsBinaryString': function(rel_path, on_success, on_error){
	    return this.readAs(rel_path, "binary", on_success, on_error);
	},
	
	'readAsDataURL': function(rel_path, on_success, on_error){
	    return this.readAs(rel_path, "data", on_success, on_error);
	},

	'readAsText': function(rel_path, on_success, on_error){
	    return this.readAs(rel_path, "text", on_success, on_error);
	},
	
	'readAs': function (rel_path, read_as, on_success, on_error){	    
	    
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

		fetch(uri_path).then(response => {

		    // https://developer.mozilla.org/en-US/docs/Web/API/Response

		    switch (read_as){
			case "buffer":
			    
			    response.arrayBuffer().then(buffer => {
				on_success(buffer);
			    }).catch(err => {
				on_error(err);
			    });
			    
			    break;
			    
			case "text":
			    
			    response.text().then(body => {
				on_success(body);
			    }).catch(err => {
				on_error(err);
			    });
			    
			    break;
			    
			default:
			    
			    response.blob().then(blob => {
				
				var reader = new FileReader();
				
				reader.onloadend = function(e) {
				    on_success(this.result);
				}
				
				switch (read_as){
				    case "binary":
					reader.readAsBinaryString(blob);
					break;
				    case "data":
					reader.readAsDataURL(blob);
					break;
				    default:
					on_error("Unsupported read target");
				}
				
			    }).catch(err => {
				on_error(err);
			    });
			}
		    
		}).catch(err => {
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

		    // https://developer.mozilla.org/en-US/docs/Web/API/FileReader

		    switch (read_as){
			case "binary":
			    reader.readAsBinaryString(file);
			    break;
			case "buffer":
			    reader.readAsArrayBuffer(file);
			    break;
			case "data":
			    reader.readAsDataURL(file);
			    break;
			case "text":			    
			    reader.readAsText(file);
			    break;
			default:
			    on_error("Unsupported read target");
		    }
		    
		});
	    };
	    
	    window.resolveLocalFileSystemURL(abs_path, on_read, on_fail);
	}
	
    }

    return self;

})();
