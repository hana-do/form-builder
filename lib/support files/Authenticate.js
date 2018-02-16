/********************************************************************************
  Name:           <Authenticate.js>
  Author:         <Casey Boone>
  Created:        <7/25/2014>
  For Version:    <7.1>
---------------------------------------------------------------------------------
  Summary:
    This script is used to for StarID authentication. 
    
    Server-side scripts that utilize this file include:
    eForm_StarId_Authenticate_Mnscu_CLI.js
    eForm_StarId_Authenticate_MSU_AD.js

  Mod Summary:
    7/25/2014   -CJB: Initial creation of this script.
    10/22/2014  -CJB: Added code to include the students full name and email address.
    3/6/2015    -CJB: Added checks for the enableSaveOnAuth flag
    3/30/15     -CJB: Added checks for maximum number of login attempts.
    4/30/15     -CJB: Added ability to use this script in a local/test environment without an ImageNow iScript instance.
    1/10/16     -CJB: Added ability to detect if a starID or techid has been entered in the form with proper alerts
    4/10/16     -CJB: Made it so the starId keyed is is converted to lowercase. Introducing minification to this file.
    5/10/2016   -CJB: Added controls to change the login button
    11/21/2016  -CJB: Added URIencoding to the password so it doesn't break the XML/XHR requests..
    2/20/2017   -CJB: Altered timestamps to geneerate from server instead of browser.
    4/19/2017   -CJB: Added User Agent tracking.
    5/19/2017   -CJB: Removing masking of passwords. Too problematic.
    8/10/2017   -CJB: Updates to setActive/Inactive Field stuff so it highlights properly
********************************************************************************/


/**
 * This function is used for form login purposes. 
 * It authenticates the users credentials, and then fetches additional details about the user, 
 * and then populates the eForm with those values.
 * 
 * @param element - 'Login' button (not really needed for authenticateAndLookup)
 * @param viewer - string - 'FormViewer', 'WebNow', 'ImageNow'
 */
function authenticateAndLookup(element, viewer) {

  var authFunction = document.getElementById("authFunction");

  //check to see if we are switching between authentication methods and reset attempts if needed.
  if (authFunction.value == "AuthOnly") {
    authFunction.value = "AuthAndLookup";
    document.getElementById("curAttempts").value = "1";
  }

  // CHECK STAR ID & PASSWORD
  var starId = document.getElementById("starId").value;
  if (starId.length < 8) {
    setErrorField(document.getElementById('starId'));
    document.getElementById("loginMessage").innerHTML = "Please enter a valid StarId.";
    return false;
  }

  var starPassword = document.getElementById("starPassword").value;
  if (starPassword.length <1 ) {
    setErrorField(document.getElementById('starPassword'));
    document.getElementById("loginMessage").innerHTML = "You must provide a StarId password.";
    return false;
  }

  // CHECK LOGIN ATTEMPT COUNT
  var maxAttempts = document.getElementById("maxAttemptsAuthAndLookup");
  if (maxAttempts) {
    var maxAttemptsVal = parseInt(maxAttempts.value);
  } else {
    var maxAttemptsVal = 3;
  }

  var curAttempts = document.getElementById("curAttempts");
  if (curAttempts) {
    var curAttemptsVal = parseInt(curAttempts.value);
  } else {
    var curAttemptsVal = 1;
  }

  //ATTEMPT TO LOGIN
  if (curAttemptsVal <= maxAttemptsVal) {
    
    setUserAgentLogin();
     
    setLoginButtonLoading(); 
    
    setTimeout(function() {
      runAuthAndLookup(element, viewer, maxAttemptsVal, curAttemptsVal);
    }, 0);

  } else {
    document.getElementById("loginMessage").innerHTML = "Your maximum amount of login attempts has been reached. <br/>Please close and reopen this form to try again.";
    document.getElementById("authLogin").disabled = true;
  }
}

