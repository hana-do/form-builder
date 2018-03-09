
/********************************************************************************
Name:           <sharedResources.js>
Author:         <Casey Boone/Chetak Agrawal>
Created:        <4/15/2016>

For Version:    <7.1>
---------------------------------------------------------------------------------
Summary:

This file contains all of the older 6.7 shared resources..
It contains:
CharacterCheck.js
CommonFunctions.js
DisableElements.js
NumberFormatter.js
TextareaResize.js

********************************************************************************/




/**
* This function is used to check the validity of a form elements value. 
* For example, it can be configured on field via an onBlur() call to ensure a valid Currency type value entered.
* @param el - the element
* @param type - the type to check. Int, Currency, Chars, Email, etc.
*/
function CheckElementInput(el, type) {
  var valChk;
  var isValueOk = false;
  var value = el.value;
  
  if (value != "") {
    switch (type) {
      case 'Int' : /*integer*/
        valChk = /^[0-9]+$/;
        isValueOk = valChk.test(value);
        break;
      case 'Percent' : /*integer, 0 to 100*/
        
        valChk = /^([0-9])*\.?[0-9]{0,2}$/;
        //valChk = /^(100|[0-9]{1,2})%?$/; checking for 0 through 100
        isValueOk = valChk.test(value);
        
        if (isValueOk != false) {
          if (value >= 0 && value <= 100) {
            isValueOk = true;
          } else {
            isValueOk = false;
          }
        }
        break;
      case 'Currency':  /* currency ($, numbers, .) */
        value = value.replace(",", "");
        valChk = /^([0-9])*\.?[0-9]{0,2}$/;
        isValueOk = valChk.test(value);
        if (isValueOk) {
          el.value = parseFloat(value).toFixed(2);
        }
        break;
      case 'PrefName': /* upper and lower chars, space, dash, single quote allowed */
        valChk = /^[a-zA-Z\s'\-]+$/;
        isValueOk = valChk.test(value);
        break;
      default:
        break;
    }
  
  } else {
    if (type="PrefName") {
      isValueOk = true;
    }
  }
  if (isValueOk == false) {
    el.className = "error";
    return false;
  } else {
    el.className = "normal";
    return true;
  }
  //case Email: var regEx = /\S+@\S+\.\S+/; return regEx.test(email);
}

/**
* This function is used to check a valid keystroke for a specific field through an onkeypress event.
* For example, it can be used to enforce only digits are used in a TechID field, and blocks any other character from entry.
* @param e - onkeypress event
* @param el - the element
* @param type - the type to check against, such as Int, Char, etc..
* @returns {Boolean}
*/
function CheckKeyInput(e, el, type) {

  //printObject(e);
  
  var keynum = (typeof e.which == "number" && e.which != 0) ? e.which : e.keyCode;
  
  var keyCode = (e.keyCode == 0) ? e.charCode : e.keyCode;
  
  //alert("keyCode: " + keyCode + ", " + keynum);
  /* fix for numpad numbers!  */
  if (type != "PrefName") {
    if (keynum > 95 && keynum < 106) {
      keynum = keynum-48;
      keyCode = keyCode-48;
    }
  }
  // if (keyCode > 95 && keyCode < 106) {
  //   keyCode = keyCode-48;
  // }
  
  var keychar = String.fromCharCode(keynum); /* the character typed */
  var allowedKeys = getAllowedKeys(); /* array of allowed characters to ignore.*/
  var isShiftPressed = e.shiftKey;
  var skipCharCheck = false;  /*flag to skip validating the keystroke*/
  var isKeyOk = false; /*flag for checking if the key pressed is valid*/
  var valChk;
  
  if (isShiftPressed == true) {
    skipCharCheck = true;
  } else {
    for (var x=0; x < allowedKeys.length; x++) {
      if (allowedKeys[x] == keynum) {
        /* always return a true when an allowable key is pressed  */
        skipCharCheck = true;
        break;
      }
    }
  }
  
  if (skipCharCheck == false) {
    switch (type) {
      case 'Int' : /*integer*/
        //alert("keychar:" + keychar + "parsedINT:" + parseInt(keychar) + " keynum:" + keynum + " keycode:" + e.keyCode);
        if (keyCode >= 48 && keyCode <= 57) {
          isKeyOk = true;
        } else {
          isKeyOk = false;
        }
       break;
      case 'Char' :
        if (keyCode >= 97 && keyCode <= 122) {
          isKeyOk = true;
        } else {
          isKeyOk = false;
        }
        break;
      case 'PrefName' :
        // 32 - space
        // 39 - quote
        // 222 - quote mac?ff?
        // 45 - dash
        // 173 - dash - mac?ff?
        // 65-90 - upper letters
        // 97-122 - lower letters
        if (keyCode == 32 || keyCode == 39 || keyCode == 45 || keyCode == 222 || keyCode == 173 || (keyCode >= 65 && keyCode <= 90) || (keyCode >= 97  && keyCode <= 122)) {
          isKeyOk = true;
        } else {
          isKeyOk = false;
        }
        break;
      default:
        break;
    }
  
    if (isKeyOk == false) {
      return false;
    }
    return true;
  } else if (skipCharCheck == true) {
    if (type != "PrefName") {
      if (isShiftPressed == true && keynum != 9) { //if shift is pressed we want to fail the keypress, unless its a shift-tab.
        return false;
      }
    }
    return true;
  }
}

/**
* Helper function
*/
function getAllowedKeys() {
  var allowedKeys = new Array();
  /*allowedKeys[0] = 0;  */
  allowedKeys[1] = 9; /*tab */
  allowedKeys[2] = 13; /*enter */
  allowedKeys[3] = 37; /*left arrow */
  allowedKeys[4] = 39; /*right arrow */
  allowedKeys[5] = 46; /*delete */
  allowedKeys[6] = 8; /*backspace */
  allowedKeys[7] = 16; /*shift */
  allowedKeys[8] = 17; /*ctrl */
  allowedKeys[9] = 20; /*caps */
  allowedKeys[10] = 37; /* esc */
  allowedKeys[11] = 224; /* osx cmd */
  allowedKeys[12] = 18; /* osx option */
  allowedKeys[13] = 91; /* win left */
  allowedKeys[14] = 92; /* win right */
  //allowedKeys[15] = 110; /* period */
  //allowedKeys[16] = 190; /*decimal */
  
  return allowedKeys;
}

/**
* Helpf unction to dump output
* @param o
*/
function printObject(o) {
  var out = '';
  for (var p in o) {
    out += p + ': ' + o[p] + '\n';
  }
  
  //alert(out);
  //document.getElementById("studentComments").value = out + " " + o;
}

/********************************************************************************
Name:           <CommonFunctions.js>
Author:         <Casey Boone>
Created:        <5/5/2015>
For Version:    <6.7>
---------------------------------------------------------------------------------
Summary:
  This file is used to store commonly used form related funcitons. This file is not a dumping grounds
  and will slowly become very dependent by many different forms. Only put funciton in here with a high level of reusability.

Mod Summary:
  5/5/2015-CJB: Initial creation of this script.

********************************************************************************/

/**
* Sets the value 'newValue' to the 'hiddenElement'
* @param newValue - string - the new value of the form element
* @param hiddenElement - string - the hidden element used to assign the newValue to
*/
function setRadioValue(newValue, hiddenElement) {
  document.getElementById(hiddenElement).value = newValue;
}

/**
* sets the value of 'selectElement' to 'hiddenElement'
* @param newValue - string - the select element id
* @param hiddenElement - string - the hidden element used to assign the select value to
*/
function setSelectValue(selectElement, hiddenElement) {
  var selectList = document.getElementById(selectElement);
  var newValue = selectList.options[selectList.selectedIndex].value;
  document.getElementById(hiddenElement).value = newValue;
  document.getElementById(selectElement).blur();
}

/**
* Concats the name fields
*/
function concatName(skipMiddle, limit40, padding) {
  if (skipMiddle == "" || skipMiddle == null) {
    skipMiddle = false;
  }
  
  if (limit40 == "" || limit40 == null) {
    limit40 = false;
  }
  
  if (padding == "" || padding == null) {
    padding = false;
  }
  
  var firstName = document.getElementById("firstName").value;
  var lastName = document.getElementById("lastName").value;
  
  if (skipMiddle === true || skipMiddle == "true") {
    var fullName = lastName + ", " + firstName;
    if (limit40) {
      fullName = fullName.substring(0,40);
    }
    document.getElementById("fullName").value = fullName;
  } else {
    var mi = document.getElementById("middleName").value;
  
    if (mi == "" || mi == null || mi == undefined) {
      mi = "";
    }
  
    if (padding) {
      var fullName = lastName + ", " + firstName + "        " + mi;
    } else {
      var fullName = lastName + ", " + firstName + " " + mi;
    }
    
  
    if (limit40) {
      fullName = fullName.substring(0,40);
    }
    document.getElementById("fullName").value = fullName;
  }
}

/**
* Similar to setSelectValue but used for list type custom properties
* @param selectElement id
* @param readOnlyElement id
* @param trashElement id
*/
function setCustomPropertySelect(selectElement, readOnlyElement, trashElement) {
  var selectList = document.getElementById(selectElement);
  var newValue = selectList.options[selectList.selectedIndex].value;
  
  if (newValue) {
    //if we have a value, hide the select list, show the readonly, show the trash icon
    document.getElementById(selectElement).className = "hide";
    document.getElementById(readOnlyElement).className = "show";
    document.getElementById(trashElement).className = "trashIconShow";
  } else {
    document.getElementById(selectElement).className = "show";
    document.getElementById(readOnlyElement).className = "hide";
    document.getElementById(trashElement).className = "trashIconHide";
  }
  
  var readEl = document.getElementById(readOnlyElement);
  readEl.value = newValue;
  readEl.setAttribute("value", newValue); //fixes a stupid issue with Firebug not updating the element
  
  document.getElementById(selectElement).blur();

}

function emptyCustomPropertySelect(selectElement, readOnlyElement, trashElement) {

  document.getElementById(readOnlyElement).value = "";
  document.getElementById(readOnlyElement).className = "hide";
  document.getElementById(trashElement).className = "trashIconHide";
  
  document.getElementById(selectElement).selectedIndex = 0;
  document.getElementById(selectElement).className = "show";
}

function removeTextareaValue(elName) {
  var elems = document.getElementsByName(elName);
  elems[elems.length - 1].value = "";
}

function trim(str){
  return (str && str.replace) ? str.replace(/^\s+|\s+$/g,"") : str;
}

function decodeXMLChars (value) {
  return value.replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>;')
              .replace(/&quot;/g, '"')
              .replace(/&apos;/g, "'");
}

function populateFormData(data) {

  for (var key in data) {
    if (data.hasOwnProperty(key)) {
  
      value = data[key];
  
      var el = document.getElementById(key)
      if (el != null) {
  
        if (el.nodeName == "DIV") {
          el.innerHTML = value;
        } else {
          var type = el.type;
  
          switch (type) {
            case "text":
              el.value = value;
              el.readOnly=true;
              break;
            case "textarea":
              el.value = value;
              el.readOnly=true;
              break;
            case "radio":
              el.disabled=true;
              break;
            case "select-one":
            case "select-multiple":
              el.disabled=true;
               break;
            case "checkbox":
              el.disabled=true;
              if (value == "true") {
                el.checked = true;
              }
              break;
            case "hidden":
              el.value = value;
              break;
            case "button":
            case "password":
              break;
            case "email":
              el.value = value;
              el.readOnly=true;
              break;
            case "tel":
              el.value = value;
              el.readOnly=true;
              break;
            default:
              break;
          }
        }
      }
    }
  }
}



function get_browser_info() {
  var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return {name: 'IE', version: (tem[1] || '')};
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\bOPR\/(\d+)/)
    if (tem != null) {
      return {name: 'Opera', version: tem[1]};
    }
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) {
    M.splice(1, 1, tem[1]);
  }
  return {
    name: M[0],
    version: M[1]
  };
}



