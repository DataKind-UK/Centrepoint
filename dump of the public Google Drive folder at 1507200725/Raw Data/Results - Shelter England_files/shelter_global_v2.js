/* This file is version controlled. Do not edit here */

/* ===========================
SHELTER SITE WIDE SCRIPTS
Version: 2

1. Extensions
----------------------------
a. scrollTo
b. titleCase
c. URL encode/decode
d. cookies
e. jQuery Browser

2. Shelter functions
----------------------------
eg shelter.changeLocation(para1,para2);
a. changeLocation
b. getQueryVariable
c. AJAX search
d. Google analytics bindings
e. Advice page country information
f. Table of contents
g. Form validation
h. Address lookup
i. Twitter parser
l. Animated banner
m. Mega Menus
n. Social Network loads and binds
o. Tab Panel Box
p. Hover Tips 2011
q. ComboBox
r. Site update scripts: interim
s. Radek/Danny Carousel
t. Cookie bar
u. Lightbox Survey
v. Website Survey

3. Init global

=========================== */


// 1a. scrollTo
jQuery.fn.extend({
  scrollTo : function(speed, easing) {
    return this.each(function() {
      var targetOffset = $(this).offset().top;
      $('html,body').animate({scrollTop: targetOffset}, speed, easing);
    });
  }
}); //scrollTo


// 1b. titleCase
// Extend String object to allow Title Case
String.prototype.titleCase = function () {
  var str = "";
  var wrds = this.split(" ");
  for(keyvar in wrds) {
    str += ' ' + wrds[keyvar].substr(0,1).toUpperCase() + wrds[keyvar].substr(1,wrds[keyvar].length).toLowerCase();
  }
  return jQuery.trim(str);
}; //titleCase


// 1c. URL encode/decode - http://www.webtoolkit.info/
var Url = {
  encode : function (string) { // url encoding
    return escape(this._utf8_encode(string));
  },

  decode : function (string) { // url decoding
    return this._utf8_decode(unescape(string));
  },

  _utf8_encode : function (string) { // UTF-8 encoding
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  },

  _utf8_decode : function (utftext) { // UTF-8 decoding
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;

    while ( i < utftext.length ) {
      c = utftext.charCodeAt(i);

      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i+1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i+1);
        c3 = utftext.charCodeAt(i+2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return string;
  }
}; //URL encode/decode


// 1d. Cookies
cookie = {
  create: function(name,value,days) {

    if (days) {
      var date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      var expires = "; expires="+date.toGMTString();
    } else {
      var expires = "";
    }
    document.cookie = name+"="+value+expires+"; path=/";
  },
  read: function(name) {

    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') {
        c = c.substring(1,c.length);
      }
      if (c.indexOf(nameEQ) == 0) {
        return c.substring(nameEQ.length,c.length);
      }
    }
    return null;
  },
  erase: function(name) {
    cookie.create(name,"",-1);
  }
};

// 2. Set Shelter object and domain
var shelter = {};

// 2a. changeLocation
(function($) {
  if(typeof shelter.changeLocation == "undefined") shelter.changeLocation = {
    init:function() {
      $("#location a").click(function() {
        if ($(this).html() == "Scotland"){
          shelter.changeLocation.change('england','scotland');
        } else {
          shelter.changeLocation.change('scotland','england');
        }
      });
    },

    change:function(firstCookie, countryName){
      if(firstCookie=='england'){
        var cookieString="country" + "=" + "england"; // the begining of our cookie string
        cookieString +="; expires=01/01/1900 00:00:00";
        cookieString +="; path=/"
        document.cookie= cookieString; // final cookie string

        var cookieString="country" + "=" + "scotland";
        cookieString +="; expires=01/01/2099 00:00:00";
        cookieString +="; path=/"
        document.cookie= cookieString;
      } else{
        var cookieString="country" + "=" + "scotland";
        cookieString +="; expires=01/01/1900 00:00:00";
        cookieString +="; path=/"
        document.cookie= cookieString;

        var cookieString="country" + "=" + "england";
        cookieString +="; expires=01/01/2099 00:00:00";
        cookieString +="; path=/"
        document.cookie= cookieString;
      }
    }
  }; // end changeLocation
})(jQuery);

// 2b. getQueryVariable
if(typeof shelter.getQueryVariable == "undefined") shelter.getQueryVariable = {
  init:function(variable, defaultValue) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0; i<vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] == variable) {
        if (pair[1] != "") {
          return Url.decode(pair[1]);
        } else {
          return defaultValue;
        }
      }
    }
    return defaultValue;
  }
}; // end getQueryVariable


// 2c. AJAX search
(function($) {
    if(typeof shelter.liveSearch == "undefined") shelter.liveSearch = {

        doingAjaxSearch: false, // global indicator of whether an search is going on
        currentSearchTerm: "", // current search term to prevent same AJAX search from happening
        searchTimeout:0, // ID of current search request
        alertTimerId: 0,

        init: function() {

            $("#header").append('<div id="ajax_search_container"></div>');
            $("#ajax_search_container").html("<div id=\"search_list\"><p id=\"searching_indicator\">Searching</p></div>");
            $("#search_list").hide();

            $("#queries_searchfield_query-new").bind('keyup', function() {
                var self = shelter.liveSearch;

                // clears the future search if a keypress is made within that time
                if(self.searchTimeout != undefined) {
                    clearTimeout(self.searchTimeout);
                }

                // set doing the search in 500 milliseconds
                self.searchTimeout = setTimeout(function() {
                    self.searchTimeout = undefined;
                    shelter.liveSearch.ajaxSearch();
                    }, 200 // increase time to reduce the server load
                );
            }).focus(function() {
                shelter.liveSearch.clearField(this.id);
            }).blur(function() {
                shelter.liveSearch.restoreField(this.id);
            });

            // when the return/enter key is pressed
            $(document).keyup(function(event){
                if (event.keyCode == 27) {
                    shelter.liveSearch.closeSearchList();
                }
            });

        }, // end init

    ajaxSearch: function() {
      var search_term =  $("#queries_searchfield_query-new").val();
      var self = shelter.liveSearch;

      if (!self.doingAjaxSearch && (self.currentSearchTerm != self.search_term) && (self.search_term != "Search shelter...")) {
        if (search_term == "") {
          $("#search_list").fadeOut("medium");
        } else if (search_term.length >= 3) {
          shelter.liveSearch.doSearch();
        }
      }
    }, // end ajaxSearch

    doSearch: function() {
      $("#queries_searchfield_query-new").addClass("active_search");
      var self = shelter.liveSearch;

      self.doingAjaxSearch = true;

      $.ajax({
        type: "POST",
        url: "/ajax_search/_nocache",
        data: "?mode=results&queries_search_query=" + $("#queries_searchfield_query-new").val(),
        dataType: "html",
        timeout: 30000, // 30 second timeout
        // ifModified: true, // don't do a search if the same as last request
        success: function(htmlData){
          self.doingAjaxSearch = false;
          self.currentSearchTerm = $("#queries_searchfield_query-new").val();

          $("#search_list").html(htmlData,function(){});

          $("#ajax_search_close").bind("click", function (event) {
            shelter.liveSearch.closeSearchList();
          });
          $("#more_search_results").attr("href","/search_results?mode=results&queries_search_query=" + $("#queries_searchfield_query-new").val());
          $("#search_list").fadeIn("fast");

          $(document).bind("click.searchEvents",function(event) {
            var $clicked = $(event.target);
              if ($clicked.parents().attr("id") !== "ajax_search_container" ) {
                shelter.liveSearch.closeSearchList();
              }
          });

          $("#queries_searchfield_query-new").removeClass("active_search");

          },
        error: function(request, errorType, errorThrown) {
          self.doingAjaxSearch = false;
          $("#queries_searchfield_query-new").removeClass("active_search");
          }
      });

    }, // end doSearch

    closeSearchList: function() {

      $(document).unbind("click.searchEvents");

      $("#search_list").fadeOut("medium");
      clearTimeout(shelter.liveSearch.searchTimeout);
      $("#queries_searchfield_query-new").removeClass("active_search");
      return false;
    }, // end closeSearchList

    clearField: function(x) {
      if (document.getElementById(x).value == document.getElementById(x).defaultValue) {
        document.getElementById(x).value = "";
      }
    },

    restoreField: function(x) {
      if (document.getElementById(x).value != document.getElementById(x).defaultValue) {
        document.getElementById(x).style.color="#000000";
      } else {
        document.getElementById(x).style.color="#BEBEBE";
      }

      if (document.getElementById(x).value == "") {
        document.getElementById(x).value = document.getElementById(x).defaultValue;
        document.getElementById(x).style.color="#BEBEBE";
      }
    }

  }; // end shelter.liveSearch
})(jQuery);