function runAuthAndLookup(element, viewer, maxAttemptsVal, curAttemptsVal) {
  var loginInfo = triggeriScript();
  var starId = document.getElementById("starId").value;
  //increment the login attempt
  incrementLoginAttempts();

  //determine if we are testing on a local dev machine. If so mock up the lookup response with fake/test data
  var host = window.location.host;
  if (host != "inoweformtest.campus.mnsu.edu" && host != "inoweform.campus.mnsu.edu" && host != "dimmtestn3.campus.mnsu.edu" && host != "dimmtest.campus.mnsu.edu" && (viewer != "WebNow" && viewer != "ImageNow")) {
    var loginInfo = new Object();
    loginInfo.error = "false";
    loginInfo.errorMessage = "Please enter a valid StarId.";
    loginInfo.lastName = "TestBoone";
    loginInfo.firstName = "Casey";
    loginInfo.middleName = "J";
    loginInfo.studentEmail = "casey.boone@mnsu.edu";
    loginInfo.techId = "00060629";
  }

  if (!loginInfo) { 
    //this indictaes something went wrong with the parsing of the results
    var message = "Error running StarID authentication.";
    if (maxAttemptsVal - curAttemptsVal == 1) {
      message += " You have one remaining login attempt!";
    }
    document.getElementById("loginMessage").innerHTML = message; 
    document.getElementById("starPassword").value = ""; //clear out the password for security sake. We never store it anyways..
    resetLoginButton();
  } else if (loginInfo.error == "true") {
    // this case alerts the error message returned on error on serv-side lookup
    if (loginInfo.errorMessage == "Please enter a valid StarID.") {
      setErrorField(document.getElementById('starId'));
    }

    if (loginInfo.errorMessage == "You must provide a StarID password.") {
      setErrorField(document.getElementById('starPassword'));
    }

    if (maxAttemptsVal - curAttemptsVal == 1) {
      loginInfo.errorMessage += " You have one remaining login attempt!";
    }

    //set the error message
    document.getElementById("loginMessage").innerHTML = loginInfo.errorMessage;
    document.getElementById("starPassword").value = ""; //clear out the password for security sake. We never store it anyways..
    resetLoginButton();
  } else {
  
    //we are here because of a successful authentication!
    //printObject(loginInfo);
    
    //Set all of the appropraite field data from the authentication response
    document.getElementById("loginTimestamp").value = loginInfo.timestamp;

    setUserAgentFormSave();

    var firstN = loginInfo.firstName;
    var lastN = loginInfo.lastName;

    if (firstN == "" && lastN != "") {
      firstN = " ";
      document.getElementById("firstName").readOnly = false;
    }
    if (firstN != "" && lastN == "") {
      lastN = " ";
      document.getElementById("lastName").readOnly = false;
    }
    
    document.getElementById("firstName").value = firstN;
    document.getElementById("middleName").value = loginInfo.middleName; 
    document.getElementById("lastName").value = lastN;

    if (loginInfo.middleName == "") {
      document.getElementById("middleName").readOnly = false;
    }

    var fullName = "";
    var fullNameSkipMiddle = document.getElementById("fullNameSkipMiddle");


    if (fullNameSkipMiddle) {
      if (fullNameSkipMiddle.value == "true") {
        fullName = loginInfo.lastName + ", " + loginInfo.firstName;
      } 
    } 

    if (fullName == "") {
      var fullName = loginInfo.lastName + ", " + loginInfo.firstName + " " + loginInfo.middleName;
    }
  
    fullName = fullName.substring(0, 40); 

    document.getElementById("fullName").value = fullName;
    document.getElementById("techId").value = loginInfo.techId;
    if (loginInfo.techId == "") {
      document.getElementById("techId").readOnly = false;
    }

    document.getElementById("displayStarId").value = starId;
    document.getElementById("email").value = loginInfo.studentEmail;

    //sometimes we dont get a middle name. Enable the user to enter there middle name if it comes back blank


    //hide the signature section and show the full form
    document.getElementById("loginSection").style.display="none";
    document.getElementById("starPassword").value = ""; //clear out the password for security sake. We never store it anyways..
    document.getElementById("formSection").style.display="block";

    //determine if we need to enable the save button or not.
    var enableSave = document.getElementById("enableSaveOnAuth");

    if (enableSave) {
      //we have found an enableSaveOnAuth setting, if its set to true, enable saving
      if (enableSave.value == "AuthAndLookup") {
        if (typeof(formViewerApplet) == "object" && typeof(formViewerApplet.setSaveButtonEnabled) == "function") {
          formViewerApplet.setSaveButtonEnabled(true);
        }
      }
    }

    setTimeout(function() {
      scrollTo(0,0);
    }, 10);
    
  }
}