/********************************************************************************
Name:           <DisableElements.js>
Author:         <Casey Boone>
Created:        <5/20/2014>
Last Updated:   <5/20/2014>
For Version:    <6.6>
---------------------------------------------------------------------------------
Summary:
  This is a shared javascript file meant to be used by any eform. Its primary purpose is to 
  disable form elements from being updated within ImageNow or WebNow, or even in the Form Viewer. 
  This works by disabling EVERY element and creating a whitelist of elements that should not be disabled.

  Notes
  1) The xsl/xl must call the JS file: <script language="JavaScript" type="text/javascript" src="DisableElements.js"></script>
  2) The form must have an id equal to 'form' ~ <form id="form">
  3) The body must call the formLoad() method, or a similar method that includes the following:

    var clientType = '<xsl:value-of select="StateInfo/Client/Type"/>';
    var currentQueue = '<xsl:value-of select="StateInfo/CurrentQueueName"/>';
    var allowedElements = {
      'any': ['preparedBy','preparedDate','preparedComments'],
      'correctionsQueue' : ['bypassFormLocking'],
      'partialMatchTerm%' : ['bypassFormlocking']  //Use a % sign to indicate this a partial match queue identifier..Eg, any queue with HTC RG in the name is set as HTC RG%..
    };

    disableElements(allowedElements, clientType, currentQueue);

    allowedElements is an object in which a queue name must be defined accompanied by an array
    of allowed element names or ids. In this example the queue name of 'any' is being used.
    The 'any' queue name is the deafult queue name that should be used if no specific queue is required.
    
    If an allowed element is in the list with a value of 'bypassFormLocking', no form elements will be disabled!

Mod Summary:
  05/20/14-CJB: Initial creation of this script.
  1/14/2015 CJB: Added the ability to have a partial queue name within allowedElements. 
    
********************************************************************************/

