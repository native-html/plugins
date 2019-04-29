
const injectedScript = `

var RNWV = window.ReactNativeWebView;

// Send size on body content height updates
function postSize() {
    //https://stackoverflow.com/questions/1145850/how-to-get-height-of-entire-document-with-javascript
    var body = document.body, html = document.documentElement;
    var maxHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    RNWV.postMessage(JSON.stringify({
      type: 'heightUpdate',
      content: maxHeight
    }));
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