/**
 * This function is used for authentication purposes only. 
 * This is the bottom checkbox function..
 * It is meant to be used to validate a digital signature in conjunction with an eForm that uses AuthAndLookup
 * 
 * @param element - 'Verify Sig' button
 */
function authenticate(element, viewer) {

  var authFunction = document.getElementById("authFunction");
  if (authFunction.value == "AuthAndLookup" || authFunction.value == "AuthAndLookupOptionalName") {
    authFunction.value = "AuthOnly";
    document.getElementById("curAttempts").value = "1";
  }

  if (element.checked == true) {

    var maxAttempts = document.getElementById("maxAttemptsAuthOnly");
    if (maxAttempts) {
      var maxAttemptsVal = parseInt(maxAttempts.value);
    } else {
      var maxAttemptsVal = 3;
    }

    var curAttempts = document.getElementById("curAttempts");
    if (curAttempts) {
      var curAttemptsVal = parseInt(curAttempts.value);
    } else {
      var curAttemptsVal = 1;
    }

    var sigPassword = document.getElementById("sigPassword").value;
    if (sigPassword.length == 0) {
      document.getElementById("signatureMessageDiv").innerHTML = "You must re-enter your StarID Password to electronically sign this document!"; 
      element.checked = false;
      return false;
    }

    if (curAttemptsVal < maxAttemptsVal) {
     
      
      var loginInfo = triggeriScript();
      incrementLoginAttempts();

      //determine if we are testing on a local machine. If so mock up the lookup response with fake/test data
      var host = window.location.host;
      if (host != "inoweformtest.campus.mnsu.edu" && host != "inoweform.campus.mnsu.edu" && host != "dimmtestn3.campus.mnsu.edu" && host != "dimmtest.campus.mnsu.edu" && (viewer != "WebNow" && viewer != "ImageNow")) {
        var loginInfo = new Object();
        loginInfo.error = "false";
        loginInfo.errorMessage = "";
        loginInfo.validLogin = "true";
      }

      if (!loginInfo) { 
        //this indictaes something went wrong with the parsing of the results
        var message = "Error running StarId authentication.";

        if (maxAttemptsVal - curAttemptsVal == 1) {
          message += " You have one remaining authentication attempt!";
        }

        document.getElementById("signatureMessageDiv").innerHTML = message; 
        document.getElementById("sigPassword").value = "";
        element.checked = false;
       
      } else if (loginInfo.error == "true") {
        // this case alerts the error message returned on error on server-side lookup

        //Need to display a message saying sig password is not good
        document.getElementById("signatureMessageDiv").innerHTML = loginInfo.errorMessage;
        document.getElementById("sigPassword").value = "";
        element.checked = false;
        
      } else if (loginInfo.validLogin == "true") {

        var timeStamp = loginInfo.timestamp;

        //Set signature timestamp
        document.getElementById("signatureTimestamp").value = timeStamp;

        //build out the signature string
        var firstName = document.getElementById("firstName").value;
        var lastName = document.getElementById("lastName").value;
        
        if (firstName == "" || lastName == "") {
          alert("You must enter your name before you can sign this form.");
          clearSignature();
          return false;
        }
        
        var signatureString = "Electronically Signed By " + firstName + " " + lastName + " on " + timeStamp;

        //set signatureString hidden value
        document.getElementById("signatureString").value = signatureString;
        //set signatureString innerhtml to sigString

        //save message
        // var saveMessage = "<br/><div id='AuthOnlyFlashMessage' class='callout primary'><font color='red' style='line-height: 1.8em; font-size: 1.7em; font-weight: bold;'>Press the 'Submit Form' button below to submit this form!</font></div><br/>";

        var saveMessage = '<span style="font-size: 1.3em; font-weight: bold;">' + signatureString + '</span><br/><div style="margin-top: 10px" id="AuthOnlyFlashMessage" class="callout primary">Signature Successfully Applied!<br/><span style="font-size: 1.3em; font-weight: bold; display: block;">Press the Save/Submit button on the bottom of this form to complete your request.</span></div>';

        document.getElementById("signatureStringDiv").innerHTML = saveMessage;
        //set signatureStringDiv class to show on the form
        document.getElementById("signatureStringDiv").className = "show";

        //set sigPasswordDiv class to hide
        document.getElementById("sigPasswordDiv").className = "hide";

        document.getElementById("sigPassword").value = ""; //clear out the password for security sake. we never store it anyways

        //clear out any type of signature error message
        document.getElementById("signatureMessageDiv").innerHTML = "";

        //determine if we need to enable the save button or not.
        var enableSave = document.getElementById("enableSaveOnAuth");

        if (enableSave) {
          //we have found an enableSaveOnAuth setting, if its set to true, enable saving
          if (enableSave.value == "AuthOnly") {
            if (typeof(formViewerApplet) == "object" && typeof(formViewerApplet.setSaveButtonEnabled) == "function") {
              formViewerApplet.setSaveButtonEnabled(true);
              
              //@TODO - add save button click code here...
              //var actionButtons = window.parent.document.getElementsByClassName("psw-forms-formActionButton");
              //for (var i = 0; i < actionButtons.length; i++)  {  
              //  if (actionButtons[i].getAttribute("onclick").search("save") > -1) {
              //    actionButtons[i].click();
              //  }
              //}
            }
          }
        } 

        //reset login attempts
        curAttempts.value = 1;
      }
    } else {
      document.getElementById("signatureMessageDiv").innerHTML = "Your maximum amount of login attempts has been reached. <br/>Please reload this form and try again later.";
      document.getElementById("signatureConfirm").disabled = true;
    }
  } else {
    //we are unchecking the signature checkbox
    clearSignature();
  }
}