/**
* @param allowedElements - array of strings - the name of individual elements that should remain editable after this script executes
* @param clientType - string - the name of the viewer. ImageNow, WebNow, or FormViewer. Defaults to FormViewer
* @param currentQueue - string - the name of the current queue
*/
function disableElements(allowedElements, clientType, currentQueue) {
  var list = new Array();
  var out ='';
  
  if (clientType == "" || clientType == "undefined") {
    clientType = "FormViewer";
  }
  
  if (clientType != "FormViewer") {
  
    //grab the current queue and default to nil if not set
    if (currentQueue == "" || currentQueue == "undefined") {
      currentQueue = "";
    }
  
    var totalAllowed = objectSize(allowedElements);
  
    //grab our list of elements to skip locking on
    if (currentQueue != "" && allowedElements.hasOwnProperty(currentQueue)) {
      list = allowedElements[currentQueue];
    } else if (currentQueue != "") {
      //we have a queue, but not a matching property in allowed elements. Run a fuzzy type search.
        for(var item in allowedElements) {
          if (item.indexOf("%") > -1) {
            var itemPart = item.replace("%", "");
            if (currentQueue.indexOf(itemPart) > -1) {
              list = allowedElements[item];
              break;
            }
          } else {
            list = allowedElements['any'];
          }
        }
    } else {
      list = allowedElements['any'];
    }
  
    // cont of items to skip
    var totalSkips = list.length;
  
    var els = document.getElementById("form").elements;
  
    //count of total form elements
    var totalElements = els.length;
  
    var skipLockingElements = false;
  
    //determine if we need to completely skip locking of elements
    for (var z=0; z < totalSkips; z++) {
      if ( list[z] == "bypassFormLocking") {
        skipLockingElements = true;
        break;
      }
    }
  
    if (!skipLockingElements) {
  
      for (var x=0; x < totalElements; x++) {
        var el = els[x];
        var name = el.name;
        var id = el.id;
        var type = el.type;
        var disableElement = true;

        if (totalSkips > 0) {
          //if we have items to skip run this to exclude them..
          //if we find a name or id that resdies within 'list', we do NOT want to disable it
          for (var y=0; y < totalSkips; y++) {
            var allowedElement = list[y];
            if (name == allowedElement || id == allowedElement) {
              disableElement = false;
              break;
            }
          }
        }
 
        if (disableElement) {
          switch (type) {
            case "text":
              el.readOnly=true; 
              break;
            case "textarea":
              el.readOnly=true;
              break;
            case "radio":
              el.disabled=true;
              break;
            case "select-one":
            case "select-multiple":
              el.disabled=true;
               break;
            case "checkbox":
              el.disabled=true;
              break;
            case "button":
              el.disabled=true;
            case "password":
              el.readOnly=true;
              break;
            case "email":
              el.readOnly=true;
              break;
            case "tel":
              el.readOnly=true;
              break;
            default:
              break;
          }
          if (clientType != 'WebNow') {
            $(el).off("click change focus");
          }
          
        }
      }
    }
  }
}


