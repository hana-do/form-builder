/**
 * this function creates a hidden form element to store what the name fields should be for sigpad style signatures.
 * @param array nameFields
 */
function appendNameFields(nameFields) {
  var sigPadNameFields = document.createElement('input');
  sigPadNameFields.type = 'hidden';
  sigPadNameFields.id = 'sigField';
  sigPadNameFields.value = nameFields.toString();
  var form = document.forms.namedItem("form");
  form.appendChild(sigPadNameFields);
}

/**
 * This funciton corrects XSLT parsing issues that double up <br> tags
 */
function clearDuplicateBRs() {
  $('br').each(function() {
    $next = $(this).next();
    if ($next.is('br')) {
      $next.remove();
    }
  });
}

/**
 * Fucntion to determine if we are working with a mobile device
 * @returns boolean
 */
function devices() {
  var isMobile = {
      Android: function () {
        return navigator.userAgent.match(/Android/i);
      },
      BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
      },
      iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      iPhone: function () {
        return navigator.userAgent.match(/iPhone/i);
      },
      Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
      },
      Windows: function () {
        return navigator.userAgent.match(/IEMobile/i);
      },
      any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
      }
    };
    return isMobile;
}

/**
 * Fetchs the name of the form
 * @returns
 */
function fetchFormTitle() {
  var frame = window.parent.document.getElementById("psw-forms-formFrame");
  var formTitle = "";
  
  if (frame != null) {
    var iFrameSrcRaw = frame.src;
    var iFrameSrcParts = iFrameSrcRaw.split("_");
    var formTitle = iFrameSrcParts[1];
    formTitle = formTitle.replace(".html", "");
    formTitle = formTitle.replace(/%20/g, " ");
  }
  return formTitle;
}

/**
 * This function attempts to fetch the name details needed for the signature pad only..
 * This is used to build out the signature string: Signed By Casey J boone on 7/7/2017 2:02:02 PM CDT
 * @returns {String}
 */
function fetchSigPadNameFields() {
  var name = "";

  var nameFieldsEl = document.getElementById("sigField");

  if (nameFieldsEl != false && nameFieldsEl != undefined && nameFieldsEl != null) {
    var nameFields = nameFieldsEl.value.split(",");
  }

  if (nameFields == "" || nameFields == undefined || nameFields.length == 0) {

    var fNameEl = document.getElementById("firstName");
    var lNameEl = document.getElementById("lastName");

    if (fNameEl != false || fNameEl != undefined || fNameEl != null) {
      var fName = trim(fNameEl.value)
    } else {
      var fName = "";
    }
    if (lNameEl != false || lNameEl != undefined || lNameEl != null) {
      var lName = trim(lNameEl.value)
    } else {
      var lName = "";
    }
    name = fName + " " + lName;
    if (name == " ") {
      name = "";
    }
  } else {
    var namePartLength = nameFields.length;
    var i=0;
    for (i; i < namePartLength; i++) {
      name += document.getElementById(nameFields[i]).value + " ";
    }
    name = trim(name);
  }
  
  return name;
}

/**
 * Binds the foundation validation to the Save button 
 */
function foundationValidation() {
  var actionButtons = window.parent.document.getElementsByClassName("psw-forms-formActionButton");
  var saveButton = null;
  for (var i = 0; i < actionButtons.length; i++) {
    // find the save button
    if (actionButtons[i].getAttribute("onclick").search("save") > -1) {
      saveButton = actionButtons[i];
      break;
    }
  }

  // Event Listener - Invalid form (triggered onclick of the submit button)
  // Scroll to the invalid field and focus it
  $('form').on('forminvalid.zf.abide', function () {
    var invalid_fields = $(this).find('[data-invalid]');
    $('html, body').animate({scrollTop: $(invalid_fields[0]).offset().top - 40}, 1000, function () {
      $(invalid_fields[0]).focus();
    });
  });

  // Event Listener - Valid form (triggered onclick of the submit button)
  // Submit the form
  $('form').on('formvalid.zf.abide', function () {
    grecaptcha.reset();
    //concatName();
    // Submit the form.
    window.parent.ImageNowForms.ButtonAction.saveForm();
  });
}

/**
 * instantiates the input field text resizer
 */
function inputSize() {
  $(function(){
    $('input').inputfit();
  });
}

/**
 * Fixes a jumping issue for iOS devices
 */
function iPhoneScrollIssue(clientType) {
  if (clientType == "FormViewer") {
    $( document ).ready(function() {
      var el2 = window.parent.document.getElementById("psw-forms-wrapper");
      $(el2).attr('style', 'display: initial');
    });
  }
}

/**
 * This function shows the SignaturePad dialog on button click
 * @param elem - the Signature pad dialog
 */