/**
 * This function is used for form login purposes.
 * It authenticates the user credentials, and then attempts to fetch additional, optional, name data on the user.
 */
function authenticateAndLookupOptionalName(element, viewer) {
  
  var authFunction = document.getElementById("authFunction");
  //check to see if we are switching between authentication methods and reset attempts if needed.
  if (authFunction.value == "AuthOnly") {
    authFunction.value = "AuthAndLookupOptionalName";
    document.getElementById("curAttempts").value = "1";
  }

  // CHECK STAR ID & PASSWORD
  var starId = document.getElementById("starId").value;
  if (starId.length < 8) {
    setErrorField(document.getElementById('starId'));
    document.getElementById("loginMessage").innerHTML = "Please enter a valid StarId.";
    return false;
  }

  // CHECK LOGIN ATTEMPT COUNT
  var maxAttempts = document.getElementById("maxAttemptsAuthAndLookup");
  if (maxAttempts) {
    var maxAttemptsVal = parseInt(maxAttempts.value);
  } else {
    var maxAttemptsVal = 3;
  }

  var curAttempts = document.getElementById("curAttempts");
  if (curAttempts) {
    var curAttemptsVal = parseInt(curAttempts.value);
  } else {
    var curAttemptsVal = 1;
  }

  //ATTEMPT TO LOGIN
  if (curAttemptsVal <= maxAttemptsVal) {

    setUserAgentLogin();

    setLoginButtonLoading(); 

    setTimeout(function() {
      runAuthAndLookupOptionalName(element, viewer, maxAttemptsVal, curAttemptsVal);
    }, 0);

  } else {
    document.getElementById("loginMessage").innerHTML = "Your maximum amount of login attempts has been reached. Please close and reopen this form to try again.";
    document.getElementById("authLogin").disabled = true;
  }
}