function objectSize(obj) {
  var size = 0, key;
  for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
  }
  return size;
}


/*!
 * accounting.js v0.4.1
 * Copyright 2014 Open Exchange Rates
 *
 * Freely distributable under the MIT license.
 * Portions of accounting.js are inspired or borrowed from underscore.js
 *
 * Full details and documentation:
 * http://openexchangerates.github.io/accounting.js/
 * 
 * 
 * SAMPLE USEAGE: 
 * var test = numberFormatter.formatMoney(totalValue);
 * var phone = numberFormatter.formatPhone(phone);
 */
(function(root, undefined) {
  /* --- Setup --- */
  // Create the local library object, to be exported or referenced globally
  // later
  var lib = {};
  // Current version
  lib.version = '0.4.1';
  /* --- Exposed settings --- */
  // The library's settings configuration object. Contains default parameters
  // for
  // currency and number formatting
  lib.settings = {
    currency : {
      symbol : "$", // default currency symbol is '$'
      format : "%s%v", // controls output: %s = symbol, %v = value (can be
                        // object, see docs)
      decimal : ".", // decimal point separator
      thousand : ",", // thousands separator
      precision : 2, // decimal places
      grouping : 3
    // digit grouping (not implemented yet)
    },
    number : {
      precision : 0, // default precision on numbers is 0
      grouping : 3, // digit grouping (not implemented yet)
      thousand : ",",
      decimal : "."
    }
  };
  /* --- Internal Helper Methods --- */
  // Store reference to possibly-available ECMAScript 5 methods for later
  var nativeMap = Array.prototype.map, nativeIsArray = Array.isArray, toString = Object.prototype.toString;
  /**
   * Tests whether supplied parameter is a string from underscore.js
   */
  function isString(obj) {
    return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
  }
  /**
   * Tests whether supplied parameter is a string from underscore.js, delegates
   * to ECMA5's native Array.isArray
   */
  function isArray(obj) {
    return nativeIsArray ? nativeIsArray(obj)
        : toString.call(obj) === '[object Array]';
  }
  /**
   * Tests whether supplied parameter is a true object
   */
  function isObject(obj) {
    return obj && toString.call(obj) === '[object Object]';
  }
  /**
   * Extends an object with a defaults object, similar to underscore's
   * _.defaults
   * 
   * Used for abstracting parameter handling from API methods
   */
  function defaults(object, defs) {
    var key;
    object = object || {};
    defs = defs || {};
    // Iterate over object non-prototype properties:
    for (key in defs) {
      if (defs.hasOwnProperty(key)) {
        // Replace values with defaults only if undefined (allow empty/zero
        // values):
        if (object[key] == null)
          object[key] = defs[key];
      }
    }
    return object;
  }
  /**
   * Implementation of `Array.map()` for iteration loops
   * 
   * Returns a new Array as a result of calling `iterator` on each array value.
   * Defers to native Array.map if available
   */
  function map(obj, iterator, context) {
    var results = [], i, j;
    if (!obj)
      return results;
    // Use native .map method if it exists:
    if (nativeMap && obj.map === nativeMap)
      return obj.map(iterator, context);
    // Fallback for native .map:
    for (i = 0, j = obj.length; i < j; i++) {
      results[i] = iterator.call(context, obj[i], i, obj);
    }
    return results;
  }
  /**
   * Check and normalise the value of precision (must be positive integer)
   */
  function checkPrecision(val, base) {
    val = Math.round(Math.abs(val));
    return isNaN(val) ? base : val;
  }
  /**
   * Parses a format string or object and returns format obj for use in
   * rendering
   * 
   * `format` is either a string with the default (positive) format, or object
   * containing `pos` (required), `neg` and `zero` values (or a function
   * returning either a string or object)
   * 
   * Either string or format.pos must contain "%v" (value) to be valid
   */
  function checkCurrencyFormat(format) {
    var defaults = lib.settings.currency.format;
    // Allow function as format parameter (should return string or object):
    if (typeof format === "function")
      format = format();
    // Format can be a string, in which case `value` ("%v") must be present:
    if (isString(format) && format.match("%v")) {
      // Create and return positive, negative and zero formats:
      return {
        pos : format,
        neg : format.replace("-", "").replace("%v", "-%v"),
        zero : format
      };
      // If no format, or object is missing valid positive value, use defaults:
    } else if (!format || !format.pos || !format.pos.match("%v")) {
      // If defaults is a string, casts it to an object for faster checking next
      // time:
      return (!isString(defaults)) ? defaults
          : lib.settings.currency.format = {
            pos : defaults,
            neg : defaults.replace("%v", "-%v"),
            zero : defaults
          };
    }
    // Otherwise, assume format was fine:
    return format;
  }
  /* --- API Methods --- */
  /**
   * Takes a string/array of strings, removes all formatting/cruft and returns
   * the raw float value Alias: `accounting.parse(string)`
   * 
   * Decimal must be included in the regular expression to match floats
   * (defaults to accounting.settings.number.decimal), so if the number uses a
   * non-standard decimal separator, provide it as the second argument.
   * 
   * Also matches bracketed negatives (eg. "$ (1.99)" => -1.99)
   * 
   * Doesn't throw any errors (`NaN`s become 0) but this may change in future
   */
  var unformat = lib.unformat = lib.parse = function(value, decimal) {
    // Recursively unformat arrays:
    if (isArray(value)) {
      return map(value, function(val) {
        return unformat(val, decimal);
      });
    }
    // Fails silently (need decent errors):
    value = value || 0;
    // Return the value as-is if it's already a number:
    if (typeof value === "number")
      return value;
    // Default decimal point comes from settings, but could be set to eg. "," in
    // opts:
    decimal = decimal || lib.settings.number.decimal;
    // Build regex to strip out everything except digits, decimal point and
    // minus sign:
    var regex = new RegExp("[^0-9-" + decimal + "]", [ "g" ]), unformatted = parseFloat(("" + value)
        .replace(/\((.*)\)/, "-$1") // replace bracketed values with negatives
        .replace(regex, '') // strip out any cruft
        .replace(decimal, '.') // make sure decimal point is standard
    );
    // This will fail silently which may cause trouble, let's wait and see:
    return !isNaN(unformatted) ? unformatted : 0;
  };
  /**
   * Implementation of toFixed() that treats floats more like decimals
   * 
   * Fixes binary rounding issues (eg. (0.615).toFixed(2) === "0.61") that
   * present problems for accounting- and finance-related software.
   */
  var toFixed = lib.toFixed = function(value, precision) {
    precision = checkPrecision(precision, lib.settings.number.precision);
    var power = Math.pow(10, precision);
    // Multiply up by precision, round accurately, then divide and use native
    // toFixed():
    return (Math.round(lib.unformat(value) * power) / power).toFixed(precision);
  };
  /**
   * Format a number, with comma-separated thousands and custom
   * precision/decimal places Alias: `accounting.format()`
   * 
   * Localise by overriding the precision and thousand / decimal separators 2nd
   * parameter `precision` can be an object matching `settings.number`
   */
  var formatNumber = lib.formatNumber = lib.format = function(number,
      precision, thousand, decimal) {
    // Resursively format arrays:
    if (isArray(number)) {
      return map(number, function(val) {
        return formatNumber(val, precision, thousand, decimal);
      });
    }
    // Clean up number:
    number = unformat(number);
    // Build options object from second param (if object) or all params,
    // extending defaults:
    var opts = defaults((isObject(precision) ? precision : {
      precision : precision,
      thousand : thousand,
      decimal : decimal
    }), lib.settings.number),
    // Clean up precision
    usePrecision = checkPrecision(opts.precision),
    // Do some calc:
    negative = number < 0 ? "-" : "", base = parseInt(toFixed(Math
        .abs(number || 0), usePrecision), 10)
        + "", mod = base.length > 3 ? base.length % 3 : 0;
    // Format the number:
    return negative
        + (mod ? base.substr(0, mod) + opts.thousand : "")
        + base.substr(mod).replace(/(\d{3})(?=\d)/g, "$1" + opts.thousand)
        + (usePrecision ? opts.decimal
            + toFixed(Math.abs(number), usePrecision).split('.')[1] : "");
  };

  var formatPhone = lib.formatPhone = function(phone, element) {
    phone = phone.replace(/[^0-9]/g, '');
    phone = phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    
    if (element) {
      element.value = phone;
    }
    return phone;
  }
  
  /**
   * Format a number into currency
   * 
   * Usage: accounting.formatMoney(number, symbol, precision, thousandsSep,
   * decimalSep, format) defaults: (0, "$", 2, ",", ".", "%s%v")
   * 
   * Localise by overriding the symbol, precision, thousand / decimal separators
   * and format Second param can be an object matching `settings.currency` which
   * is the easiest way.
   * 
   * To do: tidy up the parameters
   */
  var formatMoney = lib.formatMoney = function(number, symbol, precision,
      thousand, decimal, format) {
    // Resursively format arrays:
    if (isArray(number)) {
      return map(number, function(val) {
        return formatMoney(val, symbol, precision, thousand, decimal, format);
      });
    }
    // Clean up number:
    number = unformat(number);
    // Build options object from second param (if object) or all params,
    // extending defaults:
    var opts = defaults((isObject(symbol) ? symbol : {
      symbol : symbol,
      precision : precision,
      thousand : thousand,
      decimal : decimal,
      format : format
    }), lib.settings.currency),
    // Check format (returns object with pos, neg and zero):
    formats = checkCurrencyFormat(opts.format),
    // Choose which format to use for this value:
    useFormat = number > 0 ? formats.pos : number < 0 ? formats.neg
        : formats.zero;
    // Return with currency symbol added:
    return useFormat.replace('%s', opts.symbol).replace(
        '%v',
        formatNumber(Math.abs(number), checkPrecision(opts.precision),
            opts.thousand, opts.decimal));
  };
  /**
   * Format a list of numbers into an accounting column, padding with whitespace
   * to line up currency symbols, thousand separators and decimals places
   * 
   * List should be an array of numbers Second parameter can be an object
   * containing keys that match the params
   * 
   * Returns array of accouting-formatted number strings of same length
   * 
   * NB: `white-space:pre` CSS rule is required on the list container to prevent
   * browsers from collapsing the whitespace in the output strings.
   */
  lib.formatColumn = function(list, symbol, precision, thousand, decimal,
      format) {
    if (!list)
      return [];
    // Build options object from second param (if object) or all params,
    // extending defaults:
    var opts = defaults((isObject(symbol) ? symbol : {
      symbol : symbol,
      precision : precision,
      thousand : thousand,
      decimal : decimal,
      format : format
    }), lib.settings.currency),
    // Check format (returns object with pos, neg and zero), only need pos for
    // now:
    formats = checkCurrencyFormat(opts.format),
    // Whether to pad at start of string or after currency symbol:
    padAfterSymbol = formats.pos.indexOf("%s") < formats.pos.indexOf("%v") ? true
        : false,
    // Store value for the length of the longest string in the column:
    maxLength = 0,
    // Format the list according to options, store the length of the longest
    // string:
    formatted = map(list, function(val, i) {
      if (isArray(val)) {
        // Recursively format columns if list is a multi-dimensional array:
        return lib.formatColumn(val, opts);
      } else {
        // Clean up the value
        val = unformat(val);
        // Choose which format to use for this value (pos, neg or zero):
        var useFormat = val > 0 ? formats.pos : val < 0 ? formats.neg
            : formats.zero,
        // Format this value, push into formatted list and save the length:
        fVal = useFormat.replace('%s', opts.symbol).replace(
            '%v',
            formatNumber(Math.abs(val), checkPrecision(opts.precision),
                opts.thousand, opts.decimal));
        if (fVal.length > maxLength)
          maxLength = fVal.length;
        return fVal;
      }
    });
    // Pad each number in the list and send back the column of numbers:
    return map(formatted, function(val, i) {
      // Only if this is a string (not a nested array, which would have already
      // been padded):
      if (isString(val) && val.length < maxLength) {
        // Depending on symbol position, pad after symbol or at index 0:
        return padAfterSymbol ? val.replace(opts.symbol, opts.symbol
            + (new Array(maxLength - val.length + 1).join(" "))) : (new Array(
            maxLength - val.length + 1).join(" "))
            + val;
      }
      return val;
    });
  };
  /* --- Module Definition --- */
  // Export accounting for CommonJS. If being loaded as an AMD module, define it as such.
  // Otherwise, just add `accounting` to the global object
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = lib;
    }
    exports.accounting = lib;
  } else if (typeof define === 'function' && define.amd) {
    // Return the library as an AMD module:
    define([], function() {
      return lib;
    });
  } else {
    // Use accounting.noConflict to restore `accounting` back to its original value.
    // Returns a reference to the library's `accounting` object;
    // e.g. `var numbers = accounting.noConflict();`
    lib.noConflict = (function(oldAccounting) {
      return function() {
        // Reset the value of the root's `accounting` variable:
        root.numberFormatter = oldAccounting;
        // Delete the noConflict method:
        lib.noConflict = undefined;
        // Return reference to the library to re-assign it:
        return lib;
      };
    })(root.numberFormatter);
    // Declare `fx` on the root (global/window) object:
    root['numberFormatter'] = lib;
  }
  // Root will be `window` in browser or `global` on the server:
}(this));