function openSigPad(ele) {

  var name = fetchSigPadNameFields();

  if (name == "") {
    alert("You must enter a name above before signing this form.");
    return false;
  } else {
    document.getElementById(ele).className = "show";
    $( "#dialogSignaturePad" ).dialog("open");
  }
}

/**
 * Removes the Perceptive Content Status bar
 */
function removeStatusBar(clientType) {
  if (clientType == "FormViewer") {
    $ (document ).ready(function() {
      var el = window.parent.document.getElementById("psw-forms-statusBar");
      $(el).hide();
    });
  }
}

/**
 * Function to reset a signature after it has been applied to the form.
 * @param byPassClear - flag to bypass SignaturePad drawing board
 */
function resetSigPad (byPassClear) {
  if (byPassClear == true) {
    document.getElementById("byPassSignTime").innerHTML = "";
    document.getElementById("openSigPadButton").className = "button";
    document.getElementById("byPassClearButton").className = "hide";
    document.getElementById("bypassSigPad").className = "show";

  } else {
    document.getElementById("sigImage").src = "";                   //remove old signature from display
    document.getElementById('signatureString').value = "";          //remove what we save
    document.getElementById('signatureTimestamp').value = "";       //remove what we save
    document.getElementById('signatureCapture').className = "";     //show the capture div
    document.getElementById("bypassSigPad").className = "show";
    document.getElementById('signatureDisplay').className = "hide";
    //hide the display div
  }
  //disable the form save
  if (typeof(formViewerApplet) == "object" && typeof(formViewerApplet.setSaveButtonEnabled) == "function") {
    formViewerApplet.setSaveButtonEnabled(false);
  }
}

/*
 * Sets up the Google Analytics page tracker
 */
function runAnalytics(clientType, formTitle) {
  if (clientType == "FormViewer") {
    if (formTitle == undefined || formTitle == "") {
      var formTitle = fetchFormTitle();
    }
    var host = window.location.host;
    if (host == "inoweform.campus.mnsu.edu" || host == "inoweformtest.campus.mnsu.edu") {
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })
      (window,document,'script','//www.google-analytics.com/analytics.js','ga');
      ga('create', 'UA-72685607-1', 'auto');
      ga('set', 'page', '/' + formTitle);
      ga('set', 'title', formTitle);
      ga('send', 'pageview');
    }
  }
}

/**
 * runs the setup process for desktop computers
 * @param clientType
 * @param formTitle
 * @param isMobile
 */
function runDesktopSetup(clientType, formTitle, isMobile) {
  if (clientType == "FormViewer") {
    setFormTitle(formTitle);
    setSubmissionTracker(formTitle, clientType, 'Desktop');
    setToken(clientType);
    removeStatusBar(clientType);
  }

  inputSize();

  textArea();
  clearDuplicateBRs();
  foundationValidation();
  $(document).foundation();
  Foundation.Abide.defaults['patterns']['year'] = /^[1-9]+[0-9]{3}$/;
  Foundation.Abide.defaults['patterns']['zipcode'] = /^\d{5}(?:[-\s]\d{4})?$/;
  Foundation.Abide.defaults['patterns']['phone'] = /^1?[-\. ]?(\(\d{3}\)?[-\. ]?|\d{3}?[-\. ]?)?\d{3}?[-\. ]?\d{4}$/;
  Foundation.Abide.defaults['validators']['checkbox_limit'] =
   function ($el, required, parent) {
     var group = parent.closest('.checkbox-group');
     var min = group.attr('data-validator-min');
     var checked = group.find(':checked').length;
     if (checked >= min) {
       // clear label highlight
       group.find('label').each(function () {
         $(this).removeClass('is-invalid-label');
       });
       // clear radiobutton error
       group.find(':checkbox').each(function () {
         $(this).removeClass('is-invalid-input').removeAttr('data-invalid');
       });
       group.find('span.form-error').hide();
       return true;
     } else {
       // label highlight
       group.find('label').each(function () {
         $(this).addClass('is-invalid-label');
       });
       // radiobutton error
       group.find(':checkbox').each(function () {
         $(this).addClass('is-invalid-input').attr('data-invalid');
       });
       group.find('span.form-error').css({
         display: 'block'
       });
       return false;
     }
   };

   Foundation.Abide.defaults['validators']['radiobutton_limit'] =
     function ($el, required, parent) {
       var group = parent.closest('.radiobutton_limit-group');
       var min = group.attr('data-validator-min');
       var checked = group.find(':checked').length;
       if (checked >= min) {
         // clear label highlight
         group.find('label').each(function () {
           $(this).removeClass('is-invalid-label');
         });
         // clear radiobutton error
         group.find(':radio').each(function () {
           $(this).removeClass('is-invalid-input').removeAttr('data-invalid');
         });
         group.find('span.form-error').hide();
         return true;
       } else {
         // label highlight
         group.find('label').each(function () {
           $(this).addClass('is-invalid-label');
         });
         // radiobutton error
         group.find(':radio').each(function () {
           $(this).addClass('is-invalid-input').attr('data-invalid');
         });
         group.find('span.form-error').css({
           display: 'block'
         });
         return false;
       }
     };

   if (typeof customFormLoadDesktop == 'function') {
     customFormLoadDesktop(clientType, isMobile); 
   }
   setupKonami();
}