function runAuthAndLookupOptionalName(element, viewer, maxAttemptsVal, curAttemptsVal) {
  
  //call the function that initiates the iScript lookups
  var loginInfo = triggeriScript();
  var starId = document.getElementById("starId").value;
  //increment the login attempt
  incrementLoginAttempts();

  //determine if we are testing on a local dev machine. If so mock up the lookup response with fake/test data
  var host = window.location.host;
  if (host != "inoweformtest.campus.mnsu.edu" && host != "inoweform.campus.mnsu.edu" && host != "dimmtestn3.campus.mnsu.edu" && host != "dimmtest.campus.mnsu.edu" && (viewer != "WebNow" && viewer != "ImageNow")) {
    var loginInfo = new Object();
    loginInfo.error = "false";
    loginInfo.errorMessage = "";
    loginInfo.lastName = "";
    loginInfo.firstName = "";
    loginInfo.middleName = "";
    loginInfo.studentEmail = "";
    loginInfo.techId = "99999999";
  }
  
  if (!loginInfo) { 
    //this indictaes something went wrong with the parsing of the results
    var message = "Error running StarID authentication.";
    if (maxAttemptsVal - curAttemptsVal == 1) {
      message += " You have one remaining login attempt!";
    }
    document.getElementById("loginMessage").innerHTML = message; 
    document.getElementById("starPassword").value = ""; //clear out the password for security sake. We never store it anyways..
    resetLoginButton();
  } else if (loginInfo.error == "true") {
    // this case alerts the error message returned on error on serv-side lookup
    if (loginInfo.errorMessage == "Please enter a valid StarID.") {
      setErrorField(document.getElementById('starId'));
    }

    if (loginInfo.errorMessage == "You must provide a StarID password.") {
      setErrorField(document.getElementById('starPassword'));
    }

    if (maxAttemptsVal - curAttemptsVal == 1) {
      loginInfo.errorMessage += " You have one remaining login attempt!";
    }
    
    //set the error message
    document.getElementById("loginMessage").innerHTML = loginInfo.errorMessage;
    document.getElementById("starPassword").value = ""; //clear out the password for security sake. We never store it anyways..
    resetLoginButton();
  } else {
    //we are here because of a successful authentication!
    //printObject(loginInfo);

    //Set all of the appropraite field data from the authentication response
    document.getElementById("loginTimestamp").value = loginInfo.timestamp;

    setUserAgentFormSave();

    document.getElementById("loginMissingNameData").value = "true";
    document.getElementById("firstName").value = loginInfo.firstName; 
    document.getElementById("middleName").value = loginInfo.middleName; 
    document.getElementById("lastName").value = loginInfo.lastName; 

    if (loginInfo.firstName == "") {
      document.getElementById("firstName").readOnly = false;
    }
    if (loginInfo.middleName == "") {
      document.getElementById("middleName").readOnly = false;
    }
    if (loginInfo.lastName == "") {
      document.getElementById("lastName").readOnly = false;
    } else {
      document.getElementById("loginMissingNameData").value = "false";
    }

    var fullName = "";
    var fullNameSkipMiddle = document.getElementById("fullNameSkipMiddle");


    if (fullNameSkipMiddle) {
      if (fullNameSkipMiddle.value == "true") {
        fullName = loginInfo.lastName + ", " + loginInfo.firstName;
      } 
    } 

    if (fullName == "") {
      var fullName = loginInfo.lastName + ", " + loginInfo.firstName + " " + loginInfo.middleName;
    }
    fullName = fullName.substring(0, 40); 
    document.getElementById("fullName").value = fullName;

    document.getElementById("techId").value = loginInfo.techId;
    document.getElementById("displayStarId").value = starId;
    document.getElementById("email").value = loginInfo.studentEmail;

    //sometimes we dont get a middle name. Enable the user to enter there middle name if it comes back blank


    //hide the signature section and show the full form
    document.getElementById("loginSection").style.display="none";
    document.getElementById("starPassword").value = ""; //clear out the password for security sake. We never store it anyways..
    document.getElementById("formSection").style.display="block";

    //determine if we need to enable the save button or not.
    var enableSave = document.getElementById("enableSaveOnAuth");

    if (enableSave) {
      //we have found an enableSaveOnAuth setting, if its set to true, enable saving
      if (enableSave.value == "AuthAndLookup") {
        if (typeof(formViewerApplet) == "object" && typeof(formViewerApplet.setSaveButtonEnabled) == "function") {
          formViewerApplet.setSaveButtonEnabled(true);
        }
      }
    }
    
    setTimeout(function() {
      scrollTo(0,0);
    }, 10);
    
  }
}
/*
 * Function used to clear out a signature
 */
