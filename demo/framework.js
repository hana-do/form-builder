/*
 * * This is a consolidated file of the following frameworks: foundation, inputfit, foundation date-picker, zselect, mobiscroll
 * Foundation is the front-end framework used in the development of the project (MOBILE, TABLET and DESKTOP) || Line 12 || || Version 6.2.0 || https://github.com/zurb/foundation-sites/releases/
 * Inputfit is used to adjust the font size provided the text exceeds the form field (MOBILE, TABLET and DESKTOP) || Line 8802 || https://github.com/vxsx/jquery.inputfit.js?files=1
 * Foundation-datepicker is used to select date, month and year (used only in desktop) || Line 8876 || http://foundation-datepicker.peterbeno.com/example.html#docs
   //cdnjs.cloudflare.com/ajax/libs/foundicons/3.0.0/foundation-icons.css is used for foundation icons
 * Zselect framework is used for multi-select and single select usign checkbox and radio buttons respectively. Also includes a search box within the dropdown (used only in desktop) || 
 	 Taken from a fiddle https://jsfiddle.net/xvzq3185/ (The website is depraecated) || Line 10202
 * Mobiscroll is a framework used for date-picker, single select and multi-select (used only in MOBILE and TABLETS) || Line 10604 || Version 2.17.1 || https://github.com/acidb/mobiscroll
 * Autoresize || Line 14057 || http://www.jacklmoore.com/autosize/
 * Signature Pad || Line 14306 || https://github.com/Leimi/drawingboard.js/
*/
/*
 	Foundation 6.2.0 
 */
!function ($) {

  "use strict";

  var FOUNDATION_VERSION = '6.2.0';
  var ga = '';
  
  // Global Foundation object
  // This is attached to the window, or used as a module for AMD/Browserify
  var Foundation = {
    version: FOUNDATION_VERSION,

    /**
     * Stores initialized plugins.
     */
    _plugins: {},

    /**
     * Stores generated unique ids for plugin instances
     */
    _uuids: [],

    /**
     * Returns a boolean for RTL support
     */
    rtl: function () {
      return $('html').attr('dir') === 'rtl';
    },
    /**
     * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
     * @param {Object} plugin - The constructor of the plugin.
     */
    plugin: function (plugin, name) {
      // Object key to use when adding to global Foundation object
      // Examples: Foundation.Reveal, Foundation.OffCanvas
      var className = name || functionName(plugin);
      // Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
      // Examples: data-reveal, data-off-canvas
      var attrName = hyphenate(className);

      // Add to the Foundation object and the plugins list (for reflowing)
      this._plugins[attrName] = this[className] = plugin;
    },
    /**
     * @function
     * Populates the _uuids array with pointers to each individual plugin instance.
     * Adds the `zfPlugin` data-attribute to programmatically created plugins to allow use of $(selector).foundation(method) calls.
     * Also fires the initialization event for each plugin, consolidating repeditive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @param {String} name - the name of the plugin, passed as a camelCased string.
     * @fires Plugin#init
     */
    registerPlugin: function (plugin, name) {
      var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
      plugin.uuid = this.GetYoDigits(6, pluginName);

      if (!plugin.$element.attr('data-' + pluginName)) {
        plugin.$element.attr('data-' + pluginName, plugin.uuid);
      }
      if (!plugin.$element.data('zfPlugin')) {
        plugin.$element.data('zfPlugin', plugin);
      }
      /**
       * Fires when the plugin has initialized.
       * @event Plugin#init
       */
      plugin.$element.trigger('init.zf.' + pluginName);

      this._uuids.push(plugin.uuid);

      return;
    },
    /**
     * @function
     * Removes the plugins uuid from the _uuids array.
     * Removes the zfPlugin data attribute, as well as the data-plugin-name attribute.
     * Also fires the destroyed event for the plugin, consolidating repeditive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @fires Plugin#destroyed
     */
    unregisterPlugin: function (plugin) {
      var pluginName = hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

      this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
      plugin.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
      /**
       * Fires when the plugin has been destroyed.
       * @event Plugin#destroyed
       */
      .trigger('destroyed.zf.' + pluginName);
      for (var prop in plugin) {
        plugin[prop] = null; //clean up script to prep for garbage collection.
      }
      return;
    },

    /**
     * @function
     * Causes one or more active plugins to re-initialize, resetting event listeners, recalculating positions, etc.
     * @param {String} plugins - optional string of an individual plugin key, attained by calling `$(element).data('pluginName')`, or string of a plugin class i.e. `'dropdown'`
     * @default If no argument is passed, reflow all currently active plugins.
     */
    reInit: function (plugins) {
      var isJQ = plugins instanceof $;
      try {
        if (isJQ) {
          plugins.each(function () {
            $(this).data('zfPlugin')._init();
          });
        } else {
          var type = typeof plugins,
              _this = this,
              fns = {
            'object': function (plgs) {
              plgs.forEach(function (p) {
                p = hyphenate(p);
                $('[data-' + p + ']').foundation('_init');
              });
            },
            'string': function () {
              plugins = hyphenate(plugins);
              $('[data-' + plugins + ']').foundation('_init');
            },
            'undefined': function () {
              this['object'](Object.keys(_this._plugins));
            }
          };
          fns[type](plugins);
        }
      } catch (err) {
        console.error(err);
      } finally {
        return plugins;
      }
    },

    /**
     * returns a random base-36 uid with namespacing
     * @function
     * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
     * @param {String} namespace - name of plugin to be incorporated in uid, optional.
     * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
     * @returns {String} - unique id
     */
    GetYoDigits: function (length, namespace) {
      length = length || 6;
      return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? '-' + namespace : '');
    },
    /**
     * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
     * @param {Object} elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
     * @param {String|Array} plugins - A list of plugins to initialize. Leave this out to initialize everything.
     */
    reflow: function (elem, plugins) {

      // If plugins is undefined, just grab everything
      if (typeof plugins === 'undefined') {
        plugins = Object.keys(this._plugins);
      }
      // If plugins is a string, convert it to an array with one item
      else if (typeof plugins === 'string') {
          plugins = [plugins];
        }

      var _this = this;

      // Iterate through each plugin
      $.each(plugins, function (i, name) {
        // Get the current plugin
        var plugin = _this._plugins[name];

        // Localize the search to all elements inside elem, as well as elem itself, unless elem === document
        var $elem = $(elem).find('[data-' + name + ']').addBack('[data-' + name + ']');

        // For each plugin found, initialize it
        $elem.each(function () {
          var $el = $(this),
              opts = {};
          // Don't double-dip on plugins
          if ($el.data('zfPlugin')) {
            console.warn("Tried to initialize " + name + " on an element that already has a Foundation plugin.");
            return;
          }

          if ($el.attr('data-options')) {
            var thing = $el.attr('data-options').split(';').forEach(function (e, i) {
              var opt = e.split(':').map(function (el) {
                return el.trim();
              });
              if (opt[0]) opts[opt[0]] = parseValue(opt[1]);
            });
          }
          try {
            $el.data('zfPlugin', new plugin($(this), opts));
          } catch (er) {
            console.error(er);
          } finally {
            return;
          }
        });
      });
    },
    getFnName: functionName,
    transitionend: function ($elem) {
      var transitions = {
        'transition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'otransitionend'
      };
      var elem = document.createElement('div'),
          end;

      for (var t in transitions) {
        if (typeof elem.style[t] !== 'undefined') {
          end = transitions[t];
        }
      }
      if (end) {
        return end;
      } else {
        end = setTimeout(function () {
          $elem.triggerHandler('transitionend', [$elem]);
        }, 1);
        return 'transitionend';
      }
    }
  };

  Foundation.util = {
    /**
     * Function for applying a debounce effect to a function call.
     * @function
     * @param {Function} func - Function to be called at end of timeout.
     * @param {Number} delay - Time in ms to delay the call of `func`.
     * @returns function
     */
    throttle: function (func, delay) {
      var timer = null;

      return function () {
        var context = this,
            args = arguments;

        if (timer === null) {
          timer = setTimeout(function () {
            func.apply(context, args);
            timer = null;
          }, delay);
        }
      };
    }
  };

  // TODO: consider not making this a jQuery function
  // TODO: need way to reflow vs. re-initialize
  /**
   * The Foundation jQuery method.
   * @param {String|Array} method - An action to perform on the current jQuery object.
   */
  var foundation = function (method) {
    var type = typeof method,
        $meta = $('meta.foundation-mq'),
        $noJS = $('.no-js');

    if (!$meta.length) {
      $('<meta class="foundation-mq">').appendTo(document.head);
    }
    if ($noJS.length) {
      $noJS.removeClass('no-js');
    }

    if (type === 'undefined') {
      //needs to initialize the Foundation object, or an individual plugin.
      Foundation.MediaQuery._init();
      Foundation.reflow(this);
    } else if (type === 'string') {
      //an individual method to invoke on a plugin or group of plugins
      var args = Array.prototype.slice.call(arguments, 1); //collect all the arguments, if necessary
      var plugClass = this.data('zfPlugin'); //determine the class of plugin

      if (plugClass !== undefined && plugClass[method] !== undefined) {
        //make sure both the class and method exist
        if (this.length === 1) {
          //if there's only one, call it directly.
          plugClass[method].apply(plugClass, args);
        } else {
          this.each(function (i, el) {
            //otherwise loop through the jQuery collection and invoke the method on each
            plugClass[method].apply($(el).data('zfPlugin'), args);
          });
        }
      } else {
        //error for no class or no method
        throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
      }
    } else {
      //error for invalid argument type
      throw new TypeError('We\'re sorry, ' + type + ' is not a valid parameter. You must use a string representing the method you wish to invoke.');
    }
    return this;
  };

  window.Foundation = Foundation;
  $.fn.foundation = foundation;

  // Polyfill for requestAnimationFrame
  (function () {
    if (!Date.now || !window.Date.now) window.Date.now = Date.now = function () {
      return new Date().getTime();
    };

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function (callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function () {
          callback(lastTime = nextTime);
        }, nextTime - now);
      };
      window.cancelAnimationFrame = clearTimeout;
    }
    /**
     * Polyfill for performance.now, required by rAF
     */
    if (!window.performance || !window.performance.now) {
      window.performance = {
        start: Date.now(),
        now: function () {
          return Date.now() - this.start;
        }
      };
    }
  })();
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP = function () {},
          fBound = function () {
        return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      if (this.prototype) {
        // native functions don't have a prototype
        fNOP.prototype = this.prototype;
      }
      fBound.prototype = new fNOP();

      return fBound;
    };
  }
  // Polyfill to get the name of a function in IE9
  function functionName(fn) {
    if (Function.prototype.name === undefined) {
      var funcNameRegex = /function\s([^(]{1,})\(/;
      var results = funcNameRegex.exec(fn.toString());
      return results && results.length > 1 ? results[1].trim() : "";
    } else if (fn.prototype === undefined) {
      return fn.constructor.name;
    } else {
      return fn.prototype.constructor.name;
    }
  }
  function parseValue(str) {
    if (/true/.test(str)) return true;else if (/false/.test(str)) return false;else if (!isNaN(str * 1)) return parseFloat(str);
    return str;
  }
  // Convert PascalCase to kebab-case
  // Thank you: http://stackoverflow.com/a/8955580
  function hyphenate(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}(jQuery);
'use strict';

!function ($) {

  Foundation.Box = {
    ImNotTouchingYou: ImNotTouchingYou,
    GetDimensions: GetDimensions,
    GetOffsets: GetOffsets
  };

  /**
   * Compares the dimensions of an element to a container and determines collision events with container.
   * @function
   * @param {jQuery} element - jQuery object to test for collisions.
   * @param {jQuery} parent - jQuery object to use as bounding container.
   * @param {Boolean} lrOnly - set to true to check left and right values only.
   * @param {Boolean} tbOnly - set to true to check top and bottom values only.
   * @default if no parent object passed, detects collisions with `window`.
   * @returns {Boolean} - true if collision free, false if a collision in any direction.
   */
  function ImNotTouchingYou(element, parent, lrOnly, tbOnly) {
    var eleDims = GetDimensions(element),
        top,
        bottom,
        left,
        right;

    if (parent) {
      var parDims = GetDimensions(parent);

      bottom = eleDims.offset.top + eleDims.height <= parDims.height + parDims.offset.top;
      top = eleDims.offset.top >= parDims.offset.top;
      left = eleDims.offset.left >= parDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= parDims.width;
    } else {
      bottom = eleDims.offset.top + eleDims.height <= eleDims.windowDims.height + eleDims.windowDims.offset.top;
      top = eleDims.offset.top >= eleDims.windowDims.offset.top;
      left = eleDims.offset.left >= eleDims.windowDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= eleDims.windowDims.width;
    }

    var allDirs = [bottom, top, left, right];

    if (lrOnly) {
      return left === right === true;
    }

    if (tbOnly) {
      return top === bottom === true;
    }

    return allDirs.indexOf(false) === -1;
  };

  /**
   * Uses native methods to return an object of dimension values.
   * @function
   * @param {jQuery || HTML} element - jQuery object or DOM element for which to get the dimensions. Can be any element other that document or window.
   * @returns {Object} - nested object of integer pixel values
   * TODO - if element is window, return only those values.
   */
  function GetDimensions(elem, test) {
    elem = elem.length ? elem[0] : elem;

    if (elem === window || elem === document) {
      throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");
    }

    var rect = elem.getBoundingClientRect(),
        parRect = elem.parentNode.getBoundingClientRect(),
        winRect = document.body.getBoundingClientRect(),
        winY = window.pageYOffset,
        winX = window.pageXOffset;

    return {
      width: rect.width,
      height: rect.height,
      offset: {
        top: rect.top + winY,
        left: rect.left + winX
      },
      parentDims: {
        width: parRect.width,
        height: parRect.height,
        offset: {
          top: parRect.top + winY,
          left: parRect.left + winX
        }
      },
      windowDims: {
        width: winRect.width,
        height: winRect.height,
        offset: {
          top: winY,
          left: winX
        }
      }
    };
  }

  /**
   * Returns an object of top and left integer pixel values for dynamically rendered elements,
   * such as: Tooltip, Reveal, and Dropdown
   * @function
   * @param {jQuery} element - jQuery object for the element being positioned.
   * @param {jQuery} anchor - jQuery object for the element's anchor point.
   * @param {String} position - a string relating to the desired position of the element, relative to it's anchor
   * @param {Number} vOffset - integer pixel value of desired vertical separation between anchor and element.
   * @param {Number} hOffset - integer pixel value of desired horizontal separation between anchor and element.
   * @param {Boolean} isOverflow - if a collision event is detected, sets to true to default the element to full width - any desired offset.
   * TODO alter/rewrite to work with `em` values as well/instead of pixels
   */
  function GetOffsets(element, anchor, position, vOffset, hOffset, isOverflow) {
    var $eleDims = GetDimensions(element),
        $anchorDims = anchor ? GetDimensions(anchor) : null;

    switch (position) {
      case 'top':
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top
        };
        break;
      case 'right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset,
          top: $anchorDims.offset.top
        };
        break;
      case 'center top':
        return {
          left: $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'center bottom':
        return {
          left: isOverflow ? hOffset : $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'center left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset + 1,
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center':
        return {
          left: $eleDims.windowDims.offset.left + $eleDims.windowDims.width / 2 - $eleDims.width / 2,
          top: $eleDims.windowDims.offset.top + $eleDims.windowDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'reveal':
        return {
          left: ($eleDims.windowDims.width - $eleDims.width) / 2,
          top: $eleDims.windowDims.offset.top + vOffset
        };
      case 'reveal full':
        return {
          left: $eleDims.windowDims.offset.left,
          top: $eleDims.windowDims.offset.top
        };
        break;
      default:
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
    }
  }
}(jQuery);
/*******************************************
 *                                         *
 * This util was created by Marius Olbertz *
 * Please thank Marius on GitHub /owlbertz *
 * or the web http://www.mariusolbertz.de/ *
 *                                         *
 ******************************************/

'use strict';

!function ($) {

  var keyCodes = {
    9: 'TAB',
    13: 'ENTER',
    27: 'ESCAPE',
    32: 'SPACE',
    37: 'ARROW_LEFT',
    38: 'ARROW_UP',
    39: 'ARROW_RIGHT',
    40: 'ARROW_DOWN'
  };

  var commands = {};

  var Keyboard = {
    keys: getKeyCodes(keyCodes),

    /**
     * Parses the (keyboard) event and returns a String that represents its key
     * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
     * @param {Event} event - the event generated by the event handler
     * @return String key - String that represents the key pressed
     */
    parseKey: function (event) {
      var key = keyCodes[event.which || event.keyCode] || String.fromCharCode(event.which).toUpperCase();
      if (event.shiftKey) key = 'SHIFT_' + key;
      if (event.ctrlKey) key = 'CTRL_' + key;
      if (event.altKey) key = 'ALT_' + key;
      return key;
    },


    /**
     * Handles the given (keyboard) event
     * @param {Event} event - the event generated by the event handler
     * @param {String} component - Foundation component's name, e.g. Slider or Reveal
     * @param {Objects} functions - collection of functions that are to be executed
     */
    handleKey: function (event, component, functions) {
      var commandList = commands[component],
          keyCode = this.parseKey(event),
          cmds,
          command,
          fn;

      if (!commandList) return console.warn('Component not defined!');

      if (typeof commandList.ltr === 'undefined') {
        // this component does not differentiate between ltr and rtl
        cmds = commandList; // use plain list
      } else {
          // merge ltr and rtl: if document is rtl, rtl overwrites ltr and vice versa
          if (Foundation.rtl()) cmds = $.extend({}, commandList.ltr, commandList.rtl);else cmds = $.extend({}, commandList.rtl, commandList.ltr);
        }
      command = cmds[keyCode];

      fn = functions[command];
      if (fn && typeof fn === 'function') {
        // execute function  if exists
        fn.apply();
        if (functions.handled || typeof functions.handled === 'function') {
          // execute function when event was handled
          functions.handled.apply();
        }
      } else {
        if (functions.unhandled || typeof functions.unhandled === 'function') {
          // execute function when event was not handled
          functions.unhandled.apply();
        }
      }
    },


    /**
     * Finds all focusable elements within the given `$element`
     * @param {jQuery} $element - jQuery object to search within
     * @return {jQuery} $focusable - all focusable elements within `$element`
     */
    findFocusable: function ($element) {
      return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function () {
        if (!$(this).is(':visible') || $(this).attr('tabindex') < 0) {
          return false;
        } //only have visible elements and those that have a tabindex greater or equal 0
        return true;
      });
    },


    /**
     * Returns the component name name
     * @param {Object} component - Foundation component, e.g. Slider or Reveal
     * @return String componentName
     */

    register: function (componentName, cmds) {
      commands[componentName] = cmds;
    }
  };

  /*
   * Constants for easier comparing.
   * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
   */
  function getKeyCodes(kcs) {
    var k = {};
    for (var kc in kcs) {
      k[kcs[kc]] = kcs[kc];
    }return k;
  }

  Foundation.Keyboard = Keyboard;
}(jQuery);
'use strict';

!function ($) {

  // Default set of media queries
  var defaultQueries = {
    'default': 'only screen',
    landscape: 'only screen and (orientation: landscape)',
    portrait: 'only screen and (orientation: portrait)',
    retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' + 'only screen and (min--moz-device-pixel-ratio: 2),' + 'only screen and (-o-min-device-pixel-ratio: 2/1),' + 'only screen and (min-device-pixel-ratio: 2),' + 'only screen and (min-resolution: 192dpi),' + 'only screen and (min-resolution: 2dppx)'
  };

  var MediaQuery = {
    queries: [],

    current: '',

    /**
     * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
     * @function
     * @private
     */
    _init: function () {
      var self = this;
      var extractedStyles = $('.foundation-mq').css('font-family');
      var namedQueries;

      namedQueries = parseStyleToObject(extractedStyles);

      for (var key in namedQueries) {
        self.queries.push({
          name: key,
          value: 'only screen and (min-width: ' + namedQueries[key] + ')'
        });
      }

      this.current = this._getCurrentSize();

      this._watcher();
    },


    /**
     * Checks if the screen is at least as wide as a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
     */
    atLeast: function (size) {
      var query = this.get(size);

      if (query) {
        return window.matchMedia(query).matches;
      }

      return false;
    },


    /**
     * Gets the media query of a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to get.
     * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
     */
    get: function (size) {
      for (var i in this.queries) {
        var query = this.queries[i];
        if (size === query.name) return query.value;
      }

      return null;
    },


    /**
     * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
     * @function
     * @private
     * @returns {String} Name of the current breakpoint.
     */
    _getCurrentSize: function () {
      var matched;

      for (var i in this.queries) {
        var query = this.queries[i];

        if (window.matchMedia(query.value).matches) {
          matched = query;
        }
      }

      if (typeof matched === 'object') {
        return matched.name;
      } else {
        return matched;
      }
    },


    /**
     * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
     * @function
     * @private
     */
    _watcher: function () {
      var _this = this;

      $(window).on('resize.zf.mediaquery', function () {
        var newSize = _this._getCurrentSize();

        if (newSize !== _this.current) {
          // Broadcast the media query change on the window
          $(window).trigger('changed.zf.mediaquery', [newSize, _this.current]);

          // Change the current media query
          _this.current = newSize;
        }
      });
    }
  };

  Foundation.MediaQuery = MediaQuery;

  // matchMedia() polyfill - Test a CSS media type/query in JS.
  // Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
  window.matchMedia || (window.matchMedia = function () {
    'use strict';

    // For browsers that support matchMedium api such as IE 9 and webkit

    var styleMedia = window.styleMedia || window.media;

    // For those that don't support matchMedium
    if (!styleMedia) {
      var style = document.createElement('style'),
          script = document.getElementsByTagName('script')[0],
          info = null;

      style.type = 'text/css';
      style.id = 'matchmediajs-test';

      script.parentNode.insertBefore(style, script);

      // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
      info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

      styleMedia = {
        matchMedium: function (media) {
          var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

          // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
          if (style.styleSheet) {
            style.styleSheet.cssText = text;
          } else {
            style.textContent = text;
          }

          // Test if media query is true or false
          return info.width === '1px';
        }
      };
    }

    return function (media) {
      return {
        matches: styleMedia.matchMedium(media || 'all'),
        media: media || 'all'
      };
    };
  }());

  // Thank you: https://github.com/sindresorhus/query-string
  function parseStyleToObject(str) {
    var styleObject = {};

    if (typeof str !== 'string') {
      return styleObject;
    }

    str = str.trim().slice(1, -1); // browsers re-quote string style values

    if (!str) {
      return styleObject;
    }

    styleObject = str.split('&').reduce(function (ret, param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = parts[0];
      var val = parts[1];
      key = decodeURIComponent(key);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
      return ret;
    }, {});

    return styleObject;
  }

  Foundation.MediaQuery = MediaQuery;
}(jQuery);
'use strict';

!function ($) {

  /**
   * Motion module.
   * @module foundation.motion
   */

  var initClasses = ['mui-enter', 'mui-leave'];
  var activeClasses = ['mui-enter-active', 'mui-leave-active'];

  var Motion = {
    animateIn: function (element, animation, cb) {
      animate(true, element, animation, cb);
    },

    animateOut: function (element, animation, cb) {
      animate(false, element, animation, cb);
    }
  };

  function Move(duration, elem, fn) {
    var anim,
        prog,
        start = null;
    // console.log('called');

    function move(ts) {
      if (!start) start = window.performance.now();
      // console.log(start, ts);
      prog = ts - start;
      fn.apply(elem);

      if (prog < duration) {
        anim = window.requestAnimationFrame(move, elem);
      } else {
        window.cancelAnimationFrame(anim);
        elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      }
    }
    anim = window.requestAnimationFrame(move);
  }

  /**
   * Animates an element in or out using a CSS transition class.
   * @function
   * @private
   * @param {Boolean} isIn - Defines if the animation is in or out.
   * @param {Object} element - jQuery or HTML object to animate.
   * @param {String} animation - CSS class to use.
   * @param {Function} cb - Callback to run when animation is finished.
   */
  function animate(isIn, element, animation, cb) {
    element = $(element).eq(0);

    if (!element.length) return;

    var initClass = isIn ? initClasses[0] : initClasses[1];
    var activeClass = isIn ? activeClasses[0] : activeClasses[1];

    // Set up the animation
    reset();

    element.addClass(animation).css('transition', 'none');

    requestAnimationFrame(function () {
      element.addClass(initClass);
      if (isIn) element.show();
    });

    // Start the animation
    requestAnimationFrame(function () {
      element[0].offsetWidth;
      element.css('transition', '').addClass(activeClass);
    });

    // Clean up the animation when it finishes
    element.one(Foundation.transitionend(element), finish);

    // Hides the element (for out animations), resets the element, and runs a callback
    function finish() {
      if (!isIn) element.hide();
      reset();
      if (cb) cb.apply(element);
    }

    // Resets transitions and removes motion-specific classes
    function reset() {
      element[0].style.transitionDuration = 0;
      element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
    }
  }

  Foundation.Move = Move;
  Foundation.Motion = Motion;
}(jQuery);
'use strict';

!function ($) {

  var Nest = {
    Feather: function (menu) {
      var type = arguments.length <= 1 || arguments[1] === undefined ? 'zf' : arguments[1];

      menu.attr('role', 'menubar');

      var items = menu.find('li').attr({ 'role': 'menuitem' }),
          subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      menu.find('a:first').attr('tabindex', 0);

      items.each(function () {
        var $item = $(this),
            $sub = $item.children('ul');

        if ($sub.length) {
          $item.addClass(hasSubClass).attr({
            'aria-haspopup': true,
            'aria-expanded': false,
            'aria-label': $item.children('a:first').text()
          });

          $sub.addClass('submenu ' + subMenuClass).attr({
            'data-submenu': '',
            'aria-hidden': true,
            'role': 'menu'
          });
        }

        if ($item.parent('[data-submenu]').length) {
          $item.addClass('is-submenu-item ' + subItemClass);
        }
      });

      return;
    },
    Burn: function (menu, type) {
      var items = menu.find('li').removeAttr('tabindex'),
          subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      menu.find('*').removeClass(subMenuClass + ' ' + subItemClass + ' ' + hasSubClass + ' is-submenu-item submenu is-active').removeAttr('data-submenu').css('display', '');

      // console.log(      menu.find('.' + subMenuClass + ', .' + subItemClass + ', .has-submenu, .is-submenu-item, .submenu, [data-submenu]')
      //           .removeClass(subMenuClass + ' ' + subItemClass + ' has-submenu is-submenu-item submenu')
      //           .removeAttr('data-submenu'));
      // items.each(function(){
      //   var $item = $(this),
      //       $sub = $item.children('ul');
      //   if($item.parent('[data-submenu]').length){
      //     $item.removeClass('is-submenu-item ' + subItemClass);
      //   }
      //   if($sub.length){
      //     $item.removeClass('has-submenu');
      //     $sub.removeClass('submenu ' + subMenuClass).removeAttr('data-submenu');
      //   }
      // });
    }
  };

  Foundation.Nest = Nest;
}(jQuery);
'use strict';

!function ($) {

  function Timer(elem, options, cb) {
    var _this = this,
        duration = options.duration,
        //options is an object for easily adding features later.
    nameSpace = Object.keys(elem.data())[0] || 'timer',
        remain = -1,
        start,
        timer;

    this.isPaused = false;

    this.restart = function () {
      remain = -1;
      clearTimeout(timer);
      this.start();
    };

    this.start = function () {
      this.isPaused = false;
      // if(!elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      remain = remain <= 0 ? duration : remain;
      elem.data('paused', false);
      start = Date.now();
      timer = setTimeout(function () {
        if (options.infinite) {
          _this.restart(); //rerun the timer.
        }
        cb();
      }, remain);
      elem.trigger('timerstart.zf.' + nameSpace);
    };

    this.pause = function () {
      this.isPaused = true;
      //if(elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      elem.data('paused', true);
      var end = Date.now();
      remain = remain - (end - start);
      elem.trigger('timerpaused.zf.' + nameSpace);
    };
  }

  /**
   * Runs a callback function when images are fully loaded.
   * @param {Object} images - Image(s) to check if loaded.
   * @param {Func} callback - Function to execute when image is fully loaded.
   */
  function onImagesLoaded(images, callback) {
    var self = this,
        unloaded = images.length;

    if (unloaded === 0) {
      callback();
    }

    images.each(function () {
      if (this.complete) {
        singleImageLoaded();
      } else if (typeof this.naturalWidth !== 'undefined' && this.naturalWidth > 0) {
        singleImageLoaded();
      } else {
        $(this).one('load', function () {
          singleImageLoaded();
        });
      }
    });

    function singleImageLoaded() {
      unloaded--;
      if (unloaded === 0) {
        callback();
      }
    }
  }

  Foundation.Timer = Timer;
  Foundation.onImagesLoaded = onImagesLoaded;
}(jQuery);
//**************************************************
//**Work inspired by multiple jquery swipe plugins**
//**Done by Yohai Ararat ***************************
//**************************************************
(function ($) {

	$.spotSwipe = {
		version: '1.0.0',
		enabled: 'ontouchstart' in document.documentElement,
		preventDefault: false,
		moveThreshold: 75,
		timeThreshold: 200
	};

	var startPosX,
	    startPosY,
	    startTime,
	    elapsedTime,
	    isMoving = false;

	function onTouchEnd() {
		//  alert(this);
		this.removeEventListener('touchmove', onTouchMove);
		this.removeEventListener('touchend', onTouchEnd);
		isMoving = false;
	}

	function onTouchMove(e) {
		if ($.spotSwipe.preventDefault) {
			e.preventDefault();
		}
		if (isMoving) {
			var x = e.touches[0].pageX;
			var y = e.touches[0].pageY;
			var dx = startPosX - x;
			var dy = startPosY - y;
			var dir;
			elapsedTime = new Date().getTime() - startTime;
			if (Math.abs(dx) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
				dir = dx > 0 ? 'left' : 'right';
			}
			// else if(Math.abs(dy) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
			//   dir = dy > 0 ? 'down' : 'up';
			// }
			if (dir) {
				e.preventDefault();
				onTouchEnd.call(this);
				$(this).trigger('swipe', dir).trigger('swipe' + dir);
			}
		}
	}

	function onTouchStart(e) {
		if (e.touches.length == 1) {
			startPosX = e.touches[0].pageX;
			startPosY = e.touches[0].pageY;
			isMoving = true;
			startTime = new Date().getTime();
			this.addEventListener('touchmove', onTouchMove, false);
			this.addEventListener('touchend', onTouchEnd, false);
		}
	}

	function init() {
		this.addEventListener && this.addEventListener('touchstart', onTouchStart, false);
	}

	function teardown() {
		this.removeEventListener('touchstart', onTouchStart);
	}

	$.event.special.swipe = { setup: init };

	$.each(['left', 'up', 'down', 'right'], function () {
		$.event.special['swipe' + this] = { setup: function () {
				$(this).on('swipe', $.noop);
			} };
	});
})(jQuery);
/****************************************************
 * Method for adding psuedo drag events to elements *
 ***************************************************/
!function ($) {
	$.fn.addTouch = function () {
		this.each(function (i, el) {
			$(el).bind('touchstart touchmove touchend touchcancel', function () {
				//we pass the original event object because the jQuery event
				//object is normalized to w3c specs and does not provide the TouchList
				handleTouch(event);
			});
		});

		var handleTouch = function (event) {
			var touches = event.changedTouches,
			    first = touches[0],
			    eventTypes = {
				touchstart: 'mousedown',
				touchmove: 'mousemove',
				touchend: 'mouseup'
			},
			    type = eventTypes[event.type],
			    simulatedEvent;

			if ('MouseEvent' in window && typeof window.MouseEvent === 'function') {
				simulatedEvent = window.MouseEvent(type, {
					'bubbles': true,
					'cancelable': true,
					'screenX': first.screenX,
					'screenY': first.screenY,
					'clientX': first.clientX,
					'clientY': first.clientY
				});
			} else {
				simulatedEvent = document.createEvent('MouseEvent');
				simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 /*left*/, null);
			}
			first.target.dispatchEvent(simulatedEvent);
		};
	};
}(jQuery);

//**********************************
//**From the jQuery Mobile Library**
//**need to recreate functionality**
//**and try to improve if possible**
//**********************************

/* Removing the jQuery function ****
************************************

(function( $, window, undefined ) {

	var $document = $( document ),
		// supportTouch = $.mobile.support.touch,
		touchStartEvent = 'touchstart'//supportTouch ? "touchstart" : "mousedown",
		touchStopEvent = 'touchend'//supportTouch ? "touchend" : "mouseup",
		touchMoveEvent = 'touchmove'//supportTouch ? "touchmove" : "mousemove";

	// setup new event shortcuts
	$.each( ( "touchstart touchmove touchend " +
		"swipe swipeleft swiperight" ).split( " " ), function( i, name ) {

		$.fn[ name ] = function( fn ) {
			return fn ? this.bind( name, fn ) : this.trigger( name );
		};

		// jQuery < 1.8
		if ( $.attrFn ) {
			$.attrFn[ name ] = true;
		}
	});

	function triggerCustomEvent( obj, eventType, event, bubble ) {
		var originalType = event.type;
		event.type = eventType;
		if ( bubble ) {
			$.event.trigger( event, undefined, obj );
		} else {
			$.event.dispatch.call( obj, event );
		}
		event.type = originalType;
	}

	// also handles taphold

	// Also handles swipeleft, swiperight
	$.event.special.swipe = {

		// More than this horizontal displacement, and we will suppress scrolling.
		scrollSupressionThreshold: 30,

		// More time than this, and it isn't a swipe.
		durationThreshold: 1000,

		// Swipe horizontal displacement must be more than this.
		horizontalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		// Swipe vertical displacement must be less than this.
		verticalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		getLocation: function ( event ) {
			var winPageX = window.pageXOffset,
				winPageY = window.pageYOffset,
				x = event.clientX,
				y = event.clientY;

			if ( event.pageY === 0 && Math.floor( y ) > Math.floor( event.pageY ) ||
				event.pageX === 0 && Math.floor( x ) > Math.floor( event.pageX ) ) {

				// iOS4 clientX/clientY have the value that should have been
				// in pageX/pageY. While pageX/page/ have the value 0
				x = x - winPageX;
				y = y - winPageY;
			} else if ( y < ( event.pageY - winPageY) || x < ( event.pageX - winPageX ) ) {

				// Some Android browsers have totally bogus values for clientX/Y
				// when scrolling/zooming a page. Detectable since clientX/clientY
				// should never be smaller than pageX/pageY minus page scroll
				x = event.pageX - winPageX;
				y = event.pageY - winPageY;
			}

			return {
				x: x,
				y: y
			};
		},

		start: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ],
						origin: $( event.target )
					};
		},

		stop: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ]
					};
		},

		handleSwipe: function( start, stop, thisObject, origTarget ) {
			if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
				Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
				Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {
				var direction = start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight";

				triggerCustomEvent( thisObject, "swipe", $.Event( "swipe", { target: origTarget, swipestart: start, swipestop: stop }), true );
				triggerCustomEvent( thisObject, direction,$.Event( direction, { target: origTarget, swipestart: start, swipestop: stop } ), true );
				return true;
			}
			return false;

		},

		// This serves as a flag to ensure that at most one swipe event event is
		// in work at any given time
		eventInProgress: false,

		setup: function() {
			var events,
				thisObject = this,
				$this = $( thisObject ),
				context = {};

			// Retrieve the events data for this element and add the swipe context
			events = $.data( this, "mobile-events" );
			if ( !events ) {
				events = { length: 0 };
				$.data( this, "mobile-events", events );
			}
			events.length++;
			events.swipe = context;

			context.start = function( event ) {

				// Bail if we're already working on a swipe event
				if ( $.event.special.swipe.eventInProgress ) {
					return;
				}
				$.event.special.swipe.eventInProgress = true;

				var stop,
					start = $.event.special.swipe.start( event ),
					origTarget = event.target,
					emitted = false;

				context.move = function( event ) {
					if ( !start || event.isDefaultPrevented() ) {
						return;
					}

					stop = $.event.special.swipe.stop( event );
					if ( !emitted ) {
						emitted = $.event.special.swipe.handleSwipe( start, stop, thisObject, origTarget );
						if ( emitted ) {

							// Reset the context to make way for the next swipe event
							$.event.special.swipe.eventInProgress = false;
						}
					}
					// prevent scrolling
					if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
						event.preventDefault();
					}
				};

				context.stop = function() {
						emitted = true;

						// Reset the context to make way for the next swipe event
						$.event.special.swipe.eventInProgress = false;
						$document.off( touchMoveEvent, context.move );
						context.move = null;
				};

				$document.on( touchMoveEvent, context.move )
					.one( touchStopEvent, context.stop );
			};
			$this.on( touchStartEvent, context.start );
		},

		teardown: function() {
			var events, context;

			events = $.data( this, "mobile-events" );
			if ( events ) {
				context = events.swipe;
				delete events.swipe;
				events.length--;
				if ( events.length === 0 ) {
					$.removeData( this, "mobile-events" );
				}
			}

			if ( context ) {
				if ( context.start ) {
					$( this ).off( touchStartEvent, context.start );
				}
				if ( context.move ) {
					$document.off( touchMoveEvent, context.move );
				}
				if ( context.stop ) {
					$document.off( touchStopEvent, context.stop );
				}
			}
		}
	};
	$.each({
		swipeleft: "swipe.left",
		swiperight: "swipe.right"
	}, function( event, sourceEvent ) {

		$.event.special[ event ] = {
			setup: function() {
				$( this ).bind( sourceEvent, $.noop );
			},
			teardown: function() {
				$( this ).unbind( sourceEvent );
			}
		};
	});
})( jQuery, this );
*/
'use strict';

!function ($) {

  var MutationObserver = function () {
    var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
    for (var i = 0; i < prefixes.length; i++) {
      if (prefixes[i] + 'MutationObserver' in window) {
        return window[prefixes[i] + 'MutationObserver'];
      }
    }
    return false;
  }();

  var triggers = function (el, type) {
    el.data(type).split(' ').forEach(function (id) {
      $('#' + id)[type === 'close' ? 'trigger' : 'triggerHandler'](type + '.zf.trigger', [el]);
    });
  };
  // Elements with [data-open] will reveal a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-open]', function () {
    triggers($(this), 'open');
  });

  // Elements with [data-close] will close a plugin that supports it when clicked.
  // If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
  $(document).on('click.zf.trigger', '[data-close]', function () {
    var id = $(this).data('close');
    if (id) {
      triggers($(this), 'close');
    } else {
      $(this).trigger('close.zf.trigger');
    }
  });

  // Elements with [data-toggle] will toggle a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-toggle]', function () {
    triggers($(this), 'toggle');
  });

  // Elements with [data-closable] will respond to close.zf.trigger events.
  $(document).on('close.zf.trigger', '[data-closable]', function (e) {
    e.stopPropagation();
    var animation = $(this).data('closable');

    if (animation !== '') {
      Foundation.Motion.animateOut($(this), animation, function () {
        $(this).trigger('closed.zf');
      });
    } else {
      $(this).fadeOut().trigger('closed.zf');
    }
  });

  $(document).on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', function () {
    var id = $(this).data('toggle-focus');
    $('#' + id).triggerHandler('toggle.zf.trigger', [$(this)]);
  });

  /**
  * Fires once after all other scripts have loaded
  * @function
  * @private
  */
  $(window).load(function () {
    checkListeners();
  });

  function checkListeners() {
    eventsListener();
    resizeListener();
    scrollListener();
    closemeListener();
  }

  //******** only fires this function once on load, if there's something to watch ********
  function closemeListener(pluginName) {
    var yetiBoxes = $('[data-yeti-box]'),
        plugNames = ['dropdown', 'tooltip', 'reveal'];

    if (pluginName) {
      if (typeof pluginName === 'string') {
        plugNames.push(pluginName);
      } else if (typeof pluginName === 'object' && typeof pluginName[0] === 'string') {
        plugNames.concat(pluginName);
      } else {
        console.error('Plugin names must be strings');
      }
    }
    if (yetiBoxes.length) {
      var listeners = plugNames.map(function (name) {
        return 'closeme.zf.' + name;
      }).join(' ');

      $(window).off(listeners).on(listeners, function (e, pluginId) {
        var plugin = e.namespace.split('.')[0];
        var plugins = $('[data-' + plugin + ']').not('[data-yeti-box="' + pluginId + '"]');

        plugins.each(function () {
          var _this = $(this);

          _this.triggerHandler('close.zf.trigger', [_this]);
        });
      });
    }
  }

  function resizeListener(debounce) {
    var timer = undefined,
        $nodes = $('[data-resize]');
    if ($nodes.length) {
      $(window).off('resize.zf.trigger').on('resize.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('resizeme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a resize event
          $nodes.attr('data-events', "resize");
        }, debounce || 10); //default time to emit resize event
      });
    }
  }

  function scrollListener(debounce) {
    var timer = undefined,
        $nodes = $('[data-scroll]');
    if ($nodes.length) {
      $(window).off('scroll.zf.trigger').on('scroll.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('scrollme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a scroll event
          $nodes.attr('data-events', "scroll");
        }, debounce || 10); //default time to emit scroll event
      });
    }
  }

  function eventsListener() {
    if (!MutationObserver) {
      return false;
    }
    var nodes = document.querySelectorAll('[data-resize], [data-scroll], [data-mutate]');

    //element callback
    var listeningElementsMutation = function (mutationRecordsList) {
      var $target = $(mutationRecordsList[0].target);
      //trigger the event handler for the element depending on type
      switch ($target.attr("data-events")) {

        case "resize":
          $target.triggerHandler('resizeme.zf.trigger', [$target]);
          break;

        case "scroll":
          $target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
          break;

        // case "mutate" :
        // console.log('mutate', $target);
        // $target.triggerHandler('mutate.zf.trigger');
        //
        // //make sure we don't get stuck in an infinite loop from sloppy codeing
        // if ($target.index('[data-mutate]') == $("[data-mutate]").length-1) {
        //   domMutationObserver();
        // }
        // break;

        default:
          return false;
        //nothing
      }
    };

    if (nodes.length) {
      //for each element that needs to listen for resizing, scrolling, (or coming soon mutation) add a single observer
      for (var i = 0; i <= nodes.length - 1; i++) {
        var elementObserver = new MutationObserver(listeningElementsMutation);
        elementObserver.observe(nodes[i], { attributes: true, childList: false, characterData: false, subtree: false, attributeFilter: ["data-events"] });
      }
    }
  }

  // ------------------------------------

  // [PH]
  // Foundation.CheckWatchers = checkWatchers;
  Foundation.IHearYou = checkListeners;
  // Foundation.ISeeYou = scrollListener;
  // Foundation.IFeelYou = closemeListener;
}(jQuery);

// function domMutationObserver(debounce) {
//   // !!! This is coming soon and needs more work; not active  !!! //
//   var timer,
//   nodes = document.querySelectorAll('[data-mutate]');
//   //
//   if (nodes.length) {
//     // var MutationObserver = (function () {
//     //   var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
//     //   for (var i=0; i < prefixes.length; i++) {
//     //     if (prefixes[i] + 'MutationObserver' in window) {
//     //       return window[prefixes[i] + 'MutationObserver'];
//     //     }
//     //   }
//     //   return false;
//     // }());
//
//
//     //for the body, we need to listen for all changes effecting the style and class attributes
//     var bodyObserver = new MutationObserver(bodyMutation);
//     bodyObserver.observe(document.body, { attributes: true, childList: true, characterData: false, subtree:true, attributeFilter:["style", "class"]});
//
//
//     //body callback
//     function bodyMutation(mutate) {
//       //trigger all listening elements and signal a mutation event
//       if (timer) { clearTimeout(timer); }
//
//       timer = setTimeout(function() {
//         bodyObserver.disconnect();
//         $('[data-mutate]').attr('data-events',"mutate");
//       }, debounce || 150);
//     }
//   }
// }
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Abide module.
   * @module foundation.abide
   */

  var Abide = function () {
    /**
     * Creates a new instance of Abide.
     * @class
     * @fires Abide#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Abide(element) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, Abide);

      this.$element = element;
      this.options = $.extend({}, Abide.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Abide');
    }

    /**
     * Initializes the Abide plugin and calls functions to get Abide functioning on load.
     * @private
     */


    _createClass(Abide, [{
      key: '_init',
      value: function _init() {
        this.$inputs = this.$element.find('input, textarea, select').not('[data-abide-ignore]');

        this._events();
      }

      /**
       * Initializes events for Abide.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this2 = this;

        this.$element.off('.abide').on('reset.zf.abide', function () {
          _this2.resetForm();
        }).on('submit.zf.abide', function () {
          return _this2.validateForm();
        });

        if (this.options.validateOn === 'fieldChange') {
          this.$inputs.off('change.zf.abide').on('change.zf.abide', function (e) {
            _this2.validateInput($(e.target));
          });
        }

        if (this.options.liveValidate) {
          this.$inputs.off('input.zf.abide').on('input.zf.abide', function (e) {
            _this2.validateInput($(e.target));
          });
        }
      }

      /**
       * Calls necessary functions to update Abide upon DOM change
       * @private
       */

    }, {
      key: '_reflow',
      value: function _reflow() {
        this._init();
      }

      /**
       * Checks whether or not a form element has the required attribute and if it's checked or not
       * @param {Object} element - jQuery object to check for required attribute
       * @returns {Boolean} Boolean value depends on whether or not attribute is checked or empty
       */

    }, {
      key: 'requiredCheck',
      value: function requiredCheck($el) {
        if (!$el.attr('required')) return true;

        var isGood = true;

        switch ($el[0].type) {
          case 'checkbox':
          case 'radio':
            isGood = $el[0].checked;
            break;

          case 'select':
          case 'select-one':
          case 'select-multiple':
            var opt = $el.find('option:selected');
            if (!opt.length || !opt.val()) isGood = false;
            break;

          default:
            if (!$el.val() || !$el.val().length) isGood = false;
        }

        return isGood;
      }

      /**
       * Based on $el, get the first element with selector in this order:
       * 1. The element's direct sibling('s).
       * 3. The element's parent's children.
       *
       * This allows for multiple form errors per input, though if none are found, no form errors will be shown.
       *
       * @param {Object} $el - jQuery object to use as reference to find the form error selector.
       * @returns {Object} jQuery object with the selector.
       */

    }, {
      key: 'findFormError',
      value: function findFormError($el) {
        var $error = $el.siblings(this.options.formErrorSelector);

        if (!$error.length) {
          $error = $el.parent().find(this.options.formErrorSelector);
        }

        return $error;
      }

      /**
       * Get the first element in this order:
       * 2. The <label> with the attribute `[for="someInputId"]`
       * 3. The `.closest()` <label>
       *
       * @param {Object} $el - jQuery object to check for required attribute
       * @returns {Boolean} Boolean value depends on whether or not attribute is checked or empty
       */

    }, {
      key: 'findLabel',
      value: function findLabel($el) {
        var id = $el[0].id;
        var $label = this.$element.find('label[for="' + id + '"]');

        if (!$label.length) {
          return $el.closest('label');
        }

        return $label;
      }

      /**
       * Adds the CSS error class as specified by the Abide settings to the label, input, and the form
       * @param {Object} $el - jQuery object to add the class to
       */

    }, {
      key: 'addErrorClasses',
      value: function addErrorClasses($el) {
        var $label = this.findLabel($el);
        var $formError = this.findFormError($el);

        if ($label.length) {
          $label.addClass(this.options.labelErrorClass);
        }

        if ($formError.length) {
          $formError.addClass(this.options.formErrorClass);
        }

        $el.addClass(this.options.inputErrorClass).attr('data-invalid', '');
      }

      /**
       * Removes CSS error class as specified by the Abide settings from the label, input, and the form
       * @param {Object} $el - jQuery object to remove the class from
       */

    }, {
      key: 'removeErrorClasses',
      value: function removeErrorClasses($el) {
        var $label = this.findLabel($el);
        var $formError = this.findFormError($el);

        if ($label.length) {
          $label.removeClass(this.options.labelErrorClass);
        }

        if ($formError.length) {
          $formError.removeClass(this.options.formErrorClass);
        }

        $el.removeClass(this.options.inputErrorClass).removeAttr('data-invalid');
      }

      /**
       * Goes through a form to find inputs and proceeds to validate them in ways specific to their type
       * @fires Abide#invalid
       * @fires Abide#valid
       * @param {Object} element - jQuery object to validate, should be an HTML input
       * @returns {Boolean} goodToGo - If the input is valid or not.
       */

    }, {
      key: 'validateInput',
      value: function validateInput($el) {
        var clearRequire = this.requiredCheck($el),
            validated = false,
            customValidator = true,
            validator = $el.attr('data-validator'),
            equalTo = true;

        switch ($el[0].type) {
          case 'radio':
            validated = this.validateRadio($el.attr('name'));
            break;

          case 'checkbox':
            validated = clearRequire;
            break;

          case 'select':
          case 'select-one':
          case 'select-multiple':
            validated = clearRequire;
            break;

          default:
            validated = this.validateText($el);
        }

        if (validator) {
          customValidator = this.matchValidation($el, validator, $el.attr('required'));
        }

        if ($el.attr('data-equalto')) {
          equalTo = this.options.validators.equalTo($el);
        }

        var goodToGo = [clearRequire, validated, customValidator, equalTo].indexOf(false) === -1;
        var message = (goodToGo ? 'valid' : 'invalid') + '.zf.abide';

        this[goodToGo ? 'removeErrorClasses' : 'addErrorClasses']($el);

        /**
         * Fires when the input is done checking for validation. Event trigger is either `valid.zf.abide` or `invalid.zf.abide`
         * Trigger includes the DOM element of the input.
         * @event Abide#valid
         * @event Abide#invalid
         */
        $el.trigger(message, [$el]);

        return goodToGo;
      }

      /**
       * Goes through a form and if there are any invalid inputs, it will display the form error element
       * @returns {Boolean} noError - true if no errors were detected...
       * @fires Abide#formvalid
       * @fires Abide#forminvalid
       */

    }, {
      key: 'validateForm',
      value: function validateForm() {
        var acc = [];
        var _this = this;

        this.$inputs.each(function () {
          acc.push(_this.validateInput($(this)));
        });

        var noError = acc.indexOf(false) === -1;

        this.$element.find('[data-abide-error]').css('display', noError ? 'none' : 'block');

        /**
         * Fires when the form is finished validating. Event trigger is either `formvalid.zf.abide` or `forminvalid.zf.abide`.
         * Trigger includes the element of the form.
         * @event Abide#formvalid
         * @event Abide#forminvalid
         */
        this.$element.trigger((noError ? 'formvalid' : 'forminvalid') + '.zf.abide', [this.$element]);

        return noError;
      }

      /**
       * Determines whether or a not a text input is valid based on the pattern specified in the attribute. If no matching pattern is found, returns true.
       * @param {Object} $el - jQuery object to validate, should be a text input HTML element
       * @param {String} pattern - string value of one of the RegEx patterns in Abide.options.patterns
       * @returns {Boolean} Boolean value depends on whether or not the input value matches the pattern specified
       */

    }, {
      key: 'validateText',
      value: function validateText($el, pattern) {
        // pattern = pattern ? pattern : $el.attr('pattern') ? $el.attr('pattern') : $el.attr('type');
        pattern = pattern || $el.attr('pattern') || $el.attr('type');
        var inputText = $el.val();

        // if text, check if the pattern exists, if so, test it, if no text or no pattern, return true.
        return inputText.length ? this.options.patterns.hasOwnProperty(pattern) ? this.options.patterns[pattern].test(inputText) : pattern && pattern !== $el.attr('type') ? new RegExp(pattern).test(inputText) : true : true;
      }

      /**
       * Determines whether or a not a radio input is valid based on whether or not it is required and selected
       * @param {String} groupName - A string that specifies the name of a radio button group
       * @returns {Boolean} Boolean value depends on whether or not at least one radio input has been selected (if it's required)
       */

    }, {
      key: 'validateRadio',
      value: function validateRadio(groupName) {
        var $group = this.$element.find(':radio[name="' + groupName + '"]'),
            counter = [],
            _this = this;

        $group.each(function () {
          var rdio = $(this),
              clear = _this.requiredCheck(rdio);
          counter.push(clear);
          if (clear) _this.removeErrorClasses(rdio);
        });

        return counter.indexOf(false) === -1;
      }

      /**
       * Determines if a selected input passes a custom validation function. Multiple validations can be used, if passed to the element with `data-validator="foo bar baz"` in a space separated listed.
       * @param {Object} $el - jQuery input element.
       * @param {String} validators - a string of function names matching functions in the Abide.options.validators object.
       * @param {Boolean} required - self explanatory?
       * @returns {Boolean} - true if validations passed.
       */

    }, {
      key: 'matchValidation',
      value: function matchValidation($el, validators, required) {
        var _this3 = this;

        required = required ? true : false;

        var clear = validators.split(' ').map(function (v) {
          return _this3.options.validators[v]($el, required, $el.parent());
        });
        return clear.indexOf(false) === -1;
      }

      /**
       * Resets form inputs and styles
       * @fires Abide#formreset
       */

    }, {
      key: 'resetForm',
      value: function resetForm() {
        var $form = this.$element,
            opts = this.options;

        $('.' + opts.labelErrorClass, $form).not('small').removeClass(opts.labelErrorClass);
        $('.' + opts.inputErrorClass, $form).not('small').removeClass(opts.inputErrorClass);
        $(opts.formErrorSelector + '.' + opts.formErrorClass).removeClass(opts.formErrorClass);
        $form.find('[data-abide-error]').css('display', 'none');
        $(':input', $form).not(':button, :submit, :reset, :hidden, [data-abide-ignore]').val('').removeAttr('data-invalid');
        /**
         * Fires when the form has been reset.
         * @event Abide#formreset
         */
        $form.trigger('formreset.zf.abide', [$form]);
      }

      /**
       * Destroys an instance of Abide.
       * Removes error styles and classes from elements, without resetting their values.
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        var _this = this;
        this.$element.off('.abide').find('[data-abide-error]').css('display', 'none');

        this.$inputs.off('.abide').each(function () {
          _this.removeErrorClasses($(this));
        });

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Abide;
  }();

  /**
   * Default settings for plugin
   */


  Abide.defaults = {
    /**
     * The default event to validate inputs. Checkboxes and radios validate immediately.
     * Remove or change this value for manual validation.
     * @option
     * @example 'fieldChange'
     */
    validateOn: 'fieldChange',

    /**
     * Class to be applied to input labels on failed validation.
     * @option
     * @example 'is-invalid-label'
     */
    labelErrorClass: 'is-invalid-label',

    /**
     * Class to be applied to inputs on failed validation.
     * @option
     * @example 'is-invalid-input'
     */
    inputErrorClass: 'is-invalid-input',

    /**
     * Class selector to use to target Form Errors for show/hide.
     * @option
     * @example '.form-error'
     */
    formErrorSelector: '.form-error',

    /**
     * Class added to Form Errors on failed validation.
     * @option
     * @example 'is-visible'
     */
    formErrorClass: 'is-visible',

    /**
     * Set to true to validate text inputs on any value change.
     * @option
     * @example false
     */
    liveValidate: false,

    patterns: {
      alpha: /^[a-zA-Z]+$/,
      alpha_numeric: /^[a-zA-Z0-9]+$/,
      integer: /^[-+]?\d+$/,
      number: /^[-+]?\d*(?:[\.\,]\d+)?$/,

      // amex, visa, diners
      card: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
      cvv: /^([0-9]){3,4}$/,

      // http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#valid-e-mail-address
      email: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,

      url: /^(https?|ftp|file|ssh):\/\/(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/,
      // abc.de
      domain: /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,8}$/,

      datetime: /^([0-2][0-9]{3})\-([0-1][0-9])\-([0-3][0-9])T([0-5][0-9])\:([0-5][0-9])\:([0-5][0-9])(Z|([\-\+]([0-1][0-9])\:00))$/,
      // YYYY-MM-DD
      date: /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))$/,
      // HH:MM:SS
      time: /^(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]){2}$/,
      dateISO: /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/,
      // MM/DD/YYYY
      month_day_year: /^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]\d{4}$/,
      // DD/MM/YYYY
      day_month_year: /^(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.]\d{4}$/,

      // #FFF or #FFFFFF
      color: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
    },

    /**
     * Optional validation functions to be used. `equalTo` being the only default included function.
     * Functions should return only a boolean if the input is valid or not. Functions are given the following arguments:
     * el : The jQuery element to validate.
     * required : Boolean value of the required attribute be present or not.
     * parent : The direct parent of the input.
     * @option
     */
    validators: {
      equalTo: function (el, required, parent) {
        return $('#' + el.attr('data-equalto')).val() === el.val();
      }
    }
  };

  // Window exports
  Foundation.plugin(Abide, 'Abide');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Accordion module.
   * @module foundation.accordion
   * @requires foundation.util.keyboard
   * @requires foundation.util.motion
   */

  var Accordion = function () {
    /**
     * Creates a new instance of an accordion.
     * @class
     * @fires Accordion#init
     * @param {jQuery} element - jQuery object to make into an accordion.
     * @param {Object} options - a plain object with settings to override the default options.
     */

    function Accordion(element, options) {
      _classCallCheck(this, Accordion);

      this.$element = element;
      this.options = $.extend({}, Accordion.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Accordion');
      Foundation.Keyboard.register('Accordion', {
        'ENTER': 'toggle',
        'SPACE': 'toggle',
        'ARROW_DOWN': 'next',
        'ARROW_UP': 'previous'
      });
    }

    /**
     * Initializes the accordion by animating the preset active pane(s).
     * @private
     */


    _createClass(Accordion, [{
      key: '_init',
      value: function _init() {
        this.$element.attr('role', 'tablist');
        this.$tabs = this.$element.children('li');
        if (this.$tabs.length === 0) {
          this.$tabs = this.$element.children('[data-accordion-item]');
        }
        this.$tabs.each(function (idx, el) {

          var $el = $(el),
              $content = $el.find('[data-tab-content]'),
              id = $content[0].id || Foundation.GetYoDigits(6, 'accordion'),
              linkId = el.id || id + '-label';

          $el.find('a:first').attr({
            'aria-controls': id,
            'role': 'tab',
            'id': linkId,
            'aria-expanded': false,
            'aria-selected': false
          });
          $content.attr({ 'role': 'tabpanel', 'aria-labelledby': linkId, 'aria-hidden': true, 'id': id });
        });
        var $initActive = this.$element.find('.is-active').children('[data-tab-content]');
        if ($initActive.length) {
          this.down($initActive, true);
        }
        this._events();
      }

      /**
       * Adds event handlers for items within the accordion.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        this.$tabs.each(function () {
          var $elem = $(this);
          var $tabContent = $elem.children('[data-tab-content]');
          if ($tabContent.length) {
            $elem.children('a').off('click.zf.accordion keydown.zf.accordion').on('click.zf.accordion', function (e) {
              // $(this).children('a').on('click.zf.accordion', function(e) {
              e.preventDefault();
              if ($elem.hasClass('is-active')) {
                if (_this.options.allowAllClosed || $elem.siblings().hasClass('is-active')) {
                  _this.up($tabContent);
                }
              } else {
                _this.down($tabContent);
              }
            }).on('keydown.zf.accordion', function (e) {
              Foundation.Keyboard.handleKey(e, 'Accordion', {
                toggle: function () {
                  _this.toggle($tabContent);
                },
                next: function () {
                  $elem.next().find('a').focus().trigger('click.zf.accordion');
                },
                previous: function () {
                  $elem.prev().find('a').focus().trigger('click.zf.accordion');
                },
                handled: function () {
                  e.preventDefault();
                  e.stopPropagation();
                }
              });
            });
          }
        });
      }

      /**
       * Toggles the selected content pane's open/close state.
       * @param {jQuery} $target - jQuery object of the pane to toggle.
       * @function
       */

    }, {
      key: 'toggle',
      value: function toggle($target) {
        if ($target.parent().hasClass('is-active')) {
          if (this.options.allowAllClosed || $target.parent().siblings().hasClass('is-active')) {
            this.up($target);
          } else {
            return;
          }
        } else {
          this.down($target);
        }
      }

      /**
       * Opens the accordion tab defined by `$target`.
       * @param {jQuery} $target - Accordion pane to open.
       * @param {Boolean} firstTime - flag to determine if reflow should happen.
       * @fires Accordion#down
       * @function
       */

    }, {
      key: 'down',
      value: function down($target, firstTime) {
        var _this = this;
        if (!this.options.multiExpand && !firstTime) {
          var $currentActive = this.$element.find('.is-active').children('[data-tab-content]');
          if ($currentActive.length) {
            this.up($currentActive);
          }
        }

        $target.attr('aria-hidden', false).parent('[data-tab-content]').addBack().parent().addClass('is-active');

        // Foundation.Move(_this.options.slideSpeed, $target, function(){
        $target.slideDown(_this.options.slideSpeed, function () {
          /**
           * Fires when the tab is done opening.
           * @event Accordion#down
           */
          _this.$element.trigger('down.zf.accordion', [$target]);
        });
        // });

        // if(!firstTime){
        //   Foundation._reflow(this.$element.attr('data-accordion'));
        // }
        $('#' + $target.attr('aria-labelledby')).attr({
          'aria-expanded': true,
          'aria-selected': true
        });
      }

      /**
       * Closes the tab defined by `$target`.
       * @param {jQuery} $target - Accordion tab to close.
       * @fires Accordion#up
       * @function
       */

    }, {
      key: 'up',
      value: function up($target) {
        var $aunts = $target.parent().siblings(),
            _this = this;
        var canClose = this.options.multiExpand ? $aunts.hasClass('is-active') : $target.parent().hasClass('is-active');

        if (!this.options.allowAllClosed && !canClose) {
          return;
        }

        // Foundation.Move(this.options.slideSpeed, $target, function(){
        $target.slideUp(_this.options.slideSpeed, function () {
          /**
           * Fires when the tab is done collapsing up.
           * @event Accordion#up
           */
          _this.$element.trigger('up.zf.accordion', [$target]);
        });
        // });

        $target.attr('aria-hidden', true).parent().removeClass('is-active');

        $('#' + $target.attr('aria-labelledby')).attr({
          'aria-expanded': false,
          'aria-selected': false
        });
      }

      /**
       * Destroys an instance of an accordion.
       * @fires Accordion#destroyed
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('[data-tab-content]').slideUp(0).css('display', '');
        this.$element.find('a').off('.zf.accordion');

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Accordion;
  }();

  Accordion.defaults = {
    /**
     * Amount of time to animate the opening of an accordion pane.
     * @option
     * @example 250
     */
    slideSpeed: 250,
    /**
     * Allow the accordion to have multiple open panes.
     * @option
     * @example false
     */
    multiExpand: false,
    /**
     * Allow the accordion to close all panes.
     * @option
     * @example false
     */
    allowAllClosed: false
  };

  // Window exports
  Foundation.plugin(Accordion, 'Accordion');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * AccordionMenu module.
   * @module foundation.accordionMenu
   * @requires foundation.util.keyboard
   * @requires foundation.util.motion
   * @requires foundation.util.nest
   */

  var AccordionMenu = function () {
    /**
     * Creates a new instance of an accordion menu.
     * @class
     * @fires AccordionMenu#init
     * @param {jQuery} element - jQuery object to make into an accordion menu.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function AccordionMenu(element, options) {
      _classCallCheck(this, AccordionMenu);

      this.$element = element;
      this.options = $.extend({}, AccordionMenu.defaults, this.$element.data(), options);

      Foundation.Nest.Feather(this.$element, 'accordion');

      this._init();

      Foundation.registerPlugin(this, 'AccordionMenu');
      Foundation.Keyboard.register('AccordionMenu', {
        'ENTER': 'toggle',
        'SPACE': 'toggle',
        'ARROW_RIGHT': 'open',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'close',
        'ESCAPE': 'closeAll',
        'TAB': 'down',
        'SHIFT_TAB': 'up'
      });
    }

    /**
     * Initializes the accordion menu by hiding all nested menus.
     * @private
     */


    _createClass(AccordionMenu, [{
      key: '_init',
      value: function _init() {
        this.$element.find('[data-submenu]').not('.is-active').slideUp(0); //.find('a').css('padding-left', '1rem');
        this.$element.attr({
          'role': 'tablist',
          'aria-multiselectable': this.options.multiOpen
        });

        this.$menuLinks = this.$element.find('.is-accordion-submenu-parent');
        this.$menuLinks.each(function () {
          var linkId = this.id || Foundation.GetYoDigits(6, 'acc-menu-link'),
              $elem = $(this),
              $sub = $elem.children('[data-submenu]'),
              subId = $sub[0].id || Foundation.GetYoDigits(6, 'acc-menu'),
              isActive = $sub.hasClass('is-active');
          $elem.attr({
            'aria-controls': subId,
            'aria-expanded': isActive,
            'role': 'tab',
            'id': linkId
          });
          $sub.attr({
            'aria-labelledby': linkId,
            'aria-hidden': !isActive,
            'role': 'tabpanel',
            'id': subId
          });
        });
        var initPanes = this.$element.find('.is-active');
        if (initPanes.length) {
          var _this = this;
          initPanes.each(function () {
            _this.down($(this));
          });
        }
        this._events();
      }

      /**
       * Adds event handlers for items within the menu.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        this.$element.find('li').each(function () {
          var $submenu = $(this).children('[data-submenu]');

          if ($submenu.length) {
            $(this).children('a').off('click.zf.accordionMenu').on('click.zf.accordionMenu', function (e) {
              e.preventDefault();

              _this.toggle($submenu);
            });
          }
        }).on('keydown.zf.accordionmenu', function (e) {
          var $element = $(this),
              $elements = $element.parent('ul').children('li'),
              $prevElement,
              $nextElement,
              $target = $element.children('[data-submenu]');

          $elements.each(function (i) {
            if ($(this).is($element)) {
              $prevElement = $elements.eq(Math.max(0, i - 1));
              $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1));

              if ($(this).children('[data-submenu]:visible').length) {
                // has open sub menu
                $nextElement = $element.find('li:first-child');
              }
              if ($(this).is(':first-child')) {
                // is first element of sub menu
                $prevElement = $element.parents('li').first();
              } else if ($prevElement.children('[data-submenu]:visible').length) {
                // if previous element has open sub menu
                $prevElement = $prevElement.find('li:last-child');
              }
              if ($(this).is(':last-child')) {
                // is last element of sub menu
                $nextElement = $element.parents('li').first().next('li');
              }

              return;
            }
          });
          Foundation.Keyboard.handleKey(e, 'AccordionMenu', {
            open: function () {
              if ($target.is(':hidden')) {
                _this.down($target);
                $target.find('li').first().focus();
              }
            },
            close: function () {
              if ($target.length && !$target.is(':hidden')) {
                // close active sub of this item
                _this.up($target);
              } else if ($element.parent('[data-submenu]').length) {
                // close currently open sub
                _this.up($element.parent('[data-submenu]'));
                $element.parents('li').first().focus();
              }
            },
            up: function () {
              $prevElement.focus();
            },
            down: function () {
              $nextElement.focus();
            },
            toggle: function () {
              if ($element.children('[data-submenu]').length) {
                _this.toggle($element.children('[data-submenu]'));
              }
            },
            closeAll: function () {
              _this.hideAll();
            },
            handled: function () {
              e.preventDefault();
              e.stopImmediatePropagation();
            }
          });
        }); //.attr('tabindex', 0);
      }

      /**
       * Closes all panes of the menu.
       * @function
       */

    }, {
      key: 'hideAll',
      value: function hideAll() {
        this.$element.find('[data-submenu]').slideUp(this.options.slideSpeed);
      }

      /**
       * Toggles the open/close state of a submenu.
       * @function
       * @param {jQuery} $target - the submenu to toggle
       */

    }, {
      key: 'toggle',
      value: function toggle($target) {
        if (!$target.is(':animated')) {
          if (!$target.is(':hidden')) {
            this.up($target);
          } else {
            this.down($target);
          }
        }
      }

      /**
       * Opens the sub-menu defined by `$target`.
       * @param {jQuery} $target - Sub-menu to open.
       * @fires AccordionMenu#down
       */

    }, {
      key: 'down',
      value: function down($target) {
        var _this = this;

        if (!this.options.multiOpen) {
          this.up(this.$element.find('.is-active').not($target.parentsUntil(this.$element).add($target)));
        }

        $target.addClass('is-active').attr({ 'aria-hidden': false }).parent('.is-accordion-submenu-parent').attr({ 'aria-expanded': true });

        Foundation.Move(this.options.slideSpeed, $target, function () {
          $target.slideDown(_this.options.slideSpeed, function () {
            /**
             * Fires when the menu is done opening.
             * @event AccordionMenu#down
             */
            _this.$element.trigger('down.zf.accordionMenu', [$target]);
          });
        });
      }

      /**
       * Closes the sub-menu defined by `$target`. All sub-menus inside the target will be closed as well.
       * @param {jQuery} $target - Sub-menu to close.
       * @fires AccordionMenu#up
       */

    }, {
      key: 'up',
      value: function up($target) {
        var _this = this;
        Foundation.Move(this.options.slideSpeed, $target, function () {
          $target.slideUp(_this.options.slideSpeed, function () {
            /**
             * Fires when the menu is done collapsing up.
             * @event AccordionMenu#up
             */
            _this.$element.trigger('up.zf.accordionMenu', [$target]);
          });
        });

        var $menus = $target.find('[data-submenu]').slideUp(0).addBack().attr('aria-hidden', true);

        $menus.parent('.is-accordion-submenu-parent').attr('aria-expanded', false);
      }

      /**
       * Destroys an instance of accordion menu.
       * @fires AccordionMenu#destroyed
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('[data-submenu]').slideDown(0).css('display', '');
        this.$element.find('a').off('click.zf.accordionMenu');

        Foundation.Nest.Burn(this.$element, 'accordion');
        Foundation.unregisterPlugin(this);
      }
    }]);

    return AccordionMenu;
  }();

  AccordionMenu.defaults = {
    /**
     * Amount of time to animate the opening of a submenu in ms.
     * @option
     * @example 250
     */
    slideSpeed: 250,
    /**
     * Allow the menu to have multiple open panes.
     * @option
     * @example true
     */
    multiOpen: true
  };

  // Window exports
  Foundation.plugin(AccordionMenu, 'AccordionMenu');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Drilldown module.
   * @module foundation.drilldown
   * @requires foundation.util.keyboard
   * @requires foundation.util.motion
   * @requires foundation.util.nest
   */

  var Drilldown = function () {
    /**
     * Creates a new instance of a drilldown menu.
     * @class
     * @param {jQuery} element - jQuery object to make into an accordion menu.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Drilldown(element, options) {
      _classCallCheck(this, Drilldown);

      this.$element = element;
      this.options = $.extend({}, Drilldown.defaults, this.$element.data(), options);

      Foundation.Nest.Feather(this.$element, 'drilldown');

      this._init();

      Foundation.registerPlugin(this, 'Drilldown');
      Foundation.Keyboard.register('Drilldown', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'previous',
        'ESCAPE': 'close',
        'TAB': 'down',
        'SHIFT_TAB': 'up'
      });
    }

    /**
     * Initializes the drilldown by creating jQuery collections of elements
     * @private
     */


    _createClass(Drilldown, [{
      key: '_init',
      value: function _init() {
        this.$submenuAnchors = this.$element.find('li.is-drilldown-submenu-parent');
        this.$submenus = this.$submenuAnchors.children('[data-submenu]');
        this.$menuItems = this.$element.find('li').not('.js-drilldown-back').attr('role', 'menuitem');

        this._prepareMenu();

        this._keyboardEvents();
      }

      /**
       * prepares drilldown menu by setting attributes to links and elements
       * sets a min height to prevent content jumping
       * wraps the element if not already wrapped
       * @private
       * @function
       */

    }, {
      key: '_prepareMenu',
      value: function _prepareMenu() {
        var _this = this;
        // if(!this.options.holdOpen){
        //   this._menuLinkEvents();
        // }
        this.$submenuAnchors.each(function () {
          var $sub = $(this);
          var $link = $sub.find('a:first');
          if (_this.options.parentLink) {
            $link.clone().prependTo($sub.children('[data-submenu]')).wrap('<li class="is-submenu-parent-item is-submenu-item is-drilldown-submenu-item" role="menu-item"></li>');
          }
          $link.data('savedHref', $link.attr('href')).removeAttr('href');
          $sub.children('[data-submenu]').attr({
            'aria-hidden': true,
            'tabindex': 0,
            'role': 'menu'
          });
          _this._events($sub);
        });
        this.$submenus.each(function () {
          var $menu = $(this),
              $back = $menu.find('.js-drilldown-back');
          if (!$back.length) {
            $menu.prepend(_this.options.backButton);
          }
          _this._back($menu);
        });
        if (!this.$element.parent().hasClass('is-drilldown')) {
          this.$wrapper = $(this.options.wrapper).addClass('is-drilldown').css(this._getMaxDims());
          this.$element.wrap(this.$wrapper);
        }
      }

      /**
       * Adds event handlers to elements in the menu.
       * @function
       * @private
       * @param {jQuery} $elem - the current menu item to add handlers to.
       */

    }, {
      key: '_events',
      value: function _events($elem) {
        var _this = this;

        $elem.off('click.zf.drilldown').on('click.zf.drilldown', function (e) {
          if ($(e.target).parentsUntil('ul', 'li').hasClass('is-drilldown-submenu-parent')) {
            e.stopImmediatePropagation();
            e.preventDefault();
          }

          // if(e.target !== e.currentTarget.firstElementChild){
          //   return false;
          // }
          _this._show($elem);

          if (_this.options.closeOnClick) {
            var $body = $('body').not(_this.$wrapper);
            $body.off('.zf.drilldown').on('click.zf.drilldown', function (e) {
              e.preventDefault();
              _this._hideAll();
              $body.off('.zf.drilldown');
            });
          }
        });
      }

      /**
       * Adds keydown event listener to `li`'s in the menu.
       * @private
       */

    }, {
      key: '_keyboardEvents',
      value: function _keyboardEvents() {
        var _this = this;
        this.$menuItems.add(this.$element.find('.js-drilldown-back')).on('keydown.zf.drilldown', function (e) {
          var $element = $(this),
              $elements = $element.parent('ul').children('li'),
              $prevElement,
              $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              $prevElement = $elements.eq(Math.max(0, i - 1));
              $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1));
              return;
            }
          });
          Foundation.Keyboard.handleKey(e, 'Drilldown', {
            next: function () {
              if ($element.is(_this.$submenuAnchors)) {
                _this._show($element);
                $element.on(Foundation.transitionend($element), function () {
                  $element.find('ul li').filter(_this.$menuItems).first().focus();
                });
              }
            },
            previous: function () {
              _this._hide($element.parent('ul'));
              $element.parent('ul').on(Foundation.transitionend($element), function () {
                setTimeout(function () {
                  $element.parent('ul').parent('li').focus();
                }, 1);
              });
            },
            up: function () {
              $prevElement.focus();
            },
            down: function () {
              $nextElement.focus();
            },
            close: function () {
              _this._back();
              //_this.$menuItems.first().focus(); // focus to first element
            },
            open: function () {
              if (!$element.is(_this.$menuItems)) {
                // not menu item means back button
                _this._hide($element.parent('ul'));
                setTimeout(function () {
                  $element.parent('ul').parent('li').focus();
                }, 1);
              } else if ($element.is(_this.$submenuAnchors)) {
                _this._show($element);
                setTimeout(function () {
                  $element.find('ul li').filter(_this.$menuItems).first().focus();
                }, 1);
              }
            },
            handled: function () {
              e.preventDefault();
              e.stopImmediatePropagation();
            }
          });
        }); // end keyboardAccess
      }

      /**
       * Closes all open elements, and returns to root menu.
       * @function
       * @fires Drilldown#closed
       */

    }, {
      key: '_hideAll',
      value: function _hideAll() {
        var $elem = this.$element.find('.is-drilldown-submenu.is-active').addClass('is-closing');
        $elem.one(Foundation.transitionend($elem), function (e) {
          $elem.removeClass('is-active is-closing');
        });
        /**
         * Fires when the menu is fully closed.
         * @event Drilldown#closed
         */
        this.$element.trigger('closed.zf.drilldown');
      }

      /**
       * Adds event listener for each `back` button, and closes open menus.
       * @function
       * @fires Drilldown#back
       * @param {jQuery} $elem - the current sub-menu to add `back` event.
       */

    }, {
      key: '_back',
      value: function _back($elem) {
        var _this = this;
        $elem.off('click.zf.drilldown');
        $elem.children('.js-drilldown-back').on('click.zf.drilldown', function (e) {
          e.stopImmediatePropagation();
          // console.log('mouseup on back');
          _this._hide($elem);
        });
      }

      /**
       * Adds event listener to menu items w/o submenus to close open menus on click.
       * @function
       * @private
       */

    }, {
      key: '_menuLinkEvents',
      value: function _menuLinkEvents() {
        var _this = this;
        this.$menuItems.not('.is-drilldown-submenu-parent').off('click.zf.drilldown').on('click.zf.drilldown', function (e) {
          // e.stopImmediatePropagation();
          setTimeout(function () {
            _this._hideAll();
          }, 0);
        });
      }

      /**
       * Opens a submenu.
       * @function
       * @fires Drilldown#open
       * @param {jQuery} $elem - the current element with a submenu to open.
       */

    }, {
      key: '_show',
      value: function _show($elem) {
        $elem.children('[data-submenu]').addClass('is-active');

        this.$element.trigger('open.zf.drilldown', [$elem]);
      }
    }, {
      key: '_hide',


      /**
       * Hides a submenu
       * @function
       * @fires Drilldown#hide
       * @param {jQuery} $elem - the current sub-menu to hide.
       */
      value: function _hide($elem) {
        var _this = this;
        $elem.addClass('is-closing').one(Foundation.transitionend($elem), function () {
          $elem.removeClass('is-active is-closing');
          $elem.blur();
        });
        /**
         * Fires when the submenu is has closed.
         * @event Drilldown#hide
         */
        $elem.trigger('hide.zf.drilldown', [$elem]);
      }

      /**
       * Iterates through the nested menus to calculate the min-height, and max-width for the menu.
       * Prevents content jumping.
       * @function
       * @private
       */

    }, {
      key: '_getMaxDims',
      value: function _getMaxDims() {
        var max = 0,
            result = {};
        this.$submenus.add(this.$element).each(function () {
          var numOfElems = $(this).children('li').length;
          max = numOfElems > max ? numOfElems : max;
        });

        result['min-height'] = max * this.$menuItems[0].getBoundingClientRect().height + 'px';
        result['max-width'] = this.$element[0].getBoundingClientRect().width + 'px';

        return result;
      }

      /**
       * Destroys the Drilldown Menu
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this._hideAll();
        Foundation.Nest.Burn(this.$element, 'drilldown');
        this.$element.unwrap().find('.js-drilldown-back, .is-submenu-parent-item').remove().end().find('.is-active, .is-closing, .is-drilldown-submenu').removeClass('is-active is-closing is-drilldown-submenu').end().find('[data-submenu]').removeAttr('aria-hidden tabindex role').off('.zf.drilldown').end().off('zf.drilldown');
        this.$element.find('a').each(function () {
          var $link = $(this);
          if ($link.data('savedHref')) {
            $link.attr('href', $link.data('savedHref')).removeData('savedHref');
          } else {
            return;
          }
        });
        Foundation.unregisterPlugin(this);
      }
    }]);

    return Drilldown;
  }();

  Drilldown.defaults = {
    /**
     * Markup used for JS generated back button. Prepended to submenu lists and deleted on `destroy` method, 'js-drilldown-back' class required. Remove the backslash (`\`) if copy and pasting.
     * @option
     * @example '<\li><\a>Back<\/a><\/li>'
     */
    backButton: '<li class="js-drilldown-back"><a>Back</a></li>',
    /**
     * Markup used to wrap drilldown menu. Use a class name for independent styling; the JS applied class: `is-drilldown` is required. Remove the backslash (`\`) if copy and pasting.
     * @option
     * @example '<\div class="is-drilldown"><\/div>'
     */
    wrapper: '<div></div>',
    /**
     * Adds the parent link to the submenu.
     * @option
     * @example false
     */
    parentLink: false,
    /**
     * Allow the menu to return to root list on body click.
     * @option
     * @example false
     */
    closeOnClick: false
    // holdOpen: false
  };

  // Window exports
  Foundation.plugin(Drilldown, 'Drilldown');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Dropdown module.
   * @module foundation.dropdown
   * @requires foundation.util.keyboard
   * @requires foundation.util.box
   * @requires foundation.util.triggers
   */

  var Dropdown = function () {
    /**
     * Creates a new instance of a dropdown.
     * @class
     * @param {jQuery} element - jQuery object to make into a dropdown.
     *        Object should be of the dropdown panel, rather than its anchor.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Dropdown(element, options) {
      _classCallCheck(this, Dropdown);

      this.$element = element;
      this.options = $.extend({}, Dropdown.defaults, this.$element.data(), options);
      this._init();

      Foundation.registerPlugin(this, 'Dropdown');
      Foundation.Keyboard.register('Dropdown', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ESCAPE': 'close',
        'TAB': 'tab_forward',
        'SHIFT_TAB': 'tab_backward'
      });
    }

    /**
     * Initializes the plugin by setting/checking options and attributes, adding helper variables, and saving the anchor.
     * @function
     * @private
     */


    _createClass(Dropdown, [{
      key: '_init',
      value: function _init() {
        var $id = this.$element.attr('id');

        this.$anchor = $('[data-toggle="' + $id + '"]') || $('[data-open="' + $id + '"]');
        this.$anchor.attr({
          'aria-controls': $id,
          'data-is-focus': false,
          'data-yeti-box': $id,
          'aria-haspopup': true,
          'aria-expanded': false

        });

        this.options.positionClass = this.getPositionClass();
        this.counter = 4;
        this.usedPositions = [];
        this.$element.attr({
          'aria-hidden': 'true',
          'data-yeti-box': $id,
          'data-resize': $id,
          'aria-labelledby': this.$anchor[0].id || Foundation.GetYoDigits(6, 'dd-anchor')
        });
        this._events();
      }

      /**
       * Helper function to determine current orientation of dropdown pane.
       * @function
       * @returns {String} position - string value of a position class.
       */

    }, {
      key: 'getPositionClass',
      value: function getPositionClass() {
        var position = this.$element[0].className.match(/\b(top|left|right)\b/g);
        position = position ? position[0] : '';
        return position;
      }

      /**
       * Adjusts the dropdown panes orientation by adding/removing positioning classes.
       * @function
       * @private
       * @param {String} position - position class to remove.
       */

    }, {
      key: '_reposition',
      value: function _reposition(position) {
        this.usedPositions.push(position ? position : 'bottom');
        //default, try switching to opposite side
        if (!position && this.usedPositions.indexOf('top') < 0) {
          this.$element.addClass('top');
        } else if (position === 'top' && this.usedPositions.indexOf('bottom') < 0) {
          this.$element.removeClass(position);
        } else if (position === 'left' && this.usedPositions.indexOf('right') < 0) {
          this.$element.removeClass(position).addClass('right');
        } else if (position === 'right' && this.usedPositions.indexOf('left') < 0) {
          this.$element.removeClass(position).addClass('left');
        }

        //if default change didn't work, try bottom or left first
        else if (!position && this.usedPositions.indexOf('top') > -1 && this.usedPositions.indexOf('left') < 0) {
            this.$element.addClass('left');
          } else if (position === 'top' && this.usedPositions.indexOf('bottom') > -1 && this.usedPositions.indexOf('left') < 0) {
            this.$element.removeClass(position).addClass('left');
          } else if (position === 'left' && this.usedPositions.indexOf('right') > -1 && this.usedPositions.indexOf('bottom') < 0) {
            this.$element.removeClass(position);
          } else if (position === 'right' && this.usedPositions.indexOf('left') > -1 && this.usedPositions.indexOf('bottom') < 0) {
            this.$element.removeClass(position);
          }
          //if nothing cleared, set to bottom
          else {
              this.$element.removeClass(position);
            }
        this.classChanged = true;
        this.counter--;
      }

      /**
       * Sets the position and orientation of the dropdown pane, checks for collisions.
       * Recursively calls itself if a collision is detected, with a new position class.
       * @function
       * @private
       */

    }, {
      key: '_setPosition',
      value: function _setPosition() {
        if (this.$anchor.attr('aria-expanded') === 'false') {
          return false;
        }
        var position = this.getPositionClass(),
            $eleDims = Foundation.Box.GetDimensions(this.$element),
            $anchorDims = Foundation.Box.GetDimensions(this.$anchor),
            _this = this,
            direction = position === 'left' ? 'left' : position === 'right' ? 'left' : 'top',
            param = direction === 'top' ? 'height' : 'width',
            offset = param === 'height' ? this.options.vOffset : this.options.hOffset;

        if ($eleDims.width >= $eleDims.windowDims.width || !this.counter && !Foundation.Box.ImNotTouchingYou(this.$element)) {
          this.$element.offset(Foundation.Box.GetOffsets(this.$element, this.$anchor, 'center bottom', this.options.vOffset, this.options.hOffset, true)).css({
            'width': $eleDims.windowDims.width - this.options.hOffset * 2,
            'height': 'auto'
          });
          this.classChanged = true;
          return false;
        }

        this.$element.offset(Foundation.Box.GetOffsets(this.$element, this.$anchor, position, this.options.vOffset, this.options.hOffset));

        while (!Foundation.Box.ImNotTouchingYou(this.$element) && this.counter) {
          this._reposition(position);
          this._setPosition();
        }
      }

      /**
       * Adds event listeners to the element utilizing the triggers utility library.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;
        this.$element.on({
          'open.zf.trigger': this.open.bind(this),
          'close.zf.trigger': this.close.bind(this),
          'toggle.zf.trigger': this.toggle.bind(this),
          'resizeme.zf.trigger': this._setPosition.bind(this)
        });

        if (this.options.hover) {
          this.$anchor.off('mouseenter.zf.dropdown mouseleave.zf.dropdown').on('mouseenter.zf.dropdown', function () {
            clearTimeout(_this.timeout);
            _this.timeout = setTimeout(function () {
              _this.open();
              _this.$anchor.data('hover', true);
            }, _this.options.hoverDelay);
          }).on('mouseleave.zf.dropdown', function () {
            clearTimeout(_this.timeout);
            _this.timeout = setTimeout(function () {
              _this.close();
              _this.$anchor.data('hover', false);
            }, _this.options.hoverDelay);
          });
          if (this.options.hoverPane) {
            this.$element.off('mouseenter.zf.dropdown mouseleave.zf.dropdown').on('mouseenter.zf.dropdown', function () {
              clearTimeout(_this.timeout);
            }).on('mouseleave.zf.dropdown', function () {
              clearTimeout(_this.timeout);
              _this.timeout = setTimeout(function () {
                _this.close();
                _this.$anchor.data('hover', false);
              }, _this.options.hoverDelay);
            });
          }
        }
        this.$anchor.add(this.$element).on('keydown.zf.dropdown', function (e) {

          var $target = $(this),
              visibleFocusableElements = Foundation.Keyboard.findFocusable(_this.$element);

          Foundation.Keyboard.handleKey(e, 'Dropdown', {
            tab_forward: function () {
              if (_this.$element.find(':focus').is(visibleFocusableElements.eq(-1))) {
                // left modal downwards, setting focus to first element
                if (_this.options.trapFocus) {
                  // if focus shall be trapped
                  visibleFocusableElements.eq(0).focus();
                  e.preventDefault();
                } else {
                  // if focus is not trapped, close dropdown on focus out
                  _this.close();
                }
              }
            },
            tab_backward: function () {
              if (_this.$element.find(':focus').is(visibleFocusableElements.eq(0)) || _this.$element.is(':focus')) {
                // left modal upwards, setting focus to last element
                if (_this.options.trapFocus) {
                  // if focus shall be trapped
                  visibleFocusableElements.eq(-1).focus();
                  e.preventDefault();
                } else {
                  // if focus is not trapped, close dropdown on focus out
                  _this.close();
                }
              }
            },
            open: function () {
              if ($target.is(_this.$anchor)) {
                _this.open();
                _this.$element.attr('tabindex', -1).focus();
                e.preventDefault();
              }
            },
            close: function () {
              _this.close();
              _this.$anchor.focus();
            }
          });
        });
      }

      /**
       * Adds an event handler to the body to close any dropdowns on a click.
       * @function
       * @private
       */

    }, {
      key: '_addBodyHandler',
      value: function _addBodyHandler() {
        var $body = $(document.body).not(this.$element),
            _this = this;
        $body.off('click.zf.dropdown').on('click.zf.dropdown', function (e) {
          if (_this.$anchor.is(e.target) || _this.$anchor.find(e.target).length) {
            return;
          }
          if (_this.$element.find(e.target).length) {
            return;
          }
          _this.close();
          $body.off('click.zf.dropdown');
        });
      }

      /**
       * Opens the dropdown pane, and fires a bubbling event to close other dropdowns.
       * @function
       * @fires Dropdown#closeme
       * @fires Dropdown#show
       */

    }, {
      key: 'open',
      value: function open() {
        // var _this = this;
        /**
         * Fires to close other open dropdowns
         * @event Dropdown#closeme
         */
        this.$element.trigger('closeme.zf.dropdown', this.$element.attr('id'));
        this.$anchor.addClass('hover').attr({ 'aria-expanded': true });
        // this.$element/*.show()*/;
        this._setPosition();
        this.$element.addClass('is-open').attr({ 'aria-hidden': false });

        if (this.options.autoFocus) {
          var $focusable = Foundation.Keyboard.findFocusable(this.$element);
          if ($focusable.length) {
            $focusable.eq(0).focus();
          }
        }

        if (this.options.closeOnClick) {
          this._addBodyHandler();
        }

        /**
         * Fires once the dropdown is visible.
         * @event Dropdown#show
         */
        this.$element.trigger('show.zf.dropdown', [this.$element]);
      }

      /**
       * Closes the open dropdown pane.
       * @function
       * @fires Dropdown#hide
       */

    }, {
      key: 'close',
      value: function close() {
        if (!this.$element.hasClass('is-open')) {
          return false;
        }
        this.$element.removeClass('is-open').attr({ 'aria-hidden': true });

        this.$anchor.removeClass('hover').attr('aria-expanded', false);

        if (this.classChanged) {
          var curPositionClass = this.getPositionClass();
          if (curPositionClass) {
            this.$element.removeClass(curPositionClass);
          }
          this.$element.addClass(this.options.positionClass)
          /*.hide()*/.css({ height: '', width: '' });
          this.classChanged = false;
          this.counter = 4;
          this.usedPositions.length = 0;
        }
        this.$element.trigger('hide.zf.dropdown', [this.$element]);
      }

      /**
       * Toggles the dropdown pane's visibility.
       * @function
       */

    }, {
      key: 'toggle',
      value: function toggle() {
        if (this.$element.hasClass('is-open')) {
          if (this.$anchor.data('hover')) return;
          this.close();
        } else {
          this.open();
        }
      }

      /**
       * Destroys the dropdown.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.off('.zf.trigger').hide();
        this.$anchor.off('.zf.dropdown');

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Dropdown;
  }();

  Dropdown.defaults = {
    /**
     * Amount of time to delay opening a submenu on hover event.
     * @option
     * @example 250
     */
    hoverDelay: 250,
    /**
     * Allow submenus to open on hover events
     * @option
     * @example false
     */
    hover: false,
    /**
     * Don't close dropdown when hovering over dropdown pane
     * @option
     * @example true
     */
    hoverPane: false,
    /**
     * Number of pixels between the dropdown pane and the triggering element on open.
     * @option
     * @example 1
     */
    vOffset: 1,
    /**
     * Number of pixels between the dropdown pane and the triggering element on open.
     * @option
     * @example 1
     */
    hOffset: 1,
    /**
     * Class applied to adjust open position. JS will test and fill this in.
     * @option
     * @example 'top'
     */
    positionClass: '',
    /**
     * Allow the plugin to trap focus to the dropdown pane if opened with keyboard commands.
     * @option
     * @example false
     */
    trapFocus: false,
    /**
     * Allow the plugin to set focus to the first focusable element within the pane, regardless of method of opening.
     * @option
     * @example true
     */
    autoFocus: false,
    /**
     * Allows a click on the body to close the dropdown.
     * @option
     * @example false
     */
    closeOnClick: false
  };

  // Window exports
  Foundation.plugin(Dropdown, 'Dropdown');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * DropdownMenu module.
   * @module foundation.dropdown-menu
   * @requires foundation.util.keyboard
   * @requires foundation.util.box
   * @requires foundation.util.nest
   */

  var DropdownMenu = function () {
    /**
     * Creates a new instance of DropdownMenu.
     * @class
     * @fires DropdownMenu#init
     * @param {jQuery} element - jQuery object to make into a dropdown menu.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function DropdownMenu(element, options) {
      _classCallCheck(this, DropdownMenu);

      this.$element = element;
      this.options = $.extend({}, DropdownMenu.defaults, this.$element.data(), options);

      Foundation.Nest.Feather(this.$element, 'dropdown');
      this._init();

      Foundation.registerPlugin(this, 'DropdownMenu');
      Foundation.Keyboard.register('DropdownMenu', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'previous',
        'ESCAPE': 'close'
      });
    }

    /**
     * Initializes the plugin, and calls _prepareMenu
     * @private
     * @function
     */


    _createClass(DropdownMenu, [{
      key: '_init',
      value: function _init() {
        var subs = this.$element.find('li.is-dropdown-submenu-parent');
        this.$element.children('.is-dropdown-submenu-parent').children('.is-dropdown-submenu').addClass('first-sub');

        this.$menuItems = this.$element.find('[role="menuitem"]');
        this.$tabs = this.$element.children('[role="menuitem"]');
        this.$tabs.find('ul.is-dropdown-submenu').addClass(this.options.verticalClass);

        if (this.$element.hasClass(this.options.rightClass) || this.options.alignment === 'right' || Foundation.rtl()) {
          this.options.alignment = 'right';
          subs.addClass('opens-left');
        } else {
          subs.addClass('opens-right');
        }
        this.changed = false;
        this._events();
      }
    }, {
      key: '_events',

      /**
       * Adds event listeners to elements within the menu
       * @private
       * @function
       */
      value: function _events() {
        var _this = this,
            hasTouch = 'ontouchstart' in window || typeof window.ontouchstart !== 'undefined',
            parClass = 'is-dropdown-submenu-parent';

        if (this.options.clickOpen || hasTouch) {
          this.$menuItems.on('click.zf.dropdownmenu touchstart.zf.dropdownmenu', function (e) {
            var $elem = $(e.target).parentsUntil('ul', '.' + parClass),
                hasSub = $elem.hasClass(parClass),
                hasClicked = $elem.attr('data-is-click') === 'true',
                $sub = $elem.children('.is-dropdown-submenu');

            if (hasSub) {
              if (hasClicked) {
                if (!_this.options.closeOnClick || !_this.options.clickOpen && !hasTouch || _this.options.forceFollow && hasTouch) {
                  return;
                } else {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                  _this._hide($elem);
                }
              } else {
                e.preventDefault();
                e.stopImmediatePropagation();
                _this._show($elem.children('.is-dropdown-submenu'));
                $elem.add($elem.parentsUntil(_this.$element, '.' + parClass)).attr('data-is-click', true);
              }
            } else {
              return;
            }
          });
        }

        if (!this.options.disableHover) {
          this.$menuItems.on('mouseenter.zf.dropdownmenu', function (e) {
            e.stopImmediatePropagation();
            var $elem = $(this),
                hasSub = $elem.hasClass(parClass);

            if (hasSub) {
              clearTimeout(_this.delay);
              _this.delay = setTimeout(function () {
                _this._show($elem.children('.is-dropdown-submenu'));
              }, _this.options.hoverDelay);
            }
          }).on('mouseleave.zf.dropdownmenu', function (e) {
            var $elem = $(this),
                hasSub = $elem.hasClass(parClass);
            if (hasSub && _this.options.autoclose) {
              if ($elem.attr('data-is-click') === 'true' && _this.options.clickOpen) {
                return false;
              }

              clearTimeout(_this.delay);
              _this.delay = setTimeout(function () {
                _this._hide($elem);
              }, _this.options.closingTime);
            }
          });
        }
        this.$menuItems.on('keydown.zf.dropdownmenu', function (e) {
          var $element = $(e.target).parentsUntil('ul', '[role="menuitem"]'),
              isTab = _this.$tabs.index($element) > -1,
              $elements = isTab ? _this.$tabs : $element.siblings('li').add($element),
              $prevElement,
              $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              $prevElement = $elements.eq(i - 1);
              $nextElement = $elements.eq(i + 1);
              return;
            }
          });

          var nextSibling = function () {
            if (!$element.is(':last-child')) $nextElement.children('a:first').focus();
          },
              prevSibling = function () {
            $prevElement.children('a:first').focus();
          },
              openSub = function () {
            var $sub = $element.children('ul.is-dropdown-submenu');
            if ($sub.length) {
              _this._show($sub);
              $element.find('li > a:first').focus();
            } else {
              return;
            }
          },
              closeSub = function () {
            //if ($element.is(':first-child')) {
            var close = $element.parent('ul').parent('li');
            close.children('a:first').focus();
            _this._hide(close);
            //}
          };
          var functions = {
            open: openSub,
            close: function () {
              _this._hide(_this.$element);
              _this.$menuItems.find('a:first').focus(); // focus to first element
            },
            handled: function () {
              e.preventDefault();
              e.stopImmediatePropagation();
            }
          };

          if (isTab) {
            if (_this.vertical) {
              // vertical menu
              if (_this.options.alignment === 'left') {
                // left aligned
                $.extend(functions, {
                  down: nextSibling,
                  up: prevSibling,
                  next: openSub,
                  previous: closeSub
                });
              } else {
                // right aligned
                $.extend(functions, {
                  down: nextSibling,
                  up: prevSibling,
                  next: closeSub,
                  previous: openSub
                });
              }
            } else {
              // horizontal menu
              $.extend(functions, {
                next: nextSibling,
                previous: prevSibling,
                down: openSub,
                up: closeSub
              });
            }
          } else {
            // not tabs -> one sub
            if (_this.options.alignment === 'left') {
              // left aligned
              $.extend(functions, {
                next: openSub,
                previous: closeSub,
                down: nextSibling,
                up: prevSibling
              });
            } else {
              // right aligned
              $.extend(functions, {
                next: closeSub,
                previous: openSub,
                down: nextSibling,
                up: prevSibling
              });
            }
          }
          Foundation.Keyboard.handleKey(e, 'DropdownMenu', functions);
        });
      }

      /**
       * Adds an event handler to the body to close any dropdowns on a click.
       * @function
       * @private
       */

    }, {
      key: '_addBodyHandler',
      value: function _addBodyHandler() {
        var $body = $(document.body),
            _this = this;
        $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu').on('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu', function (e) {
          var $link = _this.$element.find(e.target);
          if ($link.length) {
            return;
          }

          _this._hide();
          $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu');
        });
      }

      /**
       * Opens a dropdown pane, and checks for collisions first.
       * @param {jQuery} $sub - ul element that is a submenu to show
       * @function
       * @private
       * @fires DropdownMenu#show
       */

    }, {
      key: '_show',
      value: function _show($sub) {
        var idx = this.$tabs.index(this.$tabs.filter(function (i, el) {
          return $(el).find($sub).length > 0;
        }));
        var $sibs = $sub.parent('li.is-dropdown-submenu-parent').siblings('li.is-dropdown-submenu-parent');
        this._hide($sibs, idx);
        $sub.css('visibility', 'hidden').addClass('js-dropdown-active').attr({ 'aria-hidden': false }).parent('li.is-dropdown-submenu-parent').addClass('is-active').attr({ 'aria-expanded': true });
        var clear = Foundation.Box.ImNotTouchingYou($sub, null, true);
        if (!clear) {
          var oldClass = this.options.alignment === 'left' ? '-right' : '-left',
              $parentLi = $sub.parent('.is-dropdown-submenu-parent');
          $parentLi.removeClass('opens' + oldClass).addClass('opens-' + this.options.alignment);
          clear = Foundation.Box.ImNotTouchingYou($sub, null, true);
          if (!clear) {
            $parentLi.removeClass('opens-' + this.options.alignment).addClass('opens-inner');
          }
          this.changed = true;
        }
        $sub.css('visibility', '');
        if (this.options.closeOnClick) {
          this._addBodyHandler();
        }
        /**
         * Fires when the new dropdown pane is visible.
         * @event DropdownMenu#show
         */
        this.$element.trigger('show.zf.dropdownmenu', [$sub]);
      }

      /**
       * Hides a single, currently open dropdown pane, if passed a parameter, otherwise, hides everything.
       * @function
       * @param {jQuery} $elem - element with a submenu to hide
       * @param {Number} idx - index of the $tabs collection to hide
       * @private
       */

    }, {
      key: '_hide',
      value: function _hide($elem, idx) {
        var $toClose;
        if ($elem && $elem.length) {
          $toClose = $elem;
        } else if (idx !== undefined) {
          $toClose = this.$tabs.not(function (i, el) {
            return i === idx;
          });
        } else {
          $toClose = this.$element;
        }
        var somethingToClose = $toClose.hasClass('is-active') || $toClose.find('.is-active').length > 0;

        if (somethingToClose) {
          $toClose.find('li.is-active').add($toClose).attr({
            'aria-expanded': false,
            'data-is-click': false
          }).removeClass('is-active');

          $toClose.find('ul.js-dropdown-active').attr({
            'aria-hidden': true
          }).removeClass('js-dropdown-active');

          if (this.changed || $toClose.find('opens-inner').length) {
            var oldClass = this.options.alignment === 'left' ? 'right' : 'left';
            $toClose.find('li.is-dropdown-submenu-parent').add($toClose).removeClass('opens-inner opens-' + this.options.alignment).addClass('opens-' + oldClass);
            this.changed = false;
          }
          /**
           * Fires when the open menus are closed.
           * @event DropdownMenu#hide
           */
          this.$element.trigger('hide.zf.dropdownmenu', [$toClose]);
        }
      }

      /**
       * Destroys the plugin.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$menuItems.off('.zf.dropdownmenu').removeAttr('data-is-click').removeClass('is-right-arrow is-left-arrow is-down-arrow opens-right opens-left opens-inner');
        $(document.body).off('.zf.dropdownmenu');
        Foundation.Nest.Burn(this.$element, 'dropdown');
        Foundation.unregisterPlugin(this);
      }
    }]);

    return DropdownMenu;
  }();

  /**
   * Default settings for plugin
   */


  DropdownMenu.defaults = {
    /**
     * Disallows hover events from opening submenus
     * @option
     * @example false
     */
    disableHover: false,
    /**
     * Allow a submenu to automatically close on a mouseleave event, if not clicked open.
     * @option
     * @example true
     */
    autoclose: true,
    /**
     * Amount of time to delay opening a submenu on hover event.
     * @option
     * @example 50
     */
    hoverDelay: 50,
    /**
     * Allow a submenu to open/remain open on parent click event. Allows cursor to move away from menu.
     * @option
     * @example true
     */
    clickOpen: false,
    /**
     * Amount of time to delay closing a submenu on a mouseleave event.
     * @option
     * @example 500
     */

    closingTime: 500,
    /**
     * Position of the menu relative to what direction the submenus should open. Handled by JS.
     * @option
     * @example 'left'
     */
    alignment: 'left',
    /**
     * Allow clicks on the body to close any open submenus.
     * @option
     * @example true
     */
    closeOnClick: true,
    /**
     * Class applied to vertical oriented menus, Foundation default is `vertical`. Update this if using your own class.
     * @option
     * @example 'vertical'
     */
    verticalClass: 'vertical',
    /**
     * Class applied to right-side oriented menus, Foundation default is `align-right`. Update this if using your own class.
     * @option
     * @example 'align-right'
     */
    rightClass: 'align-right',
    /**
     * Boolean to force overide the clicking of links to perform default action, on second touch event for mobile.
     * @option
     * @example false
     */
    forceFollow: true
  };

  // Window exports
  Foundation.plugin(DropdownMenu, 'DropdownMenu');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Equalizer module.
   * @module foundation.equalizer
   */

  var Equalizer = function () {
    /**
     * Creates a new instance of Equalizer.
     * @class
     * @fires Equalizer#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Equalizer(element, options) {
      _classCallCheck(this, Equalizer);

      this.$element = element;
      this.options = $.extend({}, Equalizer.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Equalizer');
    }

    /**
     * Initializes the Equalizer plugin and calls functions to get equalizer functioning on load.
     * @private
     */


    _createClass(Equalizer, [{
      key: '_init',
      value: function _init() {
        var eqId = this.$element.attr('data-equalizer') || '';
        var $watched = this.$element.find('[data-equalizer-watch="' + eqId + '"]');

        this.$watched = $watched.length ? $watched : this.$element.find('[data-equalizer-watch]');
        this.$element.attr('data-resize', eqId || Foundation.GetYoDigits(6, 'eq'));

        this.hasNested = this.$element.find('[data-equalizer]').length > 0;
        this.isNested = this.$element.parentsUntil(document.body, '[data-equalizer]').length > 0;
        this.isOn = false;

        var imgs = this.$element.find('img');
        var tooSmall;
        if (this.options.equalizeOn) {
          tooSmall = this._checkMQ();
          $(window).on('changed.zf.mediaquery', this._checkMQ.bind(this));
        } else {
          this._events();
        }
        if (tooSmall !== undefined && tooSmall === false || tooSmall === undefined) {
          if (imgs.length) {
            Foundation.onImagesLoaded(imgs, this._reflow.bind(this));
          } else {
            this._reflow();
          }
        }
      }

      /**
       * Removes event listeners if the breakpoint is too small.
       * @private
       */

    }, {
      key: '_pauseEvents',
      value: function _pauseEvents() {
        this.isOn = false;
        this.$element.off('.zf.equalizer resizeme.zf.trigger');
      }

      /**
       * Initializes events for Equalizer.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;
        this._pauseEvents();
        if (this.hasNested) {
          this.$element.on('postequalized.zf.equalizer', function (e) {
            if (e.target !== _this.$element[0]) {
              _this._reflow();
            }
          });
        } else {
          this.$element.on('resizeme.zf.trigger', this._reflow.bind(this));
        }
        this.isOn = true;
      }

      /**
       * Checks the current breakpoint to the minimum required size.
       * @private
       */

    }, {
      key: '_checkMQ',
      value: function _checkMQ() {
        var tooSmall = !Foundation.MediaQuery.atLeast(this.options.equalizeOn);
        if (tooSmall) {
          if (this.isOn) {
            this._pauseEvents();
            this.$watched.css('height', 'auto');
          }
        } else {
          if (!this.isOn) {
            this._events();
          }
        }
        return tooSmall;
      }

      /**
       * A noop version for the plugin
       * @private
       */

    }, {
      key: '_killswitch',
      value: function _killswitch() {
        return;
      }

      /**
       * Calls necessary functions to update Equalizer upon DOM change
       * @private
       */

    }, {
      key: '_reflow',
      value: function _reflow() {
        if (!this.options.equalizeOnStack) {
          if (this._isStacked()) {
            this.$watched.css('height', 'auto');
            return false;
          }
        }
        if (this.options.equalizeByRow) {
          this.getHeightsByRow(this.applyHeightByRow.bind(this));
        } else {
          this.getHeights(this.applyHeight.bind(this));
        }
      }

      /**
       * Manually determines if the first 2 elements are *NOT* stacked.
       * @private
       */

    }, {
      key: '_isStacked',
      value: function _isStacked() {
        return this.$watched[0].offsetTop !== this.$watched[1].offsetTop;
      }

      /**
       * Finds the outer heights of children contained within an Equalizer parent and returns them in an array
       * @param {Function} cb - A non-optional callback to return the heights array to.
       * @returns {Array} heights - An array of heights of children within Equalizer container
       */

    }, {
      key: 'getHeights',
      value: function getHeights(cb) {
        var heights = [];
        for (var i = 0, len = this.$watched.length; i < len; i++) {
          this.$watched[i].style.height = 'auto';
          heights.push(this.$watched[i].offsetHeight);
        }
        cb(heights);
      }

      /**
       * Finds the outer heights of children contained within an Equalizer parent and returns them in an array
       * @param {Function} cb - A non-optional callback to return the heights array to.
       * @returns {Array} groups - An array of heights of children within Equalizer container grouped by row with element,height and max as last child
       */

    }, {
      key: 'getHeightsByRow',
      value: function getHeightsByRow(cb) {
        var lastElTopOffset = this.$watched.first().offset().top,
            groups = [],
            group = 0;
        //group by Row
        groups[group] = [];
        for (var i = 0, len = this.$watched.length; i < len; i++) {
          this.$watched[i].style.height = 'auto';
          //maybe could use this.$watched[i].offsetTop
          var elOffsetTop = $(this.$watched[i]).offset().top;
          if (elOffsetTop != lastElTopOffset) {
            group++;
            groups[group] = [];
            lastElTopOffset = elOffsetTop;
          }
          groups[group].push([this.$watched[i], this.$watched[i].offsetHeight]);
        }

        for (var j = 0, ln = groups.length; j < ln; j++) {
          var heights = $(groups[j]).map(function () {
            return this[1];
          }).get();
          var max = Math.max.apply(null, heights);
          groups[j].push(max);
        }
        cb(groups);
      }

      /**
       * Changes the CSS height property of each child in an Equalizer parent to match the tallest
       * @param {array} heights - An array of heights of children within Equalizer container
       * @fires Equalizer#preequalized
       * @fires Equalizer#postequalized
       */

    }, {
      key: 'applyHeight',
      value: function applyHeight(heights) {
        var max = Math.max.apply(null, heights);
        /**
         * Fires before the heights are applied
         * @event Equalizer#preequalized
         */
        this.$element.trigger('preequalized.zf.equalizer');

        this.$watched.css('height', max);

        /**
         * Fires when the heights have been applied
         * @event Equalizer#postequalized
         */
        this.$element.trigger('postequalized.zf.equalizer');
      }

      /**
       * Changes the CSS height property of each child in an Equalizer parent to match the tallest by row
       * @param {array} groups - An array of heights of children within Equalizer container grouped by row with element,height and max as last child
       * @fires Equalizer#preequalized
       * @fires Equalizer#preequalizedRow
       * @fires Equalizer#postequalizedRow
       * @fires Equalizer#postequalized
       */

    }, {
      key: 'applyHeightByRow',
      value: function applyHeightByRow(groups) {
        /**
         * Fires before the heights are applied
         */
        this.$element.trigger('preequalized.zf.equalizer');
        for (var i = 0, len = groups.length; i < len; i++) {
          var groupsILength = groups[i].length,
              max = groups[i][groupsILength - 1];
          if (groupsILength <= 2) {
            $(groups[i][0][0]).css({ 'height': 'auto' });
            continue;
          }
          /**
            * Fires before the heights per row are applied
            * @event Equalizer#preequalizedRow
            */
          this.$element.trigger('preequalizedrow.zf.equalizer');
          for (var j = 0, lenJ = groupsILength - 1; j < lenJ; j++) {
            $(groups[i][j][0]).css({ 'height': max });
          }
          /**
            * Fires when the heights per row have been applied
            * @event Equalizer#postequalizedRow
            */
          this.$element.trigger('postequalizedrow.zf.equalizer');
        }
        /**
         * Fires when the heights have been applied
         */
        this.$element.trigger('postequalized.zf.equalizer');
      }

      /**
       * Destroys an instance of Equalizer.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this._pauseEvents();
        this.$watched.css('height', 'auto');

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Equalizer;
  }();

  /**
   * Default settings for plugin
   */


  Equalizer.defaults = {
    /**
     * Enable height equalization when stacked on smaller screens.
     * @option
     * @example true
     */
    equalizeOnStack: true,
    /**
     * Enable height equalization row by row.
     * @option
     * @example false
     */
    equalizeByRow: false,
    /**
     * String representing the minimum breakpoint size the plugin should equalize heights on.
     * @option
     * @example 'medium'
     */
    equalizeOn: ''
  };

  // Window exports
  Foundation.plugin(Equalizer, 'Equalizer');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Interchange module.
   * @module foundation.interchange
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.timerAndImageLoader
   */

  var Interchange = function () {
    /**
     * Creates a new instance of Interchange.
     * @class
     * @fires Interchange#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Interchange(element, options) {
      _classCallCheck(this, Interchange);

      this.$element = element;
      this.options = $.extend({}, Interchange.defaults, options);
      this.rules = [];
      this.currentPath = '';

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'Interchange');
    }

    /**
     * Initializes the Interchange plugin and calls functions to get interchange functioning on load.
     * @function
     * @private
     */


    _createClass(Interchange, [{
      key: '_init',
      value: function _init() {
        this._addBreakpoints();
        this._generateRules();
        this._reflow();
      }

      /**
       * Initializes events for Interchange.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        $(window).on('resize.zf.interchange', Foundation.util.throttle(this._reflow.bind(this), 50));
      }

      /**
       * Calls necessary functions to update Interchange upon DOM change
       * @function
       * @private
       */

    }, {
      key: '_reflow',
      value: function _reflow() {
        var match;

        // Iterate through each rule, but only save the last match
        for (var i in this.rules) {
          var rule = this.rules[i];

          if (window.matchMedia(rule.query).matches) {
            match = rule;
          }
        }

        if (match) {
          this.replace(match.path);
        }
      }

      /**
       * Gets the Foundation breakpoints and adds them to the Interchange.SPECIAL_QUERIES object.
       * @function
       * @private
       */

    }, {
      key: '_addBreakpoints',
      value: function _addBreakpoints() {
        for (var i in Foundation.MediaQuery.queries) {
          var query = Foundation.MediaQuery.queries[i];
          Interchange.SPECIAL_QUERIES[query.name] = query.value;
        }
      }

      /**
       * Checks the Interchange element for the provided media query + content pairings
       * @function
       * @private
       * @param {Object} element - jQuery object that is an Interchange instance
       * @returns {Array} scenarios - Array of objects that have 'mq' and 'path' keys with corresponding keys
       */

    }, {
      key: '_generateRules',
      value: function _generateRules(element) {
        var rulesList = [];
        var rules;

        if (this.options.rules) {
          rules = this.options.rules;
        } else {
          rules = this.$element.data('interchange').match(/\[.*?\]/g);
        }

        for (var i in rules) {
          var rule = rules[i].slice(1, -1).split(', ');
          var path = rule.slice(0, -1).join('');
          var query = rule[rule.length - 1];

          if (Interchange.SPECIAL_QUERIES[query]) {
            query = Interchange.SPECIAL_QUERIES[query];
          }

          rulesList.push({
            path: path,
            query: query
          });
        }

        this.rules = rulesList;
      }

      /**
       * Update the `src` property of an image, or change the HTML of a container, to the specified path.
       * @function
       * @param {String} path - Path to the image or HTML partial.
       * @fires Interchange#replaced
       */

    }, {
      key: 'replace',
      value: function replace(path) {
        if (this.currentPath === path) return;

        var _this = this,
            trigger = 'replaced.zf.interchange';

        // Replacing images
        if (this.$element[0].nodeName === 'IMG') {
          this.$element.attr('src', path).load(function () {
            _this.currentPath = path;
          }).trigger(trigger);
        }
        // Replacing background images
        else if (path.match(/\.(gif|jpg|jpeg|tiff|png)([?#].*)?/i)) {
            this.$element.css({ 'background-image': 'url(' + path + ')' }).trigger(trigger);
          }
          // Replacing HTML
          else {
              $.get(path, function (response) {
                _this.$element.html(response).trigger(trigger);
                $(response).foundation();
                _this.currentPath = path;
              });
            }

        /**
         * Fires when content in an Interchange element is done being loaded.
         * @event Interchange#replaced
         */
        // this.$element.trigger('replaced.zf.interchange');
      }

      /**
       * Destroys an instance of interchange.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        //TODO this.
      }
    }]);

    return Interchange;
  }();

  /**
   * Default settings for plugin
   */


  Interchange.defaults = {
    /**
     * Rules to be applied to Interchange elements. Set with the `data-interchange` array notation.
     * @option
     */
    rules: null
  };

  Interchange.SPECIAL_QUERIES = {
    'landscape': 'screen and (orientation: landscape)',
    'portrait': 'screen and (orientation: portrait)',
    'retina': 'only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min--moz-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx)'
  };

  // Window exports
  Foundation.plugin(Interchange, 'Interchange');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Magellan module.
   * @module foundation.magellan
   */

  var Magellan = function () {
    /**
     * Creates a new instance of Magellan.
     * @class
     * @fires Magellan#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Magellan(element, options) {
      _classCallCheck(this, Magellan);

      this.$element = element;
      this.options = $.extend({}, Magellan.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Magellan');
    }

    /**
     * Initializes the Magellan plugin and calls functions to get equalizer functioning on load.
     * @private
     */


    _createClass(Magellan, [{
      key: '_init',
      value: function _init() {
        var id = this.$element[0].id || Foundation.GetYoDigits(6, 'magellan');
        var _this = this;
        this.$targets = $('[data-magellan-target]');
        this.$links = this.$element.find('a');
        this.$element.attr({
          'data-resize': id,
          'data-scroll': id,
          'id': id
        });
        this.$active = $();
        this.scrollPos = parseInt(window.pageYOffset, 10);

        this._events();
      }

      /**
       * Calculates an array of pixel values that are the demarcation lines between locations on the page.
       * Can be invoked if new elements are added or the size of a location changes.
       * @function
       */

    }, {
      key: 'calcPoints',
      value: function calcPoints() {
        var _this = this,
            body = document.body,
            html = document.documentElement;

        this.points = [];
        this.winHeight = Math.round(Math.max(window.innerHeight, html.clientHeight));
        this.docHeight = Math.round(Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight));

        this.$targets.each(function () {
          var $tar = $(this),
              pt = Math.round($tar.offset().top - _this.options.threshold);
          $tar.targetPoint = pt;
          _this.points.push(pt);
        });
      }

      /**
       * Initializes events for Magellan.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this,
            $body = $('html, body'),
            opts = {
          duration: _this.options.animationDuration,
          easing: _this.options.animationEasing
        };
        $(window).one('load', function () {
          if (_this.options.deepLinking) {
            if (location.hash) {
              _this.scrollToLoc(location.hash);
            }
          }
          _this.calcPoints();
          _this._updateActive();
        });

        this.$element.on({
          'resizeme.zf.trigger': this.reflow.bind(this),
          'scrollme.zf.trigger': this._updateActive.bind(this)
        }).on('click.zf.magellan', 'a[href^="#"]', function (e) {
          e.preventDefault();
          var arrival = this.getAttribute('href');
          _this.scrollToLoc(arrival);
        });
      }

      /**
       * Function to scroll to a given location on the page.
       * @param {String} loc - a properly formatted jQuery id selector. Example: '#foo'
       * @function
       */

    }, {
      key: 'scrollToLoc',
      value: function scrollToLoc(loc) {
        var scrollPos = Math.round($(loc).offset().top - this.options.threshold / 2 - this.options.barOffset);

        $('html, body').stop(true).animate({ scrollTop: scrollPos }, this.options.animationDuration, this.options.animationEasing);
      }

      /**
       * Calls necessary functions to update Magellan upon DOM change
       * @function
       */

    }, {
      key: 'reflow',
      value: function reflow() {
        this.calcPoints();
        this._updateActive();
      }

      /**
       * Updates the visibility of an active location link, and updates the url hash for the page, if deepLinking enabled.
       * @private
       * @function
       * @fires Magellan#update
       */

    }, {
      key: '_updateActive',
      value: function _updateActive() /*evt, elem, scrollPos*/{
        var winPos = /*scrollPos ||*/parseInt(window.pageYOffset, 10),
            curIdx;

        if (winPos + this.winHeight === this.docHeight) {
          curIdx = this.points.length - 1;
        } else if (winPos < this.points[0]) {
          curIdx = 0;
        } else {
          var isDown = this.scrollPos < winPos,
              _this = this,
              curVisible = this.points.filter(function (p, i) {
            return isDown ? p <= winPos : p - _this.options.threshold <= winPos; //&& winPos >= _this.points[i -1] - _this.options.threshold;
          });
          curIdx = curVisible.length ? curVisible.length - 1 : 0;
        }

        this.$active.removeClass(this.options.activeClass);
        this.$active = this.$links.eq(curIdx).addClass(this.options.activeClass);

        if (this.options.deepLinking) {
          var hash = this.$active[0].getAttribute('href');
          if (window.history.pushState) {
            window.history.pushState(null, null, hash);
          } else {
            window.location.hash = hash;
          }
        }

        this.scrollPos = winPos;
        /**
         * Fires when magellan is finished updating to the new active element.
         * @event Magellan#update
         */
        this.$element.trigger('update.zf.magellan', [this.$active]);
      }

      /**
       * Destroys an instance of Magellan and resets the url of the window.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.off('.zf.trigger .zf.magellan').find('.' + this.options.activeClass).removeClass(this.options.activeClass);

        if (this.options.deepLinking) {
          var hash = this.$active[0].getAttribute('href');
          window.location.hash.replace(hash, '');
        }

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Magellan;
  }();

  /**
   * Default settings for plugin
   */


  Magellan.defaults = {
    /**
     * Amount of time, in ms, the animated scrolling should take between locations.
     * @option
     * @example 500
     */
    animationDuration: 500,
    /**
     * Animation style to use when scrolling between locations.
     * @option
     * @example 'ease-in-out'
     */
    animationEasing: 'linear',
    /**
     * Number of pixels to use as a marker for location changes.
     * @option
     * @example 50
     */
    threshold: 50,
    /**
     * Class applied to the active locations link on the magellan container.
     * @option
     * @example 'active'
     */
    activeClass: 'active',
    /**
     * Allows the script to manipulate the url of the current page, and if supported, alter the history.
     * @option
     * @example true
     */
    deepLinking: false,
    /**
     * Number of pixels to offset the scroll of the page on item click if using a sticky nav bar.
     * @option
     * @example 25
     */
    barOffset: 0
  };

  // Window exports
  Foundation.plugin(Magellan, 'Magellan');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * OffCanvas module.
   * @module foundation.offcanvas
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.triggers
   * @requires foundation.util.motion
   */

  var OffCanvas = function () {
    /**
     * Creates a new instance of an off-canvas wrapper.
     * @class
     * @fires OffCanvas#init
     * @param {Object} element - jQuery object to initialize.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function OffCanvas(element, options) {
      _classCallCheck(this, OffCanvas);

      this.$element = element;
      this.options = $.extend({}, OffCanvas.defaults, this.$element.data(), options);
      this.$lastTrigger = $();

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'OffCanvas');
    }

    /**
     * Initializes the off-canvas wrapper by adding the exit overlay (if needed).
     * @function
     * @private
     */


    _createClass(OffCanvas, [{
      key: '_init',
      value: function _init() {
        var id = this.$element.attr('id');

        this.$element.attr('aria-hidden', 'true');

        // Find triggers that affect this element and add aria-expanded to them
        $(document).find('[data-open="' + id + '"], [data-close="' + id + '"], [data-toggle="' + id + '"]').attr('aria-expanded', 'false').attr('aria-controls', id);

        // Add a close trigger over the body if necessary
        if (this.options.closeOnClick) {
          if ($('.js-off-canvas-exit').length) {
            this.$exiter = $('.js-off-canvas-exit');
          } else {
            var exiter = document.createElement('div');
            exiter.setAttribute('class', 'js-off-canvas-exit');
            $('[data-off-canvas-content]').append(exiter);

            this.$exiter = $(exiter);
          }
        }

        this.options.isRevealed = this.options.isRevealed || new RegExp(this.options.revealClass, 'g').test(this.$element[0].className);

        if (this.options.isRevealed) {
          this.options.revealOn = this.options.revealOn || this.$element[0].className.match(/(reveal-for-medium|reveal-for-large)/g)[0].split('-')[2];
          this._setMQChecker();
        }
        if (!this.options.transitionTime) {
          this.options.transitionTime = parseFloat(window.getComputedStyle($('[data-off-canvas-wrapper]')[0]).transitionDuration) * 1000;
        }
      }

      /**
       * Adds event handlers to the off-canvas wrapper and the exit overlay.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        this.$element.off('.zf.trigger .zf.offcanvas').on({
          'open.zf.trigger': this.open.bind(this),
          'close.zf.trigger': this.close.bind(this),
          'toggle.zf.trigger': this.toggle.bind(this),
          'keydown.zf.offcanvas': this._handleKeyboard.bind(this)
        });

        if (this.options.closeOnClick && this.$exiter.length) {
          this.$exiter.on({ 'click.zf.offcanvas': this.close.bind(this) });
        }
      }

      /**
       * Applies event listener for elements that will reveal at certain breakpoints.
       * @private
       */

    }, {
      key: '_setMQChecker',
      value: function _setMQChecker() {
        var _this = this;

        $(window).on('changed.zf.mediaquery', function () {
          if (Foundation.MediaQuery.atLeast(_this.options.revealOn)) {
            _this.reveal(true);
          } else {
            _this.reveal(false);
          }
        }).one('load.zf.offcanvas', function () {
          if (Foundation.MediaQuery.atLeast(_this.options.revealOn)) {
            _this.reveal(true);
          }
        });
      }

      /**
       * Handles the revealing/hiding the off-canvas at breakpoints, not the same as open.
       * @param {Boolean} isRevealed - true if element should be revealed.
       * @function
       */

    }, {
      key: 'reveal',
      value: function reveal(isRevealed) {
        var $closer = this.$element.find('[data-close]');
        if (isRevealed) {
          this.close();
          this.isRevealed = true;
          // if (!this.options.forceTop) {
          //   var scrollPos = parseInt(window.pageYOffset);
          //   this.$element[0].style.transform = 'translate(0,' + scrollPos + 'px)';
          // }
          // if (this.options.isSticky) { this._stick(); }
          this.$element.off('open.zf.trigger toggle.zf.trigger');
          if ($closer.length) {
            $closer.hide();
          }
        } else {
          this.isRevealed = false;
          // if (this.options.isSticky || !this.options.forceTop) {
          //   this.$element[0].style.transform = '';
          //   $(window).off('scroll.zf.offcanvas');
          // }
          this.$element.on({
            'open.zf.trigger': this.open.bind(this),
            'toggle.zf.trigger': this.toggle.bind(this)
          });
          if ($closer.length) {
            $closer.show();
          }
        }
      }

      /**
       * Opens the off-canvas menu.
       * @function
       * @param {Object} event - Event object passed from listener.
       * @param {jQuery} trigger - element that triggered the off-canvas to open.
       * @fires OffCanvas#opened
       */

    }, {
      key: 'open',
      value: function open(event, trigger) {
        if (this.$element.hasClass('is-open') || this.isRevealed) {
          return;
        }
        var _this = this,
            $body = $(document.body);

        if (this.options.forceTop) {
          $('body').scrollTop(0);
        }
        // window.pageYOffset = 0;

        // if (!this.options.forceTop) {
        //   var scrollPos = parseInt(window.pageYOffset);
        //   this.$element[0].style.transform = 'translate(0,' + scrollPos + 'px)';
        //   if (this.$exiter.length) {
        //     this.$exiter[0].style.transform = 'translate(0,' + scrollPos + 'px)';
        //   }
        // }
        /**
         * Fires when the off-canvas menu opens.
         * @event OffCanvas#opened
         */
        Foundation.Move(this.options.transitionTime, this.$element, function () {
          $('[data-off-canvas-wrapper]').addClass('is-off-canvas-open is-open-' + _this.options.position);

          _this.$element.addClass('is-open');

          // if (_this.options.isSticky) {
          //   _this._stick();
          // }
        });
        this.$element.attr('aria-hidden', 'false').trigger('opened.zf.offcanvas');

        if (this.options.closeOnClick) {
          this.$exiter.addClass('is-visible');
        }

        if (trigger) {
          this.$lastTrigger = trigger.attr('aria-expanded', 'true');
        }

        if (this.options.autoFocus) {
          this.$element.one(Foundation.transitionend(this.$element), function () {
            _this.$element.find('a, button').eq(0).focus();
          });
        }

        if (this.options.trapFocus) {
          $('[data-off-canvas-content]').attr('tabindex', '-1');
          this._trapFocus();
        }
      }

      /**
       * Traps focus within the offcanvas on open.
       * @private
       */

    }, {
      key: '_trapFocus',
      value: function _trapFocus() {
        var focusable = Foundation.Keyboard.findFocusable(this.$element),
            first = focusable.eq(0),
            last = focusable.eq(-1);

        focusable.off('.zf.offcanvas').on('keydown.zf.offcanvas', function (e) {
          if (e.which === 9 || e.keycode === 9) {
            if (e.target === last[0] && !e.shiftKey) {
              e.preventDefault();
              first.focus();
            }
            if (e.target === first[0] && e.shiftKey) {
              e.preventDefault();
              last.focus();
            }
          }
        });
      }

      /**
       * Allows the offcanvas to appear sticky utilizing translate properties.
       * @private
       */
      // OffCanvas.prototype._stick = function() {
      //   var elStyle = this.$element[0].style;
      //
      //   if (this.options.closeOnClick) {
      //     var exitStyle = this.$exiter[0].style;
      //   }
      //
      //   $(window).on('scroll.zf.offcanvas', function(e) {
      //     console.log(e);
      //     var pageY = window.pageYOffset;
      //     elStyle.transform = 'translate(0,' + pageY + 'px)';
      //     if (exitStyle !== undefined) { exitStyle.transform = 'translate(0,' + pageY + 'px)'; }
      //   });
      //   // this.$element.trigger('stuck.zf.offcanvas');
      // };
      /**
       * Closes the off-canvas menu.
       * @function
       * @param {Function} cb - optional cb to fire after closure.
       * @fires OffCanvas#closed
       */

    }, {
      key: 'close',
      value: function close(cb) {
        if (!this.$element.hasClass('is-open') || this.isRevealed) {
          return;
        }

        var _this = this;

        //  Foundation.Move(this.options.transitionTime, this.$element, function() {
        $('[data-off-canvas-wrapper]').removeClass('is-off-canvas-open is-open-' + _this.options.position);
        _this.$element.removeClass('is-open');
        // Foundation._reflow();
        // });
        this.$element.attr('aria-hidden', 'true')
        /**
         * Fires when the off-canvas menu opens.
         * @event OffCanvas#closed
         */
        .trigger('closed.zf.offcanvas');
        // if (_this.options.isSticky || !_this.options.forceTop) {
        //   setTimeout(function() {
        //     _this.$element[0].style.transform = '';
        //     $(window).off('scroll.zf.offcanvas');
        //   }, this.options.transitionTime);
        // }
        if (this.options.closeOnClick) {
          this.$exiter.removeClass('is-visible');
        }

        this.$lastTrigger.attr('aria-expanded', 'false');
        if (this.options.trapFocus) {
          $('[data-off-canvas-content]').removeAttr('tabindex');
        }
      }

      /**
       * Toggles the off-canvas menu open or closed.
       * @function
       * @param {Object} event - Event object passed from listener.
       * @param {jQuery} trigger - element that triggered the off-canvas to open.
       */

    }, {
      key: 'toggle',
      value: function toggle(event, trigger) {
        if (this.$element.hasClass('is-open')) {
          this.close(event, trigger);
        } else {
          this.open(event, trigger);
        }
      }

      /**
       * Handles keyboard input when detected. When the escape key is pressed, the off-canvas menu closes, and focus is restored to the element that opened the menu.
       * @function
       * @private
       */

    }, {
      key: '_handleKeyboard',
      value: function _handleKeyboard(event) {
        if (event.which !== 27) return;

        event.stopPropagation();
        event.preventDefault();
        this.close();
        this.$lastTrigger.focus();
      }

      /**
       * Destroys the offcanvas plugin.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.close();
        this.$element.off('.zf.trigger .zf.offcanvas');
        this.$exiter.off('.zf.offcanvas');

        Foundation.unregisterPlugin(this);
      }
    }]);

    return OffCanvas;
  }();

  OffCanvas.defaults = {
    /**
     * Allow the user to click outside of the menu to close it.
     * @option
     * @example true
     */
    closeOnClick: true,

    /**
     * Amount of time in ms the open and close transition requires. If none selected, pulls from body style.
     * @option
     * @example 500
     */
    transitionTime: 0,

    /**
     * Direction the offcanvas opens from. Determines class applied to body.
     * @option
     * @example left
     */
    position: 'left',

    /**
     * Force the page to scroll to top on open.
     * @option
     * @example true
     */
    forceTop: true,

    /**
     * Allow the offcanvas to remain open for certain breakpoints.
     * @option
     * @example false
     */
    isRevealed: false,

    /**
     * Breakpoint at which to reveal. JS will use a RegExp to target standard classes, if changing classnames, pass your class with the `revealClass` option.
     * @option
     * @example reveal-for-large
     */
    revealOn: null,

    /**
     * Force focus to the offcanvas on open. If true, will focus the opening trigger on close.
     * @option
     * @example true
     */
    autoFocus: true,

    /**
     * Class used to force an offcanvas to remain open. Foundation defaults for this are `reveal-for-large` & `reveal-for-medium`.
     * @option
     * TODO improve the regex testing for this.
     * @example reveal-for-large
     */
    revealClass: 'reveal-for-',

    /**
     * Triggers optional focus trapping when opening an offcanvas. Sets tabindex of [data-off-canvas-content] to -1 for accessibility purposes.
     * @option
     * @example true
     */
    trapFocus: false
  };

  // Window exports
  Foundation.plugin(OffCanvas, 'OffCanvas');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Orbit module.
   * @module foundation.orbit
   * @requires foundation.util.keyboard
   * @requires foundation.util.motion
   * @requires foundation.util.timerAndImageLoader
   * @requires foundation.util.touch
   */

  var Orbit = function () {
    /**
    * Creates a new instance of an orbit carousel.
    * @class
    * @param {jQuery} element - jQuery object to make into an Orbit Carousel.
    * @param {Object} options - Overrides to the default plugin settings.
    */

    function Orbit(element, options) {
      _classCallCheck(this, Orbit);

      this.$element = element;
      this.options = $.extend({}, Orbit.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Orbit');
      Foundation.Keyboard.register('Orbit', {
        'ltr': {
          'ARROW_RIGHT': 'next',
          'ARROW_LEFT': 'previous'
        },
        'rtl': {
          'ARROW_LEFT': 'next',
          'ARROW_RIGHT': 'previous'
        }
      });
    }

    /**
    * Initializes the plugin by creating jQuery collections, setting attributes, and starting the animation.
    * @function
    * @private
    */


    _createClass(Orbit, [{
      key: '_init',
      value: function _init() {
        this.$wrapper = this.$element.find('.' + this.options.containerClass);
        this.$slides = this.$element.find('.' + this.options.slideClass);
        var $images = this.$element.find('img'),
            initActive = this.$slides.filter('.is-active');

        if (!initActive.length) {
          this.$slides.eq(0).addClass('is-active');
        }

        if (!this.options.useMUI) {
          this.$slides.addClass('no-motionui');
        }

        if ($images.length) {
          Foundation.onImagesLoaded($images, this._prepareForOrbit.bind(this));
        } else {
          this._prepareForOrbit(); //hehe
        }

        if (this.options.bullets) {
          this._loadBullets();
        }

        this._events();

        if (this.options.autoPlay && this.$slides.length > 1) {
          this.geoSync();
        }

        if (this.options.accessible) {
          // allow wrapper to be focusable to enable arrow navigation
          this.$wrapper.attr('tabindex', 0);
        }
      }

      /**
      * Creates a jQuery collection of bullets, if they are being used.
      * @function
      * @private
      */

    }, {
      key: '_loadBullets',
      value: function _loadBullets() {
        this.$bullets = this.$element.find('.' + this.options.boxOfBullets).find('button');
      }

      /**
      * Sets a `timer` object on the orbit, and starts the counter for the next slide.
      * @function
      */

    }, {
      key: 'geoSync',
      value: function geoSync() {
        var _this = this;
        this.timer = new Foundation.Timer(this.$element, {
          duration: this.options.timerDelay,
          infinite: false
        }, function () {
          _this.changeSlide(true);
        });
        this.timer.start();
      }

      /**
      * Sets wrapper and slide heights for the orbit.
      * @function
      * @private
      */

    }, {
      key: '_prepareForOrbit',
      value: function _prepareForOrbit() {
        var _this = this;
        this._setWrapperHeight(function (max) {
          _this._setSlideHeight(max);
        });
      }

      /**
      * Calulates the height of each slide in the collection, and uses the tallest one for the wrapper height.
      * @function
      * @private
      * @param {Function} cb - a callback function to fire when complete.
      */

    }, {
      key: '_setWrapperHeight',
      value: function _setWrapperHeight(cb) {
        //rewrite this to `for` loop
        var max = 0,
            temp,
            counter = 0;

        this.$slides.each(function () {
          temp = this.getBoundingClientRect().height;
          $(this).attr('data-slide', counter);

          if (counter) {
            //if not the first slide, set css position and display property
            $(this).css({ 'position': 'relative', 'display': 'none' });
          }
          max = temp > max ? temp : max;
          counter++;
        });

        if (counter === this.$slides.length) {
          this.$wrapper.css({ 'height': max }); //only change the wrapper height property once.
          cb(max); //fire callback with max height dimension.
        }
      }

      /**
      * Sets the max-height of each slide.
      * @function
      * @private
      */

    }, {
      key: '_setSlideHeight',
      value: function _setSlideHeight(height) {
        this.$slides.each(function () {
          $(this).css('max-height', height);
        });
      }

      /**
      * Adds event listeners to basically everything within the element.
      * @function
      * @private
      */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        //***************************************
        //**Now using custom event - thanks to:**
        //**      Yohai Ararat of Toronto      **
        //***************************************
        if (this.$slides.length > 1) {

          if (this.options.swipe) {
            this.$slides.off('swipeleft.zf.orbit swiperight.zf.orbit').on('swipeleft.zf.orbit', function (e) {
              e.preventDefault();
              _this.changeSlide(true);
            }).on('swiperight.zf.orbit', function (e) {
              e.preventDefault();
              _this.changeSlide(false);
            });
          }
          //***************************************

          if (this.options.autoPlay) {
            this.$slides.on('click.zf.orbit', function () {
              _this.$element.data('clickedOn', _this.$element.data('clickedOn') ? false : true);
              _this.timer[_this.$element.data('clickedOn') ? 'pause' : 'start']();
            });

            if (this.options.pauseOnHover) {
              this.$element.on('mouseenter.zf.orbit', function () {
                _this.timer.pause();
              }).on('mouseleave.zf.orbit', function () {
                if (!_this.$element.data('clickedOn')) {
                  _this.timer.start();
                }
              });
            }
          }

          if (this.options.navButtons) {
            var $controls = this.$element.find('.' + this.options.nextClass + ', .' + this.options.prevClass);
            $controls.attr('tabindex', 0)
            //also need to handle enter/return and spacebar key presses
            .on('click.zf.orbit touchend.zf.orbit', function () {
              _this.changeSlide($(this).hasClass(_this.options.nextClass));
            });
          }

          if (this.options.bullets) {
            this.$bullets.on('click.zf.orbit touchend.zf.orbit', function () {
              if (/is-active/g.test(this.className)) {
                return false;
              } //if this is active, kick out of function.
              var idx = $(this).data('slide'),
                  ltr = idx > _this.$slides.filter('.is-active').data('slide'),
                  $slide = _this.$slides.eq(idx);

              _this.changeSlide(ltr, $slide, idx);
            });
          }

          this.$wrapper.add(this.$bullets).on('keydown.zf.orbit', function (e) {
            // handle keyboard event with keyboard util
            Foundation.Keyboard.handleKey(e, 'Orbit', {
              next: function () {
                _this.changeSlide(true);
              },
              previous: function () {
                _this.changeSlide(false);
              },
              handled: function () {
                // if bullet is focused, make sure focus moves
                if ($(e.target).is(_this.$bullets)) {
                  _this.$bullets.filter('.is-active').focus();
                }
              }
            });
          });
        }
      }

      /**
      * Changes the current slide to a new one.
      * @function
      * @param {Boolean} isLTR - flag if the slide should move left to right.
      * @param {jQuery} chosenSlide - the jQuery element of the slide to show next, if one is selected.
      * @param {Number} idx - the index of the new slide in its collection, if one chosen.
      * @fires Orbit#slidechange
      */

    }, {
      key: 'changeSlide',
      value: function changeSlide(isLTR, chosenSlide, idx) {
        var $curSlide = this.$slides.filter('.is-active').eq(0);

        if (/mui/g.test($curSlide[0].className)) {
          return false;
        } //if the slide is currently animating, kick out of the function

        var $firstSlide = this.$slides.first(),
            $lastSlide = this.$slides.last(),
            dirIn = isLTR ? 'Right' : 'Left',
            dirOut = isLTR ? 'Left' : 'Right',
            _this = this,
            $newSlide;

        if (!chosenSlide) {
          //most of the time, this will be auto played or clicked from the navButtons.
          $newSlide = isLTR ? //if wrapping enabled, check to see if there is a `next` or `prev` sibling, if not, select the first or last slide to fill in. if wrapping not enabled, attempt to select `next` or `prev`, if there's nothing there, the function will kick out on next step. CRAZY NESTED TERNARIES!!!!!
          this.options.infiniteWrap ? $curSlide.next('.' + this.options.slideClass).length ? $curSlide.next('.' + this.options.slideClass) : $firstSlide : $curSlide.next('.' + this.options.slideClass) : //pick next slide if moving left to right
          this.options.infiniteWrap ? $curSlide.prev('.' + this.options.slideClass).length ? $curSlide.prev('.' + this.options.slideClass) : $lastSlide : $curSlide.prev('.' + this.options.slideClass); //pick prev slide if moving right to left
        } else {
            $newSlide = chosenSlide;
          }

        if ($newSlide.length) {
          if (this.options.bullets) {
            idx = idx || this.$slides.index($newSlide); //grab index to update bullets
            this._updateBullets(idx);
          }

          if (this.options.useMUI) {
            Foundation.Motion.animateIn($newSlide.addClass('is-active').css({ 'position': 'absolute', 'top': 0 }), this.options['animInFrom' + dirIn], function () {
              $newSlide.css({ 'position': 'relative', 'display': 'block' }).attr('aria-live', 'polite');
            });

            Foundation.Motion.animateOut($curSlide.removeClass('is-active'), this.options['animOutTo' + dirOut], function () {
              $curSlide.removeAttr('aria-live');
              if (_this.options.autoPlay && !_this.timer.isPaused) {
                _this.timer.restart();
              }
              //do stuff?
            });
          } else {
              $curSlide.removeClass('is-active is-in').removeAttr('aria-live').hide();
              $newSlide.addClass('is-active is-in').attr('aria-live', 'polite').show();
              if (this.options.autoPlay && !this.timer.isPaused) {
                this.timer.restart();
              }
            }
          /**
          * Triggers when the slide has finished animating in.
          * @event Orbit#slidechange
          */
          this.$element.trigger('slidechange.zf.orbit', [$newSlide]);
        }
      }

      /**
      * Updates the active state of the bullets, if displayed.
      * @function
      * @private
      * @param {Number} idx - the index of the current slide.
      */

    }, {
      key: '_updateBullets',
      value: function _updateBullets(idx) {
        var $oldBullet = this.$element.find('.' + this.options.boxOfBullets).find('.is-active').removeClass('is-active').blur(),
            span = $oldBullet.find('span:last').detach(),
            $newBullet = this.$bullets.eq(idx).addClass('is-active').append(span);
      }

      /**
      * Destroys the carousel and hides the element.
      * @function
      */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.off('.zf.orbit').find('*').off('.zf.orbit').end().hide();
        Foundation.unregisterPlugin(this);
      }
    }]);

    return Orbit;
  }();

  Orbit.defaults = {
    /**
    * Tells the JS to look for and loadBullets.
    * @option
    * @example true
    */
    bullets: true,
    /**
    * Tells the JS to apply event listeners to nav buttons
    * @option
    * @example true
    */
    navButtons: true,
    /**
    * motion-ui animation class to apply
    * @option
    * @example 'slide-in-right'
    */
    animInFromRight: 'slide-in-right',
    /**
    * motion-ui animation class to apply
    * @option
    * @example 'slide-out-right'
    */
    animOutToRight: 'slide-out-right',
    /**
    * motion-ui animation class to apply
    * @option
    * @example 'slide-in-left'
    *
    */
    animInFromLeft: 'slide-in-left',
    /**
    * motion-ui animation class to apply
    * @option
    * @example 'slide-out-left'
    */
    animOutToLeft: 'slide-out-left',
    /**
    * Allows Orbit to automatically animate on page load.
    * @option
    * @example true
    */
    autoPlay: true,
    /**
    * Amount of time, in ms, between slide transitions
    * @option
    * @example 5000
    */
    timerDelay: 5000,
    /**
    * Allows Orbit to infinitely loop through the slides
    * @option
    * @example true
    */
    infiniteWrap: true,
    /**
    * Allows the Orbit slides to bind to swipe events for mobile, requires an additional util library
    * @option
    * @example true
    */
    swipe: true,
    /**
    * Allows the timing function to pause animation on hover.
    * @option
    * @example true
    */
    pauseOnHover: true,
    /**
    * Allows Orbit to bind keyboard events to the slider, to animate frames with arrow keys
    * @option
    * @example true
    */
    accessible: true,
    /**
    * Class applied to the container of Orbit
    * @option
    * @example 'orbit-container'
    */
    containerClass: 'orbit-container',
    /**
    * Class applied to individual slides.
    * @option
    * @example 'orbit-slide'
    */
    slideClass: 'orbit-slide',
    /**
    * Class applied to the bullet container. You're welcome.
    * @option
    * @example 'orbit-bullets'
    */
    boxOfBullets: 'orbit-bullets',
    /**
    * Class applied to the `next` navigation button.
    * @option
    * @example 'orbit-next'
    */
    nextClass: 'orbit-next',
    /**
    * Class applied to the `previous` navigation button.
    * @option
    * @example 'orbit-previous'
    */
    prevClass: 'orbit-previous',
    /**
    * Boolean to flag the js to use motion ui classes or not. Default to true for backwards compatability.
    * @option
    * @example true
    */
    useMUI: true
  };

  // Window exports
  Foundation.plugin(Orbit, 'Orbit');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * ResponsiveMenu module.
   * @module foundation.responsiveMenu
   * @requires foundation.util.triggers
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.accordionMenu
   * @requires foundation.util.drilldown
   * @requires foundation.util.dropdown-menu
   */

  var ResponsiveMenu = function () {
    /**
     * Creates a new instance of a responsive menu.
     * @class
     * @fires ResponsiveMenu#init
     * @param {jQuery} element - jQuery object to make into a dropdown menu.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function ResponsiveMenu(element, options) {
      _classCallCheck(this, ResponsiveMenu);

      this.$element = $(element);
      this.rules = this.$element.data('responsive-menu');
      this.currentMq = null;
      this.currentPlugin = null;

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'ResponsiveMenu');
    }

    /**
     * Initializes the Menu by parsing the classes from the 'data-ResponsiveMenu' attribute on the element.
     * @function
     * @private
     */


    _createClass(ResponsiveMenu, [{
      key: '_init',
      value: function _init() {
        var rulesTree = {};

        // Parse rules from "classes" in data attribute
        var rules = this.rules.split(' ');

        // Iterate through every rule found
        for (var i = 0; i < rules.length; i++) {
          var rule = rules[i].split('-');
          var ruleSize = rule.length > 1 ? rule[0] : 'small';
          var rulePlugin = rule.length > 1 ? rule[1] : rule[0];

          if (MenuPlugins[rulePlugin] !== null) {
            rulesTree[ruleSize] = MenuPlugins[rulePlugin];
          }
        }

        this.rules = rulesTree;

        if (!$.isEmptyObject(rulesTree)) {
          this._checkMediaQueries();
        }
      }

      /**
       * Initializes events for the Menu.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        $(window).on('changed.zf.mediaquery', function () {
          _this._checkMediaQueries();
        });
        // $(window).on('resize.zf.ResponsiveMenu', function() {
        //   _this._checkMediaQueries();
        // });
      }

      /**
       * Checks the current screen width against available media queries. If the media query has changed, and the plugin needed has changed, the plugins will swap out.
       * @function
       * @private
       */

    }, {
      key: '_checkMediaQueries',
      value: function _checkMediaQueries() {
        var matchedMq,
            _this = this;
        // Iterate through each rule and find the last matching rule
        $.each(this.rules, function (key) {
          if (Foundation.MediaQuery.atLeast(key)) {
            matchedMq = key;
          }
        });

        // No match? No dice
        if (!matchedMq) return;

        // Plugin already initialized? We good
        if (this.currentPlugin instanceof this.rules[matchedMq].plugin) return;

        // Remove existing plugin-specific CSS classes
        $.each(MenuPlugins, function (key, value) {
          _this.$element.removeClass(value.cssClass);
        });

        // Add the CSS class for the new plugin
        this.$element.addClass(this.rules[matchedMq].cssClass);

        // Create an instance of the new plugin
        if (this.currentPlugin) this.currentPlugin.destroy();
        this.currentPlugin = new this.rules[matchedMq].plugin(this.$element, {});
      }

      /**
       * Destroys the instance of the current plugin on this element, as well as the window resize handler that switches the plugins out.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.currentPlugin.destroy();
        $(window).off('.zf.ResponsiveMenu');
        Foundation.unregisterPlugin(this);
      }
    }]);

    return ResponsiveMenu;
  }();

  ResponsiveMenu.defaults = {};

  // The plugin matches the plugin classes with these plugin instances.
  var MenuPlugins = {
    dropdown: {
      cssClass: 'dropdown',
      plugin: Foundation._plugins['dropdown-menu'] || null
    },
    drilldown: {
      cssClass: 'drilldown',
      plugin: Foundation._plugins['drilldown'] || null
    },
    accordion: {
      cssClass: 'accordion-menu',
      plugin: Foundation._plugins['accordion-menu'] || null
    }
  };

  // Window exports
  Foundation.plugin(ResponsiveMenu, 'ResponsiveMenu');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * ResponsiveToggle module.
   * @module foundation.responsiveToggle
   * @requires foundation.util.mediaQuery
   */

  var ResponsiveToggle = function () {
    /**
     * Creates a new instance of Tab Bar.
     * @class
     * @fires ResponsiveToggle#init
     * @param {jQuery} element - jQuery object to attach tab bar functionality to.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function ResponsiveToggle(element, options) {
      _classCallCheck(this, ResponsiveToggle);

      this.$element = $(element);
      this.options = $.extend({}, ResponsiveToggle.defaults, this.$element.data(), options);

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'ResponsiveToggle');
    }

    /**
     * Initializes the tab bar by finding the target element, toggling element, and running update().
     * @function
     * @private
     */


    _createClass(ResponsiveToggle, [{
      key: '_init',
      value: function _init() {
        var targetID = this.$element.data('responsive-toggle');
        if (!targetID) {
          console.error('Your tab bar needs an ID of a Menu as the value of data-tab-bar.');
        }

        this.$targetMenu = $('#' + targetID);
        this.$toggler = this.$element.find('[data-toggle]');

        this._update();
      }

      /**
       * Adds necessary event handlers for the tab bar to work.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        $(window).on('changed.zf.mediaquery', this._update.bind(this));

        this.$toggler.on('click.zf.responsiveToggle', this.toggleMenu.bind(this));
      }

      /**
       * Checks the current media query to determine if the tab bar should be visible or hidden.
       * @function
       * @private
       */

    }, {
      key: '_update',
      value: function _update() {
        // Mobile
        if (!Foundation.MediaQuery.atLeast(this.options.hideFor)) {
          this.$element.show();
          this.$targetMenu.hide();
        }

        // Desktop
        else {
            this.$element.hide();
            this.$targetMenu.show();
          }
      }

      /**
       * Toggles the element attached to the tab bar. The toggle only happens if the screen is small enough to allow it.
       * @function
       * @fires ResponsiveToggle#toggled
       */

    }, {
      key: 'toggleMenu',
      value: function toggleMenu() {
        if (!Foundation.MediaQuery.atLeast(this.options.hideFor)) {
          this.$targetMenu.toggle(0);

          /**
           * Fires when the element attached to the tab bar toggles.
           * @event ResponsiveToggle#toggled
           */
          this.$element.trigger('toggled.zf.responsiveToggle');
        }
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        //TODO this...
      }
    }]);

    return ResponsiveToggle;
  }();

  ResponsiveToggle.defaults = {
    /**
     * The breakpoint after which the menu is always shown, and the tab bar is hidden.
     * @option
     * @example 'medium'
     */
    hideFor: 'medium'
  };

  // Window exports
  Foundation.plugin(ResponsiveToggle, 'ResponsiveToggle');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Reveal module.
   * @module foundation.reveal
   * @requires foundation.util.keyboard
   * @requires foundation.util.box
   * @requires foundation.util.triggers
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.motion if using animations
   */

  var Reveal = function () {
    /**
     * Creates a new instance of Reveal.
     * @class
     * @param {jQuery} element - jQuery object to use for the modal.
     * @param {Object} options - optional parameters.
     */

    function Reveal(element, options) {
      _classCallCheck(this, Reveal);

      this.$element = element;
      this.options = $.extend({}, Reveal.defaults, this.$element.data(), options);
      this._init();

      Foundation.registerPlugin(this, 'Reveal');
      Foundation.Keyboard.register('Reveal', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ESCAPE': 'close',
        'TAB': 'tab_forward',
        'SHIFT_TAB': 'tab_backward'
      });
    }

    /**
     * Initializes the modal by adding the overlay and close buttons, (if selected).
     * @private
     */


    _createClass(Reveal, [{
      key: '_init',
      value: function _init() {
        this.id = this.$element.attr('id');
        this.isActive = false;
        this.cached = { mq: Foundation.MediaQuery.current };
        this.isiOS = iPhoneSniff();

        if (this.isiOS) {
          this.$element.addClass('is-ios');
        }

        this.$anchor = $('[data-open="' + this.id + '"]').length ? $('[data-open="' + this.id + '"]') : $('[data-toggle="' + this.id + '"]');

        if (this.$anchor.length) {
          var anchorId = this.$anchor[0].id || Foundation.GetYoDigits(6, 'reveal');

          this.$anchor.attr({
            'aria-controls': this.id,
            'id': anchorId,
            'aria-haspopup': true,
            'tabindex': 0
          });
          this.$element.attr({ 'aria-labelledby': anchorId });
        }

        if (this.options.fullScreen || this.$element.hasClass('full')) {
          this.options.fullScreen = true;
          this.options.overlay = false;
        }
        if (this.options.overlay && !this.$overlay) {
          this.$overlay = this._makeOverlay(this.id);
        }

        this.$element.attr({
          'role': 'dialog',
          'aria-hidden': true,
          'data-yeti-box': this.id,
          'data-resize': this.id
        });

        if (this.$overlay) {
          this.$element.detach().appendTo(this.$overlay);
        } else {
          this.$element.detach().appendTo($('body'));
          this.$element.addClass('without-overlay');
        }
        this._events();
        if (this.options.deepLink && window.location.hash === '#' + this.id) {
          $(window).one('load.zf.reveal', this.open.bind(this));
        }
      }

      /**
       * Creates an overlay div to display behind the modal.
       * @private
       */

    }, {
      key: '_makeOverlay',
      value: function _makeOverlay(id) {
        var $overlay = $('<div></div>').addClass('reveal-overlay').attr({ 'tabindex': -1, 'aria-hidden': true }).appendTo('body');
        return $overlay;
      }

      /**
       * Updates position of modal
       * TODO:  Figure out if we actually need to cache these values or if it doesn't matter
       * @private
       */

    }, {
      key: '_updatePosition',
      value: function _updatePosition() {
        var width = this.$element.outerWidth();
        var outerWidth = $(window).width();
        var height = this.$element.outerHeight();
        var outerHeight = $(window).height();
        var left = parseInt((outerWidth - width) / 2, 10);
        var top;
        if (height > outerHeight) {
          top = parseInt(Math.min(100, outerHeight / 10), 10);
        } else {
          top = parseInt((outerHeight - height) / 4, 10);
        }
        this.$element.css({ top: top + 'px' });
        // only worry about left if we don't have an overlay, otherwise we're perfectly in the middle
        if (!this.$overlay) {
          this.$element.css({ left: left + 'px' });
        }
      }

      /**
       * Adds event handlers for the modal.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        this.$element.on({
          'open.zf.trigger': this.open.bind(this),
          'close.zf.trigger': this.close.bind(this),
          'toggle.zf.trigger': this.toggle.bind(this),
          'resizeme.zf.trigger': function () {
            _this._updatePosition();
          }
        });

        if (this.$anchor.length) {
          this.$anchor.on('keydown.zf.reveal', function (e) {
            if (e.which === 13 || e.which === 32) {
              e.stopPropagation();
              e.preventDefault();
              _this.open();
            }
          });
        }

        if (this.options.closeOnClick && this.options.overlay) {
          this.$overlay.off('.zf.reveal').on('click.zf.reveal', function (e) {
            if (e.target === _this.$element[0] || $.contains(_this.$element[0], e.target)) {
              return;
            }
            _this.close();
          });
        }
        if (this.options.deepLink) {
          $(window).on('popstate.zf.reveal:' + this.id, this._handleState.bind(this));
        }
      }

      /**
       * Handles modal methods on back/forward button clicks or any other event that triggers popstate.
       * @private
       */

    }, {
      key: '_handleState',
      value: function _handleState(e) {
        if (window.location.hash === '#' + this.id && !this.isActive) {
          this.open();
        } else {
          this.close();
        }
      }

      /**
       * Opens the modal controlled by `this.$anchor`, and closes all others by default.
       * @function
       * @fires Reveal#closeme
       * @fires Reveal#open
       */

    }, {
      key: 'open',
      value: function open() {
        var _this2 = this;

        if (this.options.deepLink) {
          var hash = '#' + this.id;

          if (window.history.pushState) {
            window.history.pushState(null, null, hash);
          } else {
            window.location.hash = hash;
          }
        }

        this.isActive = true;

        // Make elements invisible, but remove display: none so we can get size and positioning
        this.$element.css({ 'visibility': 'hidden' }).show().scrollTop(0);
        if (this.options.overlay) {
          this.$overlay.css({ 'visibility': 'hidden' }).show();
        }

        this._updatePosition();

        this.$element.hide().css({ 'visibility': '' });

        if (this.$overlay) {
          this.$overlay.css({ 'visibility': '' }).hide();
        }

        if (!this.options.multipleOpened) {
          /**
           * Fires immediately before the modal opens.
           * Closes any other modals that are currently open
           * @event Reveal#closeme
           */
          this.$element.trigger('closeme.zf.reveal', this.id);
        }

        // Motion UI method of reveal
        if (this.options.animationIn) {
          if (this.options.overlay) {
            Foundation.Motion.animateIn(this.$overlay, 'fade-in');
          }
          Foundation.Motion.animateIn(this.$element, this.options.animationIn, function () {
            this.focusableElements = Foundation.Keyboard.findFocusable(this.$element);
          });
        }
        // jQuery method of reveal
        else {
            if (this.options.overlay) {
              this.$overlay.show(0);
            }
            this.$element.show(this.options.showDelay);
          }

        // handle accessibility
        this.$element.attr({
          'aria-hidden': false,
          'tabindex': -1
        }).focus();

        /**
         * Fires when the modal has successfully opened.
         * @event Reveal#open
         */
        this.$element.trigger('open.zf.reveal');

        if (this.isiOS) {
          var scrollPos = window.pageYOffset;
          $('html, body').addClass('is-reveal-open').scrollTop(scrollPos);
        } else {
          $('body').addClass('is-reveal-open');
        }

        $('body').addClass('is-reveal-open').attr('aria-hidden', this.options.overlay || this.options.fullScreen ? true : false);

        setTimeout(function () {
          _this2._extraHandlers();
        }, 0);
      }

      /**
       * Adds extra event handlers for the body and window if necessary.
       * @private
       */

    }, {
      key: '_extraHandlers',
      value: function _extraHandlers() {
        var _this = this;
        this.focusableElements = Foundation.Keyboard.findFocusable(this.$element);

        if (!this.options.overlay && this.options.closeOnClick && !this.options.fullScreen) {
          $('body').on('click.zf.reveal', function (e) {
            if (e.target === _this.$element[0] || $.contains(_this.$element[0], e.target)) {
              return;
            }
            _this.close();
          });
        }

        if (this.options.closeOnEsc) {
          $(window).on('keydown.zf.reveal', function (e) {
            Foundation.Keyboard.handleKey(e, 'Reveal', {
              close: function () {
                if (_this.options.closeOnEsc) {
                  _this.close();
                  _this.$anchor.focus();
                }
              }
            });
            if (_this.focusableElements.length === 0) {
              // no focusable elements inside the modal at all, prevent tabbing in general
              e.preventDefault();
            }
          });
        }

        // lock focus within modal while tabbing
        this.$element.on('keydown.zf.reveal', function (e) {
          var $target = $(this);
          // handle keyboard event with keyboard util
          Foundation.Keyboard.handleKey(e, 'Reveal', {
            tab_forward: function () {
              if (_this.$element.find(':focus').is(_this.focusableElements.eq(-1))) {
                // left modal downwards, setting focus to first element
                _this.focusableElements.eq(0).focus();
                e.preventDefault();
              }
            },
            tab_backward: function () {
              if (_this.$element.find(':focus').is(_this.focusableElements.eq(0)) || _this.$element.is(':focus')) {
                // left modal upwards, setting focus to last element
                _this.focusableElements.eq(-1).focus();
                e.preventDefault();
              }
            },
            open: function () {
              if (_this.$element.find(':focus').is(_this.$element.find('[data-close]'))) {
                setTimeout(function () {
                  // set focus back to anchor if close button has been activated
                  _this.$anchor.focus();
                }, 1);
              } else if ($target.is(_this.focusableElements)) {
                // dont't trigger if acual element has focus (i.e. inputs, links, ...)
                _this.open();
              }
            },
            close: function () {
              if (_this.options.closeOnEsc) {
                _this.close();
                _this.$anchor.focus();
              }
            }
          });
        });
      }

      /**
       * Closes the modal.
       * @function
       * @fires Reveal#closed
       */

    }, {
      key: 'close',
      value: function close() {
        if (!this.isActive || !this.$element.is(':visible')) {
          return false;
        }
        var _this = this;

        // Motion UI method of hiding
        if (this.options.animationOut) {
          if (this.options.overlay) {
            Foundation.Motion.animateOut(this.$overlay, 'fade-out', finishUp);
          } else {
            finishUp();
          }

          Foundation.Motion.animateOut(this.$element, this.options.animationOut);
        }
        // jQuery method of hiding
        else {
            if (this.options.overlay) {
              this.$overlay.hide(0, finishUp);
            } else {
              finishUp();
            }

            this.$element.hide(this.options.hideDelay);
          }

        // Conditionals to remove extra event listeners added on open
        if (this.options.closeOnEsc) {
          $(window).off('keydown.zf.reveal');
        }

        if (!this.options.overlay && this.options.closeOnClick) {
          $('body').off('click.zf.reveal');
        }

        this.$element.off('keydown.zf.reveal');

        function finishUp() {
          if (_this.isiOS) {
            $('html, body').removeClass('is-reveal-open');
          } else {
            $('body').removeClass('is-reveal-open');
          }

          $('body').attr({
            'aria-hidden': false,
            'tabindex': ''
          });

          _this.$element.attr('aria-hidden', true);

          /**
          * Fires when the modal is done closing.
          * @event Reveal#closed
          */
          _this.$element.trigger('closed.zf.reveal');
        }

        /**
        * Resets the modal content
        * This prevents a running video to keep going in the background
        */
        if (this.options.resetOnClose) {
          this.$element.html(this.$element.html());
        }

        this.isActive = false;
        if (_this.options.deepLink) {
          if (window.history.replaceState) {
            window.history.replaceState("", document.title, window.location.pathname);
          } else {
            window.location.hash = '';
          }
        }
      }

      /**
       * Toggles the open/closed state of a modal.
       * @function
       */

    }, {
      key: 'toggle',
      value: function toggle() {
        if (this.isActive) {
          this.close();
        } else {
          this.open();
        }
      }
    }, {
      key: 'destroy',


      /**
       * Destroys an instance of a modal.
       * @function
       */
      value: function destroy() {
        if (this.options.overlay) {
          this.$overlay.hide().off().remove();
        }
        this.$element.hide().off();
        this.$anchor.off('.zf');
        $(window).off('.zf.reveal:' + this.id);

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Reveal;
  }();

  Reveal.defaults = {
    /**
     * Motion-UI class to use for animated elements. If none used, defaults to simple show/hide.
     * @option
     * @example 'slide-in-left'
     */
    animationIn: '',
    /**
     * Motion-UI class to use for animated elements. If none used, defaults to simple show/hide.
     * @option
     * @example 'slide-out-right'
     */
    animationOut: '',
    /**
     * Time, in ms, to delay the opening of a modal after a click if no animation used.
     * @option
     * @example 10
     */
    showDelay: 0,
    /**
     * Time, in ms, to delay the closing of a modal after a click if no animation used.
     * @option
     * @example 10
     */
    hideDelay: 0,
    /**
     * Allows a click on the body/overlay to close the modal.
     * @option
     * @example true
     */
    closeOnClick: true,
    /**
     * Allows the modal to close if the user presses the `ESCAPE` key.
     * @option
     * @example true
     */
    closeOnEsc: true,
    /**
     * If true, allows multiple modals to be displayed at once.
     * @option
     * @example false
     */
    multipleOpened: false,
    /**
     * Distance, in pixels, the modal should push down from the top of the screen.
     * @option
     * @example 100
     */
    vOffset: 100,
    /**
     * Distance, in pixels, the modal should push in from the side of the screen.
     * @option
     * @example 0
     */
    hOffset: 0,
    /**
     * Allows the modal to be fullscreen, completely blocking out the rest of the view. JS checks for this as well.
     * @option
     * @example false
     */
    fullScreen: false,
    /**
     * Percentage of screen height the modal should push up from the bottom of the view.
     * @option
     * @example 10
     */
    btmOffsetPct: 10,
    /**
     * Allows the modal to generate an overlay div, which will cover the view when modal opens.
     * @option
     * @example true
     */
    overlay: true,
    /**
     * Allows the modal to remove and reinject markup on close. Should be true if using video elements w/o using provider's api, otherwise, videos will continue to play in the background.
     * @option
     * @example false
     */
    resetOnClose: false,
    /**
     * Allows the modal to alter the url on open/close, and allows the use of the `back` button to close modals. ALSO, allows a modal to auto-maniacally open on page load IF the hash === the modal's user-set id.
     * @option
     * @example false
     */
    deepLink: false
  };

  // Window exports
  Foundation.plugin(Reveal, 'Reveal');

  function iPhoneSniff() {
    return (/iP(ad|hone|od).*OS/.test(window.navigator.userAgent)
    );
  }
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Slider module.
   * @module foundation.slider
   * @requires foundation.util.motion
   * @requires foundation.util.triggers
   * @requires foundation.util.keyboard
   * @requires foundation.util.touch
   */

  var Slider = function () {
    /**
     * Creates a new instance of a drilldown menu.
     * @class
     * @param {jQuery} element - jQuery object to make into an accordion menu.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Slider(element, options) {
      _classCallCheck(this, Slider);

      this.$element = element;
      this.options = $.extend({}, Slider.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Slider');
      Foundation.Keyboard.register('Slider', {
        'ltr': {
          'ARROW_RIGHT': 'increase',
          'ARROW_UP': 'increase',
          'ARROW_DOWN': 'decrease',
          'ARROW_LEFT': 'decrease',
          'SHIFT_ARROW_RIGHT': 'increase_fast',
          'SHIFT_ARROW_UP': 'increase_fast',
          'SHIFT_ARROW_DOWN': 'decrease_fast',
          'SHIFT_ARROW_LEFT': 'decrease_fast'
        },
        'rtl': {
          'ARROW_LEFT': 'increase',
          'ARROW_RIGHT': 'decrease',
          'SHIFT_ARROW_LEFT': 'increase_fast',
          'SHIFT_ARROW_RIGHT': 'decrease_fast'
        }
      });
    }

    /**
     * Initilizes the plugin by reading/setting attributes, creating collections and setting the initial position of the handle(s).
     * @function
     * @private
     */


    _createClass(Slider, [{
      key: '_init',
      value: function _init() {
        this.inputs = this.$element.find('input');
        this.handles = this.$element.find('[data-slider-handle]');

        this.$handle = this.handles.eq(0);
        this.$input = this.inputs.length ? this.inputs.eq(0) : $('#' + this.$handle.attr('aria-controls'));
        this.$fill = this.$element.find('[data-slider-fill]').css(this.options.vertical ? 'height' : 'width', 0);

        var isDbl = false,
            _this = this;
        if (this.options.disabled || this.$element.hasClass(this.options.disabledClass)) {
          this.options.disabled = true;
          this.$element.addClass(this.options.disabledClass);
        }
        if (!this.inputs.length) {
          this.inputs = $().add(this.$input);
          this.options.binding = true;
        }
        this._setInitAttr(0);
        this._events(this.$handle);

        if (this.handles[1]) {
          this.options.doubleSided = true;
          this.$handle2 = this.handles.eq(1);
          this.$input2 = this.inputs.length > 1 ? this.inputs.eq(1) : $('#' + this.$handle2.attr('aria-controls'));

          if (!this.inputs[1]) {
            this.inputs = this.inputs.add(this.$input2);
          }
          isDbl = true;

          this._setHandlePos(this.$handle, this.options.initialStart, true, function () {

            _this._setHandlePos(_this.$handle2, _this.options.initialEnd, true);
          });
          // this.$handle.triggerHandler('click.zf.slider');
          this._setInitAttr(1);
          this._events(this.$handle2);
        }

        if (!isDbl) {
          this._setHandlePos(this.$handle, this.options.initialStart, true);
        }
      }

      /**
       * Sets the position of the selected handle and fill bar.
       * @function
       * @private
       * @param {jQuery} $hndl - the selected handle to move.
       * @param {Number} location - floating point between the start and end values of the slider bar.
       * @param {Function} cb - callback function to fire on completion.
       * @fires Slider#moved
       */

    }, {
      key: '_setHandlePos',
      value: function _setHandlePos($hndl, location, noInvert, cb) {
        //might need to alter that slightly for bars that will have odd number selections.
        location = parseFloat(location); //on input change events, convert string to number...grumble.

        // prevent slider from running out of bounds, if value exceeds the limits set through options, override the value to min/max
        if (location < this.options.start) {
          location = this.options.start;
        } else if (location > this.options.end) {
          location = this.options.end;
        }

        var isDbl = this.options.doubleSided;

        if (isDbl) {
          //this block is to prevent 2 handles from crossing eachother. Could/should be improved.
          if (this.handles.index($hndl) === 0) {
            var h2Val = parseFloat(this.$handle2.attr('aria-valuenow'));
            location = location >= h2Val ? h2Val - this.options.step : location;
          } else {
            var h1Val = parseFloat(this.$handle.attr('aria-valuenow'));
            location = location <= h1Val ? h1Val + this.options.step : location;
          }
        }

        //this is for single-handled vertical sliders, it adjusts the value to account for the slider being "upside-down"
        //for click and drag events, it's weird due to the scale(-1, 1) css property
        if (this.options.vertical && !noInvert) {
          location = this.options.end - location;
        }

        var _this = this,
            vert = this.options.vertical,
            hOrW = vert ? 'height' : 'width',
            lOrT = vert ? 'top' : 'left',
            handleDim = $hndl[0].getBoundingClientRect()[hOrW],
            elemDim = this.$element[0].getBoundingClientRect()[hOrW],

        //percentage of bar min/max value based on click or drag point
        pctOfBar = percent(location, this.options.end).toFixed(2),

        //number of actual pixels to shift the handle, based on the percentage obtained above
        pxToMove = (elemDim - handleDim) * pctOfBar,

        //percentage of bar to shift the handle
        movement = (percent(pxToMove, elemDim) * 100).toFixed(this.options.decimal);
        //fixing the decimal value for the location number, is passed to other methods as a fixed floating-point value
        location = parseFloat(location.toFixed(this.options.decimal));
        // declare empty object for css adjustments, only used with 2 handled-sliders
        var css = {};

        this._setValues($hndl, location);

        // TODO update to calculate based on values set to respective inputs??
        if (isDbl) {
          var isLeftHndl = this.handles.index($hndl) === 0,

          //empty variable, will be used for min-height/width for fill bar
          dim,

          //percentage w/h of the handle compared to the slider bar
          handlePct = ~ ~(percent(handleDim, elemDim) * 100);
          //if left handle, the math is slightly different than if it's the right handle, and the left/top property needs to be changed for the fill bar
          if (isLeftHndl) {
            //left or top percentage value to apply to the fill bar.
            css[lOrT] = movement + '%';
            //calculate the new min-height/width for the fill bar.
            dim = parseFloat(this.$handle2[0].style[lOrT]) - movement + handlePct;
            //this callback is necessary to prevent errors and allow the proper placement and initialization of a 2-handled slider
            //plus, it means we don't care if 'dim' isNaN on init, it won't be in the future.
            if (cb && typeof cb === 'function') {
              cb();
            } //this is only needed for the initialization of 2 handled sliders
          } else {
              //just caching the value of the left/bottom handle's left/top property
              var handlePos = parseFloat(this.$handle[0].style[lOrT]);
              //calculate the new min-height/width for the fill bar. Use isNaN to prevent false positives for numbers <= 0
              //based on the percentage of movement of the handle being manipulated, less the opposing handle's left/top position, plus the percentage w/h of the handle itself
              dim = movement - (isNaN(handlePos) ? this.options.initialStart / ((this.options.end - this.options.start) / 100) : handlePos) + handlePct;
            }
          // assign the min-height/width to our css object
          css['min-' + hOrW] = dim + '%';
        }

        this.$element.one('finished.zf.animate', function () {
          /**
           * Fires when the handle is done moving.
           * @event Slider#moved
           */
          _this.$element.trigger('moved.zf.slider', [$hndl]);
        });

        //because we don't know exactly how the handle will be moved, check the amount of time it should take to move.
        var moveTime = this.$element.data('dragging') ? 1000 / 60 : this.options.moveTime;

        Foundation.Move(moveTime, $hndl, function () {
          //adjusting the left/top property of the handle, based on the percentage calculated above
          $hndl.css(lOrT, movement + '%');

          if (!_this.options.doubleSided) {
            //if single-handled, a simple method to expand the fill bar
            _this.$fill.css(hOrW, pctOfBar * 100 + '%');
          } else {
            //otherwise, use the css object we created above
            _this.$fill.css(css);
          }
        });
      }

      /**
       * Sets the initial attribute for the slider element.
       * @function
       * @private
       * @param {Number} idx - index of the current handle/input to use.
       */

    }, {
      key: '_setInitAttr',
      value: function _setInitAttr(idx) {
        var id = this.inputs.eq(idx).attr('id') || Foundation.GetYoDigits(6, 'slider');
        this.inputs.eq(idx).attr({
          'id': id,
          'max': this.options.end,
          'min': this.options.start,
          'step': this.options.step
        });
        this.handles.eq(idx).attr({
          'role': 'slider',
          'aria-controls': id,
          'aria-valuemax': this.options.end,
          'aria-valuemin': this.options.start,
          'aria-valuenow': idx === 0 ? this.options.initialStart : this.options.initialEnd,
          'aria-orientation': this.options.vertical ? 'vertical' : 'horizontal',
          'tabindex': 0
        });
      }

      /**
       * Sets the input and `aria-valuenow` values for the slider element.
       * @function
       * @private
       * @param {jQuery} $handle - the currently selected handle.
       * @param {Number} val - floating point of the new value.
       */

    }, {
      key: '_setValues',
      value: function _setValues($handle, val) {
        var idx = this.options.doubleSided ? this.handles.index($handle) : 0;
        this.inputs.eq(idx).val(val);
        $handle.attr('aria-valuenow', val);
      }

      /**
       * Handles events on the slider element.
       * Calculates the new location of the current handle.
       * If there are two handles and the bar was clicked, it determines which handle to move.
       * @function
       * @private
       * @param {Object} e - the `event` object passed from the listener.
       * @param {jQuery} $handle - the current handle to calculate for, if selected.
       * @param {Number} val - floating point number for the new value of the slider.
       * TODO clean this up, there's a lot of repeated code between this and the _setHandlePos fn.
       */

    }, {
      key: '_handleEvent',
      value: function _handleEvent(e, $handle, val) {
        var value, hasVal;
        if (!val) {
          //click or drag events
          e.preventDefault();
          var _this = this,
              vertical = this.options.vertical,
              param = vertical ? 'height' : 'width',
              direction = vertical ? 'top' : 'left',
              pageXY = vertical ? e.pageY : e.pageX,
              halfOfHandle = this.$handle[0].getBoundingClientRect()[param] / 2,
              barDim = this.$element[0].getBoundingClientRect()[param],
              barOffset = this.$element.offset()[direction] - pageXY,

          //if the cursor position is less than or greater than the elements bounding coordinates, set coordinates within those bounds
          barXY = barOffset > 0 ? -halfOfHandle : barOffset - halfOfHandle < -barDim ? barDim : Math.abs(barOffset),
              offsetPct = percent(barXY, barDim);
          value = (this.options.end - this.options.start) * offsetPct;

          // turn everything around for RTL, yay math!
          if (Foundation.rtl() && !this.options.vertical) {
            value = this.options.end - value;
          }

          value = _this._adjustValue(null, value);
          //boolean flag for the setHandlePos fn, specifically for vertical sliders
          hasVal = false;

          if (!$handle) {
            //figure out which handle it is, pass it to the next function.
            var firstHndlPos = absPosition(this.$handle, direction, barXY, param),
                secndHndlPos = absPosition(this.$handle2, direction, barXY, param);
            $handle = firstHndlPos <= secndHndlPos ? this.$handle : this.$handle2;
          }
        } else {
          //change event on input
          value = this._adjustValue(null, val);
          hasVal = true;
        }

        this._setHandlePos($handle, value, hasVal);
      }

      /**
       * Adjustes value for handle in regard to step value. returns adjusted value
       * @function
       * @private
       * @param {jQuery} $handle - the selected handle.
       * @param {Number} value - value to adjust. used if $handle is falsy
       */

    }, {
      key: '_adjustValue',
      value: function _adjustValue($handle, value) {
        var val,
            step = this.options.step,
            div = parseFloat(step / 2),
            left,
            prev_val,
            next_val;
        if (!!$handle) {
          val = parseFloat($handle.attr('aria-valuenow'));
        } else {
          val = value;
        }
        left = val % step;
        prev_val = val - left;
        next_val = prev_val + step;
        if (left === 0) {
          return val;
        }
        val = val >= prev_val + div ? next_val : prev_val;
        return val;
      }

      /**
       * Adds event listeners to the slider elements.
       * @function
       * @private
       * @param {jQuery} $handle - the current handle to apply listeners to.
       */

    }, {
      key: '_events',
      value: function _events($handle) {
        if (this.options.disabled) {
          return false;
        }

        var _this = this,
            curHandle,
            timer;

        this.inputs.off('change.zf.slider').on('change.zf.slider', function (e) {
          var idx = _this.inputs.index($(this));
          _this._handleEvent(e, _this.handles.eq(idx), $(this).val());
        });

        if (this.options.clickSelect) {
          this.$element.off('click.zf.slider').on('click.zf.slider', function (e) {
            if (_this.$element.data('dragging')) {
              return false;
            }

            if (!$(e.target).is('[data-slider-handle]')) {
              if (_this.options.doubleSided) {
                _this._handleEvent(e);
              } else {
                _this._handleEvent(e, _this.$handle);
              }
            }
          });
        }

        if (this.options.draggable) {
          this.handles.addTouch();

          var $body = $('body');
          $handle.off('mousedown.zf.slider').on('mousedown.zf.slider', function (e) {
            $handle.addClass('is-dragging');
            _this.$fill.addClass('is-dragging'); //
            _this.$element.data('dragging', true);

            curHandle = $(e.currentTarget);

            $body.on('mousemove.zf.slider', function (e) {
              e.preventDefault();

              _this._handleEvent(e, curHandle);
            }).on('mouseup.zf.slider', function (e) {
              _this._handleEvent(e, curHandle);

              $handle.removeClass('is-dragging');
              _this.$fill.removeClass('is-dragging');
              _this.$element.data('dragging', false);

              $body.off('mousemove.zf.slider mouseup.zf.slider');
            });
          });
        }

        $handle.off('keydown.zf.slider').on('keydown.zf.slider', function (e) {
          var _$handle = $(this),
              idx = _this.options.doubleSided ? _this.handles.index(_$handle) : 0,
              oldValue = parseFloat(_this.inputs.eq(idx).val()),
              newValue;

          // handle keyboard event with keyboard util
          Foundation.Keyboard.handleKey(e, 'Slider', {
            decrease: function () {
              newValue = oldValue - _this.options.step;
            },
            increase: function () {
              newValue = oldValue + _this.options.step;
            },
            decrease_fast: function () {
              newValue = oldValue - _this.options.step * 10;
            },
            increase_fast: function () {
              newValue = oldValue + _this.options.step * 10;
            },
            handled: function () {
              // only set handle pos when event was handled specially
              e.preventDefault();
              _this._setHandlePos(_$handle, newValue, true);
            }
          });
          /*if (newValue) { // if pressed key has special function, update value
            e.preventDefault();
            _this._setHandlePos(_$handle, newValue);
          }*/
        });
      }

      /**
       * Destroys the slider plugin.
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.handles.off('.zf.slider');
        this.inputs.off('.zf.slider');
        this.$element.off('.zf.slider');

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Slider;
  }();

  Slider.defaults = {
    /**
     * Minimum value for the slider scale.
     * @option
     * @example 0
     */
    start: 0,
    /**
     * Maximum value for the slider scale.
     * @option
     * @example 100
     */
    end: 100,
    /**
     * Minimum value change per change event.
     * @option
     * @example 1
     */
    step: 1,
    /**
     * Value at which the handle/input *(left handle/first input)* should be set to on initialization.
     * @option
     * @example 0
     */
    initialStart: 0,
    /**
     * Value at which the right handle/second input should be set to on initialization.
     * @option
     * @example 100
     */
    initialEnd: 100,
    /**
     * Allows the input to be located outside the container and visible. Set to by the JS
     * @option
     * @example false
     */
    binding: false,
    /**
     * Allows the user to click/tap on the slider bar to select a value.
     * @option
     * @example true
     */
    clickSelect: true,
    /**
     * Set to true and use the `vertical` class to change alignment to vertical.
     * @option
     * @example false
     */
    vertical: false,
    /**
     * Allows the user to drag the slider handle(s) to select a value.
     * @option
     * @example true
     */
    draggable: true,
    /**
     * Disables the slider and prevents event listeners from being applied. Double checked by JS with `disabledClass`.
     * @option
     * @example false
     */
    disabled: false,
    /**
     * Allows the use of two handles. Double checked by the JS. Changes some logic handling.
     * @option
     * @example false
     */
    doubleSided: false,
    /**
     * Potential future feature.
     */
    // steps: 100,
    /**
     * Number of decimal places the plugin should go to for floating point precision.
     * @option
     * @example 2
     */
    decimal: 2,
    /**
     * Time delay for dragged elements.
     */
    // dragDelay: 0,
    /**
     * Time, in ms, to animate the movement of a slider handle if user clicks/taps on the bar. Needs to be manually set if updating the transition time in the Sass settings.
     * @option
     * @example 200
     */
    moveTime: 200, //update this if changing the transition time in the sass
    /**
     * Class applied to disabled sliders.
     * @option
     * @example 'disabled'
     */
    disabledClass: 'disabled',
    /**
     * Will invert the default layout for a vertical<span data-tooltip title="who would do this???"> </span>slider.
     * @option
     * @example false
     */
    invertVertical: false
  };

  function percent(frac, num) {
    return frac / num;
  }
  function absPosition($handle, dir, clickPos, param) {
    return Math.abs($handle.position()[dir] + $handle[param]() / 2 - clickPos);
  }

  // Window exports
  Foundation.plugin(Slider, 'Slider');
}(jQuery);

//*********this is in case we go to static, absolute positions instead of dynamic positioning********
// this.setSteps(function() {
//   _this._events();
//   var initStart = _this.options.positions[_this.options.initialStart - 1] || null;
//   var initEnd = _this.options.initialEnd ? _this.options.position[_this.options.initialEnd - 1] : null;
//   if (initStart || initEnd) {
//     _this._handleEvent(initStart, initEnd);
//   }
// });

//***********the other part of absolute positions*************
// Slider.prototype.setSteps = function(cb) {
//   var posChange = this.$element.outerWidth() / this.options.steps;
//   var counter = 0
//   while(counter < this.options.steps) {
//     if (counter) {
//       this.options.positions.push(this.options.positions[counter - 1] + posChange);
//     } else {
//       this.options.positions.push(posChange);
//     }
//     counter++;
//   }
//   cb();
// };
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Sticky module.
   * @module foundation.sticky
   * @requires foundation.util.triggers
   * @requires foundation.util.mediaQuery
   */

  var Sticky = function () {
    /**
     * Creates a new instance of a sticky thing.
     * @class
     * @param {jQuery} element - jQuery object to make sticky.
     * @param {Object} options - options object passed when creating the element programmatically.
     */

    function Sticky(element, options) {
      _classCallCheck(this, Sticky);

      this.$element = element;
      this.options = $.extend({}, Sticky.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Sticky');
    }

    /**
     * Initializes the sticky element by adding classes, getting/setting dimensions, breakpoints and attributes
     * @function
     * @private
     */


    _createClass(Sticky, [{
      key: '_init',
      value: function _init() {
        var $parent = this.$element.parent('[data-sticky-container]'),
            id = this.$element[0].id || Foundation.GetYoDigits(6, 'sticky'),
            _this = this;

        if (!$parent.length) {
          this.wasWrapped = true;
        }
        this.$container = $parent.length ? $parent : $(this.options.container).wrapInner(this.$element);
        this.$container.addClass(this.options.containerClass);

        this.$element.addClass(this.options.stickyClass).attr({ 'data-resize': id });

        this.scrollCount = this.options.checkEvery;
        this.isStuck = false;
        $(window).one('load.zf.sticky', function () {
          if (_this.options.anchor !== '') {
            _this.$anchor = $('#' + _this.options.anchor);
          } else {
            _this._parsePoints();
          }

          _this._setSizes(function () {
            _this._calc(false);
          });
          _this._events(id.split('-').reverse().join('-'));
        });
      }

      /**
       * If using multiple elements as anchors, calculates the top and bottom pixel values the sticky thing should stick and unstick on.
       * @function
       * @private
       */

    }, {
      key: '_parsePoints',
      value: function _parsePoints() {
        var top = this.options.topAnchor,
            btm = this.options.btmAnchor,
            pts = [top, btm],
            breaks = {};
        if (top && btm) {

          for (var i = 0, len = pts.length; i < len && pts[i]; i++) {
            var pt;
            if (typeof pts[i] === 'number') {
              pt = pts[i];
            } else {
              var place = pts[i].split(':'),
                  anchor = $('#' + place[0]);

              pt = anchor.offset().top;
              if (place[1] && place[1].toLowerCase() === 'bottom') {
                pt += anchor[0].getBoundingClientRect().height;
              }
            }
            breaks[i] = pt;
          }
        } else {
          breaks = { 0: 1, 1: document.documentElement.scrollHeight };
        }

        this.points = breaks;
        return;
      }

      /**
       * Adds event handlers for the scrolling element.
       * @private
       * @param {String} id - psuedo-random id for unique scroll event listener.
       */

    }, {
      key: '_events',
      value: function _events(id) {
        var _this = this,
            scrollListener = this.scrollListener = 'scroll.zf.' + id;
        if (this.isOn) {
          return;
        }
        if (this.canStick) {
          this.isOn = true;
          $(window).off(scrollListener).on(scrollListener, function (e) {
            if (_this.scrollCount === 0) {
              _this.scrollCount = _this.options.checkEvery;
              _this._setSizes(function () {
                _this._calc(false, window.pageYOffset);
              });
            } else {
              _this.scrollCount--;
              _this._calc(false, window.pageYOffset);
            }
          });
        }

        this.$element.off('resizeme.zf.trigger').on('resizeme.zf.trigger', function (e, el) {
          _this._setSizes(function () {
            _this._calc(false);
            if (_this.canStick) {
              if (!_this.isOn) {
                _this._events(id);
              }
            } else if (_this.isOn) {
              _this._pauseListeners(scrollListener);
            }
          });
        });
      }

      /**
       * Removes event handlers for scroll and change events on anchor.
       * @fires Sticky#pause
       * @param {String} scrollListener - unique, namespaced scroll listener attached to `window`
       */

    }, {
      key: '_pauseListeners',
      value: function _pauseListeners(scrollListener) {
        this.isOn = false;
        $(window).off(scrollListener);

        /**
         * Fires when the plugin is paused due to resize event shrinking the view.
         * @event Sticky#pause
         * @private
         */
        this.$element.trigger('pause.zf.sticky');
      }

      /**
       * Called on every `scroll` event and on `_init`
       * fires functions based on booleans and cached values
       * @param {Boolean} checkSizes - true if plugin should recalculate sizes and breakpoints.
       * @param {Number} scroll - current scroll position passed from scroll event cb function. If not passed, defaults to `window.pageYOffset`.
       */

    }, {
      key: '_calc',
      value: function _calc(checkSizes, scroll) {
        if (checkSizes) {
          this._setSizes();
        }

        if (!this.canStick) {
          if (this.isStuck) {
            this._removeSticky(true);
          }
          return false;
        }

        if (!scroll) {
          scroll = window.pageYOffset;
        }

        if (scroll >= this.topPoint) {
          if (scroll <= this.bottomPoint) {
            if (!this.isStuck) {
              this._setSticky();
            }
          } else {
            if (this.isStuck) {
              this._removeSticky(false);
            }
          }
        } else {
          if (this.isStuck) {
            this._removeSticky(true);
          }
        }
      }

      /**
       * Causes the $element to become stuck.
       * Adds `position: fixed;`, and helper classes.
       * @fires Sticky#stuckto
       * @function
       * @private
       */

    }, {
      key: '_setSticky',
      value: function _setSticky() {
        var stickTo = this.options.stickTo,
            mrgn = stickTo === 'top' ? 'marginTop' : 'marginBottom',
            notStuckTo = stickTo === 'top' ? 'bottom' : 'top',
            css = {};

        css[mrgn] = this.options[mrgn] + 'em';
        css[stickTo] = 0;
        css[notStuckTo] = 'auto';
        css['left'] = this.$container.offset().left + parseInt(window.getComputedStyle(this.$container[0])["padding-left"], 10);
        this.isStuck = true;
        this.$element.removeClass('is-anchored is-at-' + notStuckTo).addClass('is-stuck is-at-' + stickTo).css(css)
        /**
         * Fires when the $element has become `position: fixed;`
         * Namespaced to `top` or `bottom`, e.g. `sticky.zf.stuckto:top`
         * @event Sticky#stuckto
         */
        .trigger('sticky.zf.stuckto:' + stickTo);
      }

      /**
       * Causes the $element to become unstuck.
       * Removes `position: fixed;`, and helper classes.
       * Adds other helper classes.
       * @param {Boolean} isTop - tells the function if the $element should anchor to the top or bottom of its $anchor element.
       * @fires Sticky#unstuckfrom
       * @private
       */

    }, {
      key: '_removeSticky',
      value: function _removeSticky(isTop) {
        var stickTo = this.options.stickTo,
            stickToTop = stickTo === 'top',
            css = {},
            anchorPt = (this.points ? this.points[1] - this.points[0] : this.anchorHeight) - this.elemHeight,
            mrgn = stickToTop ? 'marginTop' : 'marginBottom',
            notStuckTo = stickToTop ? 'bottom' : 'top',
            topOrBottom = isTop ? 'top' : 'bottom';

        css[mrgn] = 0;

        if (isTop && !stickToTop || stickToTop && !isTop) {
          css[stickTo] = anchorPt;
          css[notStuckTo] = 0;
        } else {
          css[stickTo] = 0;
          css[notStuckTo] = anchorPt;
        }

        css['left'] = '';
        this.isStuck = false;
        this.$element.removeClass('is-stuck is-at-' + stickTo).addClass('is-anchored is-at-' + topOrBottom).css(css)
        /**
         * Fires when the $element has become anchored.
         * Namespaced to `top` or `bottom`, e.g. `sticky.zf.unstuckfrom:bottom`
         * @event Sticky#unstuckfrom
         */
        .trigger('sticky.zf.unstuckfrom:' + topOrBottom);
      }

      /**
       * Sets the $element and $container sizes for plugin.
       * Calls `_setBreakPoints`.
       * @param {Function} cb - optional callback function to fire on completion of `_setBreakPoints`.
       * @private
       */

    }, {
      key: '_setSizes',
      value: function _setSizes(cb) {
        this.canStick = Foundation.MediaQuery.atLeast(this.options.stickyOn);
        if (!this.canStick) {
          cb();
        }
        var _this = this,
            newElemWidth = this.$container[0].getBoundingClientRect().width,
            comp = window.getComputedStyle(this.$container[0]),
            pdng = parseInt(comp['padding-right'], 10);

        if (this.$anchor && this.$anchor.length) {
          this.anchorHeight = this.$anchor[0].getBoundingClientRect().height;
        } else {
          this._parsePoints();
        }

        this.$element.css({
          'max-width': newElemWidth - pdng + 'px'
        });

        var newContainerHeight = this.$element[0].getBoundingClientRect().height || this.containerHeight;
        this.containerHeight = newContainerHeight;
        this.$container.css({
          height: newContainerHeight
        });
        this.elemHeight = newContainerHeight;

        if (this.isStuck) {
          this.$element.css({ "left": this.$container.offset().left + parseInt(comp['padding-left'], 10) });
        }

        this._setBreakPoints(newContainerHeight, function () {
          if (cb) {
            cb();
          }
        });
      }

      /**
       * Sets the upper and lower breakpoints for the element to become sticky/unsticky.
       * @param {Number} elemHeight - px value for sticky.$element height, calculated by `_setSizes`.
       * @param {Function} cb - optional callback function to be called on completion.
       * @private
       */

    }, {
      key: '_setBreakPoints',
      value: function _setBreakPoints(elemHeight, cb) {
        if (!this.canStick) {
          if (cb) {
            cb();
          } else {
            return false;
          }
        }
        var mTop = emCalc(this.options.marginTop),
            mBtm = emCalc(this.options.marginBottom),
            topPoint = this.points ? this.points[0] : this.$anchor.offset().top,
            bottomPoint = this.points ? this.points[1] : topPoint + this.anchorHeight,

        // topPoint = this.$anchor.offset().top || this.points[0],
        // bottomPoint = topPoint + this.anchorHeight || this.points[1],
        winHeight = window.innerHeight;

        if (this.options.stickTo === 'top') {
          topPoint -= mTop;
          bottomPoint -= elemHeight + mTop;
        } else if (this.options.stickTo === 'bottom') {
          topPoint -= winHeight - (elemHeight + mBtm);
          bottomPoint -= winHeight - mBtm;
        } else {
          //this would be the stickTo: both option... tricky
        }

        this.topPoint = topPoint;
        this.bottomPoint = bottomPoint;

        if (cb) {
          cb();
        }
      }

      /**
       * Destroys the current sticky element.
       * Resets the element to the top position first.
       * Removes event listeners, JS-added css properties and classes, and unwraps the $element if the JS added the $container.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this._removeSticky(true);

        this.$element.removeClass(this.options.stickyClass + ' is-anchored is-at-top').css({
          height: '',
          top: '',
          bottom: '',
          'max-width': ''
        }).off('resizeme.zf.trigger');

        this.$anchor.off('change.zf.sticky');
        $(window).off(this.scrollListener);

        if (this.wasWrapped) {
          this.$element.unwrap();
        } else {
          this.$container.removeClass(this.options.containerClass).css({
            height: ''
          });
        }
        Foundation.unregisterPlugin(this);
      }
    }]);

    return Sticky;
  }();

  Sticky.defaults = {
    /**
     * Customizable container template. Add your own classes for styling and sizing.
     * @option
     * @example '&lt;div data-sticky-container class="small-6 columns"&gt;&lt;/div&gt;'
     */
    container: '<div data-sticky-container></div>',
    /**
     * Location in the view the element sticks to.
     * @option
     * @example 'top'
     */
    stickTo: 'top',
    /**
     * If anchored to a single element, the id of that element.
     * @option
     * @example 'exampleId'
     */
    anchor: '',
    /**
     * If using more than one element as anchor points, the id of the top anchor.
     * @option
     * @example 'exampleId:top'
     */
    topAnchor: '',
    /**
     * If using more than one element as anchor points, the id of the bottom anchor.
     * @option
     * @example 'exampleId:bottom'
     */
    btmAnchor: '',
    /**
     * Margin, in `em`'s to apply to the top of the element when it becomes sticky.
     * @option
     * @example 1
     */
    marginTop: 1,
    /**
     * Margin, in `em`'s to apply to the bottom of the element when it becomes sticky.
     * @option
     * @example 1
     */
    marginBottom: 1,
    /**
     * Breakpoint string that is the minimum screen size an element should become sticky.
     * @option
     * @example 'medium'
     */
    stickyOn: 'medium',
    /**
     * Class applied to sticky element, and removed on destruction. Foundation defaults to `sticky`.
     * @option
     * @example 'sticky'
     */
    stickyClass: 'sticky',
    /**
     * Class applied to sticky container. Foundation defaults to `sticky-container`.
     * @option
     * @example 'sticky-container'
     */
    containerClass: 'sticky-container',
    /**
     * Number of scroll events between the plugin's recalculating sticky points. Setting it to `0` will cause it to recalc every scroll event, setting it to `-1` will prevent recalc on scroll.
     * @option
     * @example 50
     */
    checkEvery: -1
  };

  /**
   * Helper function to calculate em values
   * @param Number {em} - number of em's to calculate into pixels
   */
  function emCalc(em) {
    return parseInt(window.getComputedStyle(document.body, null).fontSize, 10) * em;
  }

  // Window exports
  Foundation.plugin(Sticky, 'Sticky');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Tabs module.
   * @module foundation.tabs
   * @requires foundation.util.keyboard
   * @requires foundation.util.timerAndImageLoader if tabs contain images
   */

  var Tabs = function () {
    /**
     * Creates a new instance of tabs.
     * @class
     * @fires Tabs#init
     * @param {jQuery} element - jQuery object to make into tabs.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Tabs(element, options) {
      _classCallCheck(this, Tabs);

      this.$element = element;
      this.options = $.extend({}, Tabs.defaults, this.$element.data(), options);

      this._init();
      Foundation.registerPlugin(this, 'Tabs');
      Foundation.Keyboard.register('Tabs', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'previous',
        'ARROW_DOWN': 'next',
        'ARROW_LEFT': 'previous'
        // 'TAB': 'next',
        // 'SHIFT_TAB': 'previous'
      });
    }

    /**
     * Initializes the tabs by showing and focusing (if autoFocus=true) the preset active tab.
     * @private
     */


    _createClass(Tabs, [{
      key: '_init',
      value: function _init() {
        var _this = this;

        this.$tabTitles = this.$element.find('.' + this.options.linkClass);
        this.$tabContent = $('[data-tabs-content="' + this.$element[0].id + '"]');

        this.$tabTitles.each(function () {
          var $elem = $(this),
              $link = $elem.find('a'),
              isActive = $elem.hasClass('is-active'),
              hash = $link[0].hash.slice(1),
              linkId = $link[0].id ? $link[0].id : hash + '-label',
              $tabContent = $('#' + hash);

          $elem.attr({ 'role': 'presentation' });

          $link.attr({
            'role': 'tab',
            'aria-controls': hash,
            'aria-selected': isActive,
            'id': linkId
          });

          $tabContent.attr({
            'role': 'tabpanel',
            'aria-hidden': !isActive,
            'aria-labelledby': linkId
          });

          if (isActive && _this.options.autoFocus) {
            $link.focus();
          }
        });

        if (this.options.matchHeight) {
          var $images = this.$tabContent.find('img');

          if ($images.length) {
            Foundation.onImagesLoaded($images, this._setHeight.bind(this));
          } else {
            this._setHeight();
          }
        }

        this._events();
      }

      /**
       * Adds event handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        this._addKeyHandler();
        this._addClickHandler();

        if (this.options.matchHeight) {
          $(window).on('changed.zf.mediaquery', this._setHeight.bind(this));
        }
      }

      /**
       * Adds click handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_addClickHandler',
      value: function _addClickHandler() {
        var _this = this;

        this.$element.off('click.zf.tabs').on('click.zf.tabs', '.' + this.options.linkClass, function (e) {
          e.preventDefault();
          e.stopPropagation();
          if ($(this).hasClass('is-active')) {
            return;
          }
          _this._handleTabChange($(this));
        });
      }

      /**
       * Adds keyboard event handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_addKeyHandler',
      value: function _addKeyHandler() {
        var _this = this;
        var $firstTab = _this.$element.find('li:first-of-type');
        var $lastTab = _this.$element.find('li:last-of-type');

        this.$tabTitles.off('keydown.zf.tabs').on('keydown.zf.tabs', function (e) {
          if (e.which === 9) return;
          e.stopPropagation();
          e.preventDefault();

          var $element = $(this),
              $elements = $element.parent('ul').children('li'),
              $prevElement,
              $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              if (_this.options.wrapOnKeys) {
                $prevElement = i === 0 ? $elements.last() : $elements.eq(i - 1);
                $nextElement = i === $elements.length - 1 ? $elements.first() : $elements.eq(i + 1);
              } else {
                $prevElement = $elements.eq(Math.max(0, i - 1));
                $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1));
              }
              return;
            }
          });

          // handle keyboard event with keyboard util
          Foundation.Keyboard.handleKey(e, 'Tabs', {
            open: function () {
              $element.find('[role="tab"]').focus();
              _this._handleTabChange($element);
            },
            previous: function () {
              $prevElement.find('[role="tab"]').focus();
              _this._handleTabChange($prevElement);
            },
            next: function () {
              $nextElement.find('[role="tab"]').focus();
              _this._handleTabChange($nextElement);
            }
          });
        });
      }

      /**
       * Opens the tab `$targetContent` defined by `$target`.
       * @param {jQuery} $target - Tab to open.
       * @fires Tabs#change
       * @function
       */

    }, {
      key: '_handleTabChange',
      value: function _handleTabChange($target) {
        var $tabLink = $target.find('[role="tab"]'),
            hash = $tabLink[0].hash,
            $targetContent = this.$tabContent.find(hash),
            $oldTab = this.$element.find('.' + this.options.linkClass + '.is-active').removeClass('is-active').find('[role="tab"]').attr({ 'aria-selected': 'false' });

        $('#' + $oldTab.attr('aria-controls')).removeClass('is-active').attr({ 'aria-hidden': 'true' });

        $target.addClass('is-active');

        $tabLink.attr({ 'aria-selected': 'true' });

        $targetContent.addClass('is-active').attr({ 'aria-hidden': 'false' });

        /**
         * Fires when the plugin has successfully changed tabs.
         * @event Tabs#change
         */
        this.$element.trigger('change.zf.tabs', [$target]);
      }

      /**
       * Public method for selecting a content pane to display.
       * @param {jQuery | String} elem - jQuery object or string of the id of the pane to display.
       * @function
       */

    }, {
      key: 'selectTab',
      value: function selectTab(elem) {
        var idStr;

        if (typeof elem === 'object') {
          idStr = elem[0].id;
        } else {
          idStr = elem;
        }

        if (idStr.indexOf('#') < 0) {
          idStr = '#' + idStr;
        }

        var $target = this.$tabTitles.find('[href="' + idStr + '"]').parent('.' + this.options.linkClass);

        this._handleTabChange($target);
      }
    }, {
      key: '_setHeight',

      /**
       * Sets the height of each panel to the height of the tallest panel.
       * If enabled in options, gets called on media query change.
       * If loading content via external source, can be called directly or with _reflow.
       * @function
       * @private
       */
      value: function _setHeight() {
        var max = 0;
        this.$tabContent.find('.' + this.options.panelClass).css('height', '').each(function () {
          var panel = $(this),
              isActive = panel.hasClass('is-active');

          if (!isActive) {
            panel.css({ 'visibility': 'hidden', 'display': 'block' });
          }

          var temp = this.getBoundingClientRect().height;

          if (!isActive) {
            panel.css({
              'visibility': '',
              'display': ''
            });
          }

          max = temp > max ? temp : max;
        }).css('height', max + 'px');
      }

      /**
       * Destroys an instance of an tabs.
       * @fires Tabs#destroyed
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('.' + this.options.linkClass).off('.zf.tabs').hide().end().find('.' + this.options.panelClass).hide();

        if (this.options.matchHeight) {
          $(window).off('changed.zf.mediaquery');
        }

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Tabs;
  }();

  Tabs.defaults = {
    /**
     * Allows the window to scroll to content of active pane on load if set to true.
     * @option
     * @example false
     */
    autoFocus: false,

    /**
     * Allows keyboard input to 'wrap' around the tab links.
     * @option
     * @example true
     */
    wrapOnKeys: true,

    /**
     * Allows the tab content panes to match heights if set to true.
     * @option
     * @example false
     */
    matchHeight: false,

    /**
     * Class applied to `li`'s in tab link list.
     * @option
     * @example 'tabs-title'
     */
    linkClass: 'tabs-title',

    /**
     * Class applied to the content containers.
     * @option
     * @example 'tabs-panel'
     */
    panelClass: 'tabs-panel'
  };

  function checkClass($elem) {
    return $elem.hasClass('is-active');
  }

  // Window exports
  Foundation.plugin(Tabs, 'Tabs');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Toggler module.
   * @module foundation.toggler
   * @requires foundation.util.motion
   * @requires foundation.util.triggers
   */

  var Toggler = function () {
    /**
     * Creates a new instance of Toggler.
     * @class
     * @fires Toggler#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Toggler(element, options) {
      _classCallCheck(this, Toggler);

      this.$element = element;
      this.options = $.extend({}, Toggler.defaults, element.data(), options);
      this.className = '';

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'Toggler');
    }

    /**
     * Initializes the Toggler plugin by parsing the toggle class from data-toggler, or animation classes from data-animate.
     * @function
     * @private
     */


    _createClass(Toggler, [{
      key: '_init',
      value: function _init() {
        var input;
        // Parse animation classes if they were set
        if (this.options.animate) {
          input = this.options.animate.split(' ');

          this.animationIn = input[0];
          this.animationOut = input[1] || null;
        }
        // Otherwise, parse toggle class
        else {
            input = this.$element.data('toggler');
            // Allow for a . at the beginning of the string
            this.className = input[0] === '.' ? input.slice(1) : input;
          }

        // Add ARIA attributes to triggers
        var id = this.$element[0].id;
        $('[data-open="' + id + '"], [data-close="' + id + '"], [data-toggle="' + id + '"]').attr('aria-controls', id);
        // If the target is hidden, add aria-hidden
        this.$element.attr('aria-expanded', this.$element.is(':hidden') ? false : true);
      }

      /**
       * Initializes events for the toggle trigger.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        this.$element.off('toggle.zf.trigger').on('toggle.zf.trigger', this.toggle.bind(this));
      }

      /**
       * Toggles the target class on the target element. An event is fired from the original trigger depending on if the resultant state was "on" or "off".
       * @function
       * @fires Toggler#on
       * @fires Toggler#off
       */

    }, {
      key: 'toggle',
      value: function toggle() {
        this[this.options.animate ? '_toggleAnimate' : '_toggleClass']();
      }
    }, {
      key: '_toggleClass',
      value: function _toggleClass() {
        this.$element.toggleClass(this.className);

        var isOn = this.$element.hasClass(this.className);
        if (isOn) {
          /**
           * Fires if the target element has the class after a toggle.
           * @event Toggler#on
           */
          this.$element.trigger('on.zf.toggler');
        } else {
          /**
           * Fires if the target element does not have the class after a toggle.
           * @event Toggler#off
           */
          this.$element.trigger('off.zf.toggler');
        }

        this._updateARIA(isOn);
      }
    }, {
      key: '_toggleAnimate',
      value: function _toggleAnimate() {
        var _this = this;

        if (this.$element.is(':hidden')) {
          Foundation.Motion.animateIn(this.$element, this.animationIn, function () {
            this.trigger('on.zf.toggler');
            _this._updateARIA(true);
          });
        } else {
          Foundation.Motion.animateOut(this.$element, this.animationOut, function () {
            this.trigger('off.zf.toggler');
            _this._updateARIA(false);
          });
        }
      }
    }, {
      key: '_updateARIA',
      value: function _updateARIA(isOn) {
        this.$element.attr('aria-expanded', isOn ? true : false);
      }

      /**
       * Destroys the instance of Toggler on the element.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.off('.zf.toggler');
        Foundation.unregisterPlugin(this);
      }
    }]);

    return Toggler;
  }();

  Toggler.defaults = {
    /**
     * Tells the plugin if the element should animated when toggled.
     * @option
     * @example false
     */
    animate: false
  };

  // Window exports
  Foundation.plugin(Toggler, 'Toggler');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Tooltip module.
   * @module foundation.tooltip
   * @requires foundation.util.box
   * @requires foundation.util.triggers
   */

  var Tooltip = function () {
    /**
     * Creates a new instance of a Tooltip.
     * @class
     * @fires Tooltip#init
     * @param {jQuery} element - jQuery object to attach a tooltip to.
     * @param {Object} options - object to extend the default configuration.
     */

    function Tooltip(element, options) {
      _classCallCheck(this, Tooltip);

      this.$element = element;
      this.options = $.extend({}, Tooltip.defaults, this.$element.data(), options);

      this.isActive = false;
      this.isClick = false;
      this._init();

      Foundation.registerPlugin(this, 'Tooltip');
    }

    /**
     * Initializes the tooltip by setting the creating the tip element, adding it's text, setting private variables and setting attributes on the anchor.
     * @private
     */


    _createClass(Tooltip, [{
      key: '_init',
      value: function _init() {
        var elemId = this.$element.attr('aria-describedby') || Foundation.GetYoDigits(6, 'tooltip');

        this.options.positionClass = this._getPositionClass(this.$element);
        this.options.tipText = this.options.tipText || this.$element.attr('title');
        this.template = this.options.template ? $(this.options.template) : this._buildTemplate(elemId);

        this.template.appendTo(document.body).text(this.options.tipText).hide();

        this.$element.attr({
          'title': '',
          'aria-describedby': elemId,
          'data-yeti-box': elemId,
          'data-toggle': elemId,
          'data-resize': elemId
        }).addClass(this.triggerClass);

        //helper variables to track movement on collisions
        this.usedPositions = [];
        this.counter = 4;
        this.classChanged = false;

        this._events();
      }

      /**
       * Grabs the current positioning class, if present, and returns the value or an empty string.
       * @private
       */

    }, {
      key: '_getPositionClass',
      value: function _getPositionClass(element) {
        if (!element) {
          return '';
        }
        // var position = element.attr('class').match(/top|left|right/g);
        var position = element[0].className.match(/\b(top|left|right)\b/g);
        position = position ? position[0] : '';
        return position;
      }
    }, {
      key: '_buildTemplate',

      /**
       * builds the tooltip element, adds attributes, and returns the template.
       * @private
       */
      value: function _buildTemplate(id) {
        var templateClasses = (this.options.tooltipClass + ' ' + this.options.positionClass + ' ' + this.options.templateClasses).trim();
        var $template = $('<div></div>').addClass(templateClasses).attr({
          'role': 'tooltip',
          'aria-hidden': true,
          'data-is-active': false,
          'data-is-focus': false,
          'id': id
        });
        return $template;
      }

      /**
       * Function that gets called if a collision event is detected.
       * @param {String} position - positioning class to try
       * @private
       */

    }, {
      key: '_reposition',
      value: function _reposition(position) {
        this.usedPositions.push(position ? position : 'bottom');

        //default, try switching to opposite side
        if (!position && this.usedPositions.indexOf('top') < 0) {
          this.template.addClass('top');
        } else if (position === 'top' && this.usedPositions.indexOf('bottom') < 0) {
          this.template.removeClass(position);
        } else if (position === 'left' && this.usedPositions.indexOf('right') < 0) {
          this.template.removeClass(position).addClass('right');
        } else if (position === 'right' && this.usedPositions.indexOf('left') < 0) {
          this.template.removeClass(position).addClass('left');
        }

        //if default change didn't work, try bottom or left first
        else if (!position && this.usedPositions.indexOf('top') > -1 && this.usedPositions.indexOf('left') < 0) {
            this.template.addClass('left');
          } else if (position === 'top' && this.usedPositions.indexOf('bottom') > -1 && this.usedPositions.indexOf('left') < 0) {
            this.template.removeClass(position).addClass('left');
          } else if (position === 'left' && this.usedPositions.indexOf('right') > -1 && this.usedPositions.indexOf('bottom') < 0) {
            this.template.removeClass(position);
          } else if (position === 'right' && this.usedPositions.indexOf('left') > -1 && this.usedPositions.indexOf('bottom') < 0) {
            this.template.removeClass(position);
          }
          //if nothing cleared, set to bottom
          else {
              this.template.removeClass(position);
            }
        this.classChanged = true;
        this.counter--;
      }

      /**
       * sets the position class of an element and recursively calls itself until there are no more possible positions to attempt, or the tooltip element is no longer colliding.
       * if the tooltip is larger than the screen width, default to full width - any user selected margin
       * @private
       */

    }, {
      key: '_setPosition',
      value: function _setPosition() {
        var position = this._getPositionClass(this.template),
            $tipDims = Foundation.Box.GetDimensions(this.template),
            $anchorDims = Foundation.Box.GetDimensions(this.$element),
            direction = position === 'left' ? 'left' : position === 'right' ? 'left' : 'top',
            param = direction === 'top' ? 'height' : 'width',
            offset = param === 'height' ? this.options.vOffset : this.options.hOffset,
            _this = this;

        if ($tipDims.width >= $tipDims.windowDims.width || !this.counter && !Foundation.Box.ImNotTouchingYou(this.template)) {
          this.template.offset(Foundation.Box.GetOffsets(this.template, this.$element, 'center bottom', this.options.vOffset, this.options.hOffset, true)).css({
            // this.$element.offset(Foundation.GetOffsets(this.template, this.$element, 'center bottom', this.options.vOffset, this.options.hOffset, true)).css({
            'width': $anchorDims.windowDims.width - this.options.hOffset * 2,
            'height': 'auto'
          });
          return false;
        }

        this.template.offset(Foundation.Box.GetOffsets(this.template, this.$element, 'center ' + (position || 'bottom'), this.options.vOffset, this.options.hOffset));

        while (!Foundation.Box.ImNotTouchingYou(this.template) && this.counter) {
          this._reposition(position);
          this._setPosition();
        }
      }

      /**
       * reveals the tooltip, and fires an event to close any other open tooltips on the page
       * @fires Tooltip#closeme
       * @fires Tooltip#show
       * @function
       */

    }, {
      key: 'show',
      value: function show() {
        if (this.options.showOn !== 'all' && !Foundation.MediaQuery.atLeast(this.options.showOn)) {
          // console.error('The screen is too small to display this tooltip');
          return false;
        }

        var _this = this;
        this.template.css('visibility', 'hidden').show();
        this._setPosition();

        /**
         * Fires to close all other open tooltips on the page
         * @event Closeme#tooltip
         */
        this.$element.trigger('closeme.zf.tooltip', this.template.attr('id'));

        this.template.attr({
          'data-is-active': true,
          'aria-hidden': false
        });
        _this.isActive = true;
        // console.log(this.template);
        this.template.stop().hide().css('visibility', '').fadeIn(this.options.fadeInDuration, function () {
          //maybe do stuff?
        });
        /**
         * Fires when the tooltip is shown
         * @event Tooltip#show
         */
        this.$element.trigger('show.zf.tooltip');
      }

      /**
       * Hides the current tooltip, and resets the positioning class if it was changed due to collision
       * @fires Tooltip#hide
       * @function
       */

    }, {
      key: 'hide',
      value: function hide() {
        // console.log('hiding', this.$element.data('yeti-box'));
        var _this = this;
        this.template.stop().attr({
          'aria-hidden': true,
          'data-is-active': false
        }).fadeOut(this.options.fadeOutDuration, function () {
          _this.isActive = false;
          _this.isClick = false;
          if (_this.classChanged) {
            _this.template.removeClass(_this._getPositionClass(_this.template)).addClass(_this.options.positionClass);

            _this.usedPositions = [];
            _this.counter = 4;
            _this.classChanged = false;
          }
        });
        /**
         * fires when the tooltip is hidden
         * @event Tooltip#hide
         */
        this.$element.trigger('hide.zf.tooltip');
      }

      /**
       * adds event listeners for the tooltip and its anchor
       * TODO combine some of the listeners like focus and mouseenter, etc.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;
        var $template = this.template;
        var isFocus = false;

        if (!this.options.disableHover) {

          this.$element.on('mouseenter.zf.tooltip', function (e) {
            if (!_this.isActive) {
              _this.timeout = setTimeout(function () {
                _this.show();
              }, _this.options.hoverDelay);
            }
          }).on('mouseleave.zf.tooltip', function (e) {
            clearTimeout(_this.timeout);
            if (!isFocus || !_this.isClick && _this.options.clickOpen) {
              _this.hide();
            }
          });
        }

        if (this.options.clickOpen) {
          this.$element.on('mousedown.zf.tooltip', function (e) {
            e.stopImmediatePropagation();
            if (_this.isClick) {
              _this.hide();
              // _this.isClick = false;
            } else {
                _this.isClick = true;
                if ((_this.options.disableHover || !_this.$element.attr('tabindex')) && !_this.isActive) {
                  _this.show();
                }
              }
          });
        }

        if (!this.options.disableForTouch) {
          this.$element.on('tap.zf.tooltip touchend.zf.tooltip', function (e) {
            _this.isActive ? _this.hide() : _this.show();
          });
        }

        this.$element.on({
          // 'toggle.zf.trigger': this.toggle.bind(this),
          // 'close.zf.trigger': this.hide.bind(this)
          'close.zf.trigger': this.hide.bind(this)
        });

        this.$element.on('focus.zf.tooltip', function (e) {
          isFocus = true;
          // console.log(_this.isClick);
          if (_this.isClick) {
            return false;
          } else {
            // $(window)
            _this.show();
          }
        }).on('focusout.zf.tooltip', function (e) {
          isFocus = false;
          _this.isClick = false;
          _this.hide();
        }).on('resizeme.zf.trigger', function () {
          if (_this.isActive) {
            _this._setPosition();
          }
        });
      }

      /**
       * adds a toggle method, in addition to the static show() & hide() functions
       * @function
       */

    }, {
      key: 'toggle',
      value: function toggle() {
        if (this.isActive) {
          this.hide();
        } else {
          this.show();
        }
      }

      /**
       * Destroys an instance of tooltip, removes template element from the view.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.attr('title', this.template.text()).off('.zf.trigger .zf.tootip')
        //  .removeClass('has-tip')
        .removeAttr('aria-describedby').removeAttr('data-yeti-box').removeAttr('data-toggle').removeAttr('data-resize');

        this.template.remove();

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Tooltip;
  }();

  Tooltip.defaults = {
    disableForTouch: false,
    /**
     * Time, in ms, before a tooltip should open on hover.
     * @option
     * @example 200
     */
    hoverDelay: 200,
    /**
     * Time, in ms, a tooltip should take to fade into view.
     * @option
     * @example 150
     */
    fadeInDuration: 150,
    /**
     * Time, in ms, a tooltip should take to fade out of view.
     * @option
     * @example 150
     */
    fadeOutDuration: 150,
    /**
     * Disables hover events from opening the tooltip if set to true
     * @option
     * @example false
     */
    disableHover: false,
    /**
     * Optional addtional classes to apply to the tooltip template on init.
     * @option
     * @example 'my-cool-tip-class'
     */
    templateClasses: '',
    /**
     * Non-optional class added to tooltip templates. Foundation default is 'tooltip'.
     * @option
     * @example 'tooltip'
     */
    tooltipClass: 'tooltip',
    /**
     * Class applied to the tooltip anchor element.
     * @option
     * @example 'has-tip'
     */
    triggerClass: 'has-tip',
    /**
     * Minimum breakpoint size at which to open the tooltip.
     * @option
     * @example 'small'
     */
    showOn: 'small',
    /**
     * Custom template to be used to generate markup for tooltip.
     * @option
     * @example '&lt;div class="tooltip"&gt;&lt;/div&gt;'
     */
    template: '',
    /**
     * Text displayed in the tooltip template on open.
     * @option
     * @example 'Some cool space fact here.'
     */
    tipText: '',
    touchCloseText: 'Tap to close.',
    /**
     * Allows the tooltip to remain open if triggered with a click or touch event.
     * @option
     * @example true
     */
    clickOpen: true,
    /**
     * Additional positioning classes, set by the JS
     * @option
     * @example 'top'
     */
    positionClass: '',
    /**
     * Distance, in pixels, the template should push away from the anchor on the Y axis.
     * @option
     * @example 10
     */
    vOffset: 10,
    /**
     * Distance, in pixels, the template should push away from the anchor on the X axis, if aligned to a side.
     * @option
     * @example 12
     */
    hOffset: 12
  };

  /**
   * TODO utilize resize event trigger
   */

  // Window exports
  Foundation.plugin(Tooltip, 'Tooltip');
}(jQuery);
/*
 * Inputfit plugin to adjust the font size if the text exceeds the lenght of the form fields. (Requires jQuery 1.6.2 or higher)
 * https://github.com/vxsx/jquery.inputfit.js?files=1
 */


/*global define:true */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    $.fn.inputfit = function(options) {
        var settings = $.extend({
            minSize   : 12,
            maxSize   : false
        }, options);

        this.each(function() {
            var $input = $(this);

            if ( !$input.is(':input') ) {
                return;
            }

            $input.off('keyup.inputfit keydown.inputfit');

            var maxSize = parseFloat(settings.maxSize || $input.css('font-size'), 10);
            var width   = $input.width();
            var clone   = $input.data('inputfit-clone');

            if (!clone) {
                clone = $('<div></div>', {
                    css : {
                        fontSize     : $input.css('font-size'),
                        fontFamily   : $input.css('font-family'),
                        fontStyle    : $input.css('font-style'),
                        fontWeight   : $input.css('font-weight'),
                        fontVariant  : $input.css('font-variant'),
                        letterSpacing: $input.css('letter-spacing'),
                        position     : 'absolute',
                        left         : '-9999px',
                        visibility   : 'hidden'
                    }
                }).insertAfter($input);

                $input.data('inputfit-clone', clone);
            }

            $input.on('keyup.inputfit keydown.inputfit', function() {
                var $this = $(this);

                clone.html($this.val().replace(/ /g, '&nbsp;'));

                var ratio = width / (clone.width() || 1),
                    currentFontSize = parseInt( $this.css('font-size'), 10 ),
                    fontSize = Math.floor(currentFontSize * ratio);

                if (fontSize > maxSize) { fontSize = maxSize; }
                if (fontSize < settings.minSize) { fontSize = settings.minSize; }

                $this.css('font-size', fontSize);
                clone.css('font-size', fontSize);
            }).triggerHandler('keyup.inputfit');
        });

        return this;
    };

}));

/* =========================================================
 * foundation-datepicker.js
 * Copyright 2015 Peter Beno, najlepsiwebdesigner@gmail.com, @benopeter
 * project website http://foundation-datepicker.peterbeno.com
 * ========================================================= */
! function($) {

    function UTCDate() {
        return new Date(Date.UTC.apply(Date, arguments));
    }

    function UTCToday() {
        var today = new Date();
        return UTCDate(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    }

    var Datepicker = function(element, options) {
        var that = this;

        this.element = $(element);
        this.autoShow = options.autoShow || true;
        this.appendTo = options.appendTo || 'body';
        this.closeButton = options.closeButton;
        this.language = options.language || this.element.data('date-language') || "en";
        this.language = this.language in dates ? this.language : this.language.split('-')[0]; //Check if "de-DE" style date is available, if not language should fallback to 2 letter code eg "de"
        this.language = this.language in dates ? this.language : "en";
        this.isRTL = dates[this.language].rtl || false;
        this.format = DPGlobal.parseFormat(options.format || this.element.data('date-format') || dates[this.language].format || 'mm/dd/yyyy');
        this.isInline = false;
        this.isInput = this.element.is('input');
        this.component = this.element.is('.date') ? this.element.find('.prefix, .postfix') : false;
        this.hasInput = this.component && this.element.find('input').length;
        this.disableDblClickSelection = options.disableDblClickSelection;
        this.onRender = options.onRender || function() {};
        if (this.component && this.component.length === 0) {
            this.component = false;
        }
        this.linkField = options.linkField || this.element.data('link-field') || false;
        this.linkFormat = DPGlobal.parseFormat(options.linkFormat || this.element.data('link-format') || 'yyyy/mm/dd hh:ii:ss');
        this.minuteStep = options.minuteStep || this.element.data('minute-step') || 5;
        this.pickerPosition = options.pickerPosition || this.element.data('picker-position') || 'bottom-right';

        this._attachEvents();


        this.minView = 0;
        if ('minView' in options) {
            this.minView = options.minView;
        } else if ('minView' in this.element.data()) {
            this.minView = this.element.data('min-view');
        }
        this.minView = DPGlobal.convertViewMode(this.minView);

        this.maxView = DPGlobal.modes.length - 1;
        if ('maxView' in options) {
            this.maxView = options.maxView;
        } else if ('maxView' in this.element.data()) {
            this.maxView = this.element.data('max-view');
        }
        this.maxView = DPGlobal.convertViewMode(this.maxView);

        this.startViewMode = 'month';
        if ('startView' in options) {
            this.startViewMode = options.startView;
        } else if ('startView' in this.element.data()) {
            this.startViewMode = this.element.data('start-view');
        }
        this.startViewMode = DPGlobal.convertViewMode(this.startViewMode);
        this.viewMode = this.startViewMode;

        if (!('minView' in options) && !('maxView' in options) && !(this.element.data('min-view') && !(this.element.data('max-view')))) {
            this.pickTime = false;
            if ('pickTime' in options) {
                this.pickTime = options.pickTime;
            }
            if (this.pickTime == true) {
                this.minView = 0;
                this.maxView = 4;
            } else {
                this.minView = 2;
                this.maxView = 4;
            }
        }

        this.forceParse = true;
        if ('forceParse' in options) {
            this.forceParse = options.forceParse;
        } else if ('dateForceParse' in this.element.data()) {
            this.forceParse = this.element.data('date-force-parse');
        }


        this.picker = $(DPGlobal.template)
            .appendTo(this.isInline ? this.element : this.appendTo)
            .on({
                click: $.proxy(this.click, this),
                mousedown: $.proxy(this.mousedown, this)
            });
        if (this.closeButton) {
            this.picker.find('a.datepicker-close').show();
        } else {
            this.picker.find('a.datepicker-close').hide();
        }

        if (this.isInline) {
            this.picker.addClass('datepicker-inline');
        } else {
            this.picker.addClass('datepicker-dropdown dropdown-menu');
        }
        if (this.isRTL) {
            this.picker.addClass('datepicker-rtl');
            this.picker.find('.prev i, .next i')
                .toggleClass('fa fa-chevron-left fa-chevron-right').toggleClass('fa-chevron-left fa-chevron-right');
        }
        $(document).on('mousedown', function(e) {
            // Clicked outside the datepicker, hide it
            if ($(e.target).closest('.datepicker.datepicker-inline, .datepicker.datepicker-dropdown').length === 0) {
                that.hide();
            }
        });

        this.autoclose = true;
        if ('autoclose' in options) {
            this.autoclose = options.autoclose;
        } else if ('dateAutoclose' in this.element.data()) {
            this.autoclose = this.element.data('date-autoclose');
        }

        this.keyboardNavigation = true;
        if ('keyboardNavigation' in options) {
            this.keyboardNavigation = options.keyboardNavigation;
        } else if ('dateKeyboardNavigation' in this.element.data()) {
            this.keyboardNavigation = this.element.data('date-keyboard-navigation');
        }

        this.todayBtn = (options.todayBtn || this.element.data('date-today-btn') || false);
        this.todayHighlight = (options.todayHighlight || this.element.data('date-today-highlight') || false);

        this.calendarWeeks = false;
        if ('calendarWeeks' in options) {
            this.calendarWeeks = options.calendarWeeks;
        } else if ('dateCalendarWeeks' in this.element.data()) {
            this.calendarWeeks = this.element.data('date-calendar-weeks');
        }
        if (this.calendarWeeks)
            this.picker.find('tfoot th.today')
            .attr('colspan', function(i, val) {
                return parseInt(val) + 1;
            });

        this.weekStart = ((options.weekStart || this.element.data('date-weekstart') || dates[this.language].weekStart || 0) % 7);
        this.weekEnd = ((this.weekStart + 6) % 7);
        this.startDate = -Infinity;
        this.endDate = Infinity;
        this.daysOfWeekDisabled = [];
        this.setStartDate(options.startDate || this.element.data('date-startdate'));
        this.setEndDate(options.endDate || this.element.data('date-enddate'));
        this.setDaysOfWeekDisabled(options.daysOfWeekDisabled || this.element.data('date-days-of-week-disabled'));

        this.fillDow();
        this.fillMonths();
        this.update();

        this.showMode();

        if (this.isInline) {
            this.show();
        }
    };

    Datepicker.prototype = {
        constructor: Datepicker,

        _events: [],
        _attachEvents: function() {
            this._detachEvents();
            if (this.isInput) { // single input
                this._events = [
                    [this.element, {
                        focus: (this.autoShow) ? $.proxy(this.show, this) : function() {},
                        keyup: $.proxy(this.update, this),
                        keydown: $.proxy(this.keydown, this)
                    }]
                ];
            } else if (this.component && this.hasInput) { // component: input + button
                this._events = [
                    // For components that are not readonly, allow keyboard nav
                    [this.element.find('input'), {
                        focus: (this.autoShow) ? $.proxy(this.show, this) : function() {},
                        keyup: $.proxy(this.update, this),
                        keydown: $.proxy(this.keydown, this)
                    }],
                    [this.component, {
                        click: $.proxy(this.show, this)
                    }]
                ];
            } else if (this.element.is('div')) { // inline datepicker
                this.isInline = true;
            } else {
                this._events = [
                    [this.element, {
                        click: $.proxy(this.show, this)
                    }]
                ];
            }

            if (this.disableDblClickSelection) {
                this._events[this._events.length] = [
                    this.element, {
                        dblclick: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            $(this).blur()
                        }
                    }
                ];
            }

            for (var i = 0, el, ev; i < this._events.length; i++) {
                el = this._events[i][0];
                ev = this._events[i][1];
                el.on(ev);
            }
        },
        _detachEvents: function() {
            for (var i = 0, el, ev; i < this._events.length; i++) {
                el = this._events[i][0];
                ev = this._events[i][1];
                el.off(ev);
            }
            this._events = [];
        },

        show: function(e) {
            this.picker.show();
            this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
            this.update();
            this.place();
            $(window).on('resize', $.proxy(this.place, this));
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }
            this.element.trigger({
                type: 'show',
                date: this.date
            });
        },

        hide: function(e) {
            if (this.isInline) return;
            if (!this.picker.is(':visible')) return;
            this.picker.hide();
            $(window).off('resize', this.place);
            this.viewMode = this.startViewMode;
            this.showMode();
            if (!this.isInput) {
                $(document).off('mousedown', this.hide);
            }

            if (
                this.forceParse &&
                (
                    this.isInput && this.element.val() ||
                    this.hasInput && this.element.find('input').val()
                )
            )
                this.setValue();
            this.element.trigger({
                type: 'hide',
                date: this.date
            });
        },

        remove: function() {
            this._detachEvents();
            this.picker.remove();
            delete this.element.data().datepicker;
        },

        getDate: function() {
            var d = this.getUTCDate();
            return new Date(d.getTime() + (d.getTimezoneOffset() * 60000));
        },

        getUTCDate: function() {
            return this.date;
        },

        setDate: function(d) {
            this.setUTCDate(new Date(d.getTime() - (d.getTimezoneOffset() * 60000)));
        },

        setUTCDate: function(d) {
            this.date = d;
            this.setValue();
        },

        setValue: function() {
            var formatted = this.getFormattedDate();
            if (!this.isInput) {
                if (this.component) {
                    this.element.find('input').val(formatted);
                }
                this.element.data('date', formatted);
            } else {
                this.element.val(formatted);
            }
        },

        getFormattedDate: function(format) {
            if (format === undefined)
                format = this.format;
            return DPGlobal.formatDate(this.date, format, this.language);
        },

        setStartDate: function(startDate) {
            this.startDate = startDate || -Infinity;
            if (this.startDate !== -Infinity) {
                this.startDate = DPGlobal.parseDate(this.startDate, this.format, this.language);
            }
            this.update();
            this.updateNavArrows();
        },

        setEndDate: function(endDate) {
            this.endDate = endDate || Infinity;
            if (this.endDate !== Infinity) {
                this.endDate = DPGlobal.parseDate(this.endDate, this.format, this.language);
            }
            this.update();
            this.updateNavArrows();
        },

        setDaysOfWeekDisabled: function(daysOfWeekDisabled) {
            this.daysOfWeekDisabled = daysOfWeekDisabled || [];
            if (!$.isArray(this.daysOfWeekDisabled)) {
                this.daysOfWeekDisabled = this.daysOfWeekDisabled.split(/,\s*/);
            }
            this.daysOfWeekDisabled = $.map(this.daysOfWeekDisabled, function(d) {
                return parseInt(d, 10);
            });
            this.update();
            this.updateNavArrows();
        },

        place: function() {
            if (this.isInline) return;
            var zIndex = parseInt(this.element.parents().filter(function() {
                return $(this).css('z-index') != 'auto';
            }).first().css('z-index')) + 10;
            var textbox = this.component ? this.component : this.element;
            var offset = textbox.offset();
            var height = textbox.outerHeight() + parseInt(textbox.css('margin-top'));
            var width = textbox.outerWidth() + parseInt(textbox.css('margin-left'));
            var fullOffsetTop = offset.top + height;
            var offsetLeft = offset.left;
            // if the datepicker is going to be below the window, show it on top of the input
            if ((fullOffsetTop + this.picker.outerHeight()) >= $(window).scrollTop() + $(window).height()) {
                fullOffsetTop = offset.top - this.picker.outerHeight();
            }

            // if the datepicker is going to go past the right side of the window, we want
            // to set the right position so the datepicker lines up with the textbox
            if (offset.left + this.picker.width() >= $(window).width()) {
                offsetLeft = (offset.left + width) - this.picker.width();
            }
            this.picker.css({
                top: fullOffsetTop,
                left: offsetLeft,
                zIndex: zIndex
            });
        },

        update: function() {
            var date, fromArgs = false;
            if (arguments && arguments.length && (typeof arguments[0] === 'string' || arguments[0] instanceof Date)) {
                date = arguments[0];
                fromArgs = true;
            } else {
                date = this.isInput ? this.element.val() : this.element.data('date') || this.element.find('input').val();
            }

            this.date = DPGlobal.parseDate(date, this.format, this.language);

            if (fromArgs) this.setValue();

            if (this.date < this.startDate) {
                this.viewDate = new Date(this.startDate.valueOf());
            } else if (this.date > this.endDate) {
                this.viewDate = new Date(this.endDate.valueOf());
            } else {
                this.viewDate = new Date(this.date.valueOf());
            }
            this.fill();
        },

        fillDow: function() {
            var dowCnt = this.weekStart,
                html = '<tr>';
            if (this.calendarWeeks) {
                var cell = '<th class="cw">&nbsp;</th>';
                html += cell;
                this.picker.find('.datepicker-days thead tr:first-child').prepend(cell);
            }
            while (dowCnt < this.weekStart + 7) {
                html += '<th class="dow">' + dates[this.language].daysMin[(dowCnt++) % 7] + '</th>';
            }
            html += '</tr>';
            this.picker.find('.datepicker-days thead').append(html);
        },

        fillMonths: function() {
            var html = '',
                i = 0;
            while (i < 12) {
                html += '<span class="month">' + dates[this.language].monthsShort[i++] + '</span>';
            }
            this.picker.find('.datepicker-months td').html(html);
        },

        fill: function() {
            if (this.date == null || this.viewDate == null) {
                return;
            }

            var d = new Date(this.viewDate.valueOf()),
                year = d.getUTCFullYear(),
                month = d.getUTCMonth(),
                dayMonth = d.getUTCDate(),
                hours = d.getUTCHours(),
                minutes = d.getUTCMinutes(),
                startYear = this.startDate !== -Infinity ? this.startDate.getUTCFullYear() : -Infinity,
                startMonth = this.startDate !== -Infinity ? this.startDate.getUTCMonth() : -Infinity,
                endYear = this.endDate !== Infinity ? this.endDate.getUTCFullYear() : Infinity,
                endMonth = this.endDate !== Infinity ? this.endDate.getUTCMonth() : Infinity,
                currentDate = this.date && UTCDate(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate()).valueOf(),
                today = new Date(),
                titleFormat = dates[this.language].titleFormat || dates['en'].titleFormat;
                
            // this.picker.find('.datepicker-days thead th.date-switch')
            // 			.text(DPGlobal.formatDate(new UTCDate(year, month), titleFormat, this.language));

            this.picker.find('.datepicker-days thead th:eq(1)')
                .text(dates[this.language].months[month] + ' ' + year);
            this.picker.find('.datepicker-hours thead th:eq(1)')
                .text(dayMonth + ' ' + dates[this.language].months[month] + ' ' + year);
            this.picker.find('.datepicker-minutes thead th:eq(1)')
                .text(dayMonth + ' ' + dates[this.language].months[month] + ' ' + year);


            this.picker.find('tfoot th.today')
                .text(dates[this.language].today)
                .toggle(this.todayBtn !== false);
            this.updateNavArrows();
            this.fillMonths();
            var prevMonth = UTCDate(year, month - 1, 28, 0, 0, 0, 0),
                day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
            prevMonth.setUTCDate(day);
            prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.weekStart + 7) % 7);
            var nextMonth = new Date(prevMonth.valueOf());
            nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
            nextMonth = nextMonth.valueOf();
            var html = [];
            var clsName;
            while (prevMonth.valueOf() < nextMonth) {
                if (prevMonth.getUTCDay() == this.weekStart) {
                    html.push('<tr>');
                    if (this.calendarWeeks) {
                        // adapted from https://github.com/timrwood/moment/blob/master/moment.js#L128
                        var a = new Date(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth(), prevMonth.getUTCDate() - prevMonth.getDay() + 10 - (this.weekStart && this.weekStart % 7 < 5 && 7)),
                            b = new Date(a.getFullYear(), 0, 4),
                            calWeek = ~~((a - b) / 864e5 / 7 + 1.5);
                        html.push('<td class="cw">' + calWeek + '</td>');
                    }
                }
                clsName = ' ' + this.onRender(prevMonth) + ' ';
                if (prevMonth.getUTCFullYear() < year || (prevMonth.getUTCFullYear() == year && prevMonth.getUTCMonth() < month)) {
                    clsName += ' old';
                } else if (prevMonth.getUTCFullYear() > year || (prevMonth.getUTCFullYear() == year && prevMonth.getUTCMonth() > month)) {
                    clsName += ' new';
                }
                // Compare internal UTC date with local today, not UTC today
                if (this.todayHighlight &&
                    prevMonth.getUTCFullYear() == today.getFullYear() &&
                    prevMonth.getUTCMonth() == today.getMonth() &&
                    prevMonth.getUTCDate() == today.getDate()) {
                    clsName += ' today';
                }
                if (currentDate && prevMonth.valueOf() == currentDate) {
                    clsName += ' active';
                }
                if (prevMonth.valueOf() < this.startDate || prevMonth.valueOf() > this.endDate ||
                    $.inArray(prevMonth.getUTCDay(), this.daysOfWeekDisabled) !== -1) {
                    clsName += ' disabled';
                }
                html.push('<td class="day' + clsName + '">' + prevMonth.getUTCDate() + '</td>');
                if (prevMonth.getUTCDay() == this.weekEnd) {
                    html.push('</tr>');
                }
                prevMonth.setUTCDate(prevMonth.getUTCDate() + 1);
            }
            this.picker.find('.datepicker-days tbody').empty().append(html.join(''));

            html = [];
            for (var i = 0; i < 24; i++) {
                var actual = UTCDate(year, month, dayMonth, i);
                clsName = '';
                // We want the previous hour for the startDate
                if ((actual.valueOf() + 3600000) < this.startDate || actual.valueOf() > this.endDate) {
                    clsName += ' disabled';
                } else if (hours == i) {
                    clsName += ' active';
                }

                var display = '';
                if (i == 0) {
                  display = '12:00';
                } else if (i > 0 && i < 12) {
                  display = i+':00';
                } else if (i == 12) {
                  display = i + ':00PM';
                } else if (i > 12) {
                  display = (i-12) + ':00PM';
                }

                html.push('<span class="hour' + clsName + '" data-display="' + display + '" >' + i + ':00</span>');
            }
            this.picker.find('.datepicker-hours td').html(html.join(''));

            html = [];
            for (var i = 0; i < 60; i += this.minuteStep) {
                var actual = UTCDate(year, month, dayMonth, hours, i);
                clsName = '';
                if (actual.valueOf() < this.startDate || actual.valueOf() > this.endDate) {
                    clsName += ' disabled';
                } else if (Math.floor(minutes / this.minuteStep) == Math.floor(i / this.minuteStep)) {
                    clsName += ' active';
                }
                html.push('<span class="minute' + clsName + '">' + hours + ':' + (i < 10 ? '0' + i : i) + '</span>');
            }
            this.picker.find('.datepicker-minutes td').html(html.join(''));


            var currentYear = this.date && this.date.getUTCFullYear();
            var months = this.picker.find('.datepicker-months')
                .find('th:eq(1)')
                .text(year)
                .end()
                .find('span').removeClass('active');
            if (currentYear && currentYear == year) {
                months.eq(this.date.getUTCMonth()).addClass('active');
            }
            if (year < startYear || year > endYear) {
                months.addClass('disabled');
            }
            if (year == startYear) {
                months.slice(0, startMonth).addClass('disabled');
            }
            if (year == endYear) {
                months.slice(endMonth + 1).addClass('disabled');
            }

            html = '';
            year = parseInt(year / 10, 10) * 10;
            var yearCont = this.picker.find('.datepicker-years')
                .find('th:eq(1)')
                .text(year + '-' + (year + 9))
                .end()
                .find('td');
            year -= 1;
            for (var i = -1; i < 11; i++) {
                html += '<span class="year' + (i == -1 || i == 10 ? ' old' : '') + (currentYear == year ? ' active' : '') + (year < startYear || year > endYear ? ' disabled' : '') + '">' + year + '</span>';
                year += 1;
            }
            yearCont.html(html);
        },

        updateNavArrows: function() {
            var d = new Date(this.viewDate),
                year = d.getUTCFullYear(),
                month = d.getUTCMonth(),
                day = d.getUTCDate(),
                hour = d.getUTCHours();
            switch (this.viewMode) {
                case 0:
                    if (this.startDate !== -Infinity && year <= this.startDate.getUTCFullYear() && month <= this.startDate.getUTCMonth() && day <= this.startDate.getUTCDate() && hour <= this.startDate.getUTCHours()) {
                        this.picker.find('.prev').css({
                            visibility: 'hidden'
                        });
                    } else {
                        this.picker.find('.prev').css({
                            visibility: 'visible'
                        });
                    }
                    if (this.endDate !== Infinity && year >= this.endDate.getUTCFullYear() && month >= this.endDate.getUTCMonth() && day >= this.endDate.getUTCDate() && hour >= this.endDate.getUTCHours()) {
                        this.picker.find('.next').css({
                            visibility: 'hidden'
                        });
                    } else {
                        this.picker.find('.next').css({
                            visibility: 'visible'
                        });
                    }
                    break;
                case 1:
                    if (this.startDate !== -Infinity && year <= this.startDate.getUTCFullYear() && month <= this.startDate.getUTCMonth() && day <= this.startDate.getUTCDate()) {
                        this.picker.find('.prev').css({
                            visibility: 'hidden'
                        });
                    } else {
                        this.picker.find('.prev').css({
                            visibility: 'visible'
                        });
                    }
                    if (this.endDate !== Infinity && year >= this.endDate.getUTCFullYear() && month >= this.endDate.getUTCMonth() && day >= this.endDate.getUTCDate()) {
                        this.picker.find('.next').css({
                            visibility: 'hidden'
                        });
                    } else {
                        this.picker.find('.next').css({
                            visibility: 'visible'
                        });
                    }
                    break;
                case 2:
                    if (this.startDate !== -Infinity && year <= this.startDate.getUTCFullYear() && month <= this.startDate.getUTCMonth()) {
                        this.picker.find('.prev').css({
                            visibility: 'hidden'
                        });
                    } else {
                        this.picker.find('.prev').css({
                            visibility: 'visible'
                        });
                    }
                    if (this.endDate !== Infinity && year >= this.endDate.getUTCFullYear() && month >= this.endDate.getUTCMonth()) {
                        this.picker.find('.next').css({
                            visibility: 'hidden'
                        });
                    } else {
                        this.picker.find('.next').css({
                            visibility: 'visible'
                        });
                    }
                    break;
                case 3:
                case 4:
                    if (this.startDate !== -Infinity && year <= this.startDate.getUTCFullYear()) {
                        this.picker.find('.prev').css({
                            visibility: 'hidden'
                        });
                    } else {
                        this.picker.find('.prev').css({
                            visibility: 'visible'
                        });
                    }
                    if (this.endDate !== Infinity && year >= this.endDate.getUTCFullYear()) {
                        this.picker.find('.next').css({
                            visibility: 'hidden'
                        });
                    } else {
                        this.picker.find('.next').css({
                            visibility: 'visible'
                        });
                    }
                    break;
            }
        },

        click: function(e) {
            e.stopPropagation();
            e.preventDefault();

            if ($(e.target).hasClass('datepicker-close') || $(e.target).parent().hasClass('datepicker-close')) {
                this.hide();
            }

            var target = $(e.target).closest('span, td, th');
            if (target.length == 1) {
                if (target.is('.disabled')) {
                    this.element.trigger({
                        type: 'outOfRange',
                        date: this.viewDate,
                        startDate: this.startDate,
                        endDate: this.endDate
                    });
                    return;
                }

                switch (target[0].nodeName.toLowerCase()) {
                    case 'th':
                        switch (target[0].className) {
                            case 'date-switch':
                                this.showMode(1);
                                break;
                            case 'prev':
                            case 'next':
                                var dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className == 'prev' ? -1 : 1);
                                switch (this.viewMode) {
                                    case 0:
                                        this.viewDate = this.moveHour(this.viewDate, dir);
                                        break;
                                    case 1:
                                        this.viewDate = this.moveDate(this.viewDate, dir);
                                        break;
                                    case 2:
                                        this.viewDate = this.moveMonth(this.viewDate, dir);
                                        break;
                                    case 3:
                                    case 4:
                                        this.viewDate = this.moveYear(this.viewDate, dir);
                                        break;
                                }
                                this.fill();
                                break;
                            case 'today':
                                var date = new Date();
                                date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());

                                this.viewMode = this.startViewMode;
                                this.showMode(0);
                                this._setDate(date);
                                break;
                        }
                        break;
                    case 'span':
                        if (!target.is('.disabled')) {
                            if (target.is('.month')) {
                                this.viewDate.setUTCDate(1);
                                var month = target.parent().find('span').index(target);
                                this.viewDate.setUTCMonth(month);
                                this.element.trigger({
                                    type: 'changeMonth',
                                    date: this.viewDate
                                });
                            } else if (target.is('.year')) {
                                this.viewDate.setUTCDate(1);
                                var year = parseInt(target.text(), 10) || 0;
                                this.viewDate.setUTCFullYear(year);
                                this.element.trigger({
                                    type: 'changeYear',
                                    date: this.viewDate
                                });
                            } else if (target.is('.hour')) {
                                var hours = parseInt(target.text(), 10) || 0;
                                var year = this.viewDate.getUTCFullYear(),
                                    month = this.viewDate.getUTCMonth(),
                                    day = this.viewDate.getUTCDate(),
                                    minutes = this.viewDate.getUTCMinutes(),
                                    seconds = this.viewDate.getUTCSeconds();
                                this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
                            } else if (target.is('.minute')) {
                                var minutes = parseInt(target.text().substr(target.text().indexOf(':') + 1), 10) || 0;
                                var year = this.viewDate.getUTCFullYear(),
                                    month = this.viewDate.getUTCMonth(),
                                    day = this.viewDate.getUTCDate(),
                                    hours = this.viewDate.getUTCHours(),
                                    seconds = this.viewDate.getUTCSeconds();
                                this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
                            }



                            if (this.viewMode != 0) {



                                var oldViewMode = this.viewMode;
                                this.showMode(-1);
                                this.fill();
                                if (oldViewMode == this.viewMode && this.autoclose) {
                                    this.hide();
                                }
                            } else {
                                this.fill();
                                if (this.autoclose) {
                                    this.hide();
                                }
                            }
                        }
                        break;
                    case 'td':



                        if (target.is('.day') && !target.is('.disabled')) {
                            var day = parseInt(target.text(), 10) || 1;
                            var year = this.viewDate.getUTCFullYear(),
                                month = this.viewDate.getUTCMonth(),
                                hours = this.viewDate.getUTCHours(),
                                minutes = this.viewDate.getUTCMinutes(),
                                seconds = this.viewDate.getUTCSeconds();
                            if (target.is('.old')) {
                                if (month === 0) {
                                    month = 11;
                                    year -= 1;
                                } else {
                                    month -= 1;
                                }
                            } else if (target.is('.new')) {
                                if (month == 11) {
                                    month = 0;
                                    year += 1;
                                } else {
                                    month += 1;
                                }
                            }
                            this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
                        }



                        var oldViewMode = this.viewMode;


                        this.showMode(-1);


                        this.fill();
                        if (oldViewMode == this.viewMode && this.autoclose) {
                            this.hide();
                        }
                        break;
                }
            }
        },

        _setDate: function(date, which) {

            if (!which || which == 'date')
                this.date = date;
            if (!which || which == 'view')
                this.viewDate = date;
            this.fill();
            this.setValue();
            this.element.trigger({
                type: 'changeDate',
                date: this.date
            });
            var element;
            if (this.isInput) {
                element = this.element;
            } else if (this.component) {
                element = this.element.find('input');
            }
            if (element) {
                element.change();
                if (this.autoclose && (!which || which == 'date')) {
                    // this.hide();
                }
            }
        },

        moveHour: function(date, dir) {
            if (!dir) return date;
            var new_date = new Date(date.valueOf());
            dir = dir > 0 ? 1 : -1;
            new_date.setUTCHours(new_date.getUTCHours() + dir);
            return new_date;
        },

        moveDate: function(date, dir) {
            if (!dir) return date;
            var new_date = new Date(date.valueOf());
            dir = dir > 0 ? 1 : -1;
            new_date.setUTCDate(new_date.getUTCDate() + dir);
            return new_date;
        },

        moveMonth: function(date, dir) {
            if (!dir) return date;
            var new_date = new Date(date.valueOf()),
                day = new_date.getUTCDate(),
                month = new_date.getUTCMonth(),
                mag = Math.abs(dir),
                new_month, test;
            dir = dir > 0 ? 1 : -1;
            if (mag == 1) {
                test = dir == -1
                    // If going back one month, make sure month is not current month
                    // (eg, Mar 31 -> Feb 31 == Feb 28, not Mar 02)
                    ? function() {
                        return new_date.getUTCMonth() == month;
                    }
                    // If going forward one month, make sure month is as expected
                    // (eg, Jan 31 -> Feb 31 == Feb 28, not Mar 02)
                    : function() {
                        return new_date.getUTCMonth() != new_month;
                    };
                new_month = month + dir;
                new_date.setUTCMonth(new_month);
                // Dec -> Jan (12) or Jan -> Dec (-1) -- limit expected date to 0-11
                if (new_month < 0 || new_month > 11)
                    new_month = (new_month + 12) % 12;
            } else {
                // For magnitudes >1, move one month at a time...
                for (var i = 0; i < mag; i++)
                // ...which might decrease the day (eg, Jan 31 to Feb 28, etc)...
                    new_date = this.moveMonth(new_date, dir);
                // ...then reset the day, keeping it in the new month
                new_month = new_date.getUTCMonth();
                new_date.setUTCDate(day);
                test = function() {
                    return new_month != new_date.getUTCMonth();
                };
            }
            // Common date-resetting loop -- if date is beyond end of month, make it
            // end of month
            while (test()) {
                new_date.setUTCDate(--day);
                new_date.setUTCMonth(new_month);
            }
            return new_date;
        },

        moveYear: function(date, dir) {
            return this.moveMonth(date, dir * 12);
        },

        dateWithinRange: function(date) {
            return date >= this.startDate && date <= this.endDate;
        },

        keydown: function(e) {
            if (this.picker.is(':not(:visible)')) {
                if (e.keyCode == 27) // allow escape to hide and re-show picker
                    this.show();
                return;
            }
            var dateChanged = false,
                dir, day, month,
                newDate, newViewDate;
            switch (e.keyCode) {
                case 27: // escape
                    this.hide();
                    e.preventDefault();
                    break;
                case 37: // left
                case 39: // right
                    if (!this.keyboardNavigation) break;
                    dir = e.keyCode == 37 ? -1 : 1;
                    if (e.ctrlKey) {
                        newDate = this.moveYear(this.date, dir);
                        newViewDate = this.moveYear(this.viewDate, dir);
                    } else if (e.shiftKey) {
                        newDate = this.moveMonth(this.date, dir);
                        newViewDate = this.moveMonth(this.viewDate, dir);
                    } else {
                        newDate = new Date(this.date.valueOf());
                        newDate.setUTCDate(this.date.getUTCDate() + dir);
                        newViewDate = new Date(this.viewDate.valueOf());
                        newViewDate.setUTCDate(this.viewDate.getUTCDate() + dir);
                    }
                    if (this.dateWithinRange(newDate)) {
                        this.date = newDate;
                        this.viewDate = newViewDate;
                        this.setValue();
                        this.update();
                        e.preventDefault();
                        dateChanged = true;
                    }
                    break;
                case 38: // up
                case 40: // down
                    if (!this.keyboardNavigation) break;
                    dir = e.keyCode == 38 ? -1 : 1;
                    if (e.ctrlKey) {
                        newDate = this.moveYear(this.date, dir);
                        newViewDate = this.moveYear(this.viewDate, dir);
                    } else if (e.shiftKey) {
                        newDate = this.moveMonth(this.date, dir);
                        newViewDate = this.moveMonth(this.viewDate, dir);
                    } else {
                        newDate = new Date(this.date.valueOf());
                        newDate.setUTCDate(this.date.getUTCDate() + dir * 7);
                        newViewDate = new Date(this.viewDate.valueOf());
                        newViewDate.setUTCDate(this.viewDate.getUTCDate() + dir * 7);
                    }
                    if (this.dateWithinRange(newDate)) {
                        this.date = newDate;
                        this.viewDate = newViewDate;
                        this.setValue();
                        this.update();
                        e.preventDefault();
                        dateChanged = true;
                    }
                    break;
                case 13: // enter
                    this.hide();
                    e.preventDefault();
                    break;
                case 9: // tab
                    this.hide();
                    break;
            }
            if (dateChanged) {
                this.element.trigger({
                    type: 'changeDate',
                    date: this.date
                });
                var element;
                if (this.isInput) {
                    element = this.element;
                } else if (this.component) {
                    element = this.element.find('input');
                }
                if (element) {
                    element.change();
                }
            }
        },

        showMode: function(dir) {

            if (dir) {
                var newViewMode = Math.max(0, Math.min(DPGlobal.modes.length - 1, this.viewMode + dir));
                if (newViewMode >= this.minView && newViewMode <= this.maxView) {
                    this.viewMode = newViewMode;
                }
            }
            /*
            	vitalets: fixing bug of very special conditions:
            	jquery 1.7.1 + webkit + show inline datepicker in bootstrap popover.
            	Method show() does not set display css correctly and datepicker is not shown.
            	Changed to .css('display', 'block') solve the problem.
            	See https://github.com/vitalets/x-editable/issues/37

            	In jquery 1.7.2+ everything works fine.
            */
            //this.picker.find('>div').hide().filter('.datepicker-'+DPGlobal.modes[this.viewMode].clsName).show();
            this.picker.find('>div').hide().filter('.datepicker-' + DPGlobal.modes[this.viewMode].clsName).css('display', 'block');
            this.updateNavArrows();
        },
        reset: function(e) {
            this._setDate(null, 'date');
        }
    };

    $.fn.fdatepicker = function(option) {
        var args = Array.apply(null, arguments);
        args.shift();
        return this.each(function() {
            var $this = $(this),
                data = $this.data('datepicker'),
                options = typeof option == 'object' && option;
            if (!data) {
                $this.data('datepicker', (data = new Datepicker(this, $.extend({}, $.fn.fdatepicker.defaults, options))));
            }
            if (typeof option == 'string' && typeof data[option] == 'function') {
                data[option].apply(data, args);
            }
        });
    };

    $.fn.fdatepicker.defaults = {
        onRender: function(date) {
            return '';
        }
    };
    $.fn.fdatepicker.Constructor = Datepicker;
    var dates = $.fn.fdatepicker.dates = {
        'en': {
            days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            today: "Today",
            titleFormat: "MM yyyy"
        }
    };

    var DPGlobal = {
        modes: [{
            clsName: 'minutes',
            navFnc: 'Hours',
            navStep: 1
        }, {
            clsName: 'hours',
            navFnc: 'Date',
            navStep: 1
        }, {
            clsName: 'days',
            navFnc: 'Month',
            navStep: 1
        }, {
            clsName: 'months',
            navFnc: 'FullYear',
            navStep: 1
        }, {
            clsName: 'years',
            navFnc: 'FullYear',
            navStep: 10
        }],
        isLeapYear: function(year) {
            return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
        },
        getDaysInMonth: function(year, month) {
            return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        },
        validParts: /hh?|ii?|ss?|dd?|mm?|MM?|yy(?:yy)?/g,
        nonpunctuation: /[^ -\/:-@\[\u3400-\u9fff-`{-~\t\n\r]+/g,
        parseFormat: function(format) {
            // IE treats \0 as a string end in inputs (truncating the value),
            // so it's a bad format delimiter, anyway
            var separators = format.replace(this.validParts, '\0').split('\0'),
                parts = format.match(this.validParts);
            if (!separators || !separators.length || !parts || parts.length === 0) {
                throw new Error("Invalid date format.");
            }
            return {
                separators: separators,
                parts: parts
            };
        },
        parseDate: function(date, format, language) {
            if (date instanceof Date) return new Date(date.valueOf() - date.getTimezoneOffset() * 60000);
            if (/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(date)) {
                format = this.parseFormat('yyyy-mm-dd');
            }
            if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}$/.test(date)) {
                format = this.parseFormat('yyyy-mm-dd hh:ii');
            }
            if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}\:\d{1,2}[Z]{0,1}$/.test(date)) {
                format = this.parseFormat('yyyy-mm-dd hh:ii:ss');
            }
            if (/^[-+]\d+[dmwy]([\s,]+[-+]\d+[dmwy])*$/.test(date)) {
                var part_re = /([-+]\d+)([dmwy])/,
                    parts = date.match(/([-+]\d+)([dmwy])/g),
                    part, dir;
                date = new Date();
                for (var i = 0; i < parts.length; i++) {
                    part = part_re.exec(parts[i]);
                    dir = parseInt(part[1]);
                    switch (part[2]) {
                        case 'd':
                            date.setUTCDate(date.getUTCDate() + dir);
                            break;
                        case 'm':
                            date = Datetimepicker.prototype.moveMonth.call(Datetimepicker.prototype, date, dir);
                            break;
                        case 'w':
                            date.setUTCDate(date.getUTCDate() + dir * 7);
                            break;
                        case 'y':
                            date = Datetimepicker.prototype.moveYear.call(Datetimepicker.prototype, date, dir);
                            break;
                    }
                }
                return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            }
            var parts = date && date.match(this.nonpunctuation) || [],
                date = new Date(),
                parsed = {},
                setters_order = ['hh', 'h', 'ii', 'i', 'ss', 's', 'yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'd', 'dd'],
                setters_map = {
                    hh: function(d, v) {
                        return d.setUTCHours(v);
                    },
                    h: function(d, v) {
                        return d.setUTCHours(v);
                    },
                    ii: function(d, v) {
                        return d.setUTCMinutes(v);
                    },
                    i: function(d, v) {
                        return d.setUTCMinutes(v);
                    },
                    ss: function(d, v) {
                        return d.setUTCSeconds(v);
                    },
                    s: function(d, v) {
                        return d.setUTCSeconds(v);
                    },
                    yyyy: function(d, v) {
                        return d.setUTCFullYear(v);
                    },
                    yy: function(d, v) {
                        return d.setUTCFullYear(2000 + v);
                    },
                    m: function(d, v) {
                        v -= 1;
                        while (v < 0) v += 12;
                        v %= 12;
                        d.setUTCMonth(v);
                        while (d.getUTCMonth() != v)
                            d.setUTCDate(d.getUTCDate() - 1);
                        return d;
                    },
                    d: function(d, v) {
                        return d.setUTCDate(v);
                    }
                },
                val, filtered, part;
            setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
            setters_map['dd'] = setters_map['d'];
            date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0); //date.getHours(), date.getMinutes(), date.getSeconds());
            if (parts.length == format.parts.length) {
                for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
                    val = parseInt(parts[i], 10);
                    part = format.parts[i];
                    if (isNaN(val)) {
                        switch (part) {
                            case 'MM':
                                filtered = $(dates[language].months).filter(function() {
                                    var m = this.slice(0, parts[i].length),
                                        p = parts[i].slice(0, m.length);
                                    return m == p;
                                });
                                val = $.inArray(filtered[0], dates[language].months) + 1;
                                break;
                            case 'M':
                                filtered = $(dates[language].monthsShort).filter(function() {
                                    var m = this.slice(0, parts[i].length),
                                        p = parts[i].slice(0, m.length);
                                    return m == p;
                                });
                                val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
                                break;
                        }
                    }
                    parsed[part] = val;
                }
                for (var i = 0, s; i < setters_order.length; i++) {
                    s = setters_order[i];
                    if (s in parsed && !isNaN(parsed[s]))
                        setters_map[s](date, parsed[s])
                }
            }
            return date;
        },
        formatDate: function(date, format, language) {
            if (date == null) {
                return '';
            }
            var val = {
                h: date.getUTCHours(),
                i: date.getUTCMinutes(),
                s: date.getUTCSeconds(),
                d: date.getUTCDate(),
                m: date.getUTCMonth() + 1,
                M: dates[language].monthsShort[date.getUTCMonth()],
                MM: dates[language].months[date.getUTCMonth()],
                yy: date.getUTCFullYear().toString().substring(2),
                yyyy: date.getUTCFullYear()
            };
            val.hh = (val.h < 10 ? '0' : '') + val.h;
            val.ii = (val.i < 10 ? '0' : '') + val.i;
            val.ss = (val.s < 10 ? '0' : '') + val.s;
            val.dd = (val.d < 10 ? '0' : '') + val.d;
            val.mm = (val.m < 10 ? '0' : '') + val.m;
            
            
            /*if (val.hh > 12) {
              val.hh = val.hh-12;
              val.ii = val.ii + " PM";
            }*/
            var date = [],
                seps = $.extend([], format.separators);
            for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
                if (seps.length)
                    date.push(seps.shift())
                date.push(val[format.parts[i]]);
            }
            return date.join('');
        },
        convertViewMode: function(viewMode) {
            switch (viewMode) {
                case 4:
                case 'decade':
                    viewMode = 4;
                    break;
                case 3:
                case 'year':
                    viewMode = 3;
                    break;
                case 2:
                case 'month':
                    viewMode = 2;
                    break;
                case 1:
                case 'day':
                    viewMode = 1;
                    break;
                case 0:
                case 'hour':
                    viewMode = 0;
                    break;
            }

            return viewMode;
        },
        headTemplate: '<thead>' +
            '<tr>' +
            '<th class="prev"><i class="fa fa-chevron-left fi-arrow-left"/></th>' +
            '<th colspan="5" class="date-switch" alt="Click here to edit" title="Click the Month/Year to alter it"></th>' +
            '<th class="next"><i class="fa fa-chevron-right fi-arrow-right"/></th>' +
            '</tr>' +
            '<tr><th colspan="7" class="calendarNote">Click on the Month/Year to alter</th></tr>' +
            '</thead>',
        headHourTemplate: '<thead>' +
            '<tr>' +
            '<th class="prev"><i class="fa fa-chevron-left fi-arrow-left"/></th>' +
            '<th colspan="5" class="date-switch" alt="Click here to edit" title="Click the Month/Year to alter it"></th>' +
            '<th class="next"><i class="fa fa-chevron-right fi-arrow-right"/></th>' +
            '</tr>' +
            '<tr><th colspan="7" class="calendarNote">Choose Hour</th></tr>' +
            '</thead>',
        headMinuteTemplate: '<thead>' +
            '<tr>' +
            '<th class="prev"><i class="fa fa-chevron-left fi-arrow-left"/></th>' +
            '<th colspan="5" class="date-switch" alt="Click here to edit" title="Click the Month/Year to alter it"></th>' +
            '<th class="next"><i class="fa fa-chevron-right fi-arrow-right"/></th>' +
            '</tr>' +
            '<tr><th colspan="7" class="calendarNote">Choose Minutes</th></tr>' +
            '</thead>',
        contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
        footTemplate: '<tfoot><tr><th colspan="7" class="today"></th></tr></tfoot>'
    };
    DPGlobal.template = '<div class="datepicker">' +
        '<div class="datepicker-minutes">' +
        '<table class=" table-condensed">' +
        DPGlobal.headMinuteTemplate +
        DPGlobal.contTemplate +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '<div class="datepicker-hours">' +
        '<table class=" table-condensed">' +
        DPGlobal.headHourTemplate +
        DPGlobal.contTemplate +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '<div class="datepicker-days">' +
        '<table class=" table-condensed">' +
        DPGlobal.headTemplate +
        '<tbody></tbody>' +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '<div class="datepicker-months">' +
        '<table class="table-condensed">' +
        DPGlobal.headTemplate +
        DPGlobal.contTemplate +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '<div class="datepicker-years">' +
        '<table class="table-condensed">' +
        DPGlobal.headTemplate +
        DPGlobal.contTemplate +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '<a class="button datepicker-close tiny alert right" style="width:auto;"><i class="fa fa-remove fa-times fi-x"></i></a>' +
        '</div>';

    $.fn.fdatepicker.DPGlobal = DPGlobal;

}(window.jQuery);

/**
 * ZURB FOUNDATION 5 MULTISELECT PLUGIN
 *
 * @author Andrea Mariani
 * @mail me@andreamariani.net
 * @twitter @andreamariani2k
 * @web http://www.andreamariani.net
 *
 * ** THIS PLUGIN IS IN DEVELOPMENT ** *
 */

(function ($) {
  //todo: click out for close the dropdown
  $(document).mouseup(function (e) {
  	
    var container = $(".zselect ul");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
      container.hide();
      //console.log(e.target);
    } 
    else {	
      //console.log(e.target);
      //console.log('else');
    }
  });
  
 
  //open dropdown onclick
  $(document).on('click touchstart', '.zselect', function (e) {

    var click = $(e.target).prop("tagName");
    if (click !== 'LI' && click !== 'INPUT') {
      $("li.zmsfilter input").val('').keyup(); //clean filter
      $("ul", this).toggle();
    }
  });            
          
  //escape key for close all zselect
  $(window).on('keydown', function (e) {
    e = e || window.event;
    if (e.keyCode === 27) {
      $("li.zmsfilter input").val('').keyup(); //clean filter
      $(".zselect ul").hide();
    }
  });

  //click on label toggle input
  $(document).on('click touchstart', 'li', function (e) {
    if ($(e.target).prop("tagName") !== "INPUT") {
      $("input:checkbox[disabled!='disabled']", this).prop('checked', function (i, val) {
        return !val;
      }).trigger('change');
    }
    //how do we get a handle on the hidden element??
    //append current checked value to hidden element..
  });
  
  //select all and deselect all
  $(document).on('click touchstart', '.selectall,.deselectall', function () {
    var state = ($(this).hasClass('selectall')) ? true : false;
    $(this).parent().find("input:checkbox[disabled!='disabled']").prop('checked', state).change();
  });

  //optgroup
  $(document).on('click touchstart', '.optgroup', function () {
    $(this).parent().find(".optgroup_" + $(this).attr('data-optgroup') + " li input:checkbox[disabled!='disabled']").prop('checked', function (i, val) {
      return !val;
    }).change();
  });

  //when resize window + init
  function onResize(reflow) {
    $.each($(".zselect"), function (k, v) {
      //if( $(v).find("ul").attr('style') !== undefined && reflow !== true ) return false; //break if already set

      var w = $(v).outerWidth();

      $(v).find("ul").attr('style', 'width:' + w + 'px!important;');


      //var size = Math.max(Math.min(w / (1), parseFloat(20)), parseFloat(11));
      //console.log(size);
      //$(v).find('ul li').css('font-size', size);

      var w_li = $(v).find('ul li:eq(0)').width();
      //console.log(w_li);
    });
  }
  
  $(window).resize(function () {
    onResize();
  });

  function refreshPlaceholder(rel, placeholder, selectedText, hiddenEl, isMultiple ) {

    var counter = selectedText || ['Selected ', 'of '];
    
    if (isMultiple) {
    	var checked = $("div#" + rel + " ul li input:checked").length;
    	var tot = $("div#" + rel + " ul li input:checkbox").length;
    } else {
    	var checked = $("div#" + rel + " ul li input:checked").length;
    	var tot = 1;
    	
    }
    $("#"+hiddenEl).parent().find("select").find("option").removeAttr("selected");
    $("#"+hiddenEl).parent().find("select").find("option").removeAttr("data-selected");
    if (checked > 0) {
      $(".zselect#" + rel + " span.zmshead").text( counter[0]+" "+checked+" "+counter[1]+" "+tot);
      var x = $("div#" + rel + " ul li input:checked");
      var string="";
      for(var i=0; i < x.length; i++){
        string += x[i].value + "|";
        $("#"+hiddenEl).parent().find("select").find("option[value=" + x[i].value + "]").attr("selected", "selected");
        $("#"+hiddenEl).parent().find("select").find("option[value=" + x[i].value + "]").attr("data-selected", "true");
      }
    } else {

      $(".zselect#" + rel + " span.zmshead").html((placeholder === undefined) ? '&nbsp;' : placeholder);
    }
/*    $('#'+hiddenEl).val(string.substring(0,string.length-1));*/
  }
  
  var methods = {
    init: function (options) {

      var id, checked, disabled = "",
              disabledClass = "";
      var optgroup = [];
      var optgroup_size, optgroup_id = 0;
      var optgroup_name = false;

      $.each($(this), function (k, v) {

        id = Math.random().toString(36).substr(2, 9);
        $(v).hide().attr('rel', id);
        $("<div id='" + id + "' class='zselect' tabIndex='0' ><span class='zmshead'></span><ul></ul></div>").insertAfter($(v).parent().find("select"));

        if (options.selectAll !== false && options.multiple!==false) {
          var sAllText = "Select All";
          var desAllText = "Deselect All";
          if (options.selectAllText !== undefined) {
            sAllText = options.selectAllText[0];
            desAllText = options.selectAllText[1];
          }

          $('#' + id + ' ul').append("<li class='selectall'>" + sAllText + "</li>");
          $('#' + id + ' ul').append("<li class='deselectall'>" + desAllText + "</li>");
        }

        $.each(v, function (j, z) {

          var appendTo;
          if ($(z).parent().attr("label") !== undefined && optgroup.indexOf($(z).parent().attr("label")) === -1) {
            optgroup_size = $(z).parent().find('option').size();
            optgroup_name = $(z).parent().attr("label");

            $('#' + id + ' ul').append("<li class='optgroup' data-optgroup='" + optgroup_id + "'>" + $(z).parent().attr("label") + "</li>");
            $('#' + id + ' ul').append($("<div>").addClass('optgroup_' + optgroup_id));
            optgroup.push($(z).parent().attr("label"));
          }
          //console.log( $(z).attr('value') + " " + $(z).text() );
          //console.log( $(z).attr('value') + " " + $(z).text() );
          //console.log(id);
          //console.log( '#'+id+' ul' );
          checked = ($(z).is('[data-selected]')) ? "checked='checked'" : "";
          dataZ = ($(z).data("z") !== undefined) ? 'data-z="' + $(z).data("z") + '"' : "";

          if ($(z).is('[data-disabled]')) {
            disabled = "disabled='disabled'";
            disabledClass = "class='disabled'";
          } else {
            disabled = disabledClass = "";
          }

          if (optgroup_name === false) appendTo = '#' + id + ' ul';
          else appendTo = '#' + id + ' ul div.optgroup_' + optgroup_id;
          
          $(appendTo).append("<li " + disabledClass + " data-hiddenEl='" + options.hiddenEl + "'><input value='" + $(z).val() + "' type='checkbox' " + checked + " " + disabled + " " + dataZ + " />&nbsp;" + $(z).text() + "</li>");

          if (optgroup_size === j + 1) {
            optgroup_size = 0;
            optgroup_id++;
            optgroup_name = false;
          }
        });
       
        $('#' + id + ' span.zmshead').html((options.placeholder === undefined) ? '&nbsp;' : options.placeholder);
      });

      if (options.filter === true && options.multiple === true) {
        //defaults
        if (options.filterResult === undefined) options.filterResult = true;
        if (options.filterResultText === undefined) options.filterResultText = 'showed';
        var fplaholder = (options.filterPlaceholder !== undefined) ? options.filterPlaceholder : "Filter...";
        var rel = this.attr('rel');
        $("div#" + rel + " ul").prepend('<li class="zmsfilter"><input type="text" placeholder="' + fplaholder + '" /></li>');


        if (options.filterResult === true)
          $("div#" + rel + " ul").append('<li class="filterResult"></li>');

        $("div#" + rel + " ul li.zmsfilter input").keyup(function () {
          var value = $(this).val().toLowerCase();
          var show = 0,
                  tot = $("div#" + rel + " ul li input:checkbox").length;
          $("div#" + rel + " ul li input:checkbox").filter(function (i, v) {
            //console.log($(v).val());
            //console.log($(v).parent().text());
            if ($(v).val().toLowerCase().indexOf(value) === -1 && $(v).parent().text().toLowerCase().indexOf(value) === -1) { //and text() check...
              $(v).parent().hide();

            } else {
              $(v).parent().show();
              show++;
            }
          });

          if (options.filterResult === true)
            $("div#" + rel + " ul li.filterResult").text(options.filterResultText + ' ' + show + '/' + tot);

        });
      } //end filter

      if (options.filter === true && options.multiple === false) {
        //defaults
        if (options.filterResult === undefined) options.filterResult = true;
        if (options.filterResultText === undefined) options.filterResultText = 'showed';
        var fplaholder = (options.filterPlaceholder !== undefined) ? options.filterPlaceholder : "Filter...";
        var rel = this.attr('rel');
        $("div#" + rel + " ul").prepend('<li class="zmsfilter"><input type="text" placeholder="' + fplaholder + '" /></li>');


        if (options.filterResult === true)
          $("div#" + rel + " ul").append('<li class="filterResult"></li>');

        $("div#" + rel + " ul li.zmsfilter input").keyup(function () {
          var value = $(this).val().toLowerCase();
          var show = 0,
                  tot = $("div#" + rel + " ul li input:radio").length;
          $("div#" + rel + " ul li input:radio").filter(function (i, v) {
            //console.log($(v).val());
            //console.log($(v).parent().text());
            if ($(v).val().toLowerCase().indexOf(value) === -1 && $(v).parent().text().toLowerCase().indexOf(value) === -1) { //and text() check...
              $(v).parent().hide();
            } else {
              $(v).parent().show();
              show++;
            }
          });
          if (options.filterResult === true)
            $("div#" + rel + " ul li.filterResult").text(options.filterResultText + ' ' + show + '/' + tot);
        });
      }
      if (options.live !== undefined) {
        var rel = this.attr('rel');
        $(".zselect#" + rel).on('change', 'input:checkbox', function (e) {
          $(options.live).val(methods.getValue($("select[rel='" + rel + "']")));
        });
      } //end live
      
      if (options.multiple === false ) {
        $(document).ready(function () {
          $('div#'+rel).find("input:checkbox").attr('type', 'radio').attr('name', 'group1');

        });

        $(document).ready(function() {
          $('input:radio').change(function() {
              $('input:radio').not(this).each(function(idx, el) {
                  el.checked = false;
              });
          });
       });
        $(document).on('click touchstart', 'li', function (e) {
          if ($(e.target).prop("tagName") !== "INPUT") {
            $("input:radio[disabled!='disabled']", this).prop('checked', function (i, val) {
              return !val;
            }).trigger('change');
          }
        });
        
        $(".zselect#" + rel).on('change', 'input:radio', function () {
          refreshPlaceholder(rel, options.placeholder, options.selectedText,options.hiddenEl, options.multiple);
        });
      }
      
      if (options.get !== undefined && options.multiple === true) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        var need = false;
        for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split("=");
          if (pair[0] == options.get) {
            need = pair[1].replace(',', '%2C').split('%2C');
          }
        }
        if (need ) {
          var rel = this.attr('rel');
          for (var i = 0; i < need.length; i++) {
            //console.log(need[i]);
            $(".zselect#" + rel + " ul li input:checkbox[value='" + need[i] + "']").trigger('click touchstart');
          }
          refreshPlaceholder(rel, options.placeholder, options.selectedText, options.hiddenEl, options.multiple);
        }
      }
      //placeholder dopo click
      $(".zselect#" + rel).on('change', 'input:checkbox', function () {
        refreshPlaceholder(rel, options.placeholder, options.selectedText,  options.hiddenEl, options.multiple);
      });
      onResize();
    },
    
    getValue: function (selector) {
      if (selector === undefined) selector = this;
      var value = new Array();
      var rel = $(selector).attr('rel');
      $.each($("div#" + rel + " ul li input"), function (k, v) {
        if ($(v).val() !== undefined) {
          if ($(v).prop('checked'))
            value.push($(v).val());
        }
      });
      return value;
    },

    open: function () {
      $("div#" + $(this).attr('rel') + " ul").show();
    },
    
    close: function () {
      $("div#" + $(this).attr('rel') + " ul").hide();
    },

    disable: function (val, state) { //console.log(state);
      if (val !== undefined) {
        if (state) $("div#" + $(this).attr('rel') + " ul li input:checkbox[value='" + val + "']").attr('disabled', 'disabled');
        else $("div#" + $(this).attr('rel') + " ul li input:checkbox[value='" + val + "']").removeAttr('disabled');
      } else {
        if (state) $("div#" + $(this).attr('rel') + " ul li input:checkbox").attr('disabled', 'disabled');
        else $("div#" + $(this).attr('rel') + " ul li input:checkbox").removeAttr('disabled');
      }
    },
    
    set: function (val, checked) {
      $("div#" + $(this).attr('rel') + " ul li input:checkbox[value='" + val + "']").prop('checked', checked).change();
    },
    
    uncheckall_inpage: function () {
      $(".zselect ul li input:checkbox").prop('checked', false).change();
    },
    
    checkall_inpage: function () {
      $(".zselect ul li input:checkbox").prop('checked', true).change();
    },
    
    checkall: function () {
      $("div#" + $(this).attr('rel') + " ul li input:checkbox").prop('checked', true).change();
    },
    
    uncheckall: function () {
      $("div#" + $(this).attr('rel') + " ul li input:checkbox").prop('checked', false).change();
    },
    
    destroy: function (val) {
      $("div#" + $(this).attr('rel') + " ul li input:checkbox[value='" + val + "']").parent().remove();
    },
    
    reflow: function () {
      onResize(true);
    },

    add: function (option, pos) {
      var position = pos || 'append';
      var checked = '',
              disabled = '',
              disabledClass = '';
      if (option.checked) checked = ' checked="checked" ';
      if (option.disabled) {
        disabled = ' disabled="disabled" ';
        disabledClass = ' class="disabled" ';
      }
      if (position === 'append') $("div#" + $(this).attr('rel') + " ul").append("<li " + disabledClass + "><input value='" + option.value + "' type='checkbox' " + checked + " " + disabled + " />&nbsp;" + option.text + "</li>");
      else {
        if (position === 'prepend') {
          $("<li " + disabledClass + "><input value='" + option.value + "' type='checkbox' " + checked + " " + disabled + " />&nbsp;" + option.text + "</li>").insertAfter($("div#" + $(this).attr('rel') + " ul li.deselectall"));
        } else {
          $("<li " + disabledClass + "><input value='" + option.value + "' type='checkbox' " + checked + " " + disabled + " />&nbsp;" + option.text + "</li>").insertAfter($("div#" + $(this).attr('rel') + " ul li input[value='" + position.substring(1) + "']").closest('li'));
        }
      }
    }
    //,update : function( content ) {  }
  };
  
  $.fn.zmultiselect = function (methodOrOptions) {
    if (methods[methodOrOptions]) {
      return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + methodOrOptions + ' does not exist on zmultiselect');
    }
  };

})(jQuery);

/**
 * Mobiscroll v2.17.1
 * http://mobiscroll.com
 *
 * Copyright 2010-2015, Acid Media
 * Licensed under the MIT license.
 *
 */

(function ($, undefined) {
  function testProps(props) {
    var i;
    for (i in props) {
      if (mod[props[i]] !== undefined) {
        return true;
      }
    }
    return false;
  }

  function testPrefix() {
    var prefixes = ['Webkit', 'Moz', 'O', 'ms'],
        p;
    for (p in prefixes) {
      if (testProps([prefixes[p] + 'Transform'])) {
        return '-' + prefixes[p].toLowerCase() + '-';
      }
    }
    return '';
  }

  function init(that, options, args) {
    var ret = that;
    // Init
    if (typeof options === 'object') {
      return that.each(function () {
        if (instances[this.id]) {
          instances[this.id].destroy();
        }
        new $.mobiscroll.classes[options.component || 'Scroller'](this, options);
      });
    }
    // Method call
    if (typeof options === 'string') {
      that.each(function () {
        var r,
            inst = instances[this.id];
        if (inst && inst[options]) {
          r = inst[options].apply(this, Array.prototype.slice.call(args, 1));
          if (r !== undefined) {
            ret = r;
            return false;
          }
        }
      });
    }
    return ret;
  }

  var ms,
      id = +new Date(),
      instances = {},
      extend = $.extend,
      mod = document.createElement('modernizr').style,
      has3d = testProps(['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective']),
      hasFlex = testProps(['flex', 'msFlex', 'WebkitBoxDirection']),
      prefix = testPrefix(),
      pr = prefix.replace(/^\-/, '').replace(/\-$/, '').replace('moz', 'Moz');
  $.fn.mobiscroll = function (method) {
    extend(this, $.mobiscroll.components);
    return init(this, method, arguments);
  };
  ms = $.mobiscroll = $.mobiscroll || {
        version: '2.17.1',
        util: {
          prefix: prefix,
          jsPrefix: pr,
          has3d: has3d,
          hasFlex: hasFlex,
          isOldAndroid: /android [1-3]/i.test(navigator.userAgent),
          preventClick: function () {
            // Prevent ghost click
            ms.tapped++;
            setTimeout(function () {
              ms.tapped--;
            }, 500);
          },
          testTouch: function (e, elm) {
            if (e.type == 'touchstart') {
              $(elm).attr('data-touch', '1');
            } else if ($(elm).attr('data-touch')) {
              $(elm).removeAttr('data-touch');
              return false;
            }
            return true;
          },
          objectToArray: function (obj) {
            var arr = [],
                i;
            for (i in obj) {
              arr.push(obj[i]);
            }
            return arr;
          },
          arrayToObject: function (arr) {
            var obj = {},
                i;
            if (arr) {
              for (i = 0; i < arr.length; i++) {
                obj[arr[i]] = arr[i];
              }
            }
            return obj;
          },
          isNumeric: function (a) {
            return a - parseFloat(a) >= 0;
          },
          isString: function (s) {
            return typeof s === 'string';
          },
          getCoord: function (e, c, page) {
            var ev = e.originalEvent || e,
                prop = (page ? 'page' : 'client') + c;
            return ev.changedTouches ? ev.changedTouches[0][prop] : e[prop];
          },
          getPosition: function (t, vertical) {
            var style = window.getComputedStyle ? getComputedStyle(t[0]) : t[0].style,
                matrix,
                px;
            if (has3d) {
              $.each(['t', 'webkitT', 'MozT', 'OT', 'msT'], function (i, v) {
                if (style[v + 'ransform'] !== undefined) {
                  matrix = style[v + 'ransform'];
                  return false;
                }
              });
              matrix = matrix.split(')')[0].split(', ');
              px = vertical ? (matrix[13] || matrix[5]) : (matrix[12] || matrix[4]);
            } else {
              px = vertical ? style.top.replace('px', '') : style.left.replace('px', '');
            }
            return px;
          },
          addIcon: function ($control, ic) {
            var icons = {},
                $parent = $control.parent(),
                errorMsg = $parent.find('.mbsc-err-msg'),
                align = $control.attr('data-icon-align') || 'left',
                icon = $control.attr('data-icon');
            // Wrap input
            $('<span class="mbsc-input-wrap"></span>').insertAfter($control).append($control);
            if (errorMsg) {
              $parent.find('.mbsc-input-wrap').append(errorMsg);
            }
            if (icon) {
              if (icon.indexOf('{') !== -1) {
                icons = JSON.parse(icon);
              } else {
                icons[align] = icon;
              }
              extend(icons, ic);
              $parent
                  .addClass((icons.right ? 'mbsc-ic-right ' : '') + (icons.left ? ' mbsc-ic-left' : ''))
                  .find('.mbsc-input-wrap')
                  .append(icons.left ? '<span class="mbsc-input-ic mbsc-left-ic mbsc-ic mbsc-ic-' + icons.left + '"></span>' : '')
                  .append(icons.right ? '<span class="mbsc-input-ic mbsc-right-ic mbsc-ic mbsc-ic-' + icons.right + '"></span>' : '');
            }
          },
          constrain: function (val, min, max) {
            return Math.max(min, Math.min(val, max));
          },
          vibrate: function (time) {
            if ('vibrate' in navigator) {
              navigator.vibrate(time || 50);
            }
          }
        },
        tapped: 0,
        autoTheme: 'mobiscroll',
        presets: {
          scroller: {},
          numpad: {},
          listview: {},
          menustrip: {}
        },
        themes: {
          form: {},
          frame: {},
          listview: {},
          menustrip: {},
          progress: {}
        },
        i18n: {},
        instances: instances,
        classes: {},
        components: {},
        defaults: {
          context: 'body',
          mousewheel: true,
          vibrate: true
        },
        setDefaults: function (o) {
          extend(this.defaults, o);
        },
        presetShort: function (name, c, p) {
          this.components[name] = function (s) {
            return init(this, extend(s, {
              component: c,
              preset: p === false ? undefined : name
            }), arguments);
          };
        }
      };
  $.mobiscroll.classes.Base = function (el, settings) {
    var lang,
        preset,
        s,
        theme,
        themeName,
        defaults,
        ms = $.mobiscroll,
        util = ms.util,
        getCoord = util.getCoord,
        that = this;
    that.settings = {};
    that._presetLoad = function () {
    };
    that._init = function (ss) {
      s = that.settings;
      // Update original user settings
      extend(settings, ss);
      // Load user defaults
      if (that._hasDef) {
        defaults = ms.defaults;
      }
      // Create settings object
      extend(s, that._defaults, defaults, settings);
      // Get theme defaults
      if (that._hasTheme) {
        themeName = s.theme;
        if (themeName == 'auto' || !themeName) {
          themeName = ms.autoTheme;
        }
        if (themeName == 'default') {
          themeName = 'mobiscroll';
        }
        settings.theme = themeName;
        theme = ms.themes[that._class] ? ms.themes[that._class][themeName] : {};
      }
      // Get language defaults
      if (that._hasLang) {
        lang = ms.i18n[s.lang];
      }
      if (that._hasTheme) {
        that.trigger('onThemeLoad', [lang, settings]);
      }
      // Update settings object
      extend(s, theme, lang, defaults, settings);
      // Load preset settings
      if (that._hasPreset) {
        that._presetLoad(s);
        preset = ms.presets[that._class][s.preset];
        if (preset) {
          preset = preset.call(el, that);
          extend(s, preset, settings);
        }
      }
    };
    that._destroy = function () {
      that.trigger('onDestroy', []);
      // Delete scroller instance
      delete instances[el.id];
      that = null;
    };
    /**
     * Attach tap event to the given element.
     */
    that.tap = function (el, handler, prevent) {
      var startX,
          startY,
          target,
          moved;

      function onStart(ev) {
        if (!target) {
          // Can't always call preventDefault here, it kills page scroll
          if (prevent) {
            ev.preventDefault();
          }
          target = this;
          startX = getCoord(ev, 'X');
          startY = getCoord(ev, 'Y');
          moved = false;
          if (ev.type == 'pointerdown') {
            $(document)
                .on('pointermove', onMove)
                .on('pointerup', onEnd);
          }
        }
      }

      function onMove(ev) {
        // If movement is more than 20px, don't fire the click event handler
        if (target && !moved && Math.abs(getCoord(ev, 'X') - startX) > 9 || Math.abs(getCoord(ev, 'Y') - startY) > 9) {
          moved = true;
        }
      }

      function onEnd(ev) {
        if (target) {
          if (!moved) {
            ev.preventDefault();
            handler.call(target, ev, that);
          }
          if (ev.type == 'pointerup') {
            $(document)
                .off('pointermove', onMove)
                .off('pointerup', onEnd);
          }
          target = false;
          util.preventClick();
        }
      }

      function onCancel() {
        target = false;
      }

      if (s.tap) {
        el
            .on('touchstart.dw pointerdown.dw', onStart)
            .on('touchcancel.dw pointercancel.dw', onCancel)
            .on('touchmove.dw', onMove)
            .on('touchend.dw', onEnd);
      }
      el.on('click.dw', function (ev) {
        ev.preventDefault();
        // If handler was not called on touchend, call it on click;
        handler.call(this, ev, that);
      });
    };
    /**
     * Triggers an event
     */
    that.trigger = function (name, args) {
      var ret;
      args.push(that);
      $.each([defaults, theme, preset, settings], function (i, v) {
        if (v && v[name]) { // Call preset event
          ret = v[name].apply(el, args);
        }
      });
      return ret;
    };
    /**
     * Sets one ore more options.
     */
    that.option = function (opt, value) {
      var obj = {};
      if (typeof opt === 'object') {
        obj = opt;
      } else {
        obj[opt] = value;
      }
      that.init(obj);
    };
    /**
     * Returns the mobiscroll instance.
     */
    that.getInst = function () {
      return that;
    };
    settings = settings || {};
    $(el).addClass('mbsc-comp');
    // Autogenerate id
    if (!el.id) {
      el.id = 'mobiscroll' + (++id);
    }
    // Save instance
    instances[el.id] = that;
  };
  // Prevent standard behaviour on body click
  function preventClick(ev) {
    // Textarea needs the mousedown event
    if (ms.tapped && !ev.tap && !(ev.target.nodeName == 'TEXTAREA' && ev.type == 'mousedown')) {
      ev.stopPropagation();
      ev.preventDefault();
      return false;
    }
  }

  if (document.addEventListener) {
    $.each(['mouseover', 'mousedown', 'mouseup', 'click'], function (i, ev) {
      document.addEventListener(ev, preventClick, true);
    });
  }
})(jQuery);
(function ($, window, document, undefined) {
  var $activeElm,
      preventShow,
      ms = $.mobiscroll,
      util = ms.util,
      pr = util.jsPrefix,
      has3d = util.has3d,
      constrain = util.constrain,
      isString = util.isString,
      isOldAndroid = util.isOldAndroid,
      isIOS8 = /(iphone|ipod|ipad).* os 8_/i.test(navigator.userAgent),
      animEnd = 'webkitAnimationEnd animationend',
      empty = function () {
      },
      prevdef = function (ev) {
        ev.preventDefault();
      };
  ms.classes.Frame = function (el, settings, inherit) {
    var $ariaDiv,
        $ctx,
        $header,
        $markup,
        $overlay,
        $persp,
        $popup,
        $wnd,
        $wrapper,
        buttons,
        btn,
        doAnim,
        event,
        hasButtons,
        isModal,
        modalWidth,
        modalHeight,
        posEvents,
        preventPos,
        s,
        scrollLock,
        setReadOnly,
        wndWidth,
        wndHeight,
        that = this,
        $elm = $(el),
        elmList = [],
        posDebounce = {};

    function onBtnStart(ev) {
      // Can't call preventDefault here, it kills page scroll
      if (btn) {
        btn.removeClass('dwb-a');
      }
      btn = $(this);
      // Active button
      if (!btn.hasClass('dwb-d') && !btn.hasClass('dwb-nhl')) {
        btn.addClass('dwb-a');
      }
      if (ev.type === 'mousedown') {
        $(document).on('mouseup', onBtnEnd);
      } else if (ev.type === 'pointerdown') {
        $(document).on('pointerup', onBtnEnd);
      }
    }

    function onBtnEnd(ev) {
      if (btn) {
        btn.removeClass('dwb-a');
        btn = null;
      }
      if (ev.type === 'mouseup') {
        $(document).off('mouseup', onBtnEnd);
      } else if (ev.type === 'pointerup') {
        $(document).off('pointerup', onBtnEnd);
      }
    }

    function onWndKeyDown(ev) {
      if (ev.keyCode == 13) {
        that.select();
      } else if (ev.keyCode == 27) {
        that.cancel();
      }
    }

    function onShow(prevFocus) {
      if (!prevFocus) {
        $popup.focus();
      }
      that.ariaMessage(s.ariaMessage);
    }

    function onHide(prevAnim) {
      var activeEl,
          value,
          type,
          focus = s.focusOnClose;
      that._markupRemove();
      $markup.remove();
      if ($activeElm && !prevAnim) {
        setTimeout(function () {
          if (focus === undefined || focus === true) {
            preventShow = true;
            activeEl = $activeElm[0];
            type = activeEl.type;
            value = activeEl.value;
            try {
              activeEl.type = 'button';
            } catch (ex) {
            }
            $activeElm.focus();
            activeEl.type = type;
            activeEl.value = value;
          } else if (focus) {
            $(focus).focus();
          }
        }, 200);
      }
      that._isVisible = false;
      event('onHide', []);
    }

    function onPosition(ev) {
      clearTimeout(posDebounce[ev.type]);
      posDebounce[ev.type] = setTimeout(function () {
        var isScroll = ev.type == 'scroll';
        if (isScroll && !scrollLock) {
          return;
        }
        that.position(!isScroll);
      }, 200);
    }

    function onFocus(ev) {
      if (ev.target.nodeType && !$popup[0].contains(ev.target)) {
        $popup.focus();
      }
    }

    function onBlur() {
      $(this).off('blur', onBlur);
      setTimeout(function () {
        that.position();
      }, 100);
    }

    function show(beforeShow, $elm) {
      if (beforeShow) {
        beforeShow();
      }
      // Hide virtual keyboard
      if ($(document.activeElement).is('input,textarea')) {
        $(document.activeElement).blur();
      }
      if (that.show() !== false) {
        $activeElm = $elm;
        setTimeout(function () {
          preventShow = false;
        }, 300); // With jQuery < 1.9 focus is fired twice in IE
      }
    }

    function set() {
      that._fillValue();
      event('onSelect', [that._value]);
    }

    function cancel() {
      event('onCancel', [that._value]);
    }

    function clear() {
      that.setVal(null, true);
    }

    // Call the parent constructor
    ms.classes.Base.call(this, el, settings, true);
    /**
     * Positions the scroller on the screen.
     */
    that.position = function (check) {
      var w,
          l,
          t,
          anchor,
          aw, // anchor width
          ah, // anchor height
          ap, // anchor position
          at, // anchor top
          al, // anchor left
          arr, // arrow
          arrw, // arrow width
          arrl, // arrow left
          dh,
          scroll,
          sl, // scroll left
          st, // scroll top
          totalw = 0,
          minw = 0,
          css = {},
          nw = Math.min($wnd[0].innerWidth || $wnd.innerWidth(), $persp.width()), //$persp.width(), // To get the width without scrollbar
          nh = $wnd[0].innerHeight || $wnd.innerHeight(),
          $focused = $(document.activeElement);
      if ($focused.is('input,textarea') && !/(button|submit|checkbox|radio)/.test($focused.attr('type'))) {
        $focused.on('blur', onBlur);
        return;
      }
      if ((wndWidth === nw && wndHeight === nh && check) || preventPos) {
        return;
      }
      if (that._isFullScreen || /top|bottom/.test(s.display)) {
        // Set width, if document is larger than viewport, needs to be set before onPosition (for calendar)
        $popup.width(nw);
      }
      if (event('onPosition', [$markup, nw, nh]) === false || !isModal) {
        return;
      }
      sl = $wnd.scrollLeft();
      st = $wnd.scrollTop();
      anchor = s.anchor === undefined ? $elm : $(s.anchor);
      // Set / unset liquid layout based on screen width, but only if not set explicitly by the user
      if (that._isLiquid && s.layout !== 'liquid') {
        if (nw < 400) {
          $markup.addClass('dw-liq');
        } else {
          $markup.removeClass('dw-liq');
        }
      }
      if (!that._isFullScreen && /modal|bubble/.test(s.display)) {
        $wrapper.width('');
        $('.mbsc-w-p', $markup).each(function () {
          w = $(this).outerWidth(true);
          totalw += w;
          minw = (w > minw) ? w : minw;
        });
        w = totalw > nw ? minw : totalw;
        $wrapper.width(w + 1).css('white-space', totalw > nw ? '' : 'nowrap');
      }
      modalWidth = $popup.outerWidth();
      modalHeight = $popup.outerHeight(true);
      scrollLock = modalHeight <= nh && modalWidth <= nw;
      that.scrollLock = scrollLock;
      if (scrollLock) {
        $ctx.addClass('mbsc-fr-lock');
      } else {
        $ctx.removeClass('mbsc-fr-lock');
      }
      if (s.display == 'modal') {
        l = Math.max(0, sl + (nw - modalWidth) / 2);
        t = st + (nh - modalHeight) / 2;
      } else if (s.display == 'bubble') {
        // Scroll only if width also changed
        // to prevent scroll when address bar appears / hides
        scroll = wndWidth !== nw;
        arr = $('.dw-arrw-i', $markup);
        ap = anchor.offset();
        at = Math.abs($ctx.offset().top - ap.top);
        al = Math.abs($ctx.offset().left - ap.left);
        // horizontal positioning
        aw = anchor.outerWidth();
        ah = anchor.outerHeight();
        l = constrain(al - ($popup.outerWidth(true) - aw) / 2, sl + 3, sl + nw - modalWidth - 3);
        // vertical positioning
        t = at - modalHeight; // above the input
        if ((t < st) || (at > st + nh)) { // if doesn't fit above or the input is out of the screen
          $popup.removeClass('dw-bubble-top').addClass('dw-bubble-bottom');
          t = at + ah; // below the input
        } else {
          $popup.removeClass('dw-bubble-bottom').addClass('dw-bubble-top');
        }
        // Calculate Arrow position
        arrw = arr.outerWidth();
        arrl = constrain(al + aw / 2 - (l + (modalWidth - arrw) / 2), 0, arrw);
        // Limit Arrow position
        $('.dw-arr', $markup).css({
          left: arrl
        });
      } else {
        l = sl;
        if (s.display == 'top') {
          t = st;
        } else if (s.display == 'bottom') {
          t = st + nh - modalHeight;
        }
      }
      t = t < 0 ? 0 : t;
      css.top = t;
      css.left = l;
      $popup.css(css);
      // If top + modal height > doc height, increase doc height
      $persp.height(0);
      dh = Math.max(t + modalHeight, s.context == 'body' ? $(document).height() : $ctx[0].scrollHeight);
      $persp.css({
        height: dh
      });
      // Scroll needed
      if (scroll && ((t + modalHeight > st + nh) || (at > st + nh))) {
        preventPos = true;
        setTimeout(function () {
          preventPos = false;
        }, 300);
        $wnd.scrollTop(Math.min(at, t + modalHeight - nh, dh - nh));
      }
      wndWidth = nw;
      wndHeight = nh;
      // Call position for nested mobiscroll components
      $('.mbsc-comp', $markup).each(function () {
        var inst = $(this).mobiscroll('getInst');
        if (inst !== that && inst.position) {
          inst.position();
        }
      });
    };
    /**
     * Show mobiscroll on focus and click event of the parameter.
     * @param {jQuery} $elm - Events will be attached to this element.
     * @param {Function} [beforeShow=undefined] - Optional function to execute before showing mobiscroll.
     */
    that.attachShow = function ($elm, beforeShow) {
      elmList.push({
        readOnly: $elm.prop('readonly'),
        el: $elm
      });
      if (s.display !== 'inline') {
        if (setReadOnly && $elm.is('input')) {
          $elm.prop('readonly', true).on('mousedown.dw', function (ev) {
            // Prevent input to get focus on tap (virtual keyboard pops up on some devices)
            ev.preventDefault();
          });
        }
        if (s.showOnFocus) {
          $elm.on('focus.dw', function () {
            if (!preventShow) {
              show(beforeShow, $elm);
            }
          });
        }
        if (s.showOnTap) {
          $elm.on('keydown.dw', function (ev) {
            if (ev.keyCode == 32 || ev.keyCode == 13) { // Space or Enter
              ev.preventDefault();
              ev.stopPropagation();
              show(beforeShow, $elm);
            }
          });
          that.tap($elm, function () {
            show(beforeShow, $elm);
          });
        }
      }
    };
    /**
     * Set button handler.
     */
    that.select = function () {
      if (isModal) {
        that.hide(false, 'set', false, set);
      } else {
        set();
      }
    };
    /**
     * Cancel and hide the scroller instance.
     */
    that.cancel = function () {
      if (isModal) {
        that.hide(false, 'cancel', false, cancel);
      } else {
        set();
      }
    };
    /**
     * Clear button handler.
     */
    that.clear = function () {
      event('onClear', [$markup]);
      if (isModal && that._isVisible && !that.live) {
        that.hide(false, 'clear', false, clear);
      } else {
        clear();
      }
    };
    /**
     * Enables the scroller and the associated input.
     */
    that.enable = function () {
      s.disabled = false;
      if (that._isInput) {
        $elm.prop('disabled', false);
      }
    };
    /**
     * Disables the scroller and the associated input.
     */
    that.disable = function () {
      s.disabled = true;
      if (that._isInput) {
        $elm.prop('disabled', true);
      }
    };
    /**
     * Shows the scroller instance.
     * @param {Boolean} prevAnim - Prevent animation if true
     * @param {Boolean} prevFocus - Prevent focusing if true
     */
    that.show = function (prevAnim, prevFocus) {
      // Create wheels
      var html;
      if (s.disabled || that._isVisible) {
        return;
      }
      // Parse value from input
      that._readValue();
      if (event('onBeforeShow', []) === false) {
        return false;
      }
      doAnim = isOldAndroid ? false : s.animate;
      if (doAnim !== false) {
        if (s.display == 'top') {
          doAnim = 'slidedown';
        }
        if (s.display == 'bottom') {
          doAnim = 'slideup';
        }
      }
      // Create wheels containers
      html = '<div lang="' + s.lang + '" class="mbsc-' + s.theme + (s.baseTheme ? ' mbsc-' + s.baseTheme : '') + ' dw-' + s.display + ' ' +
          (s.cssClass || '') +
          (that._isLiquid ? ' dw-liq' : '') +
          (isOldAndroid ? ' mbsc-old' : '') +
          (hasButtons ? '' : ' dw-nobtn') + '">' +
          '<div class="dw-persp">' +
          (isModal ? '<div class="dwo"></div>' : '') + // Overlay
          '<div' + (isModal ? ' role="dialog" tabindex="-1"' : '') + ' class="dw' + (s.rtl ? ' dw-rtl' : ' dw-ltr') + '">' + // Popup
          (s.display === 'bubble' ? '<div class="dw-arrw"><div class="dw-arrw-i"><div class="dw-arr"></div></div></div>' : '') + // Bubble arrow
          '<div class="dwwr">' + // Popup content
          '<div aria-live="assertive" class="dw-aria dw-hidden"></div>' +
          (s.headerText ? '<div class="dwv">' + (isString(s.headerText) ? s.headerText : '') + '</div>' : '') + // Header
          '<div class="dwcc">'; // Wheel group container
      html += that._generateContent();
      html += '</div>';
      if (hasButtons) {
        html += '<div class="dwbc">';
        $.each(buttons, function (i, b) {
          b = isString(b) ? that.buttons[b] : b;
          if (b.handler === 'set') {
            b.parentClass = 'dwb-s';
          }
          if (b.handler === 'cancel') {
            b.parentClass = 'dwb-c';
          }
          html += '<div' + (s.btnWidth ? ' style="width:' + (100 / buttons.length) + '%"' : '') + ' class="dwbw ' + (b.parentClass || '') + '"><div tabindex="0" role="button" class="dwb' + i + ' dwb-e ' + (b.cssClass === undefined ? s.btnClass : b.cssClass) + (b.icon ? ' mbsc-ic mbsc-ic-' + b.icon : '') + '">' + (b.text || '') + '</div></div>';
        });
        html += '</div>';
      }
      html += '</div></div></div></div>';
      $markup = $(html);
      $persp = $('.dw-persp', $markup);
      $overlay = $('.dwo', $markup);
      $wrapper = $('.dwwr', $markup);
      $header = $('.dwv', $markup);
      $popup = $('.dw', $markup);
      $ariaDiv = $('.dw-aria', $markup);
      that._markup = $markup;
      that._header = $header;
      that._isVisible = true;
      posEvents = 'orientationchange resize';
      that._markupReady($markup);
      event('onMarkupReady', [$markup]);
      // Show
      if (isModal) {
        // Enter / ESC
        $(window).on('keydown', onWndKeyDown);
        // Prevent scroll if not specified otherwise
        if (s.scrollLock) {
          $markup.on('touchmove mousewheel wheel', function (ev) {
            if (scrollLock) {
              ev.preventDefault();
            }
          });
        }
        // Disable inputs to prevent bleed through (Android bug)
        if (pr !== 'Moz') {
          $('input,select,button', $ctx).each(function () {
            if (!this.disabled) {
              $(this).addClass('dwtd').prop('disabled', true);
            }
          });
        }
        if (ms.activeInstance) {
          ms.activeInstance.hide();
        }
        posEvents += ' scroll';
        ms.activeInstance = that;
        $markup.appendTo($ctx);
        if (s.focusTrap) {
          $wnd.on('focusin', onFocus);
        }
        if (has3d && doAnim && !prevAnim) {
          $markup.addClass('dw-in dw-trans').on(animEnd, function () {
            $markup.off(animEnd).removeClass('dw-in dw-trans').find('.dw').removeClass('dw-' + doAnim);
            onShow(prevFocus);
          }).find('.dw').addClass('dw-' + doAnim);
        }
      } else if ($elm.is('div') && !that._hasContent) {
        $elm.html($markup);
      } else {
        $markup.insertAfter($elm);
      }
      that._markupInserted($markup);
      event('onMarkupInserted', [$markup]);
      // Set position
      that.position();
      $wnd.on(posEvents, onPosition);
      // Events
      $markup
          .on('selectstart mousedown', prevdef) // Prevents blue highlight on Android and text selection in IE
          .on('click', '.dwb-e', prevdef)
          .on('keydown', '.dwb-e', function (ev) {
            if (ev.keyCode == 32) { // Space
              ev.preventDefault();
              ev.stopPropagation();
              $(this).click();
            }
          })
          .on('keydown', function (ev) { // Trap focus inside modal
            if (ev.keyCode == 32) { // Space
              ev.preventDefault();
            } else if (ev.keyCode == 9 && isModal && s.focusTrap) { // Tab
              var $focusable = $markup.find('[tabindex="0"]').filter(function () {
                    return this.offsetWidth > 0 || this.offsetHeight > 0;
                  }),
                  index = $focusable.index($(':focus', $markup)),
                  i = $focusable.length - 1,
                  target = 0;
              if (ev.shiftKey) {
                i = 0;
                target = -1;
              }
              if (index === i) {
                $focusable.eq(target).focus();
                ev.preventDefault();
              }
            }
          });
      $('input,select,textarea', $markup).on('selectstart mousedown', function (ev) {
        ev.stopPropagation();
      }).on('keydown', function (ev) {
        if (ev.keyCode == 32) { // Space
          ev.stopPropagation();
        }
      });
      //setTimeout(function () {
      // Init buttons
      $.each(buttons, function (i, b) {
        that.tap($('.dwb' + i, $markup), function (ev) {
          b = isString(b) ? that.buttons[b] : b;
          (isString(b.handler) ? that.handlers[b.handler] : b.handler).call(this, ev, that);
        }, true);
      });
      if (s.closeOnOverlay) {
        that.tap($overlay, function () {
          that.cancel();
        });
      }
      if (isModal && !doAnim) {
        onShow(prevFocus);
      }
      $markup
          .on('touchstart mousedown pointerdown', '.dwb-e', onBtnStart)
          .on('touchend', '.dwb-e', onBtnEnd);
      that._attachEvents($markup);
      //}, 300);
      event('onShow', [$markup, that._tempValue]);
    };
    /**
     * Hides the scroller instance.
     */
    that.hide = function (prevAnim, btn, force, callback) {
      // If onClose handler returns false, prevent hide
      if (!that._isVisible || (!force && !that._isValid && btn == 'set') || (!force && event('onBeforeClose', [that._tempValue, btn]) === false)) {
        return false;
      }
      // Hide wheels and overlay
      if ($markup) {
        // Re-enable temporary disabled fields
        if (pr !== 'Moz') {
          $('.dwtd', $ctx).each(function () {
            $(this).prop('disabled', false).removeClass('dwtd');
          });
        }
        if (has3d && isModal && doAnim && !prevAnim && !$markup.hasClass('dw-trans')) { // If dw-trans class was not removed, means that there was no animation
          $markup.addClass('dw-out dw-trans').on(animEnd, function () {
            onHide(prevAnim);
          }).find('.dw').addClass('dw-' + doAnim);
        } else {
          onHide(prevAnim);
        }
        // Stop positioning on window resize
        $wnd
            .off(posEvents, onPosition)
            .off('focusin', onFocus);
      }
      if (isModal) {
        $ctx.removeClass('mbsc-fr-lock');
        $(window).off('keydown', onWndKeyDown);
        delete ms.activeInstance;
      }
      if (callback) {
        callback();
      }
      event('onClosed', [that._value]);
    };
    that.ariaMessage = function (txt) {
      $ariaDiv.html('');
      setTimeout(function () {
        $ariaDiv.html(txt);
      }, 100);
    };
    /**
     * Return true if the scroller is currently visible.
     */
    that.isVisible = function () {
      return that._isVisible;
    };
    // Protected functions to override
    that.setVal = empty;
    that.getVal = empty;
    that._generateContent = empty;
    that._attachEvents = empty;
    that._readValue = empty;
    that._fillValue = empty;
    that._markupReady = empty;
    that._markupInserted = empty;
    that._markupRemove = empty;
    that._processSettings = empty;
    that._presetLoad = function (s) {
      // Add default buttons
      s.buttons = s.buttons || (s.display !== 'inline' ? ['set', 'cancel'] : []);
      // Hide header text in inline mode by default
      s.headerText = s.headerText === undefined ? (s.display !== 'inline' ? '{value}' : false) : s.headerText;
    };
    // Generic frame functions
    /**
     * Destroys the mobiscroll instance.
     */
    that.destroy = function () {
      // Force hide without animation
      that.hide(true, false, true);
      // Remove all events from elements
      $.each(elmList, function (i, v) {
        v.el.off('.dw').prop('readonly', v.readOnly);
      });
      that._destroy();
    };
    /**
     * Scroller initialization.
     */
    that.init = function (ss) {
      // @deprecated since 2.17.0, backward compatibility code
      // ---
      if (ss.onClose) {
        ss.onBeforeClose = ss.onClose;
      }
      // ---
      that._init(ss);
      that._isLiquid = (s.layout || (/top|bottom/.test(s.display) ? 'liquid' : '')) === 'liquid';
      that._processSettings();
      // Unbind all events (if re-init)
      $elm.off('.dw');
      buttons = s.buttons || [];
      isModal = s.display !== 'inline';
      setReadOnly = s.showOnFocus || s.showOnTap;
      that._window = $wnd = $(s.context == 'body' ? window : s.context);
      that._context = $ctx = $(s.context);
      that.live = true;
      // If no set button is found, live mode is activated
      $.each(buttons, function (i, b) {
        if (b == 'ok' || b == 'set' || b.handler == 'set') {
          that.live = false;
          return false;
        }
      });
      that.buttons.set = {
        text: s.setText,
        handler: 'set'
      };
      that.buttons.cancel = {
        text: (that.live) ? s.closeText : s.cancelText,
        handler: 'cancel'
      };
      that.buttons.clear = {
        text: s.clearText,
        handler: 'clear'
      };
      that._isInput = $elm.is('input');
      hasButtons = buttons.length > 0;
      if (that._isVisible) {
        that.hide(true, false, true);
      }
      event('onInit', []);
      if (isModal) {
        that._readValue();
        if (!that._hasContent) {
          that.attachShow($elm);
        }
      } else {
        that.show();
      }
      $elm.on('change.dw', function () {
        if (!that._preventChange) {
          that.setVal($elm.val(), true, false);
        }
        that._preventChange = false;
      });
    };
    that.buttons = {};
    that.handlers = {
      set: that.select,
      cancel: that.cancel,
      clear: that.clear
    };
    that._value = null;
    that._isValid = true;
    that._isVisible = false;
    // Constructor
    s = that.settings;
    event = that.trigger;
    if (!inherit) {
      that.init(settings);
    }
  };
  ms.classes.Frame.prototype._defaults = {
    // Localization
    lang: 'en',
    setText: 'Set',
    selectedText: '{count} selected',
    closeText: 'Close',
    cancelText: 'Cancel',
    clearText: 'Clear',
    // Options
    disabled: false,
    closeOnOverlay: true,
    showOnFocus: false,
    showOnTap: true,
    display: 'modal',
    scrollLock: true,
    tap: true,
    btnClass: 'dwb',
    btnWidth: true,
    focusTrap: true,
    focusOnClose: !isIOS8 // Temporary for iOS8
  };
  ms.themes.frame.mobiscroll = {
    rows: 5,
    showLabel: false,
    headerText: false,
    btnWidth: false,
    selectedLineHeight: true,
    selectedLineBorder: 1,
    dateOrder: 'MMddyy',
    weekDays: 'min',
    checkIcon: 'ion-ios7-checkmark-empty',
    btnPlusClass: 'mbsc-ic mbsc-ic-arrow-down5',
    btnMinusClass: 'mbsc-ic mbsc-ic-arrow-up5',
    btnCalPrevClass: 'mbsc-ic mbsc-ic-arrow-left5',
    btnCalNextClass: 'mbsc-ic mbsc-ic-arrow-right5'
  };
  // Prevent re-show on window focus
  $(window).on('focus', function () {
    if ($activeElm) {
      preventShow = true;
    }
  });
})(jQuery, window, document);
(function ($, window, document, undefined) {
  var ms = $.mobiscroll,
      classes = ms.classes,
      util = ms.util,
      pr = util.jsPrefix,
      has3d = util.has3d,
      hasFlex = util.hasFlex,
      getCoord = util.getCoord,
      constrain = util.constrain,
      testTouch = util.testTouch;
  ms.presetShort('scroller', 'Scroller', false);
  classes.Scroller = function (el, settings, inherit) {
    var $markup,
        btn,
        isScrollable,
        itemHeight,
        multiple,
        pixels,
        s,
        scrollDebounce,
        trigger,
        click,
        moved,
        start,
        startTime,
        stop,
        p,
        min,
        max,
        target,
        index,
        lines,
        timer,
        that = this,
        $elm = $(el),
        iv = {},
        pos = {},
        wheels = [];
    // Event handlers
    function onStart(ev) {
      // Scroll start
      if (testTouch(ev, this) && !target && !click && !btn && !isReadOnly(this)) {
        // Prevent touch highlight
        ev.preventDefault();
        // Better performance if there are tap events on document
        ev.stopPropagation();
        isScrollable = s.mode != 'clickpick';
        target = $('.dw-ul', this);
        setGlobals(target);
        moved = iv[index] !== undefined; // Don't allow tap, if still moving
        p = moved ? getCurrentPosition(target) : pos[index];
        start = getCoord(ev, 'Y', true);
        startTime = new Date();
        stop = start;
        scroll(target, index, p, 0.001);
        if (isScrollable) {
          target.closest('.dwwl').addClass('dwa');
        }
        if (ev.type === 'mousedown') {
          $(document).on('mousemove', onMove).on('mouseup', onEnd);
        }
      }
    }

    function onMove(ev) {
      if (target) {
        if (isScrollable) {
          // Prevent scroll
          ev.preventDefault();
          ev.stopPropagation();
          stop = getCoord(ev, 'Y', true);
          if (Math.abs(stop - start) > 3 || moved) {
            scroll(target, index, constrain(p + (start - stop) / itemHeight, min - 1, max + 1));
            moved = true;
          }
        }
      }
    }

    function onEnd(ev) {
      if (target) {
        var time = new Date() - startTime,
            curr = constrain(Math.round(p + (start - stop) / itemHeight), min - 1, max + 1),
            val = curr,
            speed,
            dist,
            ttop = target.offset().top;
        // Better performance if there are tap events on document
        ev.stopPropagation();
        if (ev.type === 'mouseup') {
          $(document).off('mousemove', onMove).off('mouseup', onEnd);
        }
        if (has3d && time < 300) {
          speed = (stop - start) / time;
          dist = (speed * speed) / s.speedUnit;
          if (stop - start < 0) {
            dist = -dist;
          }
        } else {
          dist = stop - start;
        }
        if (!moved) { // this is a "tap"
          var idx = Math.floor((stop - ttop) / itemHeight),
              li = $($('.dw-li', target)[idx]),
              valid = li.hasClass('dw-v'),
              hl = isScrollable;
          time = 0.1;
          if (trigger('onValueTap', [li]) !== false && valid) {
            val = idx;
          } else {
            hl = true;
          }
          if (hl && valid) {
            li.addClass('dw-hl'); // Highlight
            setTimeout(function () {
              li.removeClass('dw-hl');
            }, 100);
          }
          if (!multiple && (s.confirmOnTap === true || s.confirmOnTap[index]) && li.hasClass('dw-sel')) {
            that.select();
            target = false;
            return;
          }
        } else {
          val = constrain(Math.round(p - dist / itemHeight), min, max);
          time = speed ? Math.max(0.1, Math.abs((val - curr) / speed) * s.timeUnit) : 0.1;
        }
        if (isScrollable) {
          calc(target, index, val, 0, time, true);
        }
        target = false;
      }
    }

    function onBtnStart(ev) {
      btn = $(this);
      // +/- buttons
      if (testTouch(ev, this)) {
        step(ev, btn.closest('.dwwl'), btn.hasClass('dwwbp') ? plus : minus);
      }
      if (ev.type === 'mousedown') {
        $(document).on('mouseup', onBtnEnd);
      }
    }

    function onBtnEnd(ev) {
      btn = null;
      if (click) {
        clearInterval(timer);
        click = false;
      }
      if (ev.type === 'mouseup') {
        $(document).off('mouseup', onBtnEnd);
      }
    }

    function onKeyDown(ev) {
      if (ev.keyCode == 38) { // up
        step(ev, $(this), minus);
      } else if (ev.keyCode == 40) { // down
        step(ev, $(this), plus);
      }
    }

    function onKeyUp() {
      if (click) {
        clearInterval(timer);
        click = false;
      }
    }

    function onScroll(ev) {
      if (!isReadOnly(this)) {
        ev.preventDefault();
        ev = ev.originalEvent || ev;
        var delta = ev.deltaY || ev.wheelDelta || ev.detail,
            t = $('.dw-ul', this);
        setGlobals(t);
        scroll(t, index, constrain(((delta < 0 ? -20 : 20) - pixels[index]) / itemHeight, min - 1, max + 1));
        clearTimeout(scrollDebounce);
        scrollDebounce = setTimeout(function () {
          calc(t, index, Math.round(pos[index]), delta > 0 ? 1 : 2, 0.1);
        }, 200);
      }
    }

    // Private functions
    function step(ev, w, func) {
      ev.stopPropagation();
      ev.preventDefault();
      if (!click && !isReadOnly(w) && !w.hasClass('dwa')) {
        click = true;
        // + Button
        var t = w.find('.dw-ul');
        setGlobals(t);
        clearInterval(timer);
        timer = setInterval(function () {
          func(t);
        }, s.delay);
        func(t);
      }
    }

    function isReadOnly(wh) {
      if ($.isArray(s.readonly)) {
        var i = $('.dwwl', $markup).index(wh);
        return s.readonly[i];
      }
      return s.readonly;
    }

    function generateWheelItems(i) {
      var html = '<div class="dw-bf">',
          w = wheels[i],
          l = 1,
          labels = w.labels || [],
          values = w.values || [],
          keys = w.keys || values;
      $.each(values, function (j, v) {
        if (l % 20 === 0) {
          html += '</div><div class="dw-bf">';
        }
        html += '<div role="option" aria-selected="false" class="dw-li dw-v" data-val="' + keys[j] + '"' + (labels[j] ? ' aria-label="' + labels[j] + '"' : '') + ' style="height:' + itemHeight + 'px;line-height:' + itemHeight + 'px;">' +
            '<div class="dw-i"' + (lines > 1 ? ' style="line-height:' + Math.round(itemHeight / lines) + 'px;font-size:' + Math.round(itemHeight / lines * 0.8) + 'px;"' : '') + '>' + v + '</div></div>';
        l++;
      });
      html += '</div>';
      return html;
    }

    function setGlobals(t) {
      multiple = t.closest('.dwwl').hasClass('dwwms');
      min = $('.dw-li', t).index($(multiple ? '.dw-li' : '.dw-v', t).eq(0));
      max = Math.max(min, $('.dw-li', t).index($(multiple ? '.dw-li' : '.dw-v', t).eq(-1)) - (multiple ? s.rows - (s.mode == 'scroller' ? 1 : 3) : 0));
      index = $('.dw-ul', $markup).index(t);
    }

    function formatHeader(v) {
      var t = s.headerText;
      return t ? (typeof t === 'function' ? t.call(el, v) : t.replace(/\{value\}/i, v)) : '';
    }

    function getCurrentPosition(t) {
      return Math.round(-util.getPosition(t, true) / itemHeight);
    }

    function ready(t, i) {
      clearTimeout(iv[i]);
      delete iv[i];
      t.closest('.dwwl').removeClass('dwa');
    }

    function scroll(t, index, val, time, active) {
      var px = -val * itemHeight,
          style = t[0].style;
      if (px == pixels[index] && iv[index]) {
        return;
      }
      //if (time && px != pixels[index]) {
      // Trigger animation start event
      //trigger('onAnimStart', [$markup, index, time]);
      //}
      pixels[index] = px;
      if (has3d) {
        style[pr + 'Transition'] = util.prefix + 'transform ' + (time ? time.toFixed(3) : 0) + 's ease-out';
        style[pr + 'Transform'] = 'translate3d(0,' + px + 'px,0)';
      } else {
        style.top = px + 'px';
      }
      if (iv[index]) {
        ready(t, index);
      }
      if (time && active) {
        t.closest('.dwwl').addClass('dwa');
        iv[index] = setTimeout(function () {
          ready(t, index);
        }, time * 1000);
      }
      pos[index] = val;
    }

    function getValid(val, t, dir, multiple, select) {
      var selected,
          cell = $('.dw-li[data-val="' + val + '"]', t),
          cells = $('.dw-li', t),
          v = cells.index(cell),
          l = cells.length;
      if (multiple) {
        setGlobals(t);
      } else if (!cell.hasClass('dw-v')) { // Scroll to a valid cell
        var cell1 = cell,
            cell2 = cell,
            dist1 = 0,
            dist2 = 0;
        while (v - dist1 >= 0 && !cell1.hasClass('dw-v')) {
          dist1++;
          cell1 = cells.eq(v - dist1);
        }
        while (v + dist2 < l && !cell2.hasClass('dw-v')) {
          dist2++;
          cell2 = cells.eq(v + dist2);
        }
        // If we have direction (+/- or mouse wheel), the distance does not count
        if (((dist2 < dist1 && dist2 && dir !== 2) || !dist1 || (v - dist1 < 0) || dir == 1) && cell2.hasClass('dw-v')) {
          cell = cell2;
          v = v + dist2;
        } else {
          cell = cell1;
          v = v - dist1;
        }
      }
      selected = cell.hasClass('dw-sel');
      if (select) {
        if (!multiple) {
          $('.dw-sel', t).removeAttr('aria-selected');
          cell.attr('aria-selected', 'true');
        }
        // Add selected class to cell
        $('.dw-sel', t).removeClass('dw-sel');
        cell.addClass('dw-sel');
      }
      return {
        selected: selected,
        v: multiple ? constrain(v, min, max) : v,
        val: cell.hasClass('dw-v') || multiple ? cell.attr('data-val') : null
      };
    }

    function scrollToPos(time, index, manual, dir, active) {
      // Call validation event
      if (trigger('validate', [$markup, index, time, dir]) !== false) {
        // Set scrollers to position
        $('.dw-ul', $markup).each(function (i) {
          var t = $(this),
              multiple = t.closest('.dwwl').hasClass('dwwms'),
              sc = i == index || index === undefined,
              res = getValid(that._tempWheelArray[i], t, dir, multiple, true),
              selected = res.selected;
          if (!selected || sc) {
            // Set valid value
            that._tempWheelArray[i] = res.val;
            // Scroll to position
            scroll(t, i, res.v, sc ? time : 0.1, sc ? active : false);
          }
        });
        trigger('onValidated', [index]);
        // Reformat value if validation changed something
        that._tempValue = s.formatValue(that._tempWheelArray, that);
        if (that.live) {
          that._hasValue = manual || that._hasValue;
          setValue(manual, manual, 0, true);
        }
        that._header.html(formatHeader(that._tempValue));
        if (manual) {
          trigger('onChange', [that._tempValue]);
        }
      }
    }

    function calc(t, idx, val, dir, time, active) {
      val = constrain(val, min, max);
      // Set selected scroller value
      that._tempWheelArray[idx] = $('.dw-li', t).eq(val).attr('data-val');
      scroll(t, idx, val, time, active);
      setTimeout(function () {
        // Validate
        scrollToPos(time, idx, true, dir, active);
      }, 10);
    }

    function plus(t) {
      var val = pos[index] + 1;
      calc(t, index, val > max ? min : val, 1, 0.1);
    }

    function minus(t) {
      var val = pos[index] - 1;
      calc(t, index, val < min ? max : val, 2, 0.1);
    }

    function setValue(fill, change, time, noscroll, temp) {
      if (that._isVisible && !noscroll) {
        scrollToPos(time);
      }
      that._tempValue = s.formatValue(that._tempWheelArray, that);
      if (!temp) {
        that._wheelArray = that._tempWheelArray.slice(0);
        that._value = that._hasValue ? that._tempValue : null;
      }
      if (fill) {
        trigger('onValueFill', [that._hasValue ? that._tempValue : '', change]);
        if (that._isInput) {
          $elm.val(that._hasValue ? that._tempValue : '');
        }
        if (change) {
          that._preventChange = true;
          $elm.change();
        }
      }
    }

    // Call the parent constructor
    classes.Frame.call(this, el, settings, true);
    // Public functions
    /**
     * Gets the selected wheel values, formats it, and set the value of the scroller instance.
     * If input parameter is true, populates the associated input element.
     * @param {Array} values Wheel values.
     * @param {Boolean} [fill=false] Also set the value of the associated input element.
     * @param {Number} [time=0] Animation time
     * @param {Boolean} [temp=false] If true, then only set the temporary value.(only scroll there but not set the value)
     * @param {Boolean} [change=false] Trigger change on the input element
     */
    that.setVal = that._setVal = function (val, fill, change, temp, time) {
      that._hasValue = val !== null && val !== undefined;
      that._tempWheelArray = $.isArray(val) ? val.slice(0) : s.parseValue.call(el, val, that) || [];
      setValue(fill, change === undefined ? fill : change, time, false, temp);
    };
    /**
     * Returns the selected value
     */
    that.getVal = that._getVal = function (temp) {
      var val = that._hasValue || temp ? that[temp ? '_tempValue' : '_value'] : null;
      return util.isNumeric(val) ? +val : val;
    };
    /*
     * Sets the wheel values (passed as an array)
     */
    that.setArrayVal = that.setVal;
    /*
     * Returns the selected wheel values as an array
     */
    that.getArrayVal = function (temp) {
      return temp ? that._tempWheelArray : that._wheelArray;
    };
    // @deprecated since 2.14.0, backward compatibility code
    // ---
    that.setValue = function (val, fill, time, temp, change) {
      that.setVal(val, fill, change, temp, time);
    };
    /**
     * Return the selected wheel values.
     */
    that.getValue = that.getArrayVal;
    // ---
    /**
     * Changes the values of a wheel, and scrolls to the correct position
     * @param {Array} idx Indexes of the wheels to change.
     * @param {Number} [time=0] Animation time when scrolling to the selected value on the new wheel.
     * @param {Boolean} [manual=false] Indicates that the change was triggered by the user or from code.
     */
    that.changeWheel = function (idx, time, manual) {
      if ($markup) {
        var i = 0,
            nr = idx.length;
        $.each(s.wheels, function (j, wg) {
          $.each(wg, function (k, w) {
            if ($.inArray(i, idx) > -1) {
              wheels[i] = w;
              $('.dw-ul', $markup).eq(i).html(generateWheelItems(i));
              nr--;
              if (!nr) {
                that.position();
                scrollToPos(time, undefined, manual);
                return false;
              }
            }
            i++;
          });
          if (!nr) {
            return false;
          }
        });
      }
    };
    /**
     * Returns the closest valid cell.
     */
    that.getValidCell = getValid;
    that.scroll = scroll;
    // Protected overrides
    that._generateContent = function () {
      var lbl,
          html = '',
          l = 0;
      $.each(s.wheels, function (i, wg) { // Wheel groups
        html += '<div class="mbsc-w-p dwc' + (s.mode != 'scroller' ? ' dwpm' : ' dwsc') + (s.showLabel ? '' : ' dwhl') + '">' +
            '<div class="dwwc"' + (s.maxWidth ? '' : ' style="max-width:600px;"') + '>' +
            (hasFlex ? '' : '<table class="dw-tbl" cellpadding="0" cellspacing="0"><tr>');
        $.each(wg, function (j, w) { // Wheels
          wheels[l] = w;
          lbl = w.label !== undefined ? w.label : j;
          html += '<' + (hasFlex ? 'div' : 'td') + ' class="dwfl"' + ' style="' +
              (s.fixedWidth ? ('width:' + (s.fixedWidth[l] || s.fixedWidth) + 'px;') :
              (s.minWidth ? ('min-width:' + (s.minWidth[l] || s.minWidth) + 'px;') : 'min-width:' + s.width + 'px;') +
              (s.maxWidth ? ('max-width:' + (s.maxWidth[l] || s.maxWidth) + 'px;') : '')) + '">' +
              '<div class="dwwl dwwl' + l + (w.multiple ? ' dwwms' : '') + '">' +
              (s.mode != 'scroller' ?
              '<div class="dwb-e dwwb dwwbp ' + (s.btnPlusClass || '') + '" style="height:' + itemHeight + 'px;line-height:' + itemHeight + 'px;"><span>+</span></div>' + // + button
              '<div class="dwb-e dwwb dwwbm ' + (s.btnMinusClass || '') + '" style="height:' + itemHeight + 'px;line-height:' + itemHeight + 'px;"><span>&ndash;</span></div>' : '') + // - button
              '<div class="dwl">' + lbl + '</div>' + // Wheel label
              '<div tabindex="0" aria-live="off" aria-label="' + lbl + '" role="listbox" class="dwww">' +
              '<div class="dww" style="height:' + (s.rows * itemHeight) + 'px;">' +
              '<div class="dw-ul" style="margin-top:' + (w.multiple ? (s.mode == 'scroller' ? 0 : itemHeight) : s.rows / 2 * itemHeight - itemHeight / 2) + 'px;">';
          // Create wheel values
          html += generateWheelItems(l) +
              '</div></div><div class="dwwo"></div></div><div class="dwwol"' +
              (s.selectedLineHeight ? ' style="height:' + itemHeight + 'px;margin-top:-' + (itemHeight / 2 + (s.selectedLineBorder || 0)) + 'px;"' : '') + '></div></div>' +
              (hasFlex ? '</div>' : '</td>');
          l++;
        });
        html += (hasFlex ? '' : '</tr></table>') + '</div></div>';
      });
      return html;
    };
    that._attachEvents = function ($markup) {
      $markup
          .on('keydown', '.dwwl', onKeyDown)
          .on('keyup', '.dwwl', onKeyUp)
          .on('touchstart mousedown', '.dwwl', onStart)
          .on('touchmove', '.dwwl', onMove)
          .on('touchend', '.dwwl', onEnd)
          .on('touchstart mousedown', '.dwwb', onBtnStart)
          .on('touchend touchcancel', '.dwwb', onBtnEnd);
      if (s.mousewheel) {
        $markup.on('wheel mousewheel', '.dwwl', onScroll);
      }
    };
    that._markupReady = function ($m) {
      $markup = $m;
      pixels = {};
      scrollToPos();
    };
    that._fillValue = function () {
      that._hasValue = true;
      setValue(true, true, 0, true);
    };
    that._readValue = function () {
      var v = $elm.val() || '';
      if (v !== '') {
        that._hasValue = true;
      }
      that._tempWheelArray = that._hasValue && that._wheelArray ? that._wheelArray.slice(0) : s.parseValue.call(el, v, that) || [];
      setValue();
    };
    that._processSettings = function () {
      s = that.settings;
      trigger = that.trigger;
      itemHeight = s.height;
      lines = s.multiline;
      that._isLiquid = (s.layout || (/top|bottom/.test(s.display) && s.wheels.length == 1 ? 'liquid' : '')) === 'liquid';
      // @deprecated since 2.15.0, backward compatibility code
      // ---
      if (s.formatResult) {
        s.formatValue = s.formatResult;
      }
      // ---
      if (lines > 1) {
        s.cssClass = (s.cssClass || '') + ' dw-ml';
      }
      // Ensure a minimum number of 3 items if clickpick buttons present
      if (s.mode != 'scroller') {
        s.rows = Math.max(3, s.rows);
      }
    };
    // Properties
    that._selectedValues = {};
    // Constructor
    if (!inherit) {
      that.init(settings);
    }
  };
  // Extend defaults
  classes.Scroller.prototype = {
    _hasDef: true,
    _hasTheme: true,
    _hasLang: true,
    _hasPreset: true,
    _class: 'scroller',
    _defaults: $.extend({}, classes.Frame.prototype._defaults, {
      // Options
      minWidth: 80,
      height: 40,
      rows: 3,
      multiline: 1,
      delay: 300,
      readonly: false,
      showLabel: true,
      confirmOnTap: true,
      wheels: [],
      mode: 'scroller',
      preset: '',
      speedUnit: 0.0012,
      timeUnit: 0.08,
      formatValue: function (d) {
        return d.join(' ');
      },
      parseValue: function (value, inst) {
        var val = [],
            ret = [],
            i = 0,
            found,
            keys;
        if (value !== null && value !== undefined) {
          val = (value + '').split(' ');
        }
        $.each(inst.settings.wheels, function (j, wg) {
          $.each(wg, function (k, w) {
            keys = w.keys || w.values;
            found = keys[0]; // Default to first wheel value if not found
            $.each(keys, function (l, key) {
              if (val[i] == key) { // Don't do strict comparison
                found = key;
                return false;
              }
            });
            ret.push(found);
            i++;
          });
        });
        return ret;
      }
    })
  };
  ms.themes.scroller = ms.themes.frame;
})(jQuery, window, document);
(function ($, undefined) {
  var ms = $.mobiscroll;
  ms.datetime = {
    defaults: {
      shortYearCutoff: '+10',
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      dayNamesMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      amText: 'am',
      pmText: 'pm',
      getYear: function (d) {
        return d.getFullYear();
      },
      getMonth: function (d) {
        return d.getMonth();
      },
      getDay: function (d) {
        return d.getDate();
      },
      getDate: function (y, m, d, h, i, s, u) {
        return new Date(y, m, d, h || 0, i || 0, s || 0, u || 0);
      },
      getMaxDayOfMonth: function (y, m) {
        return 32 - new Date(y, m, 32).getDate();
      },
      getWeekNumber: function (d) {
        // Copy date so don't modify original
        d = new Date(d);
        d.setHours(0, 0, 0);
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        // Get first day of year
        var yearStart = new Date(d.getFullYear(), 0, 1);
        // Calculate full weeks to nearest Thursday
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      }
    },
    /**
     * Format a date into a string value with a specified format.
     * @param {String} format Output format.
     * @param {Date} date Date to format.
     * @param {Object} [settings={}] Settings.
     * @return {String} Returns the formatted date string.
     */
    formatDate: function (format, date, settings) {
      if (!date) {
        return null;
      }
      var s = $.extend({}, ms.datetime.defaults, settings),
          look = function (m) { // Check whether a format character is doubled
            var n = 0;
            while (i + 1 < format.length && format.charAt(i + 1) == m) {
              n++;
              i++;
            }
            return n;
          },
          f1 = function (m, val, len) { // Format a number, with leading zero if necessary
            var n = '' + val;
            if (look(m)) {
              while (n.length < len) {
                n = '0' + n;
              }
            }
            return n;
          },
          f2 = function (m, val, s, l) { // Format a name, short or long as requested
            return (look(m) ? l[val] : s[val]);
          },
          i,
          year,
          output = '',
          literal = false;
      for (i = 0; i < format.length; i++) {
        if (literal) {
          if (format.charAt(i) == "'" && !look("'")) {
            literal = false;
          } else {
            output += format.charAt(i);
          }
        } else {
          switch (format.charAt(i)) {
            case 'd':
              output += f1('d', s.getDay(date), 2);
              break;
            case 'D':
              output += f2('D', date.getDay(), s.dayNamesShort, s.dayNames);
              break;
            case 'o':
              output += f1('o', (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000, 3);
              break;
            case 'm':
              output += f1('m', s.getMonth(date) + 1, 2);
              break;
            case 'M':
              output += f2('M', s.getMonth(date), s.monthNamesShort, s.monthNames);
              break;
            case 'y':
              year = s.getYear(date);
              output += (look('y') ? year : (year % 100 < 10 ? '0' : '') + year % 100);
              //output += (look('y') ? date.getFullYear() : (date.getYear() % 100 < 10 ? '0' : '') + date.getYear() % 100);
              break;
            case 'h':
              var h = date.getHours();
              output += f1('h', (h > 12 ? (h - 12) : (h === 0 ? 12 : h)), 2);
              break;
            case 'H':
              output += f1('H', date.getHours(), 2);
              break;
            case 'i':
              output += f1('i', date.getMinutes(), 2);
              break;
            case 's':
              output += f1('s', date.getSeconds(), 2);
              break;
            case 'a':
              output += date.getHours() > 11 ? s.pmText : s.amText;
              break;
            case 'A':
              output += date.getHours() > 11 ? s.pmText.toUpperCase() : s.amText.toUpperCase();
              break;
            case "'":
              if (look("'")) {
                output += "'";
              } else {
                literal = true;
              }
              break;
            default:
              output += format.charAt(i);
          }
        }
      }
      return output;
    },
    /**
     * Extract a date from a string value with a specified format.
     * @param {String} format Input format.
     * @param {String} value String to parse.
     * @param {Object} [settings={}] Settings.
     * @return {Date} Returns the extracted date.
     */
    parseDate: function (format, value, settings) {
      var s = $.extend({}, ms.datetime.defaults, settings),
          def = s.defaultValue || new Date();
      if (!format || !value) {
        return def;
      }
      // If already a date object
      if (value.getTime) {
        return value;
      }
      value = (typeof value == 'object' ? value.toString() : value + '');
      var shortYearCutoff = s.shortYearCutoff,
          year = s.getYear(def),
          month = s.getMonth(def) + 1,
          day = s.getDay(def),
          doy = -1,
          hours = def.getHours(),
          minutes = def.getMinutes(),
          seconds = 0, //def.getSeconds(),
          ampm = -1,
          literal = false, // Check whether a format character is doubled
          lookAhead = function (match) {
            var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
            if (matches) {
              iFormat++;
            }
            return matches;
          },
          getNumber = function (match) { // Extract a number from the string value
            lookAhead(match);
            var size = (match == '@' ? 14 : (match == '!' ? 20 : (match == 'y' ? 4 : (match == 'o' ? 3 : 2)))),
                digits = new RegExp('^\\d{1,' + size + '}'),
                num = value.substr(iValue).match(digits);
            if (!num) {
              return 0;
            }
            iValue += num[0].length;
            return parseInt(num[0], 10);
          },
          getName = function (match, s, l) { // Extract a name from the string value and convert to an index
            var names = (lookAhead(match) ? l : s),
                i;
            for (i = 0; i < names.length; i++) {
              if (value.substr(iValue, names[i].length).toLowerCase() == names[i].toLowerCase()) {
                iValue += names[i].length;
                return i + 1;
              }
            }
            return 0;
          },
          checkLiteral = function () {
            iValue++;
          },
          iValue = 0,
          iFormat;
      for (iFormat = 0; iFormat < format.length; iFormat++) {
        if (literal) {
          if (format.charAt(iFormat) == "'" && !lookAhead("'")) {
            literal = false;
          } else {
            checkLiteral();
          }
        } else {
          switch (format.charAt(iFormat)) {
            case 'd':
              day = getNumber('d');
              break;
            case 'D':
              getName('D', s.dayNamesShort, s.dayNames);
              break;
            case 'o':
              doy = getNumber('o');
              break;
            case 'm':
              month = getNumber('m');
              break;
            case 'M':
              month = getName('M', s.monthNamesShort, s.monthNames);
              break;
            case 'y':
              year = getNumber('y');
              break;
            case 'H':
              hours = getNumber('H');
              break;
            case 'h':
              hours = getNumber('h');
              break;
            case 'i':
              minutes = getNumber('i');
              break;
            case 's':
              seconds = getNumber('s');
              break;
            case 'a':
              ampm = getName('a', [s.amText, s.pmText], [s.amText, s.pmText]) - 1;
              break;
            case 'A':
              ampm = getName('A', [s.amText, s.pmText], [s.amText, s.pmText]) - 1;
              break;
            case "'":
              if (lookAhead("'")) {
                checkLiteral();
              } else {
                literal = true;
              }
              break;
            default:
              checkLiteral();
          }
        }
      }
      if (year < 100) {
        year += new Date().getFullYear() - new Date().getFullYear() % 100 +
            (year <= (typeof shortYearCutoff != 'string' ? shortYearCutoff : new Date().getFullYear() % 100 + parseInt(shortYearCutoff, 10)) ? 0 : -100);
      }
      if (doy > -1) {
        month = 1;
        day = doy;
        do {
          var dim = 32 - new Date(year, month - 1, 32).getDate();
          if (day <= dim) {
            break;
          }
          month++;
          day -= dim;
        } while (true);
      }
      hours = (ampm == -1) ? hours : ((ampm && hours < 12) ? (hours + 12) : (!ampm && hours == 12 ? 0 : hours));
      var date = s.getDate(year, month - 1, day, hours, minutes, seconds);
      if (s.getYear(date) != year || s.getMonth(date) + 1 != month || s.getDay(date) != day) {
        return def; // Invalid date
      }
      return date;
    }
  };
  // @deprecated since 2.11.0, backward compatibility code
  // ---
  ms.formatDate = ms.datetime.formatDate;
  ms.parseDate = ms.datetime.parseDate;
  // ---
})(jQuery);
(function ($, undefined) {
  var ms = $.mobiscroll,
      datetime = ms.datetime,
      date = new Date(),
      defaults = {
        startYear: date.getFullYear() - 100,
        endYear: date.getFullYear() + 1,
        separator: ' ',
        // Localization
        dateFormat: 'mm/dd/yy',
        dateOrder: 'mmddy',
        timeWheels: 'hhiiA',
        timeFormat: 'hh:ii A',
        dayText: 'Day',
        monthText: 'Month',
        yearText: 'Year',
        hourText: 'Hours',
        minuteText: 'Minutes',
        ampmText: '&nbsp;',
        secText: 'Seconds',
        nowText: 'Now'
      },
      /**
       * @class Mobiscroll.datetime
       * @extends Mobiscroll
       * Mobiscroll Datetime component
       */
      preset = function (inst) {
        var that = $(this),
            html5def = {},
            format;
        // Force format for html5 date inputs (experimental)
        if (that.is('input')) {
          switch (that.attr('type')) {
            case 'date':
              format = 'yy-mm-dd';
              break;
            case 'datetime':
              format = 'yy-mm-ddTHH:ii:ssZ';
              break;
            case 'datetime-local':
              format = 'yy-mm-ddTHH:ii:ss';
              break;
            case 'month':
              format = 'yy-mm';
              html5def.dateOrder = 'mmyy';
              break;
            case 'time':
              format = 'HH:ii:ss';
              break;
          }
          // Check for min/max attributes
          var min = that.attr('min'),
              max = that.attr('max');
          if (min) {
            html5def.minDate = datetime.parseDate(format, min);
          }
          if (max) {
            html5def.maxDate = datetime.parseDate(format, max);
          }
        }
        // Set year-month-day order
        var i,
            k,
            keys,
            values,
            wg,
            start,
            end,
            hasTime,
            mins,
            maxs,
            orig = $.extend({}, inst.settings),
            s = $.extend(inst.settings, ms.datetime.defaults, defaults, html5def, orig),
            offset = 0,
            validValues = [],
            wheels = [],
            ord = [],
            o = {},
            innerValues = {},
            f = {
              y: getYear,
              m: getMonth,
              d: getDay,
              h: getHour,
              i: getMinute,
              s: getSecond,
              u: getMillisecond,
              a: getAmPm
            },
            invalid = s.invalid,
            valid = s.valid,
            p = s.preset,
            dord = s.dateOrder,
            tord = s.timeWheels,
            regen = dord.match(/D/),
            ampm = tord.match(/a/i),
            hampm = tord.match(/h/),
            hformat = p == 'datetime' ? s.dateFormat + s.separator + s.timeFormat : p == 'time' ? s.timeFormat : s.dateFormat,
            defd = new Date(),
            steps = s.steps || {},
            stepH = steps.hour || s.stepHour || 1,
            stepM = steps.minute || s.stepMinute || 1,
            stepS = steps.second || s.stepSecond || 1,
            zeroBased = steps.zeroBased,
            mind = s.minDate || new Date(s.startYear, 0, 1),
            maxd = s.maxDate || new Date(s.endYear, 11, 31, 23, 59, 59),
            minH = zeroBased ? 0 : mind.getHours() % stepH,
            minM = zeroBased ? 0 : mind.getMinutes() % stepM,
            minS = zeroBased ? 0 : mind.getSeconds() % stepS,
            maxH = getMax(stepH, minH, (hampm ? 11 : 23)),
            maxM = getMax(stepM, minM, 59),
            maxS = getMax(stepM, minM, 59);
        format = format || hformat;
        if (p.match(/date/i)) {

          // Determine the order of year, month, day wheels
          $.each(['y', 'm', 'd'], function (j, v) {
            i = dord.search(new RegExp(v, 'i'));
            if (i > -1) {
              ord.push({
                o: i,
                v: v
              });
            }
          });
          ord.sort(function (a, b) {
            return a.o > b.o ? 1 : -1;
          });
          $.each(ord, function (i, v) {
            o[v.v] = i;
          });
          wg = [];
          for (k = 0; k < 3; k++) {
            if (k == o.y) {
              offset++;
              values = [];
              keys = [];
              start = s.getYear(mind);
              end = s.getYear(maxd);
              for (i = start; i <= end; i++) {
                keys.push(i);
                values.push((dord.match(/yy/i) ? i : (i + '').substr(2, 2)) + (s.yearSuffix || ''));
              }
              addWheel(wg, keys, values, s.yearText);
            } else if (k == o.m) {
              offset++;
              values = [];
              keys = [];
              for (i = 0; i < 12; i++) {
                var str = dord.replace(/[dy]/gi, '').replace(/mm/, (i < 9 ? '0' + (i + 1) : i + 1) + (s.monthSuffix || '')).replace(/m/, i + 1 + (s.monthSuffix || ''));
                keys.push(i);
                values.push(str.match(/MM/) ? str.replace(/MM/, '<span class="dw-mon">' + s.monthNames[i] + '</span>') : str.replace(/M/, '<span class="dw-mon">' + s.monthNamesShort[i] + '</span>'));
              }
              addWheel(wg, keys, values, s.monthText);
            } else if (k == o.d) {
              offset++;
              values = [];
              keys = [];
              for (i = 1; i < 32; i++) {
                keys.push(i);
                values.push((dord.match(/dd/i) && i < 10 ? '0' + i : i) + (s.daySuffix || ''));
              }
              addWheel(wg, keys, values, s.dayText);
            }
          }
          wheels.push(wg);
        }
        if (p.match(/time/i)) {
          hasTime = true;
          // Determine the order of hours, minutes, seconds wheels
          ord = [];
          $.each(['h', 'i', 's', 'a'], function (i, v) {
            i = tord.search(new RegExp(v, 'i'));
            if (i > -1) {
              ord.push({
                o: i,
                v: v
              });
            }
          });
          ord.sort(function (a, b) {
            return a.o > b.o ? 1 : -1;
          });
          $.each(ord, function (i, v) {
            o[v.v] = offset + i;
          });
          wg = [];
          for (k = offset; k < offset + 4; k++) {
            if (k == o.h) {
              offset++;
              values = [];
              keys = [];
              for (i = minH; i < (hampm ? 12 : 24); i += stepH) {
                keys.push(i);
                values.push(hampm && i === 0 ? 12 : tord.match(/hh/i) && i < 10 ? '0' + i : i);
              }
              addWheel(wg, keys, values, s.hourText);
            } else if (k == o.i) {
              offset++;
              values = [];
              keys = [];
              for (i = minM; i < 60; i += stepM) {
                keys.push(i);
                values.push(tord.match(/ii/) && i < 10 ? '0' + i : i);
              }
              addWheel(wg, keys, values, s.minuteText);
            } else if (k == o.s) {
              offset++;
              values = [];
              keys = [];
              for (i = minS; i < 60; i += stepS) {
                keys.push(i);
                values.push(tord.match(/ss/) && i < 10 ? '0' + i : i);
              }
              addWheel(wg, keys, values, s.secText);
            } else if (k == o.a) {
              offset++;
              var upper = tord.match(/A/);
              addWheel(wg, [0, 1], upper ? [s.amText.toUpperCase(), s.pmText.toUpperCase()] : [s.amText, s.pmText], s.ampmText);
            }
          }
          wheels.push(wg);
        }
        function get(d, i, def) {
          if (o[i] !== undefined) {
            return +d[o[i]];
          }
          if (innerValues[i] !== undefined) {
            return innerValues[i];
          }
          if (def !== undefined) {
            return def;
          }
          return f[i](defd);
        }

        function addWheel(wg, k, v, lbl) {
          wg.push({
            values: v,
            keys: k,
            label: lbl
          });
        }

        function step(v, st, min, max) {
          return Math.min(max, Math.floor(v / st) * st + min);
        }

        function getYear(d) {
          return s.getYear(d);
        }

        function getMonth(d) {
          return s.getMonth(d);
        }

        function getDay(d) {
          return s.getDay(d);
        }

        function getHour(d) {
          var hour = d.getHours();
          hour = hampm && hour >= 12 ? hour - 12 : hour;
          return step(hour, stepH, minH, maxH);
        }

        function getMinute(d) {
          return step(d.getMinutes(), stepM, minM, maxM);
        }

        function getSecond(d) {
          return step(d.getSeconds(), stepS, minS, maxS);
        }

        function getMillisecond(d) {
          return d.getMilliseconds();
        }

        function getAmPm(d) {
          return ampm && d.getHours() > 11 ? 1 : 0;
        }

        function getDate(d) {
          if (d === null) {
            return d;
          }
          var year = get(d, 'y'),
              month = get(d, 'm'),
              day = Math.min(get(d, 'd'), s.getMaxDayOfMonth(year, month)),
              hour = get(d, 'h', 0);
          return s.getDate(year, month, day, get(d, 'a', 0) ? hour + 12 : hour, get(d, 'i', 0), get(d, 's', 0), get(d, 'u', 0));
        }

        function getMax(step, min, max) {
          return Math.floor((max - min) / step) * step + min;
        }

        function getClosestValidDate(d, dir) {
          var next,
              prev,
              nextValid = false,
              prevValid = false,
              up = 0,
              down = 0;
          // Normalize min and max dates for comparing later (set default values where there are no values from wheels)
          mind = getDate(getArray(mind));
          maxd = getDate(getArray(maxd));
          if (isValid(d)) {
            return d;
          }
          if (d < mind) {
            d = mind;
          }
          if (d > maxd) {
            d = maxd;
          }
          next = d;
          prev = d;
          if (dir !== 2) {
            nextValid = isValid(next);
            while (!nextValid && next < maxd) {
              next = new Date(next.getTime() + 1000 * 60 * 60 * 24);
              nextValid = isValid(next);
              up++;
            }
          }
          if (dir !== 1) {
            prevValid = isValid(prev);
            while (!prevValid && prev > mind) {
              prev = new Date(prev.getTime() - 1000 * 60 * 60 * 24);
              prevValid = isValid(prev);
              down++;
            }
          }
          if (dir === 1 && nextValid) {
            return next;
          }
          if (dir === 2 && prevValid) {
            return prev;
          }
          return down <= up && prevValid ? prev : next;
        }

        function isValid(d) {
          if (d < mind) {
            return false;
          }
          if (d > maxd) {
            return false;
          }
          if (isInObj(d, valid)) {
            return true;
          }
          if (isInObj(d, invalid)) {
            return false;
          }
          return true;
        }

        function isInObj(d, obj) {
          var curr,
              j,
              v;
          if (obj) {
            for (j = 0; j < obj.length; j++) {
              curr = obj[j];
              v = curr + '';
              if (!curr.start) {
                if (curr.getTime) { // Exact date
                  if (d.getFullYear() == curr.getFullYear() && d.getMonth() == curr.getMonth() && d.getDate() == curr.getDate()) {
                    return true;
                  }
                } else if (!v.match(/w/i)) { // Day of month
                  v = v.split('/');
                  if (v[1]) {
                    if ((v[0] - 1) == d.getMonth() && v[1] == d.getDate()) {
                      return true;
                    }
                  } else if (v[0] == d.getDate()) {
                    return true;
                  }
                } else { // Day of week
                  v = +v.replace('w', '');
                  if (v == d.getDay()) {
                    return true;
                  }
                }
              }
            }
          }
          return false;
        }

        function validateDates(obj, y, m, first, maxdays, idx, val) {
          var j, d, v;
          if (obj) {
            for (j = 0; j < obj.length; j++) {
              d = obj[j];
              v = d + '';
              if (!d.start) {
                if (d.getTime) { // Exact date
                  if (s.getYear(d) == y && s.getMonth(d) == m) {
                    idx[s.getDay(d) - 1] = val;
                  }
                } else if (!v.match(/w/i)) { // Day of month
                  v = v.split('/');
                  if (v[1]) {
                    if (v[0] - 1 == m) {
                      idx[v[1] - 1] = val;
                    }
                  } else {
                    idx[v[0] - 1] = val;
                  }
                } else { // Day of week
                  v = +v.replace('w', '');
                  for (k = v - first; k < maxdays; k += 7) {
                    if (k >= 0) {
                      idx[k] = val;
                    }
                  }
                }
              }
            }
          }
        }

        function validateTimes(vobj, i, v, temp, y, m, d, target, valid) {
          var dd, ss, str, parts1, parts2, prop1, prop2, v1, v2, j, i1, i2, add, remove, all, hours1, hours2, hours3,
              spec = {},
              steps = {
                h: stepH,
                i: stepM,
                s: stepS,
                a: 1
              },
              day = s.getDate(y, m, d),
              w = ['a', 'h', 'i', 's'];
          if (vobj) {
            $.each(vobj, function (i, obj) {
              if (obj.start) {
                obj.apply = false;
                dd = obj.d;
                ss = dd + '';
                str = ss.split('/');
                if (dd && ((dd.getTime && y == s.getYear(dd) && m == s.getMonth(dd) && d == s.getDay(dd)) || // Exact date
                        (!ss.match(/w/i) && ((str[1] && d == str[1] && m == str[0] - 1) || (!str[1] && d == str[0]))) || // Day of month
                        (ss.match(/w/i) && day.getDay() == +ss.replace('w', '')) // Day of week
                    )) {
                  obj.apply = true;
                  spec[day] = true; // Prevent applying generic rule on day, if specific exists
                }
              }
            });
            $.each(vobj, function (x, obj) {
              add = 0;
              remove = 0;
              i1 = 0;
              i2 = undefined;
              prop1 = true;
              prop2 = true;
              all = false;
              if (obj.start && (obj.apply || (!obj.d && !spec[day]))) {

                // Define time parts
                parts1 = obj.start.split(':');
                parts2 = obj.end.split(':');
                for (j = 0; j < 3; j++) {
                  if (parts1[j] === undefined) {
                    parts1[j] = 0;
                  }
                  if (parts2[j] === undefined) {
                    parts2[j] = 59;
                  }
                  parts1[j] = +parts1[j];
                  parts2[j] = +parts2[j];
                }
                parts1.unshift(parts1[0] > 11 ? 1 : 0);
                parts2.unshift(parts2[0] > 11 ? 1 : 0);
                if (hampm) {
                  if (parts1[1] >= 12) {
                    parts1[1] = parts1[1] - 12;
                  }
                  if (parts2[1] >= 12) {
                    parts2[1] = parts2[1] - 12;
                  }
                }
                // Look behind
                for (j = 0; j < i; j++) {
                  if (validValues[j] !== undefined) {
                    v1 = step(parts1[j], steps[w[j]], mins[w[j]], maxs[w[j]]);
                    v2 = step(parts2[j], steps[w[j]], mins[w[j]], maxs[w[j]]);
                    hours1 = 0;
                    hours2 = 0;
                    hours3 = 0;
                    if (hampm && j == 1) {
                      hours1 = parts1[0] ? 12 : 0;
                      hours2 = parts2[0] ? 12 : 0;
                      hours3 = validValues[0] ? 12 : 0;
                    }
                    if (!prop1) {
                      v1 = 0;
                    }
                    if (!prop2) {
                      v2 = maxs[w[j]];
                    }
                    if ((prop1 || prop2) && (v1 + hours1 < validValues[j] + hours3 && validValues[j] + hours3 < v2 + hours2)) {
                      all = true;
                    }
                    if (validValues[j] != v1) {
                      prop1 = false;
                    }
                    if (validValues[j] != v2) {
                      prop2 = false;
                    }
                  }
                }
                // Look ahead
                if (!valid) {
                  for (j = i + 1; j < 4; j++) {
                    if (parts1[j] > 0) {
                      add = steps[v];
                    }
                    if (parts2[j] < maxs[w[j]]) {
                      remove = steps[v];
                    }
                  }
                }
                if (!all) {
                  // Calculate min and max values
                  v1 = step(parts1[i], steps[v], mins[v], maxs[v]) + add;
                  v2 = step(parts2[i], steps[v], mins[v], maxs[v]) - remove;
                  if (prop1) {
                    i1 = getValidIndex(target, v1, maxs[v], 0);
                  }
                  if (prop2) {
                    i2 = getValidIndex(target, v2, maxs[v], 1);
                  }
                }
                // Disable values
                if (prop1 || prop2 || all) {
                  if (valid) {
                    $('.dw-li', target).slice(i1, i2).addClass('dw-v');
                  } else {
                    $('.dw-li', target).slice(i1, i2).removeClass('dw-v');
                  }
                }
              }
            });
          }
        }

        function getIndex(t, v) {
          return $('.dw-li', t).index($('.dw-li[data-val="' + v + '"]', t));
        }

        function getValidIndex(t, v, max, add) {
          if (v < 0) {
            return 0;
          }
          if (v > max) {
            return $('.dw-li', t).length;
          }
          return getIndex(t, v) + add;
        }

        function getArray(d, fillInner) {
          var ret = [];
          if (d === null || d === undefined) {
            return d;
          }
          $.each(['y', 'm', 'd', 'a', 'h', 'i', 's', 'u'], function (x, i) {
            if (o[i] !== undefined) {
              ret[o[i]] = f[i](d);
            }
            if (fillInner) {
              innerValues[i] = f[i](d);
            }
          });
          return ret;
        }

        function convertRanges(arr) {
          var i, v, start,
              ret = [];
          if (arr) {
            for (i = 0; i < arr.length; i++) {
              v = arr[i];
              if (v.start && v.start.getTime) {
                start = new Date(v.start);
                while (start <= v.end) {
                  ret.push(new Date(start.getFullYear(), start.getMonth(), start.getDate()));
                  start.setDate(start.getDate() + 1);
                }
              } else {
                ret.push(v);
              }
            }
            return ret;
          }
          return arr;
        }

        // Extended methods
        // ---
        inst.getVal = function (temp) {
          return inst._hasValue || temp ? getDate(inst.getArrayVal(temp)) : null;
        };
        /**
         * Sets the selected date
         *
         * @param {Date} d Date to select.
         * @param {Boolean} [fill=false] Also set the value of the associated input element. Default is true.
         * @param {Number} [time=0] Animation time to scroll to the selected date.
         * @param {Boolean} [temp=false] Set temporary value only.
         * @param {Boolean} [change=fill] Trigger change on input element.
         */
        inst.setDate = function (d, fill, time, temp, change) {
          inst.setArrayVal(getArray(d), fill, change, temp, time);
        };
        /**
         * Returns the selected date.
         *
         * @param {Boolean} [temp=false] If true, return the currently shown date on the picker, otherwise the last selected one.
         * @return {Date}
         */
        inst.getDate = inst.getVal;
        // ---
        // Initializations
        // ---
        inst.format = hformat;
        inst.order = o;
        inst.handlers.now = function () {
          inst.setDate(new Date(), false, 0.3, true, true);
        };
        inst.buttons.now = {
          text: s.nowText,
          handler: 'now'
        };
        invalid = convertRanges(invalid);
        valid = convertRanges(valid);
        mins = {
          y: mind.getFullYear(),
          m: 0,
          d: 1,
          h: minH,
          i: minM,
          s: minS,
          a: 0
        };
        maxs = {
          y: maxd.getFullYear(),
          m: 11,
          d: 31,
          h: maxH,
          i: maxM,
          s: maxS,
          a: 1
        };
        // ---
        return {
          wheels: wheels,
          headerText: s.headerText ? function () {
            return datetime.formatDate(hformat, getDate(inst.getArrayVal(true)), s);
          } : false,
          formatValue: function (d) {
            return datetime.formatDate(format, getDate(d), s);
          },
          parseValue: function (val) {
            if (!val) {
              innerValues = {};
            }
            return getArray(val ? datetime.parseDate(format, val, s) : (s.defaultValue || new Date()), !!val && !!val.getTime);
          },
          validate: function (dw, i, time, dir) {
            var validated = getClosestValidDate(getDate(inst.getArrayVal(true)), dir),
                temp = getArray(validated),
                y = get(temp, 'y'),
                m = get(temp, 'm'),
                minprop = true,
                maxprop = true;
            $.each(['y', 'm', 'd', 'a', 'h', 'i', 's'], function (x, i) {
              if (o[i] !== undefined) {
                var min = mins[i],
                    max = maxs[i],
                    maxdays = 31,
                    val = get(temp, i),
                    t = $('.dw-ul', dw).eq(o[i]);
                if (i == 'd') {
                  maxdays = s.getMaxDayOfMonth(y, m);
                  max = maxdays;
                  if (regen) {
                    $('.dw-li', t).each(function () {
                      var that = $(this),
                          d = that.data('val'),
                          w = s.getDate(y, m, d).getDay(),
                          str = dord.replace(/[my]/gi, '').replace(/dd/, (d < 10 ? '0' + d : d) + (s.daySuffix || '')).replace(/d/, d + (s.daySuffix || ''));
                      $('.dw-i', that).html(str.match(/DD/) ? str.replace(/DD/, '<span class="dw-day">' + s.dayNames[w] + '</span>') : str.replace(/D/, '<span class="dw-day">' + s.dayNamesShort[w] + '</span>'));
                    });
                  }
                }
                if (minprop && mind) {
                  min = f[i](mind);
                }
                if (maxprop && maxd) {
                  max = f[i](maxd);
                }
                if (i != 'y') {
                  var i1 = getIndex(t, min),
                      i2 = getIndex(t, max);
                  $('.dw-li', t).removeClass('dw-v').slice(i1, i2 + 1).addClass('dw-v');
                  if (i == 'd') { // Hide days not in month
                    $('.dw-li', t).removeClass('dw-h').slice(maxdays).addClass('dw-h');
                  }
                }
                if (val < min) {
                  val = min;
                }
                if (val > max) {
                  val = max;
                }
                if (minprop) {
                  minprop = val == min;
                }
                if (maxprop) {
                  maxprop = val == max;
                }
                // Disable some days
                if (i == 'd') {
                  var first = s.getDate(y, m, 1).getDay(),
                      idx = {};
                  // Set invalid indexes
                  validateDates(invalid, y, m, first, maxdays, idx, 1);
                  // Delete indexes which are valid
                  validateDates(valid, y, m, first, maxdays, idx, 0);
                  $.each(idx, function (i, v) {
                    if (v) {
                      $('.dw-li', t).eq(i).removeClass('dw-v');
                    }
                  });
                }
              }
            });
            // Invalid times
            if (hasTime) {
              $.each(['a', 'h', 'i', 's'], function (i, v) {
                var val = get(temp, v),
                    d = get(temp, 'd'),
                    t = $('.dw-ul', dw).eq(o[v]);
                if (o[v] !== undefined) {
                  validateTimes(invalid, i, v, temp, y, m, d, t, 0);
                  validateTimes(valid, i, v, temp, y, m, d, t, 1);
                  // Get valid value
                  validValues[i] = +inst.getValidCell(val, t, dir).val;
                }
              });
            }
            inst._tempWheelArray = temp;
          }
        };
      };
  $.each(['date', 'time', 'datetime'], function (i, v) {
    ms.presets.scroller[v] = preset;
  });
})(jQuery);
(function ($) {
  $.each(['date', 'time', 'datetime'], function (i, v) {
    $.mobiscroll.presetShort(v);
  });
})(jQuery);
(function ($) {
  var themes = $.mobiscroll.themes.frame,
      theme = {
        display: 'bottom',
        dateOrder: 'MMdyy',
        rows: 5,
        height: 34,
        minWidth: 55,
        headerText: false,
        showLabel: false,
        btnWidth: false,
        selectedLineHeight: true,
        selectedLineBorder: 1,
        useShortLabels: true,
        deleteIcon: 'backspace3',
        checkIcon: 'ion-ios7-checkmark-empty',
        btnCalPrevClass: 'mbsc-ic mbsc-ic-arrow-left5',
        btnCalNextClass: 'mbsc-ic mbsc-ic-arrow-right5',
        btnPlusClass: 'mbsc-ic mbsc-ic-arrow-down5',
        btnMinusClass: 'mbsc-ic mbsc-ic-arrow-up5',
        // @deprecated since 2.14.0, backward compatibility code
        // ---
        onThemeLoad: function (lang, s) {
          if (s.theme) {
            s.theme = s.theme.replace('ios7', 'ios');
          }
        }
        // ---
      };
  themes.ios = theme;
  // @deprecated since 2.14.0, backward compatibility code
  themes.ios7 = theme;
})(jQuery);
(function ($, undefined) {
  var ms = $.mobiscroll,
      util = ms.util,
      isString = util.isString,
      defaults = {
        batch: 40,
        inputClass: '',
        invalid: [],
        rtl: false,
        showInput: true,
        groupLabel: 'Groups',
        checkIcon: 'checkmark',
        dataText: 'text',
        dataValue: 'value',
        dataGroup: 'group',
        dataDisabled: 'disabled'
      };
  ms.presetShort('select');
  ms.presets.scroller.select = function (inst) {
    var change,
        defaultValue,
        group,
        groupArray,
        groupChanged,
        groupTap,
        groupWheelIdx,
        i,
        input,
        optionArray,
        optionWheelIdx,
        option,
        origValues,
        prevGroup,
        timer,
        batchChanged = {},
        batchStart = {},
        batchEnd = {},
        tempBatchStart = {},
        tempBatchEnd = {},
        orig = $.extend({}, inst.settings),
        s = $.extend(inst.settings, defaults, orig),
        batch = s.batch,
        layout = s.layout || (/top|bottom/.test(s.display) ? 'liquid' : ''),
        isLiquid = layout == 'liquid',
        elm = $(this),
        multiple = s.multiple || elm.prop('multiple'),
        maxSelect = util.isNumeric(s.multiple) ? s.multiple : Infinity,
        id = this.id + '_dummy',
        lbl = $('label[for="' + this.id + '"]').attr('for', id),
        label = s.label !== undefined ? s.label : (lbl.length ? lbl.text() : elm.attr('name')),
        selectedClass = 'dw-msel mbsc-ic mbsc-ic-' + s.checkIcon,
        origReadOnly = s.readonly,
        data = s.data,
        hasData = !!data,
        hasGroups = hasData ? !!s.group : $('optgroup', elm).length,
        groupSetup = s.group,
        groupWheel = hasGroups && groupSetup && groupSetup.groupWheel !== false,
        groupSep = hasGroups && groupSetup && groupWheel && groupSetup.clustered === true,
        groupHdr = hasGroups && (!groupSetup || (groupSetup.header !== false && !groupSep)),
        values = elm.val() || [],
        invalid = [],
        selectedValues = {},
        options = {},
        groups = {};

    function prepareData() {
      var gr,
          lbl,
          opt,
          txt,
          val,
          l = 0,
          c = 0,
          groupIndexes = {};
      options = {};
      groups = {};
      optionArray = [];
      groupArray = [];
      // Reset invalids
      invalid.length = 0;
      if (hasData) {
        $.each(s.data, function (i, v) {
          txt = v[s.dataText];
          val = v[s.dataValue];
          lbl = v[s.dataGroup];
          opt = {
            value: val,
            text: txt,
            index: i
          };
          options[val] = opt;
          optionArray.push(opt);
          if (hasGroups) {
            if (groupIndexes[lbl] === undefined) {
              gr = {
                text: lbl,
                value: c,
                options: [],
                index: c
              };
              groups[c] = gr;
              groupIndexes[lbl] = c;
              groupArray.push(gr);
              c++;
            } else {
              gr = groups[groupIndexes[lbl]];
            }
            if (groupSep) {
              opt.index = gr.options.length;
            }
            opt.group = groupIndexes[lbl];
            gr.options.push(opt);
          }
          if (v[s.dataDisabled]) {
            invalid.push(val);
          }
        });
      } else {
        if (hasGroups) {
          $('optgroup', elm).each(function (i) {
            groups[i] = {
              text: this.label,
              value: i,
              options: [],
              index: i
            };
            groupArray.push(groups[i]);
            $('option', this).each(function (j) {
              opt = {
                value: this.value,
                text: this.text,
                index: groupSep ? j : l++,
                group: i
              };
              options[this.value] = opt;
              optionArray.push(opt);
              groups[i].options.push(opt);
              if (this.disabled) {
                invalid.push(this.value);
              }
            });
          });
        } else {
          $('option', elm).each(function (i) {
            opt = {
              value: this.value,
              text: this.text,
              index: i
            };
            options[this.value] = opt;
            optionArray.push(opt);
            if (this.disabled) {
              invalid.push(this.value);
            }
          });
        }
      }
      if (optionArray.length) {
        defaultValue = optionArray[0].value;
      }
      if (groupHdr) {
        optionArray = [];
        l = 0;
        $.each(groups, function (i, gr) {
          val = '__group' + i;
          opt = {
            text: gr.text,
            value: val,
            group: i,
            index: l++
          };
          options[val] = opt;
          optionArray.push(opt);
          invalid.push(opt.value);
          $.each(gr.options, function (j, opt) {
            opt.index = l++;
            optionArray.push(opt);
          });
        });
      }
    }

    function genValues(w, data, dataMap, value, index, multiple, label) {
      var i,
          wheel,
          keys = [],
          values = [],
          selectedIndex = dataMap[value] !== undefined ? dataMap[value].index : 0,
          start = Math.max(0, selectedIndex - batch),
          end = Math.min(data.length - 1, start + batch * 2);
      if (batchStart[index] !== start || batchEnd[index] !== end) {
        for (i = start; i <= end; i++) {
          values.push(data[i].text);
          keys.push(data[i].value);
        }
        batchChanged[index] = true;
        tempBatchStart[index] = start;
        tempBatchEnd[index] = end;
        wheel = {
          multiple: multiple,
          values: values,
          keys: keys,
          label: label
        };
        if (isLiquid) {
          w[0][index] = wheel;
        } else {
          w[index] = [wheel];
        }
      } else {
        batchChanged[index] = false;
      }
    }

    function genGroupWheel(w) {
      genValues(w, groupArray, groups, group, groupWheelIdx, false, s.groupLabel);
    }

    function genOptWheel(w) {
      genValues(w, groupSep ? groups[group].options : optionArray, options, option, optionWheelIdx, multiple, label);
    }

    function genWheels() {
      var w = [
        []
      ];
      if (groupWheel) {
        genGroupWheel(w);
      }
      genOptWheel(w);
      return w;
    }
    function getOption(v) {
      if (multiple) {
        if (v && isString(v)) {
          v = v.split(',');
        }
        if ($.isArray(v)) {
          v = v[0];
        }
      }
      option = v === undefined || v === null || v === '' || !options[v] ? defaultValue : v;
      if (groupWheel) {
        group = options[option] ? options[option].group : null;
        prevGroup = group;
      }
    }

    function getVal(temp, group) {
      var val = temp ? inst._tempWheelArray : (inst._hasValue ? inst._wheelArray : null);
      return val ? (s.group && group ? val : val[optionWheelIdx]) : null;
    }

    function onFill() {
      var txt,
          val,
          sel = [],
          i = 0;
      if (multiple) {
        val = [];
        for (i in selectedValues) {
          sel.push(options[i] ? options[i].text : '');
          val.push(i);
        }
        txt = sel.join(', ');
      } else {
        val = option;
        txt = options[option] ? options[option].text : '';
      }
      inst._tempValue = val;
      input.val(txt);
      elm.val(val);
    }

    function onTap(li) {
      var val = li.attr('data-val'),
          selected = li.hasClass('dw-msel');
      if (multiple && li.closest('.dwwl').hasClass('dwwms')) {
        if (li.hasClass('dw-v')) {
          if (selected) {
            li.removeClass(selectedClass).removeAttr('aria-selected');
            delete selectedValues[val];
          } else if (util.objectToArray(selectedValues).length < maxSelect) {
            li.addClass(selectedClass).attr('aria-selected', 'true');
            selectedValues[val] = val;
          }
        }
        return false;
      } else if (li.hasClass('dw-w-gr')) {
        groupTap = li.attr('data-val');
      }
    }

    if (!s.invalid.length) {
      s.invalid = invalid;
    }
    if (groupWheel) {
      groupWheelIdx = 0;
      optionWheelIdx = 1;
    } else {
      groupWheelIdx = -1;
      optionWheelIdx = 0;
    }
    if (multiple) {
      elm.prop('multiple', true);
      if (values && isString(values)) {
        values = values.split(',');
      }
      for (i = 0; i < values.length; i++) {
        selectedValues[values[i]] = values[i];
      }
    }
    prepareData();
    getOption(elm.val());
    $('#' + id).remove();
    if (elm.next().is('input.mbsc-control')) {
      input = elm.off('.mbsc-form').next().removeAttr('tabindex');
    } else {
      input = $('<input type="text" id="' + id + '" class="mbsc-control mbsc-control-ev ' + s.inputClass + '" readonly />');
      if (s.showInput) {
        input.insertBefore(elm);
      }
    }
    inst.attachShow(input.attr('placeholder', s.placeholder || ''));
    elm.addClass('dw-hsel').attr('tabindex', -1).closest('.ui-field-contain').trigger('create');
    onFill();
    // Extended methods
    // ---
    inst.setVal = function (val, fill, change, temp, time) {
      if (multiple) {
        if (val && isString(val)) {
          val = val.split(',');
        }
        selectedValues = util.arrayToObject(val);
        val = val ? val[0] : null;
      }
      inst._setVal(val, fill, change, temp, time);
    };
    inst.getVal = function (temp, group) {
      if (multiple) {
        return util.objectToArray(selectedValues);
      }
      return getVal(temp, group);
    };
    inst.refresh = function () {
      prepareData();
      batchStart = {};
      batchEnd = {};
      s.wheels = genWheels();
      batchStart[groupWheelIdx] = tempBatchStart[groupWheelIdx];
      batchEnd[groupWheelIdx] = tempBatchEnd[groupWheelIdx];
      batchStart[optionWheelIdx] = tempBatchStart[optionWheelIdx];
      batchEnd[optionWheelIdx] = tempBatchEnd[optionWheelIdx];
      // Prevent wheel generation on initial validation
      change = true;
      getOption(option);
      inst._tempWheelArray = groupWheel ? [group, option] : [option];
      if (inst._isVisible) {
        inst.changeWheel(groupWheel ? [groupWheelIdx, optionWheelIdx] : [optionWheelIdx]);
      }
    };
    // @deprecated since 2.14.0, backward compatibility code
    // ---
    inst.getValues = inst.getVal;
    inst.getValue = getVal;
    // ---
    // ---
    return {
      width: 50,
      layout: layout,
      headerText: false,
      anchor: input,
      confirmOnTap: groupWheel ? [false, true] : true,
      formatValue: function (d) {
        var i,
            opt,
            sel = [];
        if (multiple) {
          for (i in selectedValues) {
            sel.push(options[i] ? options[i].text : '');
          }
          return sel.join(', ');
        }
        opt = d[optionWheelIdx];
        return options[opt] ? options[opt].text : '';
      },
      parseValue: function (val) {
        getOption(val === undefined ? elm.val() : val);
        return groupWheel ? [group, option] : [option];
      },
      onValueTap: onTap,
      onValueFill: onFill,
      onBeforeShow: function () {
        if (multiple && s.counter) {
          s.headerText = function () {
            var length = 0;
            $.each(selectedValues, function () {
              length++;
            });
            return (length > 1 ? s.selectedPluralText || s.selectedText : s.selectedText).replace(/{count}/, length);
          };
        }
        getOption(elm.val());
        if (groupWheel) {
          inst._tempWheelArray = [group, option];
        }
        inst.refresh();
      },
      onMarkupReady: function (dw) {
        dw.addClass('dw-select');
        $('.dwwl' + groupWheelIdx, dw).on('mousedown touchstart', function () {
          clearTimeout(timer);
        });
        $('.dwwl' + optionWheelIdx, dw).on('mousedown touchstart', function () {
          if (!groupChanged) {
            clearTimeout(timer);
          }
        });
        if (groupHdr) {
          $('.dwwl' + optionWheelIdx, dw).addClass('dw-select-gr');
        }
        if (multiple) {
          dw.addClass('dwms');
          $('.dwwl', dw).on('keydown', function (e) {
            if (e.keyCode == 32) { // Space
              e.preventDefault();
              e.stopPropagation();
              onTap($('.dw-sel', this));
            }
          }).eq(optionWheelIdx).attr('aria-multiselectable', 'true');
          origValues = $.extend({}, selectedValues);
        }
      },
      validate: function (dw, i, time, dir) {
        var j,
            v,
            changes = [],
            temp = inst.getArrayVal(true),
            tempGr = temp[groupWheelIdx],
            tempOpt = temp[optionWheelIdx],
            t1 = $('.dw-ul', dw).eq(groupWheelIdx),
            t2 = $('.dw-ul', dw).eq(optionWheelIdx);
        if (batchStart[groupWheelIdx] > 1) {
          $('.dw-li', t1).slice(0, 2).removeClass('dw-v').addClass('dw-fv');
        }
        if (batchEnd[groupWheelIdx] < groupArray.length - 2) {
          $('.dw-li', t1).slice(-2).removeClass('dw-v').addClass('dw-fv');
        }
        if (batchStart[optionWheelIdx] > 1) {
          $('.dw-li', t2).slice(0, 2).removeClass('dw-v').addClass('dw-fv');
        }
        if (batchEnd[optionWheelIdx] < (groupSep ? groups[tempGr].options : optionArray).length - 2) {
          $('.dw-li', t2).slice(-2).removeClass('dw-v').addClass('dw-fv');
        }
        if (!change) {
          option = tempOpt;
          if (groupWheel) {
            group = options[option].group;
            // If group changed, load group options
            if (i === undefined || i === groupWheelIdx) {
              group = +temp[groupWheelIdx];
              groupChanged = false;
              if (group !== prevGroup) {
                option = groups[group].options[0].value;
                batchStart[optionWheelIdx] = null;
                batchEnd[optionWheelIdx] = null;
                groupChanged = true;
                s.readonly = [false, true];
              } else {
                s.readonly = origReadOnly;
              }
            }
          }
          // Adjust value to the first group option if group header was selected
          if (hasGroups && (/__group/.test(option) || groupTap)) {
            option = groups[options[groupTap || option].group].options[0].value;
            tempOpt = option;
            groupTap = false;
          }
          // Update values if changed
          // Don't set the new option yet (if group changed), because it's not on the wheel yet
          inst._tempWheelArray = groupWheel ? [tempGr, tempOpt] : [tempOpt];
          // Generate new wheel batches
          if (groupWheel) {
            genGroupWheel(s.wheels);
            if (batchChanged[groupWheelIdx]) {
              changes.push(groupWheelIdx);
            }
          }
          genOptWheel(s.wheels);
          if (batchChanged[optionWheelIdx]) {
            changes.push(optionWheelIdx);
          }
          clearTimeout(timer);
          timer = setTimeout(function () {
            if (changes.length) {
              change = true;
              groupChanged = false;
              prevGroup = group;
              // Save current batch boundaries
              batchStart[groupWheelIdx] = tempBatchStart[groupWheelIdx];
              batchEnd[groupWheelIdx] = tempBatchEnd[groupWheelIdx];
              batchStart[optionWheelIdx] = tempBatchStart[optionWheelIdx];
              batchEnd[optionWheelIdx] = tempBatchEnd[optionWheelIdx];
              // Set the updated values
              inst._tempWheelArray = groupWheel ? [tempGr, option] : [option];
              // Change the wheels
              inst.changeWheel(changes, 0, i !== undefined);
            }
            if (groupWheel) {
              if (i === optionWheelIdx) {
                inst.scroll(t1, groupWheelIdx, inst.getValidCell(group, t1, dir, false, true).v, 0.1);
              }
              inst._tempWheelArray[groupWheelIdx] = group;
            }
            // Restore readonly status
            s.readonly = origReadOnly;
          }, i === undefined ? 100 : time * 1000);
          if (changes.length) {
            return groupChanged ? false : true;
          }
        }
        // Add selected styling to selected elements in case of multiselect
        if (i === undefined && multiple) {
          v = selectedValues;
          j = 0;
          $('.dwwl' + optionWheelIdx + ' .dw-li', dw).removeClass(selectedClass).removeAttr('aria-selected');
          for (j in v) {
            $('.dwwl' + optionWheelIdx + ' .dw-li[data-val="' + v[j] + '"]', dw).addClass(selectedClass).attr('aria-selected', 'true');
          }
        }
        // Add styling to group headers
        if (groupHdr) {
          $('.dw-li[data-val^="__group"]', dw).addClass('dw-w-gr');
        }
        // Disable invalid options
        $.each(s.invalid, function (i, v) {
          $('.dw-li[data-val="' + v + '"]', t2).removeClass('dw-v dw-fv');
        });
        change = false;
      },
      onValidated: function () {
        option = inst._tempWheelArray[optionWheelIdx];
      },
      onClear: function (dw) {
        selectedValues = {};
        input.val('');
        $('.dwwl' + optionWheelIdx + ' .dw-li', dw).removeClass(selectedClass).removeAttr('aria-selected');
      },
      onCancel: function () {
        if (!inst.live && multiple) {
          selectedValues = $.extend({}, origValues);
        }
      },
      onDestroy: function () {
        if (!input.hasClass('mbsc-control')) {
          input.remove();
        }
        elm.removeClass('dw-hsel').removeAttr('tabindex');
      }
    };
  };
})(jQuery);

/*!
Autosize 3.0.14
license: MIT
http://www.jacklmoore.com/autosize
*/
(function (global, factory) {
if (typeof define === 'function' && define.amd) {
	define(['exports', 'module'], factory);
} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
	factory(exports, module);
} else {
	var mod = {
		exports: {}
	};
	factory(mod.exports, mod);
	global.autosize = mod.exports;
}
})(this, function (exports, module) {
'use strict';

var set = typeof Set === 'function' ? new Set() : (function () {
	var list = [];

	return {
		has: function has(key) {
			return Boolean(list.indexOf(key) > -1);
		},
		add: function add(key) {
			list.push(key);
		},
		'delete': function _delete(key) {
			list.splice(list.indexOf(key), 1);
		} };
})();

function assign(ta) {
	var _ref = arguments[1] === undefined ? {} : arguments[1];

	var _ref$setOverflowX = _ref.setOverflowX;
	var setOverflowX = _ref$setOverflowX === undefined ? true : _ref$setOverflowX;
	var _ref$setOverflowY = _ref.setOverflowY;
	var setOverflowY = _ref$setOverflowY === undefined ? true : _ref$setOverflowY;

	if (!ta || !ta.nodeName || ta.nodeName !== 'TEXTAREA' || set.has(ta)) return;

	var heightOffset = null;
	var overflowY = null;
	var clientWidth = ta.clientWidth;

	function init() {
		var style = window.getComputedStyle(ta, null);

		overflowY = style.overflowY;

		if (style.resize === 'vertical') {
			ta.style.resize = 'none';
		} else if (style.resize === 'both') {
			ta.style.resize = 'horizontal';
		}

		if (style.boxSizing === 'content-box') {
			heightOffset = -(parseFloat(style.paddingTop) + parseFloat(style.paddingBottom));
		} else {
			heightOffset = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
		}
		// Fix when a textarea is not on document body and heightOffset is Not a Number
		if (isNaN(heightOffset)) {
			heightOffset = 0;
		}

		update();
	}

	function changeOverflow(value) {
		{
			// Chrome/Safari-specific fix:
			// When the textarea y-overflow is hidden, Chrome/Safari do not reflow the text to account for the space
			// made available by removing the scrollbar. The following forces the necessary text reflow.
			var width = ta.style.width;
			ta.style.width = '0px';
			// Force reflow:
			/* jshint ignore:start */
			ta.offsetWidth;
			/* jshint ignore:end */
			ta.style.width = width;
		}

		overflowY = value;

		if (setOverflowY) {
			ta.style.overflowY = value;
		}

		resize();
	}

	function resize() {
		var htmlTop = window.pageYOffset;
		var bodyTop = document.body.scrollTop;
		var originalHeight = ta.style.height;

		ta.style.height = 'auto';

		var endHeight = ta.scrollHeight + heightOffset;

		if (ta.scrollHeight === 0) {
			// If the scrollHeight is 0, then the element probably has display:none or is detached from the DOM.
			ta.style.height = originalHeight;
			return;
		}

		ta.style.height = endHeight + 'px';

		// used to check if an update is actually necessary on window.resize
		clientWidth = ta.clientWidth;

		// prevents scroll-position jumping
		document.documentElement.scrollTop = htmlTop;
		document.body.scrollTop = bodyTop;
	}

	function update() {
		var startHeight = ta.style.height;

		resize();

		var style = window.getComputedStyle(ta, null);

		if (style.height !== ta.style.height) {
			if (overflowY !== 'visible') {
				changeOverflow('visible');
			}
		} else {
			if (overflowY !== 'hidden') {
				changeOverflow('hidden');
			}
		}

		if (startHeight !== ta.style.height) {
			var evt = document.createEvent('Event');
			evt.initEvent('autosize:resized', true, false);
			ta.dispatchEvent(evt);
		}
	}

	var pageResize = function pageResize() {
		if (ta.clientWidth !== clientWidth) {
			update();
		}
	};

	var destroy = (function (style) {
		window.removeEventListener('resize', pageResize, false);
		ta.removeEventListener('input', update, false);
		ta.removeEventListener('keyup', update, false);
		ta.removeEventListener('autosize:destroy', destroy, false);
		ta.removeEventListener('autosize:update', update, false);
		set['delete'](ta);

		Object.keys(style).forEach(function (key) {
			ta.style[key] = style[key];
		});
	}).bind(ta, {
		height: ta.style.height,
		resize: ta.style.resize,
		overflowY: ta.style.overflowY,
		overflowX: ta.style.overflowX,
		wordWrap: ta.style.wordWrap });

	ta.addEventListener('autosize:destroy', destroy, false);

	// IE9 does not fire onpropertychange or oninput for deletions,
	// so binding to onkeyup to catch most of those events.
	// There is no way that I know of to detect something like 'cut' in IE9.
	if ('onpropertychange' in ta && 'oninput' in ta) {
		ta.addEventListener('keyup', update, false);
	}

	window.addEventListener('resize', pageResize, false);
	ta.addEventListener('input', update, false);
	ta.addEventListener('autosize:update', update, false);
	set.add(ta);

	if (setOverflowX) {
		ta.style.overflowX = 'hidden';
		ta.style.wordWrap = 'break-word';
	}

	init();
}

function destroy(ta) {
	if (!(ta && ta.nodeName && ta.nodeName === 'TEXTAREA')) return;
	var evt = document.createEvent('Event');
	evt.initEvent('autosize:destroy', true, false);
	ta.dispatchEvent(evt);
}

function update(ta) {
	if (!(ta && ta.nodeName && ta.nodeName === 'TEXTAREA')) return;
	var evt = document.createEvent('Event');
	evt.initEvent('autosize:update', true, false);
	ta.dispatchEvent(evt);
}

var autosize = null;

// Do nothing in Node.js environment and IE8 (or lower)
if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
	autosize = function (el) {
		return el;
	};
	autosize.destroy = function (el) {
		return el;
	};
	autosize.update = function (el) {
		return el;
	};
} else {
	autosize = function (el, options) {
		if (el) {
			Array.prototype.forEach.call(el.length ? el : [el], function (x) {
				return assign(x, options);
			});
		}
		return el;
	};
	autosize.destroy = function (el) {
		if (el) {
			Array.prototype.forEach.call(el.length ? el : [el], destroy);
		}
		return el;
	};
	autosize.update = function (el) {
		if (el) {
			Array.prototype.forEach.call(el.length ? el : [el], update);
		}
		return el;
	};
}

module.exports = autosize;
});

/* drawingboard.js v0.4.6 - https://github.com/Leimi/drawingboard.js
 * Copyright (c) 2015 Emmanuel Pelletier
 * Licensed MIT */
(function() {

  'use strict';

  /**
   * SimpleUndo is a very basic javascript undo/redo stack for managing
   * histories of basically anything.
   * 
   * options are: { * `provider` : required. a function to call on `save`, which
   * should provide the current state of the historized object through the given
   * "done" callback * `maxLength` : the maximum number of items in history *
   * `opUpdate` : a function to call to notify of changes in history. Will be
   * called on `save`, `undo`, `redo` and `clear` }
   * 
   */
  var SimpleUndo = function(options) {

    var settings = options ? options : {};
    var defaultOptions = {
      provider : function() {
        throw new Error("No provider!");
      },
      maxLength : 30,
      onUpdate : function() {
      }
    };

    this.provider = (typeof settings.provider != 'undefined') ? settings.provider
        : defaultOptions.provider;
    this.maxLength = (typeof settings.maxLength != 'undefined') ? settings.maxLength
        : defaultOptions.maxLength;
    this.onUpdate = (typeof settings.onUpdate != 'undefined') ? settings.onUpdate
        : defaultOptions.onUpdate;

    this.initialItem = null;
    this.clear();
  };

  function truncate(stack, limit) {
    while (stack.length > limit) {
      stack.shift();
    }
  }

  SimpleUndo.prototype.initialize = function(initialItem) {
    this.stack[0] = initialItem;
    this.initialItem = initialItem;
  };

  SimpleUndo.prototype.clear = function() {
    this.stack = [ this.initialItem ];
    this.position = 0;
    this.onUpdate();
  };

  SimpleUndo.prototype.save = function() {
    this.provider(function(current) {
      truncate(this.stack, this.maxLength);
      this.position = Math.min(this.position, this.stack.length - 1);

      this.stack = this.stack.slice(0, this.position + 1);
      this.stack.push(current);
      this.position++;
      this.onUpdate();
    }.bind(this));
  };

  SimpleUndo.prototype.undo = function(callback) {
    if (this.canUndo()) {
      var item = this.stack[--this.position];
      this.onUpdate();

      if (callback) {
        callback(item);
      }
    }
  };

  SimpleUndo.prototype.redo = function(callback) {
    if (this.canRedo()) {
      var item = this.stack[++this.position];
      this.onUpdate();

      if (callback) {
        callback(item);
      }
    }
  };

  SimpleUndo.prototype.canUndo = function() {
    return this.position > 0;
  };

  SimpleUndo.prototype.canRedo = function() {
    return this.position < this.count();
  };

  SimpleUndo.prototype.count = function() {
    return this.stack.length - 1; // -1 because of initial item
  };

  // exports
  // node module
  if (typeof module != 'undefined') {
    module.exports = SimpleUndo;
  }

  // browser global
  if (typeof window != 'undefined') {
    window.SimpleUndo = SimpleUndo;
  }

})();
window.DrawingBoard = typeof DrawingBoard !== "undefined" ? DrawingBoard : {};

DrawingBoard.Utils = {};

/*
 * ! Tim (lite) github.com/premasagar/tim
 *//*
     * A tiny, secure JavaScript micro-templating script.
     */
DrawingBoard.Utils.tpl = (function() {
  "use strict";

  var start = "{{", end = "}}", path = "[a-z0-9_][\\.a-z0-9_]*", // e.g.
                                                                  // config.person.name
  pattern = new RegExp(start + "\\s*(" + path + ")\\s*" + end, "gi"), undef;

  return function(template, data) {
    // Merge data into the template string
    return template.replace(pattern, function(tag, token) {
      var path = token.split("."), len = path.length, lookup = data, i = 0;

      for (; i < len; i++) {
        lookup = lookup[path[i]];

        // Property not found
        if (lookup === undef) {
          throw "tim: '" + path[i] + "' not found in " + tag;
        }

        // Return the required value
        if (i === len - 1) {
          return lookup;
        }
      }
    });
  };
}());

/**
 * https://github.com/jeromeetienne/microevent.js MicroEvent - to make any js
 * object an event emitter (server or browser)
 *  - pure javascript - server compatible, browser compatible - dont rely on the
 * browser doms - super simple - you get it immediatly, no mistery, no magic
 * involved
 *  - create a MicroEventDebug with goodies to debug - make it safer to use
 */
DrawingBoard.Utils.MicroEvent = function() {
};

DrawingBoard.Utils.MicroEvent.prototype = {
  bind : function(event, fct) {
    this._events = this._events || {};
    this._events[event] = this._events[event] || [];
    this._events[event].push(fct);
  },
  unbind : function(event, fct) {
    this._events = this._events || {};
    if (event in this._events === false)
      return;
    this._events[event].splice(this._events[event].indexOf(fct), 1);
  },
  trigger : function(event /* , args... */) {
    this._events = this._events || {};
    if (event in this._events === false)
      return;
    for (var i = 0; i < this._events[event].length; i++) {
      this._events[event][i].apply(this, Array.prototype.slice.call(arguments,
          1));
    }
  }
};

// I know.
DrawingBoard.Utils._boxBorderSize = function($el, withPadding, withMargin,
    direction) {
  withPadding = !!withPadding || true;
  withMargin = !!withMargin || false;
  var width = 0, props;
  if (direction == "width") {
    props = [ 'border-left-width', 'border-right-width' ];
    if (withPadding)
      props.push('padding-left', 'padding-right');
    if (withMargin)
      props.push('margin-left', 'margin-right');
  } else {
    props = [ 'border-top-width', 'border-bottom-width' ];
    if (withPadding)
      props.push('padding-top', 'padding-bottom');
    if (withMargin)
      props.push('margin-top', 'margin-bottom');
  }
  for (var i = props.length - 1; i >= 0; i--)
    width += parseInt($el.css(props[i]).replace('px', ''), 10);
  return width;
};

DrawingBoard.Utils.boxBorderWidth = function($el, withPadding, withMargin) {
  return DrawingBoard.Utils._boxBorderSize($el, withPadding, withMargin,
      'width');
};

DrawingBoard.Utils.boxBorderHeight = function($el, withPadding, withMargin) {
  return DrawingBoard.Utils._boxBorderSize($el, withPadding, withMargin,
      'height');
};

DrawingBoard.Utils.isColor = function(string) {
  if (!string || !string.length)
    return false;
  return (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i).test(string)
      || $.inArray(string.substring(0, 3), [ 'rgb', 'hsl' ]) !== -1;
};

/**
 * Packs an RGB color into a single integer.
 */
DrawingBoard.Utils.RGBToInt = function(r, g, b) {
  var c = 0;
  c |= (r & 255) << 16;
  c |= (g & 255) << 8;
  c |= (b & 255);
  return c;
};

/**
 * Returns informations on the pixel located at (x,y).
 */
DrawingBoard.Utils.pixelAt = function(image, x, y) {
  var i = (y * image.width + x) * 4;
  var c = DrawingBoard.Utils.RGBToInt(image.data[i], image.data[i + 1],
      image.data[i + 2]);

  return [ i, // INDEX
  x, // X
  y, // Y
  c // COLOR
  ];
};

/**
 * Compares two colors with the given tolerance (between 0 and 255).
 */
DrawingBoard.Utils.compareColors = function(a, b, tolerance) {
  if (tolerance === 0) {
    return (a === b);
  }

  var ra = (a >> 16) & 255, rb = (b >> 16) & 255, ga = (a >> 8) & 255, gb = (b >> 8) & 255, ba = a & 255, bb = b & 255;

  return (Math.abs(ra - rb) <= tolerance) && (Math.abs(ga - gb) <= tolerance)
      && (Math.abs(ba - bb) <= tolerance);
};

(function() {
  var lastTime = 0;
  var vendors = [ 'ms', 'moz', 'webkit', 'o' ];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
        || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }
}());

window.DrawingBoard = typeof DrawingBoard !== "undefined" ? DrawingBoard : {};

/**
 * pass the id of the html element to put the drawing board into and some
 * options : { controls: array of controls to initialize with the drawingboard.
 * 'Colors', 'Size', and 'Navigation' by default instead of simple strings, you
 * can pass an object to define a control opts ie ['Color', { Navigation: {
 * reset: false }}] controlsPosition: "top left" by default. Define where to put
 * the controls: at the "top" or "bottom" of the canvas, aligned to
 * "left"/"right"/"center" background: background of the drawing board. Give a
 * hex color or an image url "#ffffff" (white) by default color: pencil color
 * ("#000000" by default) size: pencil size (3 by default) webStorage:
 * 'session', 'local' or false ('session' by default). store the current drawing
 * in session or local storage and restore it when you come back droppable: true
 * or false (false by default). If true, dropping an image on the canvas will
 * include it and allow you to draw on it, errorMessage: html string to put in
 * the board's element on browsers that don't support canvas. stretchImg:
 * default behavior of image setting on the canvas: set to the canvas
 * width/height or not? false by default }
 */
DrawingBoard.Board = function(id, opts) {
  this.opts = this.mergeOptions(opts);
 
  this.ev = new DrawingBoard.Utils.MicroEvent();
  this.isEmpty = true;
  this.id = id;
  this.$el = $(document.getElementById(id));
  if (!this.$el.length)
    return false;

  var tpl = '<div class="drawing-board-canvas-wrapper" style="display: block;border: solid gray 1px;"><canvas class="drawing-board-canvas" style="display: block;"></canvas><div class="drawing-board-cursor drawing-board-utils-hidden"></div></div>';
  if (this.opts.controlsPosition.indexOf("bottom") > -1)
    tpl += '<div class="drawing-board-controls" style="margin-top: 5px;margin-bottom: 5px;"></div>';
  else
    tpl = '<div class="drawing-board-controls" style="margin-top: 5px;margin-bottom: 5px;"></div>'
        + tpl;

  this.$el.addClass('drawing-board').append(tpl);
  this.dom = {
    $canvasWrapper : this.$el.find('.drawing-board-canvas-wrapper'),
    $canvas : this.$el.find('.drawing-board-canvas'),
    $cursor : this.$el.find('.drawing-board-cursor'),
    $controls : this.$el.find('.drawing-board-controls')

  };

  $.each([ 'left', 'right', 'center' ], $.proxy(function(n, val) {
    if (this.opts.controlsPosition.indexOf(val) > -1) {
      this.dom.$controls.attr('data-align', val);
      return false;
    }
  }, this));

  this.canvas = this.dom.$canvas.get(0);
  this.ctx = this.canvas && this.canvas.getContext
      && this.canvas.getContext('2d') ? this.canvas.getContext('2d') : null;
  this.color = "#145394";

  if (!this.ctx) {
    if (this.opts.errorMessage)
      this.$el.html(this.opts.errorMessage);
    return false;
  }

  this.storage = this._getStorage();

  this.initHistory();
  // init default board values before controls are added (mostly pencil color
  // and size)
  this.reset({
    webStorage : false,
    history : false,
    background : false
  });
  // init controls (they will need the default board values to work like pencil
  // color and size)
  this.initControls();
  // set board's size after the controls div is added
  this.resize();
  // reset the board to take all resized space
  this.reset({
    webStorage : false,
    history : false,
    background : true
  });
  this.restoreWebStorage();
  this.initDropEvents();
  this.initDrawEvents();
};

DrawingBoard.Board.defaultOpts = {
  controls : [ 'Color', 'DrawingMode', 'Size', 'Navigation' ],
  controlsPosition : "top left",
  color : "#145394",
  size : 2,
  background : false,
  eraserColor : "background",
  fillTolerance : 100,
  fillHack : true, // try to prevent issues with anti-aliasing with a little
                    // hack by default
  webStorage : 'session',
  droppable : false,
  enlargeYourContainer : false,
  errorMessage : "<p>It seems you use an obsolete browser. <a href=\"http://browsehappy.com/\" target=\"_blank\">Update it</a> to start drawing.</p>",
  stretchImg : false
// when setting the canvas img, strech the image at the whole canvas size when
// this opt is true
};

DrawingBoard.Board.prototype = {

  mergeOptions : function(opts) {
    opts = $.extend({}, DrawingBoard.Board.defaultOpts, opts);
    if (!opts.background && opts.eraserColor === "background")
      opts.eraserColor = "transparent";
    return opts;
  },

  /**
   * Canvas reset/resize methods: put back the canvas to its default values
   * 
   * depending on options, can set color, size, background back to default
   * values and store the reseted canvas in webstorage and history queue
   * 
   * resize values depend on the `enlargeYourContainer` option
   */

  reset : function(opts) {
    opts = $.extend({
      color : this.opts.color,
      size : this.opts.size,
      webStorage : true,
      history : true,
      background : false
    }, opts);

    this.setMode('pencil');

    if (opts.background) {
      this.resetBackground(this.opts.background, $.proxy(function() {
        if (opts.history)
          this.saveHistory();
      }, this));
    }

    if (opts.color)
      this.setColor(opts.color);
    if (opts.size)
      this.ctx.lineWidth = opts.size;

    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    // this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.width);

    if (opts.webStorage)
      this.saveWebStorage();

    // if opts.background we already dealt with the history
    if (opts.history && !opts.background)
      this.saveHistory();

    this.blankCanvas = this.getImg();

    this.ev.trigger('board:reset', opts);
    
    this.isEmpty = true;
  },

  resetBackground : function(background, callback) {
    background = background || this.opts.background;

    var bgIsColor = DrawingBoard.Utils.isColor(background);
    var prevMode = this.getMode();
    this.setMode('pencil');
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    if (bgIsColor) {
      this.ctx.fillStyle = background;
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.history.initialize(this.getImg());
      if (callback)
        callback();
    } else if (background)
      this.setImg(background, {
        callback : $.proxy(function() {
          this.history.initialize(this.getImg());
          if (callback)
            callback();
        }, this)
      });
    this.setMode(prevMode);
  },

  resize : function() {
    this.dom.$controls.toggleClass('drawing-board-controls-hidden',
        (!this.controls || !this.controls.length));

    var canvasWidth, canvasHeight;
    var widths = [ this.$el.width(),
        DrawingBoard.Utils.boxBorderWidth(this.$el),
        DrawingBoard.Utils.boxBorderWidth(this.dom.$canvasWrapper, true, true) ];
    var heights = [ this.$el.height(),
        DrawingBoard.Utils.boxBorderHeight(this.$el),
        this.dom.$controls.height(),
        DrawingBoard.Utils.boxBorderHeight(this.dom.$controls, false, true),
        DrawingBoard.Utils.boxBorderHeight(this.dom.$canvasWrapper, true, true) ];
    var that = this;
    var sum = function(values, multiplier) { // make the sum of all array
                                              // values
      multiplier = multiplier || 1;
      var res = values[0];
      for (var i = 1; i < values.length; i++) {
        res = res + (values[i] * multiplier);
      }
      return res;
    };
    var sub = function(values) {
      return sum(values, -1);
    }; // substract all array values from the first one

    if (this.opts.enlargeYourContainer) {
      canvasWidth = this.$el.width();
      canvasHeight = this.$el.height();

      this.$el.width(sum(widths));
      this.$el.height(sum(heights));
    } else {
      canvasWidth = sub(widths);
      canvasHeight = sub(heights);
    }

    this.dom.$canvasWrapper.css('width', canvasWidth + 'px');
    this.dom.$canvasWrapper.css('height', canvasHeight + 'px');

    this.dom.$canvas.css('width', canvasWidth + 'px');
    this.dom.$canvas.css('height', canvasHeight + 'px');

    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
  },

  /**
   * Controls: the drawing board can has various UI elements to control it. one
   * control is represented by a class in the namespace DrawingBoard.Control it
   * must have a $el property (jQuery object), representing the html element to
   * append on the drawing board at initialization.
   * 
   */

  initControls : function() {
    this.controls = [];
    if (!this.opts.controls.length || !DrawingBoard.Control)
      return false;
    for (var i = 0; i < this.opts.controls.length; i++) {
      var c = null;
      if (typeof this.opts.controls[i] == "string")
        c = new window['DrawingBoard']['Control'][this.opts.controls[i]](this);
      else if (typeof this.opts.controls[i] == "object") {
        for ( var controlName in this.opts.controls[i])
          break;
        c = new window['DrawingBoard']['Control'][controlName](this,
            this.opts.controls[i][controlName]);
      }
      if (c) {
        this.addControl(c);
      }
    }
  },

  // add a new control or an existing one at the position you want in the UI
  // to add a totally new control, you can pass a string with the js class as
  // 1st parameter and control options as 2nd ie "addControl('Navigation', {
  // reset: false }"
  // the last parameter (2nd or 3rd depending on the situation) is always the
  // position you want to place the control at
  addControl : function(control, optsOrPos, pos) {
    if (typeof control !== "string"
        && (typeof control !== "object" || !control instanceof DrawingBoard.Control))
      return false;

    var opts = typeof optsOrPos == "object" ? optsOrPos : {};
    pos = pos ? pos * 1 : (typeof optsOrPos == "number" ? optsOrPos : null);

    if (typeof control == "string")
      control = new window['DrawingBoard']['Control'][control](this, opts);

    if (pos)
      this.dom.$controls.children().eq(pos).before(control.$el);
    else
      this.dom.$controls.append(control.$el);

    if (!this.controls)
      this.controls = [];
    this.controls.push(control);
    this.dom.$controls.removeClass('drawing-board-controls-hidden');
  },

  /**
   * History methods: undo and redo drawed lines
   */

  initHistory : function() {
    this.history = new SimpleUndo({
      maxLength : 30,
      provider : $.proxy(function(done) {
        done(this.getImg());
      }, this),
      onUpdate : $.proxy(function() {
        this.ev.trigger('historyNavigation');
      }, this)
    });
  },

  saveHistory : function() {
    this.history.save();
  },

  restoreHistory : function(image) {
    this.setImg(image, {
      callback : $.proxy(function() {
        this.saveWebStorage();
      }, this)
    });
  },

  goBackInHistory : function() {
    this.history.undo($.proxy(this.restoreHistory, this));
  },

  goForthInHistory : function() {
    this.history.redo($.proxy(this.restoreHistory, this));
  },

  /**
   * Image methods: you can directly put an image on the canvas, get it in
   * base64 data url or start a download
   */

  setImg : function(src, opts) {
    opts = $.extend({
      stretch : this.opts.stretchImg,
      callback : null
    }, opts);

    var ctx = this.ctx;
    var img = new Image();
    var oldGCO = ctx.globalCompositeOperation;
    img.onload = function() {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      if (opts.stretch) {
        ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
      } else {
        ctx.drawImage(img, 0, 0);
      }

      ctx.globalCompositeOperation = oldGCO;

      if (opts.callback) {
        opts.callback();
      }
    };
    img.src = src;
  },

  getImg : function() {
    return this.canvas.toDataURL("image/png");
  },

  downloadImg : function() {
    var img = this.getImg();
    img = img.replace("image/png", "image/octet-stream");
    window.location.href = img;
  },

  /**
   * WebStorage handling : save and restore to local or session storage
   */

  saveWebStorage : function() {
    if (window[this.storage]) {
      window[this.storage].setItem('drawing-board-' + this.id, this.getImg());
      this.ev.trigger('board:save' + this.storage.charAt(0).toUpperCase()
          + this.storage.slice(1), this.getImg());
    }
  },

  restoreWebStorage : function() {
    if (window[this.storage]
        && window[this.storage].getItem('drawing-board-' + this.id) !== null) {
      this.setImg(window[this.storage].getItem('drawing-board-' + this.id));
      this.ev.trigger('board:restore' + this.storage.charAt(0).toUpperCase()
          + this.storage.slice(1), window[this.storage]
          .getItem('drawing-board-' + this.id));
    }
  },

  clearWebStorage : function() {
    if (window[this.storage]
        && window[this.storage].getItem('drawing-board-' + this.id) !== null) {
      window[this.storage].removeItem('drawing-board-' + this.id);
      this.ev.trigger('board:clear' + this.storage.charAt(0).toUpperCase()
          + this.storage.slice(1));
    }
  },

  _getStorage : function() {
    if (!this.opts.webStorage
        || !(this.opts.webStorage === 'session' || this.opts.webStorage === 'local'))
      return false;
    return this.opts.webStorage + 'Storage';
  },

  /**
   * Drop an image on the canvas to draw on it
   */

  initDropEvents : function() {
    if (!this.opts.droppable)
      return false;

    this.dom.$canvas.on('dragover dragenter drop', function(e) {
      e.stopPropagation();
      e.preventDefault();
    });

    this.dom.$canvas.on('drop', $.proxy(this._onCanvasDrop, this));
  },

  _onCanvasDrop : function(e) {
    e = e.originalEvent ? e.originalEvent : e;
    var files = e.dataTransfer.files;
    if (!files || !files.length || files[0].type.indexOf('image') == -1
        || !window.FileReader)
      return false;
    var fr = new FileReader();
    fr.readAsDataURL(files[0]);
    fr.onload = $.proxy(function(ev) {
      this.setImg(ev.target.result, {
        callback : $.proxy(function() {
          this.saveHistory();
        }, this)
      });
      this.ev.trigger('board:imageDropped', ev.target.result);
      this.ev.trigger('board:userAction');
    }, this);
  },

  /**
   * set and get current drawing mode
   * 
   * possible modes are "pencil" (draw normally), "eraser" (draw transparent,
   * like, erase, you know), "filler" (paint can)
   */

  setMode : function(newMode, silent) {
    silent = silent || false;
    newMode = newMode || 'pencil';

    this.ev.unbind('board:startDrawing', $.proxy(this.fill, this));

    if (this.opts.eraserColor === "transparent")
      this.ctx.globalCompositeOperation = newMode === "eraser" ? "destination-out"
          : "source-over";
    else {
      if (newMode === "eraser") {
        if (this.opts.eraserColor === "background"
            && DrawingBoard.Utils.isColor(this.opts.background))
          this.ctx.strokeStyle = this.opts.background;
        else if (DrawingBoard.Utils.isColor(this.opts.eraserColor))
          this.ctx.strokeStyle = this.opts.eraserColor;
      } else if (!this.mode || this.mode === "eraser") {
        this.ctx.strokeStyle = this.color;
      }

      if (newMode === "filler")
        this.ev.bind('board:startDrawing', $.proxy(this.fill, this));
    }
    this.mode = newMode;
    if (!silent)
      this.ev.trigger('board:mode', this.mode);
  },

  getMode : function() {
    return this.mode || "pencil";
  },

  setColor : function(color) {
    var that = this;
    color = color || this.color;
    if (!DrawingBoard.Utils.isColor(color))
      return false;
    this.color = color;
    if (this.opts.eraserColor !== "transparent" && this.mode === "eraser") {
      var setStrokeStyle = function(mode) {
        if (mode !== "eraser")
          that.strokeStyle = that.color;
        that.ev.unbind('board:mode', setStrokeStyle);
      };
      this.ev.bind('board:mode', setStrokeStyle);
    } else
      this.ctx.strokeStyle = "#145394";
  },

  /**
   * Fills an area with the current stroke color.
   */
  fill : function(e) {
    if (this.getImg() === this.blankCanvas) {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      return;
    }

    var img = this.ctx
        .getImageData(0, 0, this.canvas.width, this.canvas.height);

    // constants identifying pixels components
    var INDEX = 0, X = 1, Y = 2, COLOR = 3;

    // target color components
    var stroke = this.ctx.strokeStyle;
    var r = parseInt(stroke.substr(1, 2), 16);
    var g = parseInt(stroke.substr(3, 2), 16);
    var b = parseInt(stroke.substr(5, 2), 16);

    // starting point
    var start = DrawingBoard.Utils.pixelAt(img, parseInt(e.coords.x, 10),
        parseInt(e.coords.y, 10));
    var startColor = start[COLOR];
    var tolerance = this.opts.fillTolerance;
    var useHack = this.opts.fillHack; // see
                                      // https://github.com/Leimi/drawingboard.js/pull/38

    // no need to continue if starting and target colors are the same
    if (DrawingBoard.Utils.compareColors(startColor, DrawingBoard.Utils
        .RGBToInt(r, g, b), tolerance))
      return;

    // pixels to evaluate
    var queue = [ start ];

    // loop vars
    var pixel, x, y;
    var maxX = img.width - 1;
    var maxY = img.height - 1;

    function updatePixelColor(pixel) {
      img.data[pixel[INDEX]] = r;
      img.data[pixel[INDEX] + 1] = g;
      img.data[pixel[INDEX] + 2] = b;
    }

    while ((pixel = queue.pop())) {
      if (useHack)
        updatePixelColor(pixel);

      if (DrawingBoard.Utils.compareColors(pixel[COLOR], startColor, tolerance)) {
        if (!useHack)
          updatePixelColor(pixel);
        if (pixel[X] > 0) // west
          queue.push(DrawingBoard.Utils.pixelAt(img, pixel[X] - 1, pixel[Y]));
        if (pixel[X] < maxX) // east
          queue.push(DrawingBoard.Utils.pixelAt(img, pixel[X] + 1, pixel[Y]));
        if (pixel[Y] > 0) // north
          queue.push(DrawingBoard.Utils.pixelAt(img, pixel[X], pixel[Y] - 1));
        if (pixel[Y] < maxY) // south
          queue.push(DrawingBoard.Utils.pixelAt(img, pixel[X], pixel[Y] + 1));
      }
    }

    this.ctx.putImageData(img, 0, 0);

  },

  /**
   * Drawing handling, with mouse or touch
   */

  initDrawEvents : function() {
    this.isDrawing = false;
    this.isMouseHovering = false;
    this.coords = {};
    this.coords.old = this.coords.current = this.coords.oldMid = {
      x : 0,
      y : 0
    };

    this.dom.$canvas.on('mousedown touchstart', $.proxy(function(e) {
      this._onInputStart(e, this._getInputCoords(e));
    }, this));

    this.dom.$canvas.on('mousemove touchmove', $.proxy(function(e) {
      this._onInputMove(e, this._getInputCoords(e));
    }, this));

    this.dom.$canvas.on('mousemove', $.proxy(function(e) {

    }, this));

    this.dom.$canvas.on('mouseup touchend', $.proxy(function(e) {
      this._onInputStop(e, this._getInputCoords(e));
    }, this));

    this.dom.$canvas.on('mouseover', $.proxy(function(e) {
      this._onMouseOver(e, this._getInputCoords(e));
    }, this));

    this.dom.$canvas.on('mouseout', $.proxy(function(e) {
      this._onMouseOut(e, this._getInputCoords(e));

    }, this));

    $('body').on('mouseup touchend', $.proxy(function(e) {
      this.isDrawing = false;
    }, this));

    if (window.requestAnimationFrame)
      requestAnimationFrame($.proxy(this.draw, this));
  },

  empty : function() {
    return this.isEmpty;
  },
  
  draw : function() {
    // if the pencil size is big (>10), the small crosshair makes a friend: a
    // circle of the size of the pencil
    // todo: have the circle works on every browser - it currently should be
    // added only when CSS pointer-events are supported
    // we assume that if requestAnimationFrame is supported, pointer-events is
    // too, but this is terribad.
    if (window.requestAnimationFrame && this.ctx.lineWidth > 10
        && this.isMouseHovering) {
      this.dom.$cursor.css({
        width : this.ctx.lineWidth + 'px',
        height : this.ctx.lineWidth + 'px'
      });
      var transform = DrawingBoard.Utils.tpl(
          "translateX({{x}}px) translateY({{y}}px)", {
            x : this.coords.current.x - (this.ctx.lineWidth / 2),
            y : this.coords.current.y - (this.ctx.lineWidth / 2)
          });
      this.dom.$cursor.css({
        'transform' : transform,
        '-webkit-transform' : transform,
        '-ms-transform' : transform
      });
      this.dom.$cursor.removeClass('drawing-board-utils-hidden');
    } else {
      this.dom.$cursor.addClass('drawing-board-utils-hidden');
    }

    if (this.isDrawing) {
      var currentMid = this._getMidInputCoords(this.coords.current);
      this.ctx.beginPath();
      this.ctx.moveTo(currentMid.x, currentMid.y);
      this.ctx.quadraticCurveTo(this.coords.old.x, this.coords.old.y,
          this.coords.oldMid.x, this.coords.oldMid.y);
      this.ctx.stroke();
      this.coords.old = this.coords.current;
      this.coords.oldMid = currentMid;
      this.isEmpty = false;
    }

    if (window.requestAnimationFrame)
      requestAnimationFrame($.proxy(function() {
        this.draw();
      }, this));
    
    
  },

  _onInputStart : function(e, coords) {
    this.coords.current = this.coords.old = coords;
    this.coords.oldMid = this._getMidInputCoords(coords);
    this.isDrawing = true;

    if (!window.requestAnimationFrame)
      this.draw();

    this.ev.trigger('board:startDrawing', {
      e : e,
      coords : coords
    });
    e.stopPropagation();
    e.preventDefault();
  },

  _onInputMove : function(e, coords) {
    this.coords.current = coords;
    this.ev.trigger('board:drawing', {
      e : e,
      coords : coords
    });

    if (!window.requestAnimationFrame)
      this.draw();

    e.stopPropagation();
    e.preventDefault();
  },

  _onInputStop : function(e, coords) {
    if (this.isDrawing && (!e.touches || e.touches.length === 0)) {
      this.isDrawing = false;

      this.saveWebStorage();
      this.saveHistory();

      this.ev.trigger('board:stopDrawing', {
        e : e,
        coords : coords
      });
      this.ev.trigger('board:userAction');
      e.stopPropagation();
      e.preventDefault();
    }
  },

  _onMouseOver : function(e, coords) {
    this.isMouseHovering = true;
    this.coords.old = this._getInputCoords(e);
    this.coords.oldMid = this._getMidInputCoords(this.coords.old);

    this.ev.trigger('board:mouseOver', {
      e : e,
      coords : coords
    });
  },

  _onMouseOut : function(e, coords) {
    this.isMouseHovering = false;

    this.ev.trigger('board:mouseOut', {
      e : e,
      coords : coords
    });
  },

  _getInputCoords : function(e) {
    e = e.originalEvent ? e.originalEvent : e;
    var rect = this.canvas.getBoundingClientRect(), width = this.dom.$canvas
        .width(), height = this.dom.$canvas.height();
    var x, y;
    if (e.touches && e.touches.length == 1) {
      x = e.touches[0].pageX;
      y = e.touches[0].pageY;
    } else {
      x = e.pageX;
      y = e.pageY;
    }
    x = x - this.dom.$canvas.offset().left;
    y = y - this.dom.$canvas.offset().top;
    x *= (width / rect.width);
    y *= (height / rect.height);
    return {
      x : x,
      y : y
    };
  },

  _getMidInputCoords : function(coords) {
    return {
      x : this.coords.old.x + coords.x >> 1,
      y : this.coords.old.y + coords.y >> 1
    };
  }
};

DrawingBoard.Control = function(drawingBoard, opts) {
  this.board = drawingBoard;
  this.opts = $.extend({}, this.defaults, opts);

  this.$el = $(document.createElement('div')).addClass('drawing-board-control');
  if (this.name)
    this.$el.addClass('drawing-board-control-' + this.name);

  this.board.ev.bind('board:reset', $.proxy(this.onBoardReset, this));

  this.initialize.apply(this, arguments);
  return this;
};

DrawingBoard.Control.prototype = {

  name : '',

  defaults : {},

  initialize : function() {

  },

  addToBoard : function() {
    this.board.addControl(this);
  },

  onBoardReset : function(opts) {

  }

};

// extend directly taken from backbone.js
DrawingBoard.Control.extend = function(protoProps, staticProps) {
  var parent = this;
  var child;
  if (protoProps && protoProps.hasOwnProperty('constructor')) {
    child = protoProps.constructor;
  } else {
    child = function() {
      return parent.apply(this, arguments);
    };
  }
  $.extend(child, parent, staticProps);
  var Surrogate = function() {
    this.constructor = child;
  };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate();
  if (protoProps)
    $.extend(child.prototype, protoProps);
  child.__super__ = parent.prototype;
  return child;
};
DrawingBoard.Control.Color = DrawingBoard.Control
    .extend({
      name : 'colors',

      initialize : function() {
        this.initTemplate();

        var that = this;
        this.$el.on('click', '.drawing-board-control-colors-picker',
            function(e) {
              var color = $(this).attr('data-color');
              that.board.setColor(color);
              that.$el.find('.drawing-board-control-colors-current').css(
                  'background-color', color).attr('data-color', color);

              that.board.ev.trigger('color:changed', color);
              that.$el.find('.drawing-board-control-colors-rainbows').addClass(
                  'drawing-board-utils-hidden');

              e.preventDefault();
            });

        this.$el.on('click', '.drawing-board-control-colors-current', function(
            e) {
          that.$el.find('.drawing-board-control-colors-rainbows').toggleClass(
              'drawing-board-utils-hidden');
          e.preventDefault();
        });

        $('body')
            .on(
                'click',
                function(e) {
                  var $target = $(e.target);
                  var $relatedButton = $target
                      .hasClass('drawing-board-control-colors-current') ? $target
                      : $target
                          .closest('.drawing-board-control-colors-current');
                  var $myButton = that.$el
                      .find('.drawing-board-control-colors-current');
                  var $popup = that.$el
                      .find('.drawing-board-control-colors-rainbows');
                  if ((!$relatedButton.length || $relatedButton.get(0) !== $myButton
                      .get(0))
                      && !$popup.hasClass('drawing-board-utils-hidden'))
                    $popup.addClass('drawing-board-utils-hidden');
                });
      },

      initTemplate : function() {
        var tpl = '<div class="drawing-board-control-inner">'
            + '<div class="drawing-board-control-colors-current" style="background-color: {{color}}" data-color="{{color}}"></div>'
            + '<div class="drawing-board-control-colors-rainbows">{{rainbows}}</div>'
            + '</div>';
        var oneColorTpl = '<div class="drawing-board-control-colors-picker" data-color="{{color}}" style="background-color: {{color}}"></div>';
        var rainbows = '';
        $.each([ 0.75, 0.5, 0.25 ], $.proxy(function(key, val) {
          var i = 0;
          var additionalColor = null;
          rainbows += '<div class="drawing-board-control-colors-rainbow">';
          if (val == 0.25)
            additionalColor = this._rgba(0, 0, 0, 1);
          if (val == 0.5)
            additionalColor = this._rgba(150, 150, 150, 1);
          if (val == 0.75)
            additionalColor = this._rgba(255, 255, 255, 1);
          rainbows += DrawingBoard.Utils.tpl(oneColorTpl, {
            color : additionalColor.toString()
          });
          while (i <= 330) {
            rainbows += DrawingBoard.Utils.tpl(oneColorTpl, {
              color : this._hsl2Rgba(this._hsl(i - 60, 1, val)).toString()
            });
            i += 30;
          }
          rainbows += '</div>';
        }, this));

        this.$el.append($(DrawingBoard.Utils.tpl(tpl, {
          color : this.board.color,
          rainbows : rainbows
        })));
        this.$el.find('.drawing-board-control-colors-rainbows').addClass(
            'drawing-board-utils-hidden');
      },

      onBoardReset : function(opts) {
        this.board.setColor(this.$el.find(
            '.drawing-board-control-colors-current').attr('data-color'));
      },

      _rgba : function(r, g, b, a) {
        return {
          r : r,
          g : g,
          b : b,
          a : a,
          toString : function() {
            return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
          }
        };
      },

      _hsl : function(h, s, l) {
        return {
          h : h,
          s : s,
          l : l,
          toString : function() {
            return "hsl(" + h + ", " + s * 100 + "%, " + l * 100 + "%)";
          }
        };
      },

      _hex2Rgba : function(hex) {
        var num = parseInt(hex.substring(1), 16);
        return this._rgba(num >> 16, num >> 8 & 255, num & 255, 1);
      },

      // conversion function (modified a bit) taken from
      // http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
      _hsl2Rgba : function(hsl) {
        var h = hsl.h / 360, s = hsl.s, l = hsl.l, r, g, b;
        function hue2rgb(p, q, t) {
          if (t < 0)
            t += 1;
          if (t > 1)
            t -= 1;
          if (t < 1 / 6)
            return p + (q - p) * 6 * t;
          if (t < 1 / 2)
            return q;
          if (t < 2 / 3)
            return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        }
        if (s === 0) {
          r = g = b = l; // achromatic
        } else {
          var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          var p = 2 * l - q;
          r = Math.floor((hue2rgb(p, q, h + 1 / 3)) * 255);
          g = Math.floor((hue2rgb(p, q, h)) * 255);
          b = Math.floor((hue2rgb(p, q, h - 1 / 3)) * 255);
        }
        return this._rgba(r, g, b, 1);
      }
    });
DrawingBoard.Control.DrawingMode = DrawingBoard.Control.extend({

  name : 'drawingmode',

  defaults : {
    pencil : true,
    eraser : true,
    filler : true
  },

  initialize : function() {

    this.prevMode = this.board.getMode();

    $.each([ "pencil", "eraser", "filler" ], $.proxy(function(k, value) {
      if (this.opts[value]) {
        this.$el.append('<button class="drawing-board-control-drawingmode-'
            + value + '-button" data-mode="' + value + '"></button>');
      }
    }, this));

    this.$el.on('click', 'button[data-mode]', $.proxy(function(e) {
      var value = $(e.currentTarget).attr('data-mode');
      var mode = this.board.getMode();
      if (mode !== value)
        this.prevMode = mode;
      var newMode = mode === value ? this.prevMode : value;
      this.board.setMode(newMode);
      e.preventDefault();
    }, this));

    this.board.ev.bind('board:mode', $.proxy(function(mode) {
      this.toggleButtons(mode);
    }, this));

    this.toggleButtons(this.board.getMode());
  },

  toggleButtons : function(mode) {
    this.$el.find('button[data-mode]').each(function(k, item) {
      var $item = $(item);
      $item.toggleClass('active', mode === $item.attr('data-mode'));
    });
  }

});

DrawingBoard.Control.Navigation = DrawingBoard.Control
    .extend({

      name : 'navigation',

      defaults : {
        back : true,
        forward : true,
        reset : true
      },

      initialize : function() {
        var el = '';
        if (this.opts.back)
          el += '<button class="drawing-board-control-navigation-back" aria-label="Undo" title="Undo">&larr;</button>';
        if (this.opts.forward)
          el += '<button class="drawing-board-control-navigation-forward" aria-label="Redo" title="Redo">&rarr;</button>';
        if (this.opts.reset)
          el += '<button class="drawing-board-control-navigation-reset" aria-label="Clear canvas" title="Clear Canvas">&times;</button>';
        el += '<button class="drawing-board-control-navigation-apply" aria-label="Apply signature" title="Apply Signature">Apply Signature</button>';
        el += '<button class="drawing-board-control-navigation-close" aria-label="Close canvas" title="Close">Close</button>';
        this.$el.append(el);

        this.$el.on('click', '.drawing-board-control-navigation-close', $
            .proxy(function(e) {
              $('#dialogSignaturePad').dialog('close');
              this.board.resetBackground();
            }, this));

        this.$el.on('click', '.drawing-board-control-navigation-apply', $
            .proxy(function(e) {
              saveSigPad(this.board, false);
              e.preventDefault();
            }, this));

        if (this.opts.back) {
          var $back = this.$el.find('.drawing-board-control-navigation-back');
          this.board.ev.bind('historyNavigation', $.proxy(this.updateBack,
              this, $back));
          this.$el.on('click', '.drawing-board-control-navigation-back', $
              .proxy(function(e) {
                this.board.goBackInHistory();
                e.preventDefault();
              }, this));

          this.updateBack($back);
        }

        if (this.opts.forward) {
          var $forward = this.$el
              .find('.drawing-board-control-navigation-forward');
          this.board.ev.bind('historyNavigation', $.proxy(this.updateForward,
              this, $forward));
          this.$el.on('click', '.drawing-board-control-navigation-forward', $
              .proxy(function(e) {
                this.board.goForthInHistory();
                e.preventDefault();
              }, this));

          this.updateForward($forward);
        }

        if (this.opts.reset) {
          this.$el.on('click', '.drawing-board-control-navigation-reset', $
              .proxy(function(e) {
                this.board.reset({
                  background : true
                });
                e.preventDefault();
              }, this));
        }
      },

      updateBack : function($back) {
        if (this.board.history.canUndo()) {
          $back.removeAttr('disabled');
        } else {
          $back.attr('disabled', 'disabled');
        }
      },

      updateForward : function($forward) {
        if (this.board.history.canRedo()) {
          $forward.removeAttr('disabled');
        } else {
          $forward.attr('disabled', 'disabled');
        }
      }
    });
DrawingBoard.Control.Size = DrawingBoard.Control
    .extend({

      name : 'size',

      defaults : {
        type : "auto",
        dropdownValues : [ 1, 3, 6, 10, 20, 30, 40, 50 ],
        min : 1,
        max : 50
      },

      types : [ 'dropdown', 'range' ],

      initialize : function() {
        if (this.opts.type == "auto")
          this.opts.type = this._iHasRangeInput() ? 'range' : 'dropdown';
        var tpl = $.inArray(this.opts.type, this.types) > -1 ? this['_'
            + this.opts.type + 'Template']() : false;
        if (!tpl)
          return false;

        this.val = this.board.opts.size;

        this.$el.append($(tpl));
        this.$el.attr('data-drawing-board-type', this.opts.type);
        this.updateView();

        var that = this;

        if (this.opts.type == "range") {
          this.$el.on('change', '.drawing-board-control-size-range-input',
              function(e) {
                that.val = $(this).val();
                that.updateView();

                that.board.ev.trigger('size:changed', that.val);

                e.preventDefault();
              });
        }

        if (this.opts.type == "dropdown") {
          this.$el.on('click', '.drawing-board-control-size-dropdown-current',
              $.proxy(function(e) {
                this.$el.find('.drawing-board-control-size-dropdown')
                    .toggleClass('drawing-board-utils-hidden');
              }, this));

          this.$el.on('click', '[data-size]', function(e) {
            that.val = parseInt($(this).attr('data-size'), 0);
            that.updateView();

            that.board.ev.trigger('size:changed', that.val);

            e.preventDefault();
          });
        }
      },

      _rangeTemplate : function() {
        var tpl = '<div class="drawing-board-control-inner" title="{{size}}">'
            + '<input type="range" min="{{min}}" max="{{max}}" value="{{size}}" step="1" class="drawing-board-control-size-range-input">'
            + '<span class="drawing-board-control-size-range-current"></span>'
            + '</div>';
        return DrawingBoard.Utils.tpl(tpl, {
          min : this.opts.min,
          max : this.opts.max,
          size : this.board.opts.size
        });
      },

      _dropdownTemplate : function() {
        var tpl = '<div class="drawing-board-control-inner" title="{{size}}">'
            + '<div class="drawing-board-control-size-dropdown-current"><span></span></div>'
            + '<ul class="drawing-board-control-size-dropdown">';
        $
            .each(
                this.opts.dropdownValues,
                function(i, size) {
                  tpl += DrawingBoard.Utils
                      .tpl(
                          '<li data-size="{{size}}"><span style="width: {{size}}px; height: {{size}}px; border-radius: {{size}}px;"></span></li>',
                          {
                            size : size
                          });
                });
        tpl += '</ul></div>';
        return tpl;
      },

      onBoardReset : function(opts) {
        this.updateView();
      },

      updateView : function() {
        var val = this.val;
        this.board.ctx.lineWidth = val;

        this.$el
            .find(
                '.drawing-board-control-size-range-current, .drawing-board-control-size-dropdown-current span')
            .css({
              width : val + 'px',
              height : val + 'px',
              borderRadius : val + 'px',
              marginLeft : -1 * val / 2 + 'px',
              marginTop : -1 * val / 2 + 'px'
            });

        this.$el.find('.drawing-board-control-inner').attr('title', val);

        if (this.opts.type == 'dropdown') {
          var closest = null;
          $.each(this.opts.dropdownValues, function(i, size) {
            if (closest === null
                || Math.abs(size - val) < Math.abs(closest - val))
              closest = size;
          });
          this.$el.find('.drawing-board-control-size-dropdown').addClass(
              'drawing-board-utils-hidden');
        }
      },

      _iHasRangeInput : function() {
        var inputElem = document.createElement('input'), smile = ':)', docElement = document.documentElement, inputElemType = 'range', available;
        inputElem.setAttribute('type', inputElemType);
        available = inputElem.type !== 'text';
        inputElem.value = smile;
        inputElem.style.cssText = 'position:absolute;visibility:hidden;';
        if (/^range$/.test(inputElemType)
            && inputElem.style.WebkitAppearance !== undefined) {
          docElement.appendChild(inputElem);
          defaultView = document.defaultView;
          available = defaultView.getComputedStyle
              && defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield'
              && (inputElem.offsetHeight !== 0);
          docElement.removeChild(inputElem);
        }
        return !!available;
      }
    });
DrawingBoard.Control.Download = DrawingBoard.Control
    .extend({

      name : 'download',

      initialize : function() {
        this.$el
            .append('<button class="drawing-board-control-download-button"></button>');
        this.$el.on('click', '.drawing-board-control-download-button', $.proxy(
            function(e) {
              this.board.downloadImg();
              e.preventDefault();
            }, this));
      }

    });