/**
 * runs the setup process for mobile devices
 * @param clientType
 * @param formTitle
 * @param isMobile
 */
function runMobileSetup(clientType, formTitle, isMobile) {

  if (clientType == "FormViewer") {
    setFormTitle(formTitle);
    setSubmissionTracker(formTitle, clientType, 'Mobile');
    setToken(clientType);
    removeStatusBar(clientType);
    inputSize();
    clearDuplicateBRs();
    if (isMobile.iOS()) {
      iPhoneScrollIssue(clientType);
    }
    foundationValidation();
  }
  textArea();
  $(document).foundation();
  Foundation.Abide.defaults['patterns']['year'] = /^[1-9]+[0-9]{3}$/;
  Foundation.Abide.defaults['patterns']['zipcode'] = /^\d{5}(?:[-\s]\d{4})?$/;
  Foundation.Abide.defaults['patterns']['phone'] = /^1?[-\. ]?(\(\d{3}\)?[-\. ]?|\d{3}?[-\. ]?)?\d{3}?[-\. ]?\d{4}$/;
  Foundation.Abide.defaults['validators']['checkbox_limit'] =
    function ($el, required, parent) {
      var group = parent.closest('.checkbox-group');
      var min = group.attr('data-validator-min');
      var checked = group.find(':checked').length;
      if (checked >= min) {
        // clear label highlight
        group.find('label').each(function () {
          $(this).removeClass('is-invalid-label');
        });
        // clear radiobutton error
        group.find(':checkbox').each(function () {
          $(this).removeClass('is-invalid-input').removeAttr('data-invalid');
        });
        group.find('span.form-error').hide();
        return true;
      } else {
        // label highlight
        group.find('label').each(function () {
          $(this).addClass('is-invalid-label');
        });
        // radiobutton error
        group.find(':checkbox').each(function () {
          $(this).addClass('is-invalid-input').attr('data-invalid');
        });
        group.find('span.form-error').css({
          display: 'block'
        });
        return false;
      }
  };

  Foundation.Abide.defaults['validators']['radiobutton_limit'] =
    function ($el, required, parent) {
      var group = parent.closest('.radiobutton_limit-group');
      var min = group.attr('data-validator-min');
      var checked = group.find(':checked').length;
      if (checked >= min) {
        // clear label highlight
        group.find('label').each(function () {
          $(this).removeClass('is-invalid-label');
        });
        // clear radiobutton error
        group.find(':radio').each(function () {
          $(this).removeClass('is-invalid-input').removeAttr('data-invalid');
        });
        group.find('span.form-error').hide();
        return true;
      } else {
        // label highlight
        group.find('label').each(function () {
          $(this).addClass('is-invalid-label');
        });
        // radiobutton error
        group.find(':radio').each(function () {
          $(this).addClass('is-invalid-input').attr('data-invalid');
        });
        group.find('span.form-error').css({
          display: 'block'
        });
        return false;
      }
  };
  if (typeof customFormLoadMobile == 'function') {
    customFormLoadMobile(clientType, isMobile); 
  }
  
  if (clientType == "webclient") {
    setMobileIframeHeight();
  }
}

/**
 * Function to run the forms save, followed by tracking the save in Analytics
 * @param formTitle
 * @param platform
 */
function runSave(formTitle, platform) {
  if (formTitle == undefined || formTitle == "") {
    var formTitle = fetchFormTitle();
  }

  if (platform == undefined || platform == "") {
    var isMobile = devices();
    if (isMobile.any()) {
      var platform = "Mobile";
    } else {
      var platform = "Desktop";
    }
  }
  window.parent.ImageNowForms.ButtonAction.saveForm();
  trackSubmit(formTitle, platform);
}

/**
 * Function used when a signature save is triggered
 * @object signaturePad
 * @param bypassSignatureFlag - flag to bypass SignaturePad drawing board
 */