function clearSignature() {
  //clear all sig data
  document.getElementById("signatureConfirm").checked = false;
  document.getElementById("signatureTimestamp").value = "";
  document.getElementById("sigPassword").value = "";
  document.getElementById("signatureString").value = "";
  document.getElementById("signatureStringDiv").innerHTML = "";
  document.getElementById("signatureStringDiv").className = "hide";
  document.getElementById("sigPasswordDiv").className = "show";

  document.getElementById("signatureMessageDiv").innerHTML = "";
  document.getElementById("curAttempts").value = "1";
  var enableSave = document.getElementById("enableSaveOnAuth");

  if (enableSave) {
    //we have found an enableSaveOnAuth setting, if its set to true, enable saving
    if (enableSave.value == "AuthOnly") {
      if (typeof(formViewerApplet) == "object" && typeof(formViewerApplet.setSaveButtonEnabled) == "function") {
        formViewerApplet.setSaveButtonEnabled(false);
      }
    }
  }
}

/**
 * This function makes the actual iScript call to the eForm_StarId_Authenticate.js iScript file
 */
function triggeriScript() {

  //obfuscate the passwords..
  maskPasswords();

  //Empty out the element that holds the iScript response
  document.getElementById("hdnReturnAuthenticationValue").value = "";

  //Trigger the hidden button which makes the iScript call
  document.getElementById("btnRunAuthentication").click(); 

  var json =  unescapeJSON(document.getElementById("hdnReturnAuthenticationValue").value);
  //alert("json is: " + json);

  eval(json); //creates the 'data' variable 

  //clear out the response 
  document.getElementById('hdnReturnAuthenticationValue').value = "";

  if (typeof data == 'undefined' || !data) {
    return false;
  } else {
    return (data);
  }
}

/**
 * This function will mask the star passwords so they aren't logged as plaintext
 */
function maskPasswords() {
  var starPass = document.getElementById("starPassword");
  if (starPass) {
    //var starPassEnc = encrypt(starPass.value);
    var starPassVal = starPass.value;
    starPass.value = encodeURIComponent(starPassVal);
  }

  var sigPass = document.getElementById("sigPassword");
  if (sigPass) {
    //var sigPassEnc = encrypt(sigPass.value);
    var sigPassVal = sigPass.value;
    sigPass.value = encodeURIComponent(sigPassVal);
  }
}

/**
 * @param e
 * @returns {String}
 */
