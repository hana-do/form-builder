function setSelectedItem(selectElement, hiddenElement, trashIcon) {
  var selectList = document.getElementById(selectElement);
  var newValue = selectList.options[selectList.selectedIndex].value;
  document.getElementById(hiddenElement).value = newValue;

  if (newValue) {
    // if we have a value, hide the select list, show the readonly, show the trash icon
    document.getElementById(selectElement).className = "hide";
    document.getElementById(hiddenElement).className = "show";
    document.getElementById(trashIcon).className = "show";
  }
  else {
    document.getElementById(selectElement).className = "show";
    document.getElementById(hiddenElement).className = "hide";
    document.getElementById(trashIcon).className = "hide";
  }

  updateLink(selectElement);
}

function emptyValue(selectElement, readOnlyElement, crossDiv) {
  document.getElementById(readOnlyElement).value = "";
  document.getElementById(readOnlyElement).className = "hide";

  document.getElementById(selectElement).className = "show";
  document.getElementById(selectElement).selectedIndex = 0;

  document.getElementById(crossDiv).className = "hide";
  $(".terms").remove("a");

  updateLink(selectElement);
}

function setCurrentYear(selectElementId, curValue) {
  var selectElement = document.getElementById(selectElementId);
  var date = new Date();
  var currentYear = date.getFullYear();
  var prevYear = currentYear - 3;
  selectElement.options[0] = new Option("Select", "");

  var j = 0;
  for (var i = 1, j = 0; i < 5; i++) {
    var text = (prevYear + j).toString() + " - " + (prevYear + i).toString();
    if (curValue != "") {
      selectElement.options[i] = new Option(text, text, false, true);
    }
    else {
      selectElement.options[i] = new Option(text, text, false, false);
    }
    j++;
  }
}

function updateLink(selectElement) {
  var selectList = document.getElementById(selectElement);
  var URL = selectList.options[selectList.selectedIndex].getAttribute("url");

  document.getElementById("terms").className = "hide";
  $("a").remove();
  $("#checkBox").remove();
  $("#checkBoxText").remove();

  if (URL) {
    URL = URL.replace(/(https?:\/\/[^\s]+)/g, function (link) {
      return '<p><a target="blank" href="' + link + '">' + link + '</a></p>';
    });

    document.getElementById("terms").className = "show";
    $("#terms").append(URL);
    $("#terms").append('<input id="checkBox" type="checkbox"><span id="checkBoxText"> By checking this box, I acknowledge that I have reviewed the Gainful Employment Disclosure information provided for the certificate I have chosen above.</span>');
  }
}

function validation() {
  var actionButtons = window.parent.document.getElementsByClassName("psw-forms-formActionButton");
  var saveButton = null;
  for (var i = 0; i < actionButtons.length; i++) {
    // find the save button
    if (actionButtons[i].getAttribute("onclick").search("save") > -1) {
      saveButton = actionButtons[i];
      break;
    }
  }

  saveButton.onclick = function(e) {
    if ($("#terms").hasClass("show")) {
      var checkbox = document.getElementById("checkBox");
      if (checkbox.checked) {
        //window.parent.ImageNowForms.ButtonAction.saveForm();
        runSave();
      } else {
        alert("Missing acknowledgement - This eForm cannot be submitted until you have acknowledged the Gainful Employment Disclosure Report that was presented to you for the certificate you have selected.");
      }
    } else {
      //alert("checkbox is not displayed");
      //window.parent.ImageNowForms.ButtonAction.saveForm();
      runSave();
    }
  };
}