function saveSigPad(signaturePad, bypassSignatureFlag) {
  //If signaturePad drawing board is BYPASSED
  if (bypassSignatureFlag == true) {
    document.getElementById("signatureConfirm").value = "true";
    //set the timestamp
    var date = new Date();
    var now = date.toLocaleTimeString();
    var timeStamp = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear() + " " + now;

    var name = fetchSigPadNameFields();

    if (name == "") {
      alert("You must enter a name above before signing this form.");
      return false;
    } else {
      var sigString = "Signed by " + name + " on: " + timeStamp;
      document.getElementById("signatureTimestamp").value = sigString;
      document.getElementById("byPassSignTime").innerHTML = sigString;
      document.getElementById("signatureString").value = "Signature Pad Bypassed";

      document.getElementById("bypassSigPad").className = "hide";
      document.getElementById("openSigPadButton").className = "hide";
      document.getElementById("byPassClearButton").className = "show button";

      //enable the form save button
      if (typeof(formViewerApplet) == "object" && typeof(formViewerApplet.setSaveButtonEnabled) == "function") {
        formViewerApplet.setSaveButtonEnabled(true);
      }

      trackSignaturePad('bypass');
    }
  } else {
    //if SignaturePad is NOT bypassed
    var isSigPadEmpty = signaturePad.empty();
    if (isSigPadEmpty) {
      alert("Please provide signature first.");
    } else {
      //get image
      var image = signaturePad.getImg();
      //if signature pad is not empty, set signatureConfirm to true
      if (image.length) {
        document.getElementById("signatureConfirm").value = "true";
      }
      //set the hidden value to store image
      document.getElementById("signatureString").value = image;
      //set to display
      document.getElementById("sigImage").src = image;
      //show result
      document.getElementById("signatureDisplay").className = "";

      //set the timestamp
      var date = new Date();
      var now = date.toLocaleTimeString();
      var timeStamp = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear() + " " + now;

      //set the text name signature 
      var name = fetchSigPadNameFields();

      if (name == "") {
        alert("You must enter a name above before signing this form.");
        return false;
      } else {
        var sigString = "Signed by " + name + " on: " + timeStamp;
        document.getElementById("signatureTimestamp").value = sigString;
        document.getElementById("signTime").innerHTML = sigString;
        document.getElementById("sigImage").title = sigString;

        //hide the signature modal
        $("#dialogSignaturePad").dialog('close');
        //hide the signature capture section
        document.getElementById("signatureCapture").className = "hide";
        //clear the canvas
        signaturePad.resetBackground();
        document.getElementById("bypassSigPad").className = "hide";

        //enable the form save button
        if (typeof(formViewerApplet) == "object" && typeof(formViewerApplet.setSaveButtonEnabled) == "function") {
          formViewerApplet.setSaveButtonEnabled(true);
        }
        
        trackSignaturePad();
      }
    }
  }
}

/**
 * Set the browser tab title
 * @param formTitle
 */
function setFormTitle(formTitle) {
  if (formTitle != "") {
    document.title = formTitle;
    window.parent.document.title = formTitle;
  }
}

function setMobileIframeHeight() {
  var isMobile = devices();
  if (isMobile.iPhone()) {
    var iFrame = window.parent.document.getElementById("formArea");
    iFrame.style.height = "450px";
  }
}

/**
 * Sets up the form Save event Google Analytics tracker
 * @param formTitle
 * @param clientType
 * @param platform
 */
function setSubmissionTracker(formTitle, clientType, platform) {
  var host = window.location.host;
  if (clientType == "FormViewer" && (host == "inoweform.campus.mnsu.edu" || host == "inoweformtest.campus.mnsu.edu")) {
    var actionButtons = window.parent.document.getElementsByClassName("psw-forms-formActionButton");
    var saveButton = null;
    for (var i = 0; i < actionButtons.length; i++) {
      // find the save button
      if (actionButtons[i].getAttribute("onclick").search("save") > -1) {
        saveButton = actionButtons[i];
        break;
      }
    }
    if (saveButton != null) {
      saveButton.onclick = function(e) {
        runSave(formTitle, platform); 
      };
    }
  }
}

/**
 * Stores the session hash in the rdtoken field
 * @param viewer
 */
function setToken(viewer) {
  if (viewer == "FormViewer") {
    if ( $('#rdtoken').length ) {
      var rd =  $("#rdtoken");
      var url = window.parent.document.location.href;
      var results = url.split("/");
      var i;
      var result;
      for ( i=0; i<results.length; i++) {
        if (results[i].toLowerCase()=="webform") {
          result = results[i+1];
          break;
        }
      }
      rd.val(result);
    }
  }
}

/**
 * This function helps setup the signature pad and modal for desktop browsers
 * @param clientType
 * @array nameFields - list each name element by ID, in order from L->R.. 
 */