function encrypt(e) {
  var s = '';
  for (var cntr = 0; cntr < e.length; cntr++) {
    s += String.fromCharCode(e.charCodeAt(cntr) + 1);
  }
  return s;
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

/**
 * This function is used to increase the login attempt counter.
 */
function incrementLoginAttempts() {
  var curAttempts = document.getElementById("curAttempts");

  if (curAttempts) {
    var curAttemptsVal = parseInt(curAttempts.value);
    var newVal = curAttemptsVal+1;
    curAttempts.value = newVal;
  }
}

/**
 * This function sets a form element field to the active class, making it look special to the user
 */
function setActiveField(element) {
  element.className = '';
  element.className = 'focusField';
}

/**
 * This function sets a form element field from the active class to the idle, making it look boring to the user
 */
function setInactiveField(element) {
  if (element.value.length == 0) {
    setErrorField(element);
  } else {
    element.className = '';
    element.className = 'idleField';

    //if we are running a starId field check let's verify further..
    if (element.id == "starId") {
      element.value = element.value.toLowerCase();
      verifyIdType(element);
    }
  }
}

/**
 * This function is used to identify if a StarId or TechID was entered into the form.
 * @param string id
 */
function verifyIdType(element) {

  var isValidStarId = validateStarId(element.value)
  if (isValidStarId === false) {
    var isTechId = validateTechId(element.value);
    if (isTechId) {
      showTechIdMessage();
    } else {
      showStarIDMessage();
    }
    setErrorField(element);
  } else {
    clearIdMessage();
    element.className = '';
    element.className = 'idleField';
  }
}

/**
 * If we detect a techid instead of a starId, inform the user..
 */
function showTechIdMessage() {
  var messageEl = document.getElementById("loginMessage");
  var newMessage = 'It appears that you have entered a TechID instead of a StarID.<br/> <a href="https://starid.mnscu.edu/" target="_blank">Please click here for further StarID information.</a>';

  messageEl.innerHTML = newMessage;
}

/**
 * If we dont detect a valid starid format
 */
function showStarIDMessage() {
  var messageEl = document.getElementById("loginMessage");
  var newMessage = 'You have not supplied a valid StarID.<br/> <a href="https://starid.mnscu.edu/" target="_blank">Please click here for further StarID information if you are having difficulties.</a>';

  messageEl.innerHTML = newMessage;
}

/**
 * clear out the techID message if its no longer needed.
 */
function clearIdMessage() {
  document.getElementById("loginMessage").innerHTML = "";
}


/**
 * This function sets a form element field to the error class, making it look like a problem to the user
 */
function setErrorField(element) {
  element.className = '';
  element.className = 'errorField';
}

/**
 * Helper function used to build a timestamp
 * @returns {String}
 */
function getTimestamp() {
  var date = new Date();
  //var timeStamp = date.toLocaleTimeString();
  var now = date.toLocaleTimeString();
  var timeStamp = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear() + " " + now;
  
  return timeStamp;
}

/**
 * Sleep function to hold script from processing. Used to show a successful authentication before the full form is shown.
 * @param milliseconds
 */
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

/**
 * Helper funciton to alert the values of an object/array
 * @param o - object
 */
function printObject(o) {
  var out = '';
  for (var p in o) {
    out += p + ': ' + o[p] + '\n';
  }
  alert(out);
}

/**
 * Determines if we have an 8 digit tech id
 * @param techId
 * @returns bool
 */
function validateTechId(techId) {
  var regEx = /\b[0-9]{8}\b/;
  return regEx.test(techId);
}

/**
 * Determines if we have a StarId
 * @param starId
 * @returns bool
 */
function validateStarId(starId) {
  var regEx = /\b^[a-zA-Z]{2}[0-9]{4}[a-zA-Z]{2}$\b/;
  return regEx.test(starId);
}

function setLoginButtonLoading() {
  var button = document.getElementById("authLogin");
  if (button.nodeName == "BUTTON" || button.nodeName == "button") {
    $("#authLogin").text("Loading"); 
    $("#authLogin").toggleClass('success');
    $("#authLogin").css("opacity", "0.75");
    $("#authLogin").prop("disabled", true);
    $('#authLogin').hide();
    $('#authLogin').get(0).offsetHeight;
    $('#authLogin').show();
  }
}
function resetLoginButton() { 
  var button = document.getElementById("authLogin");
  if (button.nodeName == "BUTTON" || button.nodeName == "button") {
    $("#authLogin").text("Verify Credentials"); 
    $("#authLogin").toggleClass('success');
    $("#authLogin").css("opacity", "1");
    $("#authLogin").prop("disabled", false);
    $('#authLogin').hide();
    $('#authLogin').get(0).offsetHeight;
    $('#authLogin').show();
  }
}

function loginSubmitter(field, e) {
  var keycode;
  if (window.event) {
    keycode = window.event.keyCode;
  } else if (e) {
    keycode = e.which;
  } else {
    return true;
  }

  if (keycode == 13) {
      document.getElementById("authLogin").click();
      return false;
  } else {
    return true;
  }
}

/**
 * This function sets the user agent string to the formName parameter used in authentication lookups. 
 * This get us the user agent string in the auth logs for troubleshooting.
 */
function setUserAgentLogin() {
  var formName = document.getElementById("formName");
  var formN = formName.value;

  if (formN.indexOf(navigator.userAgent) === -1) {
    var newFormName = formN + " | " + navigator.userAgent;
    formName.value = newFormName;
  }
}

/**
 * This function stroes the userAgent string in the form so we have a permanent copy of it in the eForm submission.
 * It attempts to store it in the proper "userAgent" field if it exists. If it does not, we store it in the loginStamp field. 
 */
function setUserAgentFormSave() {
  var UAInput = document.getElementById("userAgent");

  if (UAInput != null) {
    if (UAInput.value == "") {
      UAInput.value = navigator.userAgent;
    }
  } else {
    var loginTimestamp = document.getElementById("loginTimestamp");
    var loginTime = loginTimestamp.value
    if (loginTime.indexOf(navigator.userAgent) === -1) {
      var newLoginTime = loginTime + " | " + navigator.userAgent;
      loginTimestamp.value = newLoginTime;
    }
  }
}