// 2d. google analytics bindings
(function($) {

  $('#customForm :submit, #i_form :submit, #newForm :submit').click(function() {
  if ($(this).attr("onclick") == undefined) {
    var url = document.location.toString().split("shelter.org.uk")[1] + '/thank_you';
    _gaq.push(['_trackPageview', url]);
  }
  });
  $('#mega_menus').on('click', 'a', function() {
    var section = ($(this).closest('.mm_pannel').is('#advice_mm')) ? 'Get advice' : 'For professionals'
    _gaq.push(['_trackEvent', 'Megamenus', section, $(this).html() ]);
  });
})(jQuery);

// 2e. Advice page country information
// Hide explanation paragraph and displays a link to call it
if (typeof shelter.countryInfo == "undefined") shelter.countryInfo = {

  init: function() {
    if ($("#countryinformation #explanation") != null) {
      $("#countryinformation #explanation").css("height","0");
      $(".js-display-explanation strong").after("&nbsp;<a id='country_info_expose' href='#'>Why is this important?<\/a>");
      $("#explanation").css({ opacity: 1 });

      $('#country_info_expose').toggle(function() {
        $(this).addClass("info_exposed");
        $("#explanation").animate({
          height: "55px",
          opacity: 1
          }, 150);
      }, function(){
        $(this).removeClass("info_exposed");
        $("#explanation").animate({
          height: "0px",
          opacity: 0
        }, 150 );
      });
    }
  }

}; // end shelter.countryInfo


// 2f. Table of contents
if (typeof shelter.innerContentPageNav == "undefined") shelter.innerContentPageNav = {

  init: function () {
    var goBack = "<p class='btt'><a href='#content'>Back to top<\/a><\/p>";

    if (typeof(noParsing) == "undefined") {
      $("#bodycontent h2:first").before("<div id='page_index'><h3>Contents<\/h3><ul id='pagelist'><\/ul><\/div>");

      $("#bodycontent h2").each(function(index) {
        $(this).before("<a name='"+ index + "' id='" + index + "'><\/a>");
        $("#pagelist").append("<li><a href='#" + index + "' accesskey='"+index+"'>"+$(this).text()+"<\/a><\/li>");
      });

      $("#bodycontent h2:not(:first)").each(function(index) {
        $(this).prev().after(goBack);
      });
    }
  }
}; // end shelter.innerContentPageNav