function setupDesktopSigPad(clientType, nameFields) {
  if (clientType == "FormViewer" || clientType == "ImageNow") {

    $("#signature-pad").css({"width":660,"height":405,"margin":'auto'});

    //Create the Signature pad footer 
    if (clientType == "FormViewer") {
      var footerDesktop = '<div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix" id="dialog_footer" style="background-color: #ffffff;display: flex;margin-top: 0px;border: solid gray 1px;">Sign with your mouse/touchpad</div>';
    }
    if (clientType == "ImageNow") {
      var footerDesktop = '<div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix" id="dialog_footer" style="background-color: #ffffff;display: block;margin-top: 0px;">Sign with your mouse/touchpad</div>';
    }

    //Calling the SignaturePad
    var signaturePad = new DrawingBoard.Board('signature-pad', 
      {controls: ['Navigation'] , controlsPosition: ['left'], color: ['#145394'], size: ['2']}, 
      nameFields);

    canvas = document.getElementsByClassName("board");
    sigPadButton = document.getElementById("openSigPadButton");

    var test = $("#dialogSignaturePad").dialog({
      width: 680,
      height: 480,
      modal: true,
      autoOpen: false,
      resizable: true,
      fluid: true,
      dialogClass: "noTitleStuff myDialog",
      create: function() {
        $(".myDialog").append(footerDesktop);
      }
    });

    $(window).resize(function() {
      $("#dialogSignaturePad").dialog("option", "position", {my: "center", at: "center", of: window});
    });

    canvas.width="660";
    canvas.height="405";

    //add the name field data to the form
    appendNameFields(nameFields);

    //set the proper Aria tag..
    $('div.myDialog').attr("aria-labelledby", "dialog_footer");
  }
}

/**
 * Easter Egg
 */
function setupKonami() {
  var keys = []

  $.fn.konami_code = function( options ) { 
    var settings = $.extend(true, {}, $.fn.konami_code.defaults, options )

    $(this).keydown(function(e) {
      keys.push( e.keyCode )
      if ( keys.toString().indexOf( settings[settings.activeCode] ) >= 0 ){
        // execute the specified callback function when the activeCode is detected
        settings.callback.call( this )
        // empty the array containing the key sequence entered by the user
        keys = []
      } else if (keys.length >1000) {
        keys = [] //a crude way to keep the array from getting too big for no reason--a better check would be to clear after a long delay between keypresses (400-800ms)
      }
    })
    return this
  }

  defaultCallback = function() {
    $('<div />')
      .html('<ul><li>Casey Boone</li><li>Dennis Fling</li><li>Nhung (Hana) Do<li>Shankar Shrestha</li><li>Chetak Agrawal</li><li>Taraka De Silva</li></ul><p>Questions? Comments? Contact us: <a href="mailto:ImageNowSupport@mnsu.edu">ImageNowSupport@mnsu.edu</a>')
      .dialog({
        width: 500, 
        height: 300, 
        title:"eForms presented to you by",
        modal: true,
        buttons: [
          {
            text: "Close",
            click: function() {
              $( this ).dialog( "close" );
            }
          }
        ]}
     );
  }

  $.fn.konami_code.defaults = {
    konami: '38,38,40,40,37,39,37,39,66,65',
    callback: defaultCallback,
    activeCode: 'konami'
  }
  $(document).konami_code();
}

/**
 * This function helps setup the signature pad and modal for mobile browsers
 * @param clientType
 * @array nameFields - list each name element by ID, in order from L->R.. 
 */
