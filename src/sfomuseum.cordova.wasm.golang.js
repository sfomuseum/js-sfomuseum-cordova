// https://developer.mozilla.org/en-US/docs/WebAssembly
// https://github.com/golang/go/wiki/WebAssembly

const go = new Go();

var sfomuseum = sfomuseum || {};
sfomuseum.cordova = sfomuseum.cordova || {};
sfomuseum.cordova.wasm = sfomuseum.cordova.wasm || {};

sfomuseum.cordova.wasm.golang = (function(){

    var self = {
	
	'load': function (bytes, on_instantiate){

	    let mod, inst;
	    
	    WebAssembly.instantiate(bytes, go.importObject).then(
		
		async result => {
		    
		    on_instantiate();
		    
		    mod = result.module;
		    inst = result.instance;
		    await go.run(inst);
		}
		
	    );
	}
    }

    return self;

})();