// 2g. Form validation
/*
  // define field types
  var fieldsToCheck = {
    q39311_q1 : { type:"text", regExp:"textBox", msg:"Please fill in your first name", req:true },
  }

  shelter.inlineFormValidate.init({
    formID:"form_email_39309",
    fields: fieldsToCheck
  });
*/
if(typeof shelter.inlineFormValidate == "undefined")  shelter.inlineFormValidate = {
  // standard regexp
  regExp : {
    "textBox":"^[^\\\\\"]{1,300}$",
    "textArea": "^.{1,3000}",
    "email": "^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$",
    "postcode":"^([A-Z0-9][A-Z0-9][A-Z0-9]?[A-Z0-9]? {1,2}[0-9][A-Z]{2}|GIR 0AA)$",
    "phone":"^0[1237][\\d ]{5,18}$",
    "mobile":"^((00|\\+)44|0)7\\d{9}$",
    "dateOfBirth":"^\\d{2,}\/[01]\\d\/19\\d{2,}$",
    "amount":"^\\d{1,10}\\.?\\d{0,2}$",
    "sortcode":"^\\d{6}$",
    "accNo":"^\\d{8}$",
    "niNo":"^[a-z]{2}[0-9]{6}[A-DFM]{0,1}$",
    "url":"(http|https):\/\/[A-Za-z0-9\.-]{3,}\.[A-Za-z]{3}"
  },

  // customisable fields
  formID: "",
  formFieldPrefix: "",
  fieldsToCheck:[],
  newDonateForm: false,

  init: function(params) {
    if (typeof params.formID != "undefined") {
      this.formID = params.formID;
    }

    if (typeof params.fields != "undefined") {
      this.fieldsToCheck = params.fields;
    }
    if (typeof params.newDonateForm != "undefined") {
      this.newDonateForm = true;
    }

    // generic all form elements bind
    $("#" + this.formID + " :input, #" + this.formID + ":input:radio").blur(function() {
      shelter.inlineFormValidate.doInlineCheck($(this).attr("id"));
    });

    // opt in / out
    $("#optIn_email, #optIn_sms").click(function() {
      var fieldID = $(this).attr("id");
      var type = fieldID.substr(fieldID.indexOf("_") + 1);
      shelter.inlineFormValidate.optInOutHandler($(this).attr("id"), type + "OptIn");
    });

    // form submit - redo all checks
    $("#" + this.formID).submit(function(event) {

      $("#addressFields").show();

      $("#" + shelter.inlineFormValidate.formID + " :input, #" + shelter.inlineFormValidate.formID + ":input:radio").each(function() {
        shelter.inlineFormValidate.doInlineCheck($(this).attr("id"));
      });

      // Check for uncorrected errors
      if ($("#" + shelter.inlineFormValidate.formID + " div, #" + shelter.inlineFormValidate.formID + " li").is(".requiredError, .requiredErrorWrapper")) {
        $("#formErrors").html("<div style=\"color:#f00;\"><strong>Please correct the information in the fields below.</strong></div>");
        $("#" + shelter.inlineFormValidate.formID).find('.requiredError:first').scrollTo();
        event.preventDefault();
      } else {
         // $("#" + shelter.inlineFormValidate.formID + "_submit").val("Please wait...");
        return true;
      }
    });
  },

  doInlineCheck: function(fieldID) {
    if (typeof this.fieldsToCheck[fieldID] != "undefined") {
      var fieldProperties = this.fieldsToCheck[fieldID];

      switch (fieldProperties.type) {
        case "text":
          var country = typeof fieldProperties.country != "undefined" ?  fieldProperties.country : "";
          if (fieldProperties.regExp == "postcode" && country != "") {
            if ($("#" + country + " option:selected").val() == "gb") {
              shelter.inlineFormValidate.checkField(fieldID, this.regExp[fieldProperties.regExp], fieldProperties.msg, fieldProperties.req);
            } else {
              shelter.inlineFormValidate.displayMsg(fieldID, "#" + fieldID, "", false);
            }
          } else {
            shelter.inlineFormValidate.checkField(fieldID, this.regExp[fieldProperties.regExp], fieldProperties.msg, fieldProperties.req);
          }
          break;
        case "dropdown":
          shelter.inlineFormValidate.checkDropDown(fieldID, fieldProperties.emptyValue, fieldProperties.msg, fieldProperties.req);
          break;
        case "radio":
          shelter.inlineFormValidate.checkRadioSelect(fieldID, fieldProperties.msg);
          break;
        case "dob": // has a weird id that would require using eval - BAD
          shelter.inlineFormValidate.checkDOB(fieldProperties.day, fieldProperties.month, fieldProperties.year, fieldProperties.minAge, fieldProperties.req, "");
          break;
        case "date":
          shelter.inlineFormValidate.checkDOB(fieldProperties.day, fieldProperties.month, fieldProperties.year, fieldProperties.minAge, fieldProperties.req, fieldProperties.msg);
          break;
        case "title":
          shelter.inlineFormValidate.checkTitle(fieldID, fieldProperties.titleOther);
          break;
        case "checkbox":
          shelter.inlineFormValidate.checkCheckConfirm(fieldID, fieldProperties.msg);
          break;
        case "confirmEmail":
          shelter.inlineFormValidate.checkField(fieldID, this.regExp["email"], fieldProperties.msg, fieldProperties.req);
          shelter.inlineFormValidate.checkEmailConfirm(fieldProperties.emailID, fieldID);
          break;
        case "creditcard":
          shelter.inlineFormValidate.checkCardNumberField(fieldID, fieldProperties.msg, fieldProperties.req);
          break;
      }
    }
  },  // end doInlineCheck

  displayMsg: function(field, fieldID, msg, show) {

    //New donation form 2011 (id: 377592), added by Danny Pritchard.
    //Any questions, ask me.
    if (shelter.inlineFormValidate.newDonateForm == true) {
      if (show) {
        $(fieldID).parent().addClass("requiredError");
        if ($("#" + field + "_reqMsg").length > 0) {
          $("#" + field + "_reqMsg").show();
        } else {
          $(fieldID).after("<div id=\"" +  field + "_reqMsg\" class=\"requiredMsg\"><div class=\"requiredMsgArrow\"></div><div class=\"requiredMsgText\">" + msg + "</div>")
        }
      } else {
        $(fieldID).parent().removeClass("requiredError");
        $("#" + field + "_reqMsg").hide();
      }
    }

    else {
      if (show) {
        $(fieldID).parent().removeClass("requiredOkay").addClass("requiredError");
        if ($("#" + field + "_reqMsg").length > 0) {
          $("#" + field + "_reqMsg").show();
        } else {
          $(fieldID).after("<div id=\"" +  field + "_reqMsg\" class=\"requiredMsg\">" + msg + "</div>")
        }
      } else {
        $(fieldID).parent().removeClass("requiredError requiredOkay");
        $("#" + field + "_reqMsg").hide();
      }
    }

  }, // end displayMsg


  /**
   * Checks for valid input based on reg expression
   *
   * field - The id of the field
   * regExCheck - regular expression to check against
   * message - message to display if it doesn't pass a check
   * required - 1/0 Whether the field is required, ie if you can have a blank value in it
   */
  checkField: function (field, regExCheck, message, required) {
    var regExLine = new RegExp(regExCheck, "i");
    var fieldID = "#" + field;
    var fieldVal = jQuery.trim($(fieldID).val());

    if(regExCheck==this.regExp["postcode"]) {
      var cleanRX = /^([A-Z]{1,2}[0-9]{1,2}[A-Z]?) {0,1}([0-9]{1}[A-Z]{2})$/;
      fieldVal = fieldVal.toUpperCase();
      fieldVal = fieldVal.replace(cleanRX,"$1 $2");
    }

    if((regExCheck==this.regExp["phone"]) || (regExCheck==this.regExp["mobile"])) {
      var stripSpace = / /g;
      fieldVal = fieldVal.replace(stripSpace,"");
    }

    if (regExLine.test(fieldVal)) {
      if (fieldVal != "" || (fieldVal == "" && required == 1)) {
        $(fieldID).parent().removeClass("requiredError").addClass("requiredOkay");
      } else {
        $(fieldID).parent().removeClass("requiredError requiredOkay");
      }
      if ($(fieldID + "_reqMsg").length > 0) {
        $(fieldID + "_reqMsg").hide();
      }
    } else {
      if (fieldVal != "" || (fieldVal == "" && required == 1)) {
        shelter.inlineFormValidate.displayMsg(field, fieldID, message, true);
      } else {
        shelter.inlineFormValidate.displayMsg(field, fieldID, message, false);
      }
    }

    // replace value with whitespace trimmed version
    $(fieldID).val(fieldVal);
  }, // checkField

  /**
   * Check for a valid selection in a drop down
   * field - dropdown box select id
   * emptyValue - value to check against
   * message - message to display if it doesn't pass a check
   * required - 1/0 Whether the field is required, ie if you can have a blank value in it
   */
  checkDropDown: function (field, emptyValue, message, required) {
    var fieldID = "#" + field;
    var fieldVal = $(fieldID + " option:selected").val();

    if (fieldVal != emptyValue) {
      if (fieldVal != "" || (fieldVal == "" && required == 1)) {
        $(fieldID).parent().removeClass("requiredError").addClass("requiredOkay");
      } else {
        $(fieldID).parent().removeClass("requiredError requiredOkay");
      }
      if ($(fieldID + "_reqMsg").length > 0) {
        $(fieldID + "_reqMsg").hide();
      }
    } else {
      if (fieldVal != "" || (fieldVal == "" && required == 1)) {
        shelter.inlineFormValidate.displayMsg(field, fieldID, message, true);
      }
    }
  }, // end checkDropDown

  checkExpiryDateField: function (monthField, yearField, regExCheckMonth, regExCheckYear, message, required) {
    var regExLineMonth = new RegExp(regExCheckMonth, "i");
    var regExLineYear = new RegExp(regExCheckYear, "i");

    var fieldID = "#" + yearField;
    var monthFieldVal = jQuery.trim($("#" + monthField).val());
    var yearFieldVal = jQuery.trim($("#" + yearField).val());

    if (regExLineMonth.test(monthFieldVal) && regExLineYear.test(yearFieldVal)) {
      if ((monthFieldVal != "" && yearFieldVal != "") || (monthFieldVal == "" && yearFieldVal == "" && required == 1)) {
        $(fieldID).parent().removeClass("requiredError").addClass("requiredOkay");
      } else {
        $(fieldID).parent().removeClass("requiredError requiredOkay");
      }
      if ($(fieldID + "_reqMsg").length > 0) {
        $(fieldID + "_reqMsg").hide();
      }
    } else {
      if ((monthFieldVal != "" || yearFieldVal != "") || (monthFieldVal == ""  && yearFieldVal == "" && required == 1)) {
        shelter.inlineFormValidate.displayMsg(yearField, fieldID, message, true);
      }
    }
  }, // checkExpiryDateField

  /**
   * Basic credit card number check using Luhn algorithm
   * Strips out the white space and letters
   * Does not do a check for proper issuers prefix
   **/
  checkCardNumberField: function (field, message, required) {
    var fieldID = "#" + field;
    var fieldVal = jQuery.trim($(fieldID).val());

    // Strip any non-digits (useful for credit card numbers with spaces and hyphens)
    fieldVal = fieldVal.replace(/\D/g, '');

    if (fieldVal.length <= 19) {
      // Set the string length and parity
      var number_length = fieldVal.length;
      var parity = number_length % 2;

      // Loop through each digit and do the maths
      var total=0;
      for (i=0; i < number_length; i++) {
        var digit = fieldVal.charAt(i);
        // Multiply alternate digits by two
        if (i % 2 == parity) {
          digit=digit * 2;
          // If the sum is two digits, add them together (in effect)
          if (digit > 9) {
            digit=digit - 9;
          }
        }
        // Total up the digits
        total = total + parseInt(digit);
      }
    }

    // If the total mod 10 equals 0, the number is valid
    if (total % 10 == 0 && fieldVal.length >= 12 && fieldVal.length <= 19) {
      if (fieldVal != "" || (fieldVal == "" && required == 0)) {
        $(fieldID).parent().removeClass("requiredError").addClass("requiredOkay");

        shelter.inlineFormValidate.displayMsg(field, fieldID, "", false);
      } else {
        $(fieldID).parent().removeClass("requiredError requiredOkay");
      }
      if ($(fieldID + "_reqMsg").length > 0) {
        $(fieldID + "_reqMsg").hide();
      }
    } else {
      if (fieldVal != "" || (fieldVal == "" && required == 1)) {
        shelter.inlineFormValidate.displayMsg(field, fieldID, message, true);
      }
    }

    $(fieldID).val(fieldVal);
  }, // end checkCardNumberField

  /*
   * Check for valid DOB when using 3 drop downs, optional over 18 check
   * day, month, year - ids of the fields
   * over18 - true/false
   */
  checkDOB:function (day, month, year, minAge, required, msg) {
    var selectedDay = $(day + " option:selected").text();
    var selectedMonth = $(month + " option:selected").text();
    var selectedYear = $(year + " option:selected").text();

    var today = new Date().getTime();
    var DOB = new Date(selectedYear, $(month + " option:selected").val() - 1, selectedDay).getTime();
    var yearsToDate = (today - DOB)/(1000*60*60*24*365);

    wrapperID = year;

    if ((selectedDay == "" || selectedMonth == "" || selectedYear == "")) {
      if ((selectedDay != "" || selectedMonth != "" || selectedYear != "")|| (selectedDay == "" && selectedMonth == "" && selectedYear == "" && required)) {

        var customMsg = (typeof msg != "undefined" && msg != "") ? msg : "Please enter a valid date of birth";

        $(wrapperID).parent().removeClass("requiredOkay").addClass("requiredError");
        if ($("#dob_reqMsg").length > 0) {
          $("#dob_reqMsg").show();
        } else {
          $(wrapperID).after("<div id=\"dob_reqMsg\" class=\"requiredMsg\">" +  customMsg + "</div>");
        }
      } else {
        if ($("#dob_reqMsg").length > 0) {
          $(wrapperID).parent().removeClass("requiredError");
          if (selectedDay != "" || selectedMonth != "" || selectedYear != "") {
            $(wrapperID).parent().addClass("requiredOkay");
          } else {
            $(wrapperID).parent().removeClass("requiredOkay");
          }
          $("#dob_reqMsg").hide();
        }
      }
    } else {
      if (typeof minAge == "number" && minAge != 0 && (yearsToDate < minAge)) {
        $(wrapperID).parent().removeClass("requiredOkay").addClass("requiredError");
        if ($("#dob_youngMsg").length > 0) {
          $("#dob_youngMsg").show();
        } else {
          $(wrapperID).after("<div id=\"dob_youngMsg\" class=\"requiredMsg\">You must be " + minAge +" or over</div>");
        }
        $("#dob_reqMsg").hide();
      } else {
        if (yearsToDate >= minAge) {
          $(wrapperID).parent().addClass("requiredOkay");
        } else {
          $(wrapperID).parent().removeClass("requiredOkay");
        }
        $(wrapperID).parent().removeClass("requiredError");
        $("#dob_youngMsg").hide();
        $("#dob_reqMsg").hide();
      }
    }
  }, // checkDOB

  /*
   * Check that title has been selected, show/hide 'other' textbox as required
   * title, titleOther - ids of the fields
   * Other field value should be "Other"
   * 'Please select' option field should be " "
   */
  checkTitle: function(title, titleOther) {
    var titleField = $("#" + title);
    var titleOtherField = $("#" + titleOther);
    var titleErrorMsg = $("#" + title + "_reqMsg");
    var titleOtherErrorMsg = $("#" + titleOther + "_reqMsg");

    if (titleField.val() != " ") {
      titleField.parent().addClass("requiredOkay").removeClass("requiredError");
      titleErrorMsg.hide();

      if (titleField.val() == "Other") {
        titleOtherField.removeAttr("disabled");
        if (titleOtherField.val() == "") {
          titleOtherField.focus();
        }
      } else {
        titleOtherField.parent().removeClass("requiredOkay requiredError");
        titleOtherField.val("");
        titleOtherField.attr("disabled", "disabled");
        titleOtherErrorMsg.hide();
      }
      $("#" + title + "_reqMsg").hide();
    } else {
      shelter.inlineFormValidate.displayMsg(title, "#" + title, "Please select a title", true);
    }
  }, // end checkTitle

  //-- Check emails match
  checkEmailConfirm: function(email1, email2) {
    var emailField = $("#" + email1);
    var emailConfirmField = $("#" + email2);
    var emailConfirmErrorMsg = $("#" + email2 + "_email_reqMsg");

    if (emailField.val() != emailConfirmField.val()) {
      shelter.inlineFormValidate.displayMsg(email2 + "_email", "#" + email2, "Your email addresses don't match", true);
    } else {
      emailConfirmErrorMsg.hide();
    }
  }, // end checkEmailConfirm

  //-- Check a check box has been checked
  checkCheckConfirm: function (fieldID, message) {
    var checkBoxField =  $("#" + fieldID);
    var errorMsg = $("#" + fieldID + "_reqMsg");

    if (checkBoxField.attr("checked") == "" || checkBoxField.attr("checked") == undefined) {
      shelter.inlineFormValidate.displayMsg(fieldID, "#" + fieldID, message, true);
      return false;
    } else {
      shelter.inlineFormValidate.displayMsg(fieldID, "#" + fieldID, message, false);
      return true;
    }
  }, // end checkCheckConfirm

  //-- Check that at least one radio has been selected
  checkRadioSelect: function(fieldID, message) {
    var groupFieldID = fieldID.substr(0, fieldID.lastIndexOf("_"));
    var fieldName = groupFieldID.replace("_", ":");
    var field = $("#" + fieldID + "");

    var radioField = $("[name='" + fieldName + "']:checked");
    var errorMsg = $("#" + groupFieldID + "_reqMsg");

    if (radioField.length == 0) {
      $("input[name='" + fieldName + "']:last").parent().addClass("requiredError").removeClass("requiredOkay");
      if (errorMsg.length > 0) {
        errorMsg.show();
      } else {
        if (shelter.inlineFormValidate.newDonateForm == true) {
          $("input[name='" + fieldName + "']:last").parent().append("<div id=\"" +  groupFieldID + "_reqMsg\" class=\"requiredMsg\"><div class=\"requiredMsgArrow\"></div><div class=\"requiredMsgText\">" + message + "</div>");
        }
        else {
          $("input[name='" + fieldName + "']:last").parent().append("<div id=\"" + groupFieldID + "_reqMsg\" class=\"requiredMsg\">" + message + "</div>");
        }
      }
    } else {
      $("input[name='" + fieldName + "']:last").parent().removeClass("requiredError").addClass("requiredOkay");
      if (errorMsg.length > 0) {
        errorMsg.hide();
      }
    }
  }, // end checkRadioSelect

  // optin / out
  optInOutHandler: function(checkBox, hiddenField) {
    if ($("#" + checkBox).attr("checked")) {
      $("#" + hiddenField).val(0);
    } else {
      $("#" + hiddenField).val(1);
    }
  } // end optInOutHandler

}; // end inlineFomValidate object