function setupMobileSigPad(clientType, nameFields) {
  if (clientType == "FormViewer" || clientType == "ImageNow") {
    var isMobile = devices();
    var footer = '<div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix" id="dialog_footer" style="background-color: #ffffff;display: flex;">Sign with your finger/touchpad</div>';
    var signaturePad2 = new DrawingBoard.Board('signature-pad', {
      controls: ['Navigation'] , controlsPosition: ['left'], color: ['#145394'], size: ['2']
    }, nameFields);
    //Aligning the canvas controls with the footer and the canvas
    $('.drawing-board-controls').css({margin:'6px'});

    canvas = document.getElementsByClassName("board");
    sigPadButton = document.getElementById("openSigPadButton");

    var orientation = window.orientation;
    var wWidth, dWidth, wHeight, dHeight;

    //Default iOS Configurations
    if (isMobile.iOS()) {
      //iOS Default Portrait
      if (window.innerHeight > window.innerWidth) {
        //Calculate the iOS Portrait Window Width and Height
        wWidth = $(window).width();
        dWidth = wWidth - 20;
        wHeight = $(window).height();
        dHeight = wHeight - 90;
        $("#dialogSignaturePad").dialog({
          height: dHeight,
          width: dWidth,
          maxWidth: 600,
          modal: true,
          autoOpen: false,
          fluid: true,
          position: {my: "center", at: "center", of: window, collission: "none"},
          dialogClass: "noTitleStuff myDialog",
          create: function() {
            $(".myDialog").append(footer);
          }
        });
        //Center the canvas inside the dialog
        $(".drawing-board-canvas-wrapper").css({"margin":'auto'});
        //Calling the onclick event on reset button to turn the cursor blue
        setTimeout (function(event) {
          $(".drawing-board-control-navigation-reset").click();
        }, 30);
        //Setting the canvas height and width inside the dialog
        $(".drawing-board-canvas-wrapper").css({"width":dWidth - 20,"height":dHeight - 90});
        $(".drawing-board-canvas").css({"width":dWidth - 20,"height":dHeight - 90});
        $(".drawing-board-canvas").attr({"width":dWidth - 20,"height":dHeight - 90});
      } else {
        //Grabbing the default landscape iOS window height and width
        wWidth = $(window).width();
        dWidth = wWidth -20;
        wHeight = $(window).height();
        dHeight = wHeight - 60;
  
        $("#dialogSignaturePad").dialog({
          height: dHeight,
          width: dWidth,
          maxWidth: 600,
          modal: true,
          autoOpen: false,
          fluid: true,
          position: {my: "center", at: "center", of: window, collission: "none"},
          dialogClass: "noTitleStuff myDialog",
          create: function() {
            $(".myDialog").append(footer);
          }
        });
        //Calling the onclick event on reset button to turn the cursor blue
        setTimeout (function(event) {
          $(".drawing-board-control-navigation-reset").click();
        }, 30);
        //Setting the canvas height and width inside the dialog for landscape mode
        $(".drawing-board-canvas-wrapper").css({"width":dWidth - 20,"height":dHeight - 90});
        $(".drawing-board-canvas").css({"width":dWidth - 20,"height":dHeight - 90});
        $(".drawing-board-canvas").attr({"width":dWidth - 20,"height":dHeight - 90});
  
        $(window).resize(function() {
          $("#dialogSignaturePad").dialog("option", "position", {my: "center", at: "center", of: window});
        });
      }
    } else { //Default Android
      //Grab the screen height and android for not IOS devices
      wWidth = screen.width;
      dWidth = wWidth * 0.8;
      wHeight = screen.height;
      dHeight = wHeight * 0.65;
      $("#dialogSignaturePad").dialog({
        height: dHeight,
        width: dWidth,
        maxWidth: 600,
        modal: true,
        autoOpen: false,
        resizable: false,
        fluid: true,
        position: {my: "center", at: "center", of: window, collission: "none"},
        dialogClass: "noTitleStuff myDialog",
        create: function() {
          $(".myDialog").append(footer);
        }
      });
      setTimeout (function(event) {
        $(".drawing-board-control-navigation-reset").click();
      }, 30);
      $(".drawing-board-canvas-wrapper").css({"margin":'auto'});
      $(".drawing-board-canvas-wrapper").css({"width":wWidth * 0.77,"height":wHeight * 0.51});
      $(".drawing-board-canvas").css({"width":wWidth * 0.77,"height":wHeight * 0.51});
      $(".drawing-board-canvas").attr({"width":wWidth * 0.77,"height":wHeight * 0.51});
    }

    //Orientation change code for non-iOS Devices
    if (!isMobile.iOS()) {
      $(window).on("orientationchange", function (event) {
        setTimeout (function() {
          $(".drawing-board-control-navigation-reset").click();
        }, 30);

        var isOpen = $("#dialogSignaturePad").dialog('isOpen');
        var orientation = window.orientation;
        //Landscape Orienttaion NOT iOS
        if (window.matchMedia("(orientation: landscape)").matches) {
          wWidth = screen.width;
          dWidth = wWidth * 0.8;
          wHeight = screen.height;
          dHeight = wHeight * 0.65;
          if (isOpen) {
            $('#dialogSignaturePad').dialog('close');
            $('#dialogSignaturePad').dialog('open');
          }
          $("#dialogSignaturePad").dialog({
            height: dHeight,
            width: dWidth,
            maxWidth: 600,
            modal: true,
            autoOpen: false,
            resizable: true,
            fluid: true,
            position: {my: "center", at: "center", of: window, collission: "none"},
            dialogClass: "noTitleStuff myDialog",
            create: function() {
              $(".myDialog").append(footer);
            }
          });
          $(".drawing-board-canvas-wrapper").css({"width":wWidth * 0.77,"height":wHeight * 0.51});
          $(".drawing-board-canvas").css({"width":wWidth * 0.77,"height":wHeight * 0.51});
          $(".drawing-board-canvas").attr({"width":wWidth * 0.77,"height":wHeight * 0.51});
          $(window).resize(function() {
            $("#dialogSignaturePad").dialog("option", "position", {my: "center", at: "center", of: window});
          });
        }
        //Portrait Orientation Non-iOS
        if (window.matchMedia("(orientation: portrait)").matches) {
          wWidth = screen.width;
          dWidth = wWidth * 0.8;
          wHeight = screen.height;
          dHeight = wHeight * 0.65;
          if (isOpen) {
            $('#dialogSignaturePad').dialog('close');
            $('#dialogSignaturePad').dialog('open');
          }
          $("#dialogSignaturePad").dialog({
            height: dHeight,
            width: dWidth,
            maxWidth: 600,
            modal: true,
            autoOpen: false,
            resizable: true,
            fluid: true,
            position: {my: "center", at: "center", of: window, collission: "none"},
            dialogClass: "noTitleStuff myDialog",
            create: function() {
              $(".myDialog").append(footer);
            }
          });
          $(".drawing-board-canvas-wrapper").css({"width":wWidth * 0.77,"height":wHeight * 0.41});
          $(".drawing-board-canvas").css({"width":wWidth * 0.77,"height":wHeight * 0.41});
          $(".drawing-board-canvas").attr({"width":wWidth * 0.77,"height":wHeight * 0.41});
          $(window).resize(function() {
            $("#dialogSignaturePad").dialog("option", "position", {my: "center", at: "center", of: window});
          });
        }
      });
    }

    //Check to see if iOS
    if (isMobile.iOS()) {
      //Orientation change event
      $(window).on("orientationchange", function (event, orientation, dHeight, dWidth) {
        //set timeout on orinetation chnage in iOS so that the dialog gets updated correctly on orientation change 
        setTimeout (function(event) {
          var isOpen = $("#dialogSignaturePad").dialog('isOpen');
          //iOS Landscape orientation
          if (window.matchMedia("(orientation: landscape)").matches) {
            //Check to see if the dialog is open on orientation change
            if (isOpen) {
              //if dialog is open on orientation change then we close the dialog and grab the new orientaion values, setup and open the dialog with new values for the new orientation
              $('#dialogSignaturePad').dialog('close');
              wWidth = $(window).width();
              dWidth = wWidth -20;
              wHeight = $(window).height();
              dHeight = wHeight - 60;
              $("#dialogSignaturePad").dialog({
                height: dHeight,
                width: dWidth,
                maxWidth: 600,
                modal: true,
                autoOpen: false,
                fluid: true,
                position: {my: "center", at: "center", of: window, collission: "none"},
                dialogClass: "noTitleStuff myDialog",
                create: function() {
                  $(".myDialog").append(footer);
                }
              });
              $('#dialogSignaturePad').dialog('open');
              setTimeout (function(event) {
                $(".drawing-board-control-navigation-reset").click();
              }, 30);
              $(".drawing-board-canvas-wrapper").css({"width":dWidth - 20,"height":dHeight - 90});
              $(".drawing-board-canvas").css({"width":dWidth - 20,"height":dHeight - 90});
              $(".drawing-board-canvas").attr({"width":dWidth - 20,"height":dHeight - 90});
              $(window).resize(function() {
                $("#dialogSignaturePad").dialog("option", "position", {my: "center", at: "center", of: window});
              });
            } else {
              //if dialog is not open on orientation change
              wWidth = $(window).width();
              dWidth = wWidth -20;
              wHeight = $(window).height();
              dHeight = wHeight - 60;
              $("#dialogSignaturePad").dialog({
                height: dHeight,
                width: dWidth,
                maxWidth: 600,
                modal: true,
                autoOpen: false,
                fluid: true,
                position: {my: "center", at: "center", of: window, collission: "none"},
                dialogClass: "noTitleStuff myDialog",
                create: function() {
                  $(".myDialog").append(footer);
                }
              });
              setTimeout (function(event) {
                $(".drawing-board-control-navigation-reset").click();
              }, 30);
              $(".drawing-board-canvas-wrapper").css({"width":dWidth - 20,"height":dHeight - 90});
              $(".drawing-board-canvas").css({"width":dWidth - 20,"height":dHeight - 90});
              $(".drawing-board-canvas").attr({"width":dWidth - 20,"height":dHeight - 90});
              $(window).resize(function() {
                $("#dialogSignaturePad").dialog("option", "position", {my: "center", at: "center", of: window});
              });
            }
          } else {
          //if orientaion is portrait
            //check to see if the diaog is open
            if (isOpen) {
              $('#dialogSignaturePad').dialog('close');
              wWidth = $(window).width();
              dWidth = wWidth -20;
              wHeight = $(window).height();
              dHeight = wHeight - 90;

              $("#dialogSignaturePad").dialog({
                height: dHeight,
                width: dWidth,
                maxWidth: 600,
                modal: true,
                autoOpen: false,
                fluid: true,
                position: {my: "center", at: "center", of: window, collission: "none"},
                dialogClass: "noTitleStuff myDialog",
                create: function() {
                  $(".myDialog").append(footer);
                }
              });
              $('#dialogSignaturePad').dialog('open');
              setTimeout (function(event) {
                $(".drawing-board-control-navigation-reset").click();
              }, 30);
              $(".drawing-board-canvas-wrapper").css({"width":dWidth - 20,"height":dHeight - 90});
              $(".drawing-board-canvas").css({"width":dWidth - 20,"height":dHeight - 90});
              $(".drawing-board-canvas").attr({"width":dWidth - 20,"height":dHeight - 90});
              $(window).resize(function() {
                $("#dialogSignaturePad").dialog("option", "position", {my: "center", at: "center", of: window});
              });
            } else {
              //if dialog is closed on portrait orientation change
              wWidth = $(window).width();
              dWidth = wWidth -20;
              wHeight = $(window).height();
              dHeight = wHeight - 90;
              $("#dialogSignaturePad").dialog({
                height: dHeight,
                width: dWidth,
                maxWidth: 600,
                modal: true,
                autoOpen: false,
                fluid: true,
                position: {my: "center", at: "center", of: window, collission: "none"},
                dialogClass: "noTitleStuff myDialog",
                create: function() {
                  $(".myDialog").append(footer);
                }
              });
              setTimeout (function(event) {
                $(".drawing-board-control-navigation-reset").click();
              }, 30);
              $(".drawing-board-canvas-wrapper").css({"width":dWidth - 20,"height":dHeight - 90});
              $(".drawing-board-canvas").css({"width":dWidth - 20,"height":dHeight - 90});
              $(".drawing-board-canvas").attr({"width":dWidth - 20,"height":dHeight - 90});
              $(window).resize(function() {
                $("#dialogSignaturePad").dialog("option", "position", {my: "center", at: "center", of: window});
              });
            }
          }
        }, 70);
      });
    }
    //add the name field data to the form
    appendNameFields(nameFields);
  }
}

