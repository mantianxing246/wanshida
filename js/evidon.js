var _host = location.href;
var _adobeUrl = "";

if(_host.indexOf("taptotokyo.com") >= 0) {
    _adobeUrl = "//assets.adobedtm.com/launch-EN596340d8f1764860857e607dd93ce035.min.js"
} else {
    _adobeUrl = "//assets.adobedtm.com/launch-EN8c4a2e6593ad47afab36cfcdc8304cde-staging.min.js"
}

(function(id, cid, cb) {
  var d = document,
    s = d.createElement('script'),
    ts = d.getElementsByTagName('script')[0];
  s.type = 'text/javascript';
  s.async = true;
  s.setAttribute('data-ev-noticeid', id);
  s.setAttribute('data-ev-coid', cid);
  s.setAttribute('data-ev-consent-callback', cb());
  s.setAttribute('data-ev-consent-type', 'cnp');
  s.src = '//c.betrad.com/pub/gdprnotice.js';
  ts.parentNode.insertBefore(s, ts);
  // ts.appendChild (s);
})(20348, 1828, g_consentGiven);

/* 
Function used for consent callback.  Put any script or tag manager
calls in here to execute after consent is detected.  Note, this
needs to be part of the window namespace so either leave this out of any self executing
function calls, or assign it to the window namespace (window.g_consentGiven = function() {}
*/

function g_consentGiven() {
  g_addScript();
}

function g_addScript() {
  //_satellite = "";
  var head = document.head;
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = _adobeUrl;
  head.appendChild(script);
  whenAvailable("_satellite", function(t) {
    _satellite.pageBottom();
  });
}

function whenAvailable(name, callback) {
  var interval = 10; //ms
  window.setTimeout(function() {
    if (window[name]) {
      callback(window[name]);
    } else {
      window.setTimeout(arguments.callee, interval);
    }
  }, interval);
}