if (typeof shelter.bankwizard == "undefined") shelter.bankwizard = {
  // for bank wizard
  branchdetails: {},
  bankvalid: true,

  // Checks the bank details are valid, function checkForm must exist for finishing the checking.
  check: function(accNo, sortCode, functionToCall) {
    var bankwizardreached = function(json) {
      if (!json.validated) {
        // errorMessage = "<li>Bank details are invalid, please check account number and sort code</li>";
        shelter.bankwizard.bankvalid = false;
      }
      if (json.branchdetails) {
        shelter.bankwizard.bankvalid = true;
        errorMessage = "";
        shelter.bankwizard.branchdetails = json.branchdetails;

        $("#step3 span#bankName_answer").html(shelter.bankwizard.branchdetails.bankname);
      }
      if (typeof functionToCall == "function") {
        functionToCall(); // rest of checking
      }
    };

    // unable to connect with the bank wizard system
    var bankwizardfailed = function() {
      if (typeof functionToCall == "function") {
        functionToCall(); // rest of checking
      }
    };

    $.ajax({
      url: "/bankwizard/check.php?sc=" + sortCode + "&an=" + accNo,
      dataType: "json",
      success: bankwizardreached,
      error: bankwizardfailed
    });
  } // end checkBankDetails
};


// 2h. Address lookup
/**
 * Look for address that match house number / name
 *
 * Usage:
    shelter.addressLookUp.init({
        addressLines:["line1","line2", "line3", "town", "county", "postcode"]
    });
 * Override callback updating this parameter with the function name to call - addressLookUp.callback
 **/
