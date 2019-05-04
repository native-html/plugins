
const injectedScript = `

var RNWV = window.ReactNativeWebView;

// Send size on body content height updates
function postSize() {
  var tables = document.getElementsByTagName('table');
  if (tables.length > 0) {
    var table = tables[0];
    var tableHeight = table.scrollHeight;
    RNWV.postMessage(JSON.stringify({
      type: 'heightUpdate',
      content: tableHeight
    }));
  }
}
postSize();
//trigger when DOM changes
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var observer = new MutationObserver(postSize);
observer.observe(document, {
    subtree: true,
    attributes: true
});

// Intercept click events

function interceptClickEvent(e) {
  var href;
  var target = e.target || e.srcElement;
  if (target.tagName === 'A') {
      href = target.getAttribute('href');
      e.preventDefault();
      // Post message
      RNWV.postMessage(JSON.stringify({
        type: 'navigateEvent',
        content: href
      }));
  }
}

document.addEventListener('click', interceptClickEvent);
`
export default injectedScript