/**
 * Textarea auto-resizer
 */
function textArea() {
  if (typeof sizeTextareas == 'function') { 
    sizeTextareas(); 
  }
}

/**
 * Records the form data appending and apply to Google Analytics
 * @param formTitle
 * @param platform
 */
function trackAppendFormData(formTitle, platform) {
  var host = window.location.host;
  if (host == "inoweform.campus.mnsu.edu" || host == "inoweformtest.campus.mnsu.edu") {
    if (ga && typeof ga === 'function' ) {
      if (platform == undefined || platform == "") {
        var isMobile = devices();
        if (isMobile.any()) {
          var platform = "Mobile";
        } else {
          var platform = "Desktop";
        }
      }
  
      if (formTitle == undefined || formTitle == "") {
        formTitle = fetchFormTitle();
      }
  
      ga('send', {
        hitType: 'event',
        eventCategory: 'Form',
        eventAction: platform + ' Form Data Append',
        eventLabel: formTitle + ' Form Data Append '
      });
    }
  }
}

/**
 * Records the form signature apply to Google Analytics
 * @param formTitle
 * @param platform
 */
function trackSignaturePad(type) {
  var host = window.location.host;
  if (host == "inoweform.campus.mnsu.edu" || host == "inoweformtest.campus.mnsu.edu") {
    if (ga && typeof ga === 'function' ) {
      var isMobile = devices();
      if (isMobile.any()) {
        var platform = "Mobile";
      } else {
        var platform = "Desktop";
      }

      formTitle = fetchFormTitle();

      if (type == "bypass") {
        var Opt = " Bypassed";
      } else {
        var Opt = " Applied";
      }

      ga('send', {
        hitType: 'event',
        eventCategory: 'Form',
        eventAction: platform + ' Signature' + Opt,
        eventLabel: formTitle + ' Signature' + Opt
      });
    }
  }
}

/**
 * Records the form save to Google Analytics
 * @param formTitle
 * @param platform
 */
function trackSubmit(formTitle, platform) {
  
  var host = window.location.host;
  if (host == "inoweform.campus.mnsu.edu" || host == "inoweformtest.campus.mnsu.edu") {
    if (ga && typeof ga === 'function' ) {
      if (platform == undefined || platform == "") {
        var isMobile = devices();
        if (isMobile.any()) {
          var platform = "Mobile";
        } else {
          var platform = "Desktop";
        }
      }

      if (formTitle == undefined || formTitle == "") {
        formTitle = fetchFormTitle();
      }

      ga('send', {
        hitType: 'event',
        eventCategory: 'Form',
        eventAction: platform + ' Submit',
        eventLabel: formTitle + ' Submit'
      });
    }
  }
}

/**
 * Runs the setup for WebNow, which is nothing!
 * @param clientType
 * @param formTitle
 */
function webNowFormSetup (clientType, formTitle) {
  //webnow gets nothing!
}