(function ($) {
    if (typeof shelter.addressLookUp == "undefined") shelter.addressLookUp = {
        query_key: encodeURIComponent( "CM81-AP69-BD21-JK75" ),
        query_username: encodeURIComponent( "SHELT11120" ),
        updateLabels: true,
        addressLines: [],
        addresses: null,
        lookupValue: "",
        messageID: "addressLookUpMsg",
        callback: "shelter.addressLookUp.finishedLookUp",
        noAddressMsg: "Sorry no addresses found, please try again or enter your address below",
        submitButtonID: "lookupsubmit",
        inputPostcodeID: "#lookup_postcode",
        inputHouseNoID: "#lookup_house_no",
        objectToAppendTo: "#lookup_postcode",
        addressFieldsWrapper: "#addressFields",

        init: function (parameters) {
            if (typeof parameters.updateLabels != "undefined") {
                this.updateLabels = parameters.updateLabels;
            }

            if (typeof parameters.addressLines != "undefined") {
                this.addressLines = parameters.addressLines;
            }

            if (typeof parameters.objectToAppendTo != "undefined") {
                this.objectToAppendTo = parameters.objectToAppendTo;
            }

            // initial hide sections
            $(this.addressFieldsWrapper).hide();
            $("#addressLookup").show();
            this.updateAddressLabels();

            // Add check functions for postcode lookup
            $("#" + this.submitButtonID).bind("click", $("#lookup_postcode"), function (e) {
                shelter.addressLookUp.clearAddressErrors();
                shelter.addressLookUp.PostcodeAnywhere_getAddressList();
            });

            // manually enter address
            $("#enterAddress").click(function (event) {
                $("#enterAddressLink").hide();
                $("#addressLookup").slideUp(500);
                $(shelter.addressLookUp.addressFieldsWrapper).slideDown(500);
                if ($("#addressesHolder").length > 0) {
                    $("#addressesHolder").hide()
                }
                event.preventDefault()
            });

            $("#addressLookup input").keydown(function (event) {
                if (event.keyCode == 13) {
                    $("#lookupsubmit").trigger("click");
                    return false
                }
            })
        }, // end init


        // update the address labels
        updateAddressLabels: function () {
            $("label[for='" + this.addressLines[0] + "']").html("Address");
            $("label[for='" + this.addressLines[1] + "'], label[for='" + this.addressLines[2] + "']").hide()
        },

        displayMessage: function (message) {
            if ($("#" + this.messageID + " span").length > 0) {
                $("#" + this.messageID + " span").html(message)
            } else {
                message = '<div id="' + this.messageID + '"><span>' + message + "</span></div>";
                $(this.objectToAppendTo).parent().append(message)
            }
        }, // end displayMessage

        clearAddressErrors: function () {
            for (line in this.addressLines) {
                $("#" + this.addressLines[line]).parent().removeClass("requiredError");
                $("#" + this.addressLines[line] + "_reqMsg").hide()
            }
            this.displayMessage("")
        }, // end clearAddressErrors

        // Retrieve a list of IDs and partial addresses from PCA using the PostalCode
        PostcodeAnywhere_getAddressList: function() {
            var script        = document.createElement("script"),
                head          = document.getElementsByTagName("head")[0],
                url           = "https://services.postcodeanywhere.co.uk/PostcodeAnywhere/Interactive/FindByPostcode/v1.00/json2.ws?",
                inputPostcode = jQuery.trim( $( this.inputPostcodeID ).val() );

            // Build the query string
            url += "&Key="      + shelter.addressLookUp.query_key;
            url += "&Postcode=" + encodeURIComponent( inputPostcode );
            url += "&UserName=" + shelter.addressLookUp.query_username;
            url += "&CallbackFunction=shelter.addressLookUp.PostcodeAnywhere_getAddressList_callback";

            script.src = url;

            // Make the request
            script.onload = script.onreadystatechange = function () {
                if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                    script.onload = script.onreadystatechange = null;
                    if (head && script.parentNode)
                        head.removeChild(script);
                }
            }

            head.insertBefore(script, head.firstChild);
        }, // end PostcodeAnywhere_getAddressList

        // When our JSON request to find the list has returned, Display them on the page
        PostcodeAnywhere_getAddressList_callback: function(response) {
            // Test for an error
            if (response.length == 1 && typeof(response[0].Error) != "undefined")
            {
                // Show the error message
                alert(response[0].Description);
            }
            else
            {
                // Check if there were any items found
                if (response.length == 0)
                {
                    this.displayMessage(shelter.addressLookUp.noAddressMsg);
                }
                else if( response.length == 1 )
                {
                    shelter.addressLookUp.PostcodeAnywhere_getAddressById( response[0].Id );
                    this.displayMessage("Please check the address found");
                }
                else
                {
                    this.addresses = response;
                    this.displayList();
                }
            }
        }, // end PostcodeAnywhere_getAddressList_callback

        // Using the chosen Address, use the ID to find the full address from PCA
        PostcodeAnywhere_getAddressById: function( Id ) {
            var script = document.createElement("script"),
                head = document.getElementsByTagName("head")[0],
                url = "https://services.postcodeanywhere.co.uk/PostcodeAnywhere/Interactive/RetrieveById/v1.30/json2.ws?";

            // Build the query string
            url += "&Key="               + shelter.addressLookUp.query_key;
            url += "&UserName="          + shelter.addressLookUp.query_username;
            url += "&Id="                + encodeURIComponent(Id);
            url += "&CallbackFunction=shelter.addressLookUp.PostcodeAnywhere_getAddressById_Callback";

            script.src = url;

            // Make the request
            script.onload = script.onreadystatechange = function () {
                if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                    script.onload = script.onreadystatechange = null;
                    if (head && script.parentNode)
                        head.removeChild(script);
                }
            }

            head.insertBefore(script, head.firstChild);
        }, // end PostcodeAnywhere_getAddressById

        // After our JSON Request for the full address from PCA, fill it in
        PostcodeAnywhere_getAddressById_Callback: function(response) {
            // Test for an error
            if (response.length == 1 && typeof(response[0].Error) != "undefined")
            {
                $(shelter.addressLookUp.inputPostcodeID).removeClass("ac_loading");
                shelter.addressLookUp.displayMessage(this.noAddressMsg);
            }
            else
            {
                // Check if there were any items found
                if (response.length == 0)
                {
                    this.displayMessage(shelter.addressLookUp.noAddressMsg);
                }
                else
                {
                    response = response[0];

                    $("#" + this.addressLines[0]).val( response.Line1 );
                    $("#" + this.addressLines[1]).val( response.Line2 );
                    $("#" + this.addressLines[2]).val( response.Line3 );

                    $("#" + this.addressLines[3]).val( response.PostTown );
                    $("#" + this.addressLines[4]).val( response.County );

                    // No matter what happens, Insert the Post Code.
                    $("#" + this.addressLines[5]).val( response.Postcode );
                }

                this.doCallback();
            }
        }, // end PostcodeAnywhere_getAddressById_Callback

        displayList: function () {
            var addressListHTML = '<option>Please Select One</option>';

            // Loop through the addresses and creation an option List out of them.
            for (var i = this.addresses.length - 1; i >= 0; i--) {
                addressListHTML += "<option value='" + this.addresses[i].Id + "'>" + this.addresses[i].StreetAddress + "</option>";
            };

            // Wrap that in a select tag
            addressListHTML = "<select name='address_selection' class='donateTextBox detailsTextBox detailsTextBoxLong'>" + addressListHTML + "</select>";

            // if a select already exists, remove it.
            if( $('select[name="address_selection"]').length > 0 )
            {
                $('select[name="address_selection"]').remove();
            }

            // Append that to the DOM
             $(this.objectToAppendTo).parent().after(addressListHTML);

             $('select[name="address_selection"]').change(function(e){
                if( $(this).val() == '' )
                {
                    e.preventDefault();
                    return;
                }

                var addressId = $(this).val();
                $(this).remove();

                shelter.addressLookUp.PostcodeAnywhere_getAddressById( addressId );
             });
        }, // end displayList

        insertAddress: function (value) {
            var parts = value.split(",");
            addressParts = parts.length;
            if (addressParts > 0 && this.addressLines != null) {
                for (x in this.addressLines) {
                    $("#" + this.addressLines[x]).val("")
                }
                pcCityParts = jQuery.trim(parts[addressParts - 1]).split(" ");
                pc = pcCityParts[pcCityParts.length - 2] + " " + pcCityParts[pcCityParts.length - 1];
                city = pcCityParts[0].titleCase();
                if (pcCityParts.length > 2) {
                    for (i = 1; i < pcCityParts.length - 2; i++) {
                        city += " " + pcCityParts[i].titleCase()
                    }
                }
                $("#" + this.addressLines[0]).val(jQuery.trim(parts[0]));
                if (parts[1] != undefined && addressParts >= 3) {
                    $("#" + this.addressLines[1]).val(jQuery.trim(parts[1]))
                }
                if (parts[2] != undefined && addressParts >= 4) {
                    $("#" + this.addressLines[2]).val(jQuery.trim(parts[2].titleCase()))
                }
                if (parts[3] != undefined && addressParts == 5) {
                    $("#" + this.addressLines[3]).val(jQuery.trim(parts[3].titleCase()));
                    $("#" + this.addressLines[4]).val(city)
                } else {
                    if (addressParts > 1) {
                        $("#" + this.addressLines[3]).val(city)
                    }
                }
                $("#" + this.addressLines[5]).val(pc);
                this.doCallback()
            }
        },
        doCallback: function () {
            if (this.callback != null) {
                eval("" + this.callback + "()")
            }
        },
        finishedLookUp: function () {
            $("#enterAddressLink").hide();
            $(this.addressFieldsWrapper).slideDown(500);
            if ($("#enterAddressLink").parent().is(".detailsQuestionWrapper")) {
                $("#enterAddressLink").parent().hide()
            }
        }
    }
})(jQuery);

