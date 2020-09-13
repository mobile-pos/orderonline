/* @Print.js
 * DH (http://denghao.me)
 * 2017-7-14
 */

let printer = {
  // 存储 localstorage
  Print (dom, options) {
    if (!(this instanceof printer.Print)) return new printer.Print(dom, options);

    printer.options = printer.extend({
      noPrint: '.no-print',
      onStart: function () { },
      onEnd: function () { }
    }, options);

    if ((typeof dom) === "string") {
      printer.dom = document.querySelector(dom);
    } else {
      printer.dom = dom;
    }

    printer.init();
  },

  init() {
    var content = printer.getStyle() + printer.getHtml();
    printer.writeIframe(content);
    console.log("0 init");
  },
  extend(obj, obj2) {
    for (var k in obj2) {
      obj[k] = obj2[k];
    }
    return obj;
  },

  getStyle () {
    var str = "",
      styles = document.querySelectorAll('style,link');
    for (var i = 0; i < styles.length; i++) {
      str += styles[i].outerHTML;
    }
    str += "<style>" + (this.options.noPrint ? this.options.noPrint : '.no-print') + "{display:none;}</style>";

    return str;
  },

  getHtml () {
    var inputs = document.querySelectorAll('input');
    var textareas = document.querySelectorAll('textarea');
    var selects = document.querySelectorAll('select');

    for (var k in inputs) {
      if (inputs[k].type == "checkbox" || inputs[k].type == "radio") {
        if (inputs[k].checked == true) {
          inputs[k].setAttribute('checked', "checked")
        } else {
          inputs[k].removeAttribute('checked')
        }
      } else if (inputs[k].type == "text") {
        inputs[k].setAttribute('value', inputs[k].value)
      }
    }

    for (var k2 in textareas) {
      if (textareas[k2].type == 'textarea') {
        textareas[k2].innerHTML = textareas[k2].value
      }
    }

    for (var k3 in selects) {
      if (selects[k3].type == 'select-one') {
        var child = selects[k3].children;
        for (var i in child) {
          if (child[i].tagName == 'OPTION') {
            if (child[i].selected == true) {
              child[i].setAttribute('selected', "selected")
            } else {
              child[i].removeAttribute('selected')
            }
          }
        }
      }
    }

    return printer.dom.outerHTML;
  },

  writeIframe (content) {
    var w, doc, iframe = document.createElement('iframe'),
      f = document.body.appendChild(iframe);
    iframe.id = "myIframe";
    iframe.style = "position:absolute;width:0;height:0;top:-10px;left:-10px;";

    w = f.contentWindow || f.contentDocument;
    doc = f.contentDocument || f.contentWindow.document;
    doc.open();
    doc.write(content);
    doc.close();
    this.toPrint(w, function () {
      document.body.removeChild(iframe)
    });
  },

  toPrint  (w, cb) {
    var _this = printer;
    w.onload = function () {
      try {
        setTimeout(function () {
          w.focus();
          typeof _this.options.onStart === 'function' && _this.options.onStart();
          if (!w.document.execCommand('print', false, null)) {
            w.print();
          }
          typeof _this.options.onEnd === 'function' && _this.options.onEnd();
          w.close();
          cb && cb()
        });
      } catch (err) {
        console.log('err', err);
      }
    }
  }
  
}

export default printer
