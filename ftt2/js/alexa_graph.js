
function bind() {
	var args = arguments;
	var __method = args[0];
	var object = args[1];
	var new_args = args[2] || [];
	return function() {
		return __method.apply(object, new_args);
	};
}
function bindAsEventListener() {
	var args = arguments;
	var __method = args[0];
	var object = args[1];
  return function(event) {
    return __method.call(object, event || window.event);
  };
}

var Alexa = {};

var constructor = function() {
	return function() {
		return this.init.apply(this, arguments);
		//return this;
	};
};


Alexa.Permission = constructor();
Alexa.Permission.prototype = {
	'init': function(service, expiry, endpoint, signature) {
		this.service = service;
		this.endpoint = endpoint;
		this.signature = signature;
		this.expiry = expiry;
		this.created = new Date();
		this.refreshPermission();
	},
	'refreshPermission': function() {
		AGraphManager.load_signature(this);
	},
	'isFresh': function() {
		return (new Date() - this.created) < 270000;
	}
};

AGraphManager = {
	'baseSigningURI': "http://widgets.alexa.com/traffic/session/?domain=",
	'callbacks': [],
	'_ready': false,
	'add': function(callback) {
		if(this.ready()) {
			this.executeCallback(callback);
		} else {
			this.callbacks.push(callback);
			this.get_signature();
		}
	},
	'executeCallback': function(callback) {
			var signature = this.signature.signature;
			var expiry = this.signature.expiry;
			var endpoint = this.signature.endpoint;
			callback.run(endpoint, signature, expiry);
	},
	'onreadychange': function() {
		if(this.ready()) {
			this.runCache();
		} else {
			// something is wrong.
		}
	},
	'runCache': function() {
		var cur;
		this.callbacks.reverse();
		while(cur = this.callbacks.pop()) {
			this.executeCallback(cur);
		}
	},
	'ready': function() {
		var now = new Date();
		if( now - this.lastModified > 270000) {
			this._ready = false;
		}
		return this._ready;
	},
	'get_signature': function () {
		/*
		* Insert a script tag with an id of graph_signature.
		*/
		
		// Look for a pre-existing script element with an id of
		// this.signature_id.
		var previousScript = document.getElementById('alexa_signature');
		var newScript;
		if (previousScript) {
			// if there was a previous one, we need to clone it
			newScript = previousScript.cloneNode(true);
			previousScript.parentNode.removeChild(previousScript);
		} else {
			newScript = document.createElement('SCRIPT');
		}
		// insert our reference to a new script into the DOM.
		var head = document.getElementsByTagName('HEAD')[0];
		newScript.id = "alexa_signature";
		head.appendChild(newScript);
		// TODO: make the user assert who they are/where this content is being
		// served.
		newScript.src = this.baseSigningURI + window.location + '&_=' + new Date();
	},
	'load_signature': function (signature) {
		this.lastModified = new Date();
		this.signature = signature;
		this._ready = true;
		this.onreadychange();
	}
};


var AGraph = constructor();