/********************************************************************************
 * 
  Name:           <TextareaResize.js>
  Author:         <Casey Boone>
  Created:        <6/27/2014>
  Last Updated:   <6/27/2014>
  For Version:    <6.6>
---------------------------------------------------------------------------------
  Summary:
    This is a shared javascript file meant to be used by any eform containing text area elements. The sole purpose of this 
    script is to have every textarea element on the form automatically expand in height based on how much text has been typed into the element.
    This helps with readability, printing and possibly with tiffing. 
    Note: Tiffing needs to be tested. I think it wont work properly until we are updated to 6.7 as tiffing doesn't run JS properly in 6.6

    Notes
    1) The xsl/xl must call the JS file: <script language="JavaScript" type="text/javascript" src="TextareaResize.js"></script>
    2) within the formLoad or comparable function: sizeTextareas();
  Mod Summary:
    06/27/14-CJB: Initial creation of this script.

********************************************************************************/

function sizeTextareas() {
  /* @TODO - add jQuery detection and an option to use this WITHOUT jQuery(raw JS) */
  if (!(undefined == typeof window.jQuery)) {
    autosize($('textarea'));
  }
}


/**
 * 
 * @param element the textarea full of words
 * @param counterDiv the div holding the count
 * @param hiddenElement the div holding the word count if it needs to be stored..
 */
function wordcount(element, counterDiv, hiddenElement) {
  var cnt;
  var regex = /\s+/gi;
  var words = element.value.trim().replace(regex, ' ').split(' ').length;
  document.getElementById(counterDiv).innerHTML = words;
  if (hiddenElement) {
    document.getElementById(hiddenElement).value = words;
  }
}

/**
 * Json unescaping function. Used to correct the string returned from the iScript call.
 * @param str - string
 * @returns string
 */
function unescapeJSON(str) {
  str = str.replace(/&#34;/g,'"');
  return str.replace(/&#61;/g,"=")
}