// 2i. Twitter
if (typeof shelter.twitterParser == "undefined") shelter.twitterParser = {
  init:function() {
    var URLRegExp = /(https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?)/gi;
    var twitTagsRegExp = /((^|\s)[#|@](\w+))/g;

    // process the tweets for links
    $(".tweet").each(function() {
      var tweetLine = $(this).html();
      // remove the 'Shelter:' prefix
      tweetLine = tweetLine.replace(/Shelter: /i, "");
      // add links to the URLs
      tweetLine = tweetLine.replace(URLRegExp, "<a href=\"$1\">$1</a>");
      // bold the twitter tags
      tweetLine = tweetLine.replace(twitTagsRegExp, "<strong>$1</strong>")
//      if (tweetLine.charAt(8) != '@') {
        $(this).html(tweetLine);
//      } else { $(this).remove(); }
    });
  }
};

// 2j. In content JS execution
function doContentJS() {
  if (typeof contentInit == "function") {
    contentInit();
  }
};

// 2k. Bind onload events
function addWindowBind(functionName) {
  if (typeof functionName == "function") {
    if (window.addEventListener){ // compliant
      window.addEventListener("load", functionName, false);
    } else if (window.attachEvent){ // IE support
      window.attachEvent("onload", functionName);
    }
  }
};

// 2l. Create animated banner. Pass in the target div, an array of urls to load other panels from, and a delay
(function($) {
if (typeof shelter.animated_banner == "undefined") shelter.animated_banner = {

  containerDiv: "",
  extraScreens: [],
  panelTime: 3000,
  current_panel:0,
  next_panel:1,
  c:0,
  bannerTimer:null,

  init:function(parameters) {

    if (typeof parameters.containerDiv != "undefined") {
      this.containerDiv = parameters.containerDiv;
    }

    if (typeof parameters.extraScreens != "undefined") {
      this.extraScreens = parameters.extraScreens;
    }
    if (typeof parameters.panelTime != "undefined") {
      this.panelTime = parameters.panelTime;
    }

    $("#" + this.containerDiv + " .banner_panel").attr("rel","panel_0");
    shelter.animated_banner.get_data();
  },

  get_data:function() {

    var count = this.c;
    var container = this.containerDiv;
    var urlToLoad = this.extraScreens[count];
    var arrayLength = this.extraScreens.length-1;
    var newpanel = "";

    $.ajax({
        url: urlToLoad,
        success: function(data){
          $("#" + container).append(data);
          $("#" + container + " div:last-child").attr("rel","panel_" + (count+1)).hide();
          //Cufon.replace("#" + container + " div[rel$='panel_" + (count+1) + "'] .cufon_text");

          if (count == arrayLength)
          {
            $("#" + container + " .banner_panel").each(function(){
              $(this).css({"position":"absolute","top":"0","left":"0"});
            });
            shelter.animated_banner.start_animation();
            shelter.animated_banner.stopStartRotate();
          } else {

            shelter.animated_banner.incrementCount();
            shelter.animated_banner.get_data();
          }
        }
      });
  },

  stopStartRotate:function()
  {
    $("#" +  this.containerDiv).mouseenter(function(){
      shelter.animated_banner.stop_animation();
    });

    $("#" +  this.containerDiv).mouseleave(function(){
      shelter.animated_banner.restart_animation();
    });
  },

  stop_animation:function()
  {
    clearTimeout(this.bannerTimer);
  },

  incrementCount:function()
  {
    this.c++;
  },

  start_animation:function()
  {
    if (this.current_panel == this.extraScreens.length)
    {
      this.next_panel = 0;
    } else {
      this.next_panel = this.current_panel + 1;
    }
    this.bannerTimer = setTimeout(function(){shelter.animated_banner.show_next_panel(this.current_panel,this.next_panel);}, this.panelTime);
  },

  restart_animation:function()
  {
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(function(){shelter.animated_banner.show_next_panel(this.current_panel,this.next_panel);}, this.panelTime);
  },


  show_next_panel:function()
  {
    clearTimeout(this.bannerTimer);
    $("#" + this.containerDiv + " div[rel$='panel_" + this.next_panel + "']").fadeIn();
    $("#" + this.containerDiv + " div[rel$='panel_" + this.current_panel + "']").fadeOut();

    this.current_panel = this.next_panel;

    shelter.animated_banner.start_animation();
  }

};
})(jQuery);


//2m. Mega menus
(function($) {
  shelter.megaMenu = function () {

    var tabId = tabId;
    var menuTimer = 0;
    var theTab = "";
    var theTabLink = "";
    var thePadding = "";
    var fadeInSpeed = 300;
    var fadeOutSpeed = 400;

    var _this = "";

    this.init = function(tabId,menuContent) {
      _this = this;

      theTab = $("#" + tabId);
      thePadding = $("#" + menuContent);
      $(theTab).append(thePadding);
      theTabLink = $("#" + tabId + " .main_nav_tab_link");
      $(theTabLink).addClass("drop_tab_link");

      $(theTab).addClass("drop_tab").bind("mouseover.menuEvents", showMegaMenu).bind("mouseleave.menuEvents", hideMegaMenu);
      $(theTab).attr("data-status",0);


    };

    var showMegaMenu = function() {
      clearTimeout(_this.menuTimer);
      if ($(theTab).attr("data-status") !== 1) {
        $(theTab).attr("data-status",1);
        _this.menuTimer = setTimeout(doShow,300);
      }
    };


    var doShow = function() {
      $(theTab).unbind("mouseover.menuEvents").unbind("mouseleave.menuEvents");
      $(thePadding).fadeIn("fast",function(){
        $(thePadding).css("z-index","600");
        $(theTab).attr("data-status",1);
        rebindMouseover(theTab);
        $(document).bind("click.menuEvents", function(e) {
          clickToClose(e);
        }).bind("keyup.menuEvents",function(e) {
          escapeToClose(e);
        });
      });
      $(theTabLink).addClass("drop_tab_link_active");
      $(theTab).addClass("drop_tab_active");
    };

    var rebindMouseover = function () {
      $(theTab).bind("mouseover.menuEvents",showMegaMenu).bind("mouseleave.menuEvents",hideMegaMenu);
      $("#indicator").css("background","green");
    };

    var hideMegaMenu = function () {
      clearTimeout(_this.menuTimer);
      if ($(theTab).attr("data-status") !== 0) {
        $(theTab).attr("data-status",0);
        _this.menuTimer = setTimeout(doHide,fadeOutSpeed);
      }
    };

    var hideNow = function () {
      clearTimeout(_this.menuTimer);
      doHide();
      $(theTab).attr("data-status",0);
    };

    var doHide = function () {
      $(theTab).unbind("mouseover.menuEvents").unbind("mouseleave.menuEvents");
      $(thePadding).fadeOut("fast",function(){
        $(theTab).attr("data-status",0);
        rebindMouseover(theTab);
        $(document).unbind("keyup.menuEvents").unbind("click.menuEvents");
      });
      $(theTabLink).removeClass("drop_tab_link_active");
      $(theTab).removeClass("drop_tab_active");
    };

    var clickToClose = function (e) {
      var $clicked = $(e.target);
      if (! $clicked.parents().hasClass("mm_pannel_padding")) {
        hideNow();
      }
    };

    var escapeToClose = function (e) {
      if (e.keyCode == 27) {
        hideNow();
      }
    };


  }; // end shelter.Megamenu
})(jQuery);

// 2n. Social Network loads and binds
(function($) {
  shelter.social = {
    loadAPIs: function() {

      if ($("#fb-root").length == 0) { //Check whether or not fb-root exists

        $('#container').prepend("<div id='fb-root'></div>"); //Add fb-root div to start of container
        
        window.fbAsyncInit = function() {
          FB.init({
            appId: '133258046713938',
            status: true,   // check login status
            cookie: true,   // enable cookies to allow the server to access the session
            xfbml: true,  // parse XFBML
            oauth : true,   // use oauth
            channelUrl: "//" + document.domain + "/channel.html"
          });
        };

        (function(d, s, id) {
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s); js.id = id;
          js.src = "//connect.facebook.net/en_GB/all.js#xfbml=1&appId=133258046713938";
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

      }

      //Google Plus
      (function() {
        var po = document.createElement('script');
        po.type = 'text/javascript';
        po.async = true;
        po.src = 'https://apis.google.com/js/plusone.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
      })();

    },
    fbButtons: function(options) {
      //Jump out if IE6 or less -- not dsupported by FB API.
      if ($.browser.msie && parseInt($.browser.version) <= 6)
        return;

      $(options.button).on('click', function(event) {
        event.preventDefault();
        FB.ui({
          method: 'stream.publish',
          display: 'popup',
          message: options.message,
          attachment: {
            name: options.title,
            description: options.message,
            href: options.link,
            media: [
              {
                type: 'image',
                src: options.image,
                href: options.link
              }
            ]

          },
          action_links: [
            { text: options.title, href: options.link }
          ]
        });
        _gaq.push(['_trackSocial', 'facebook', 'share']);
      });
    },
    twButtons: function(options) {
      $(options.button).on('click', function(event) {
        event.preventDefault();
        window.open('https://twitter.com/intent/tweet?url=' + options.link + '&text=' + options.message, 'twitterwindow', 'height=450, width=550, top='+($(window).height()/2 - 225) +', left='+$(window).width()/2 +', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
        _gaq.push(['_trackSocial', 'twitter', 'share']);
      });
    }
  }
})(jQuery);

// 2o. Tab panel box

(function($) {
  shelter.makeTabPanelBox = {

    init: function() {

      function fillButtons() {
        for (j=1; j<4; j++) {
          var list = '#tabPanelContent div:nth-child(' + j + ') h3'
          var tab = '#tabPanelLeft-' + j
          var data = $(list).html();
          $(tab).append(data);
        }
      }

      function fillPanels() {

        for (j=1; j<4; j++) {
          var list = '#tabPanelContent div:nth-child(' + j + ') ul'
          var tab = '#tabPanelRight-' + j
          var data = '<ul>' + $(list).html() + '</ul>';
          $(tab).append(data);
        }

      }

      fillButtons();
      fillPanels();

      var selectedTab = '#tabPanelLeft-1'

      $('.tabPanelButton').click(function() {

        $(this).blur();

        //Work out content div
        selectedContent = '#tabPanelRight-' + $(this).attr('id').charAt(13)

        if ($(selectedContent).is(':hidden')) {

          //Buton change jazz
          $(this).parent().addClass('selectedTab');
          $(selectedTab).parent().removeClass('selectedTab');

          //fade content
          $(selectedContent).fadeIn().siblings().fadeOut();
        }

        selectedTab = '#tabPanelLeft-' + $(this).attr('id').charAt(13)

        return false;
      });

      $('#tabPanelLeft-1').parent().addClass('selectedTab');
      $('#tabPanelRight-1').fadeIn();

    }
  };

})(jQuery);



//2p. Hover Tips 2011

(function($) {
  $('.hoverTip2011').hover(function() {
    p = $(this).data('info');
    $(this).after('<div id="hoverTipBox" class="hidden-text"><div class="hover-tip-outer"><div class="hover-tip-inner">' + p + '</div></div></div>');
    $('#hoverTipBox').fadeIn('200');
    return false;
  }, function() {
    $('#hoverTipBox').fadeOut('200', function() {
      $('#hoverTipBox').remove();
    });
    return false;
  });
})(jQuery);

//2q. ComboBox (experimental)

(function($) {
  shelter.makeComboBox = {
    init: function() {
      if ($('.ComboBox').length > 0) {
        if (!$.browser.msie || (parseInt($.browser.version) >= 8)) {
            $('#container').prepend('<div id="ComboBoxScreenOverlay"></div>');
            var OverlayHeight = $(document).height();
            $('#ComboBoxScreenOverlay').css({ "height" : OverlayHeight, "position" : "absolute", "display" : "none" });
            $('.ComboBox').each(function(index) {
              var newWidth = parseInt($(this).css("width").replace(/px/,'')) - 21
              newWidth = newWidth + "px"
              $(this).addClass('fakeDropDown').css({
                "padding-right" : "28px",
                "width" : newWidth
              });

              var data = new Array();
              data = $(this).data('choices').split('/');

              var listWrapper = '#ComboBoxList' + index
              $(this).parent().prepend('<div class="ComboBoxList" id="ComboBoxList' + index + '">');
              var j = data.length;
              for (i=0; i<j; i++) {
                $(listWrapper).append('<a class="ComboBoxItem">' + data[i] + '</a>');
              }

              $(listWrapper).append('<a class="ComboBoxItem ComboBoxItemOther">' + 'Other (please specify)' + '</a>');

              $(this).click(function() {
                $('#ComboBoxScreenOverlay').show();
                $(listWrapper).show();
              });

              $(this).keydown(function(event) {
                if (event.keyCode == '9') {
                  $('.ComboBoxList').hide();
                  $('#ComboBoxScreenOverlay').hide();
                }
              });

            });

          $('.ComboBox').blur(function() {
            $(this).removeClass('ComboBoxOtherSelected');
          });

          $('.ComboBoxItem').click(function() {
            if ($(this).hasClass('ComboBoxItemOther') == true) {
              $(this).parent().hide().siblings().addClass('ComboBoxOtherSelected').val('').focus()
            }
            else {
              var value = $(this).html();
              $(this).parent().hide().siblings().val(value);
            }
            $('#ComboBoxScreenOverlay').hide();
          });

          $('#ComboBoxScreenOverlay').click(function() {
            $('.ComboBoxList').hide();
            $('#ComboBoxScreenOverlay').hide();
          });

        }
      }
    }
  };

})(jQuery);

//2r. Site update scripts: interim

(function($) {
  if (typeof listChildrenArrange != "undefined") {
    listChildrenArrange()
  }
  if (typeof in_section_styles !== "undefined") {
    in_section_styles()
  }

})(jQuery);

//2s. Radek/Danny Carousel

(function($) {
  shelter.rdCarouselBuild = {
    init: function() {
      var carouselCount
      carouselCount = $('.rdCarouselButtons')
      if (carouselCount.length > 0)
      {
        carouselCount.each(function(index, el) {

          var carousel,
            carouselitems,
            carouselitemswidth,
            carouselbuttons,
            leftbutton,
            rightbutton

          carousel      = $('#' + $(this).attr('data-carousel'))
          carouselitems   = carousel.find('.rdCarouselItem')
          carouselitemswidth  = carousel.find('.rdCarouselItem:first-child').width()
          carouselbuttons   = '<a class="rdCarouselLeft rdCarouselLeftGreyed" href="#"></a><a class="rdCarouselRight" href="#"></a>'

          $(this).html(carouselbuttons);

          leftbutton = $(this).find('a.rdCarouselLeft')
          rightbutton = $(this).find('a.rdCarouselRight')

          leftbutton.on('click', function(event) {
            event.preventDefault();
            var position = carousel.css('right').replace(/px/g, '')
            if ((position > 0) && !carousel.is(':animated'))
            {
              carousel.animate({
                right: '-=' + carouselitemswidth
              }, function() {
                if (carousel.css('right').replace(/px/g, '') <= 0)
                {
                  leftbutton.addClass('rdCarouselLeftGreyed');
                }
                rightbutton.removeClass('rdCarouselRightGreyed');
              });
            }
          });

          rightbutton.on('click', function(event) {
            event.preventDefault();
            var position = carousel.css('right').replace(/px/g, '')
            if ((position < carouselitemswidth*(carouselitems.length-1)) && !carousel.is(':animated'))
            {
              carousel.animate({
                right: '+=' + carouselitemswidth
              }, function() {
                if (carousel.css('right').replace(/px/g, '') >= carouselitemswidth*(carouselitems.length-1))
                {
                  rightbutton.addClass('rdCarouselRightGreyed');
                }
                leftbutton.removeClass('rdCarouselLeftGreyed');
              });
            }
          })

        })
      }
    }
  }
})(jQuery);

//2t. Cookie bar
(function($) {
  if (typeof shelter.cookiebar == "undefined") shelter.cookiebar = {
    init: function() {
      var x = cookie.read('cookiesAccepted');

      if (!x) {
        $("#cookie_message_wrapper").slideDown("1000");
      } else {
        $("#cookie_message_wrapper").remove();
      }

      $("#cookie_bar_close").on("click",function(event){
        event.preventDefault();
        $("#cookie_message_wrapper").slideUp("1000",function(){
          $(this).remove();
        });
        cookie.create("cookiesAccepted",1,720);
      });
    }
  }
})(jQuery);

//2u. Lightbox Survey

(function($) {

  if (typeof shelter.lightbox_survey == "undefined") shelter.lightbox_survey = {

    init: function() {

      var currentURI = window.location.toString();
      // shelter.domain check removed as it fails - does not register england but www instead
            // Replaced with check based on current url
            // This first conditional check might be removed at a later date depending on whether the templates for 
            // the England website are (or aren't) being used by the Scottish website
      //if ((shelter.domain == 'england') && (document.location.toString().indexOf('get_advice') != -1)) {
      if ((currentURI.indexOf('england') != -1) && (document.location.toString().indexOf('get_advice') != -1)) {
        
        //read cookies
        var y = cookie.read('lightbox_survey')

        //if user accepts cookies but hasn't done the survey yet
        if (!y) {
          

          //FUNCTION: close lightbox_survey slidedown and make a cookie so it doesn't get opened again
          function close_survey() {
            $('#lightbox_survey_wrapper').slideUp('1000',function() {
              $(this).remove();
            });
            cookie.create('lightbox_survey', 1, 720);
          }

          //html content for slidedown
          var lightbox_survey = '<div id="lightbox_survey_wrapper"><div id="lightbox_survey_inner" class="clearfix"><h2>Could you take a minute to help us improve our website?&nbsp;&nbsp;&nbsp;&nbsp;<a href="//england.shelter.org.uk/get_advice/advice_survey_2015?referer=' + encodeURI(document.location) + '" id="advice_survey">Yes</a> / <a href="#" id="lightbox_survey_close">No</a></h2></div></div>';

          $('#container').before(lightbox_survey);

          $('#lightbox_survey_wrapper').slideDown('1000');

          $('#lightbox_survey_close').on("click", function(event) {
            event.preventDefault();
            close_survey();
          });

          //Set fancybox up
          $('#advice_survey').fancybox({
            type: 'iframe',
            beforeLoad: function() {
              _gaq.push(['_trackEvent', 'Survey', 'Popped']);
            },
            afterClose: function() {
              close_survey();
            }
          });

        }

      }
    }
  }

})(jQuery);


//2v. Website Survey

(function($) {

  if (typeof shelter.website_survey == "undefined") shelter.website_survey = {

    init: function() {

      var currentURI = window.location.toString();
  
      if ((currentURI.indexOf('england') != -1)) {

        function open_survey() {

          var lightbox_survey = '<div id="lightbox_survey_wrapper"><div id="lightbox_survey_inner" class="clearfix"><h2>Can you spare 5 minutes to help us improve our website? &nbsp;&nbsp;&nbsp;&nbsp;<a href="//www.surveymonkey.com/r/KXH2P2F" target="_blank" id="lightbox_survey_yes">Yes</a> / <a href="#" id="lightbox_survey_no">No</a></h2></div></div>';
          $('#container').before(lightbox_survey);
          $('#lightbox_survey_wrapper').slideDown('1000');

          $('#lightbox_survey_yes').on("click", function(event) {
            close_survey();
          });

          $('#lightbox_survey_no').on("click", function(event) {
            event.preventDefault();
            close_survey();
          });
        }

        function close_survey() {
          $('#lightbox_survey_wrapper').slideUp('1000',function() {
            $(this).remove();
          });
            cookie.create('website_survey', 1, 720);
        }

        if(window.location.hash) {
          var hash = window.location.hash.substring(1);
          if(hash=='survey') {
            cookie.create('pagecounter', '4', {expires: 14});
            open_survey();
          } 
        }   

        if ((cookie.read('pagecounter') === null) && (cookie.read('website_survey') != 1)) {

          // If the cookie doesn't exist, save the cookie with the value of 1
          cookie.create('pagecounter', '1', {expires: 14});

        } else {

          // If the cookie exists, take the value
          var cookie_value = cookie.read('pagecounter');

          if (cookie_value != 4){
              
            // Convert the value to an int to make sure
            cookie_value = parseInt(cookie_value);

            // Add 1 to the cookie_value
            cookie_value++;
            
            // Save the incremented value to the cookie
            cookie.create('pagecounter', cookie_value, {expires: 14});

          }else{

            //read cookies
            var y = cookie.read('website_survey');

            //if user accepts cookies but hasn't done the survey yet
            if (!y) {
              open_survey();
            }
          }
        }
      }
    }
  }
})(jQuery);

// 3. Init global
(function($) {
  jQuery(document).ready(function($) {

        switch(document.body.id) {
          case 'shelter-england-body':
            shelter.domain = 'england';
            break;
          case 'shelter-scotland.body':
            shelter.domain = 'scotland';
            break;
          case 'shelter-neutral-body':
            shelter.domain = 'www';
            break;
          case 'shelter-media-body':
            shelter.domain = 'media';
            break;
          default:
            shelter.domain = 'www';
        }

    if (typeof fancybox == "function") {
      $('a.email').prop("href","/get_advice/ajax_email/_nocache").fancybox({'type':'ajax','fixed':true});
    }

    $("#mainnavtree > .currentpage  ul li, #mainnavtree > .navselected ul li").parent().parent().addClass("arrowdown");

    //Make default speeds in IE slower so they run more smoothly
    //$.fx.speeds._default = (($.browser.msie) && ($.browser.version < 8)) ? 1000 : 600;

    //init cookie bar & survey
    shelter.cookiebar.init();
    shelter.lightbox_survey.init();
    //shelter.website_survey.init();

    // add page binds here or on in page content
    var adviceTab = new shelter.megaMenu();
    var proTab = new shelter.megaMenu();
    var wycdTab = new shelter.megaMenu();
    var campTab = new shelter.megaMenu();

    var adviceTabId = (document.domain == "scotland.shelter.org.uk") ? "nav11811" : "nav24462";
    var proTabId = (document.domain == "scotland.shelter.org.uk") ? "nav12107" : "nav24522";
    var wycdTabId = (document.domain == "scotland.shelter.org.uk") ? null : "nav24466";
    var campTabId = (document.domain == "scotland.shelter.org.uk") ? null : "nav417501";

    adviceTab.init(adviceTabId,"advice_mm_padding");
    proTab.init(proTabId,"pro_mm_padding");
    wycdTab.init(wycdTabId,"wycd_mm_padding");
    campTab.init(campTabId,"camp_mm_padding");

    shelter.social.loadAPIs();
    //shelter.liveSearch.init();
    shelter.changeLocation.init();

    shelter.makeComboBox.init();

    // autorun content JS
    addWindowBind(doContentJS);

  });
})(jQuery);