AGraph.prototype = {
	'opts': {},
	'init': function(sites, opts, container) {
		this.script = getLastScript();
		this.sites = sites || [window.location];
		var tmpsites = [];
		var tmpsite = this.sites[0].replace( /[\s\u00A0;,]+/g, ' ' );
		if( tmpsite.indexOf(' ') ) {
			tmpsites = tmpsite.split(' ');
			tmpsites.reverse();
			this.sites[0] = tmpsites.pop();
			this.sites = this.sites.concat(tmpsites);
		}
		this.opts = opts || {
			width: 380,
			height: 300,
			c: 1,
			type: 'r',
			range: '6m',
			bgcolor: 'eeeeee'
		};
		this.container = container;
	},
	'run': function(endpoint, signature, expiry) {
		//var image = new Image();
		var params = this.parseParams();
		// TODO: need to add className, and provide flash and fallback support in
		// absence of flash.
		var src = endpoint + '?' 
		        + 'check='       + encodeURIComponent(window.location) 
		        + '&signature='  + encodeURIComponent(signature) 
						+ '&x='          + encodeURIComponent(expiry) + '&' + params;
		var container = this.container || document.createElement('SPAN');
		this.container = container;
		//this.script.parentNode.replaceChild( container, this.script );
		//container.innerHTML = this.produceFlashNodes(this.opts.height, this.opts.width, src).outerHTML;
		container.innerHTML = this.produceFlash2(this.opts.height, this.opts.width, encodeURIComponent(src));
		//container.appendChild(image);
		//var text = document.createElement('TEXTAREA');
		//text.cols = "80";
		//text.value = src;
		//container.appendChild(text);
		//container.id = 'abBP_1';
		//image.src = src;
	},
	'parseParams': function() {
		var params = [];
		var i;
		var opts = this.opts;
		var cur = '';
		for(i=0; i<this.sites.length; i++) {
			cur = this.sites[i];
			params.push('u[]=' + encodeURIComponent(cur));
		}
		params.push('c=1&z=2');
		params.push('w=' + opts.width);
		params.push('h=' + opts.height);
		params.push('y=' + opts.type);
		params.push('r=' + opts.range);
		params.push('b=' + opts.bgcolor);
		return params.join('&');

	},
	'produceFlash2': function(height, width, url) {
	var link = encodeURIComponent(this.get_details_URL());
	height += 20;
	return "" 
		+ '<object '
		+ 'codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0" '
		+ 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" '
		+ 'height="' + height + '" '
		+ 'width="' + width + '"> '
		+ '<param name="movie" value="http://www.britepic.com/britepic.swf"> '
		+ '<param name="FlashVars" '
		+ '	value="' +/*js=1&divID=abBP_1& */'width='+ width + '&height=' + height 
		+ '&href='+link+'&id=298335&src='+url+'&show_ads=1&keywords=&caption=&show_menu=0"> '
		/*
		+ '<param name="allowscriptaccess" value="always"> '
		*/
		+ '<param name="wmode" value="transparent"> '
		+ '<embed src="http://www.britepic.com/britepic.swf" '
		+ '	flashvars="width=' + width + ''
		+ '						&height=' + height + ''
		+ '						&href='+link+'&id=298335&src='+ url +''
		+ '						&show_ads=1&keywords=&caption=&show_menu=0" '
		/*
		+ '	allowscriptaccess="always"'
		*/
		+ '	pluginspage="http://www.macromedia.com/go/getflashplayer" '
		+ '	wmode="transparent"'
		+ '	type="application/x-shockwave-flash" '
		+ '	height="' + height + '"'
		+ '	width="' + width + '">'
		+ '</embed>'
	+ '</object>';


	},
	'produceFlashNodes': function(height, width, url) {
		var object = document.createElement('OBJECT');
		object.codebase = "http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0";
		object.classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000";
		object.height = height;
		object.width = width;
		
		var query = "width=" + width + "&height=" + height 
		          + "&href=" + 'www.alexa.com' + "&id=298335&src=" +
							url
						  + "&show_ads=1&keywords=&caption=";
		var param = document.createElement('PARAM');
		param.name = "movie";
		param.value = "http://www.britepic.com/britepic.swf";
		object.appendChild(param);
		param = document.createElement('PARAM');
		param.name = "FlashVars";
    param.value = query;
		object.appendChild(param);
		/*
		param = document.createElement('PARAM');
		param.name = "allowscriptaccess";
		param.value = "always";
		object.appendChild(param);
		*/

		param = document.createElement('PARAM');
		param.name = "wmode";
		param.value = "transparent";
		object.appendChild(param);

		param = document.createElement('EMBED');
		param.src = "http://www.britepic.com/britepic.swf";
		param.flashvars = query;

		try {
    //param.allowscriptaccess = "always";
    param.pluginspage = "http://www.macromedia.com/go/getflashplayer";
    param.wmode = "transparent";
    param.type = "application/x-shockwave-flash";
    param.height = height;
    param.width = width;
		object.appendChild(param);
		} catch(e) {}

		return object;
	},
	'get_details_URL': function() {
		var URL = "http://www.alexa.com/data/details/traffic_details?url=" + this.sites[0];
		var x = 0;
		for(x=0; x < this.sites.length; x++) {
			URL += "&site" + x + "=" + encodeURIComponent(this.sites[x]);
		}
		return URL;
	}
	
};

function getLastScript() {
	var scripts = document.getElementsByTagName('SCRIPT');
	return scripts[scripts.length - 1];
}

