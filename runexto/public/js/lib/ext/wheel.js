;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("wheel/index.js", function(exports, require, module){
module.exports = wheel;

function wheel(element, options) {
	if (!(this instanceof wheel)) return new wheel(element, options);
	this.element = element;
	this.defaults = {
 		click: true,
 		width: 210,
 		height: 140,
 		size: 'medium',
 		clip:false,
 		perspective: '100px',
 		swipe: false,
		panelsContainer: false, //can be used for a DOM element that already exists containing the right structure.
		//could be a number of ways to push content for this really, could do string or object or existing DOM element, it's a tough one.
		// panels is no longer used as we are going to pass in variables of DOM elements and just use document.createElement and pass them in
		//TODO: make sure we document this as it will certainly be unclear
		panels: [
		{
			content: document.createElement('div')
		},
		{
			content: document.createElement('div')
		},
		{
			content: document.createElement('div')
		}
		],
		verticalAxis: true
	};
	this.options = options;
	this.initialize();
}
wheel.prototype._getPanels = function (container) {
	var panels = [];
	[].forEach.call(container.children, function (prospectivePanel){
		if(prospectivePanel.tagName.toLowerCase() === 'div') {
			var panel = {};
			panel.content = prospectivePanel;
			panels.push(panel);
		}
	});
	return panels;
}
wheel.prototype.initialize = function () {
	function extend(a, b){
		for(var key in b) {
			if(b.hasOwnProperty(key)) {
				a[key] = b[key];
			}
		}
		return a;
	}
	this.options = extend(this.defaults, this.options);
	this.currentRotation = 0;
	this.currentIndex = 0;
	if (this.options.panels) {
		this.panelLength = this.options.panels.length;
	}
	if (this.options.panelsContainer) {
		if (this._getPanels(this.element).length > 1) {
			this.panelLength = this._getPanels(this.element).length;
		}
	}
	this.rotationDegree = 360 / this.panelLength;
	this.element.className = this.element.className + ' wheel';
	if (this.options.perspective) {
		this.element.setAttribute('style', 'perspective: ' + this.options.perspective + '; -webkit-perspective: ' + this.options.perspective + '; -moz-perspective: ' + this.options.perspective + '; -o-perspective: ' + this.options.perspective + ';');
	}
	if (typeof(this.options.width) === 'string') {
		this.element.style.width = this.options.width;
	} else if (typeof(this.options.width) === 'number') {
		this.element.style.width = this.options.width.toString() + 'px';
	}
	if (typeof(this.options.height) === 'string') {
		this.element.style.height === this.options.height;
	} else if (typeof(this.options.height) === 'number') {
		this.element.style.height = this.options.height.toString() + 'px';
	}
	if (this.options.clip) {
		this.element.style.overflow = 'hidden';
	}
	this.translation = Math.round( ( (this.element.offsetWidth * 0.9) / 2 ) / 
		Math.tan( Math.PI / this.panelLength ) );
	this.create();
	if (this.options.swipe) {
		console.log('wheel: swipe is not fully supported for the wheel component yet.');
	}
	return this;	
}
wheel.prototype.create = function () {
	var panelContainer,
		panels,
		degs,
		newwheel = this;
	if (newwheel.options.panelsContainer) {
		newwheel.options.panels = newwheel._getPanels(newwheel.element);
	} 
	if (newwheel.options.panels) {
		if (typeof(newwheel.options.panels) === 'object' && newwheel.options.panels.length > 0) {						
			panelContainer = document.createElement('div');
			panelContainer.className = 'wheel-panel-container';
			if (newwheel.options.verticalAxis) {
				panelContainer.setAttribute('style', 'transform: translateZ( -' + newwheel.translation + 'px ) rotateX( -0deg ); -webkit-transform: translateZ( -' + newwheel.translation + 'px ) rotateX( -0deg ); -o-transform: translateZ( -' + newwheel.translation + 'px ) rotateX( -0deg );');
			} else {
				panelContainer.setAttribute('style', 'transform: translateZ( -' + newwheel.translation + 'px ) rotateY( -0deg ); -webkit-transform: translateZ( -' + newwheel.translation + 'px ) rotateY( -0deg ); -o-transform: translateZ( -' + newwheel.translation + 'px ) rotateY( -0deg );');
			}
			[].forEach.call(newwheel.options.panels, function (panelData, key) {
				var panel;
				degs = (360 / newwheel.options.panels.length) * key;
				if (typeof(panelData.content) === 'object') {
					panel = panelData.content;
				} else {
					console.log('wheel: ERROR, incorrect panel declaration');
				}
				panel.setAttribute('data-wheel-value', key + 1);
				panel.className = panel.className + ' wheel-panel';
				if (newwheel.options.verticalAxis) {
					panel.setAttribute('style', 'transform: rotateX(' + degs + 'deg) translateZ(' + newwheel.translation + 'px); -webkit-transform: rotateX(' + degs + 'deg) translateZ(' + newwheel.translation + 'px); -o-transform: rotateX(' + degs + 'deg) translateZ(' + newwheel.translation + 'px);');
				} else {
					panel.setAttribute('style', 'transform: rotateY(' + degs + 'deg) translateZ(' + newwheel.translation + 'px); -webkit-transform: rotateY(' + degs + 'deg) translateZ(' + newwheel.translation + 'px); -o-transform: rotateY(' + degs + 'deg) translateZ(' + newwheel.translation + 'px);');
				}
				panelContainer.appendChild(panel);
			});
			newwheel.element.appendChild(panelContainer);
			if (newwheel.options.click) {
				panels = panelContainer.querySelectorAll('.wheel-panel');
				[].forEach.call(panels, function (clickPanel) {
					newwheel._bindPanelClick(clickPanel);
				});
			}
		}
	} else {
		console.log('wheel: ERROR, NO panels have been defined');
	}
}
wheel.prototype._bindPanelClick = function (panel) {
	var wheel = this;
	panel.addEventListener('click', function (event) {
		wheel.roll();
	});
}
wheel.prototype.roll = function () {
	this.currentRotation = this.currentRotation + this.rotationDegree;
	if (this.options.verticalAxis) {
		this.element.querySelector('.wheel-panel-container').setAttribute('style', 'transform: translateZ( -' + this.translation + 'px ) rotateX( -' + Math.abs(this.currentRotation) + 'deg ); -webkit-transform: translateZ( -' + this.translation + 'px ) rotateX( -' + Math.abs(this.currentRotation) + 'deg ); -o-transform: translateZ( -' + this.translation + 'px ) rotateX( -' + Math.abs(this.currentRotation) + 'deg );');						
	} else {
		this.element.querySelector('.wheel-panel-container').setAttribute('style', 'transform: translateZ( -' + this.translation + 'px ) rotateY( -' + Math.abs(this.currentRotation) + 'deg ); -webkit-transform: translateZ( -' + this.translation + 'px ) rotateY( -' + Math.abs(this.currentRotation) + 'deg ); -o-transform: translateZ( -' + this.translation + 'px ) rotateY( -' + Math.abs(this.currentRotation) + 'deg );');
	}
},
wheel.prototype.rollTo = function (index) {
	if (this.currentIndex !== index) {
		this.closingBracket = this.element.querySelector('[data-wheel-value="' + index + '"]').getAttribute('style').indexOf(')');
		this.opener = this.element.querySelector('[data-wheel-value="' + index + '"]').getAttribute('style').indexOf('rotate') + 8;
		this.rotationDegree = this.element.querySelector('[data-wheel-value="' + index + '"]').getAttribute('style').substr(this.opener, this.closingBracket - 19);
		if (this.options.verticalAxis) {
			this.panelContainerStyle = "transform: translateZ( -" + this.translation + "px ) rotateX( -" + this.rotationDegree + " ); -webkit-transform: translateZ( -" + this.translation + "px ) rotateX( -" + this.rotationDegree + " ); -o-transform: translateZ( -" + this.translation + "px ) rotateX( -" + this.rotationDegree + " );"
		} else {
			this.panelContainerStyle = "transform: translateZ( -" + this.translation + "px ) rotateY( -" + this.rotationDegree + " ); -webkit-transform: translateZ( -" + this.translation + "px ) rotateY( -" + this.rotationDegree + " ); -o-transform: translateZ( -" + this.translation + "px ) rotateY( -" + this.rotationDegree + " );"
		}
		this.element.querySelector('.wheel-panel-container')
			.setAttribute('style', this.panelContainerStyle);
		this.currentIndex = index;
	}
};
});
require.alias("wheel/index.js", "wheel/index.js");if (typeof exports == "object") {
  module.exports = require("wheel");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("wheel"); });
} else {
  this["wheel"] = require("wheel");
}})();