(function() {
  var alert, createXPathFromElement, getClassNames, isMovingToNextUrl, loadCss, loadJs, selectedItem, selectors, top, unique, uniqueClass,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.spynotify = new Object;

  uniqueClass = "spynotify-" + (+(new Date));

  console.log(uniqueClass);

  console.log('Loader loaded');


  /**
   * Get class names for an element
   *
   * @pararm {Element} el
   * @return {Array}
   */

  getClassNames = function(el) {
    var className;
    className = el.getAttribute('class');
    if (!className || !className.length) {
      return [];
    }
    className = className.replace(/\s+/g, ' ');
    className = className.replace(/^\s+|\s+$/g, '');
    return className.split(' ');
  };


  /**
   * CSS selectors to generate unique selector for DOM element
   *
   * @param {Element} el
   * @return {Array}
   * @api prviate
   */

  selectors = function(el) {
    var alt, classNames, label, name, parts, title, value;
    parts = [];
    label = null;
    title = null;
    alt = null;
    name = null;
    value = null;
    while (true) {
      if (el.id) {
        label = '#' + el.id;
      } else {
        label = el.tagName.toLowerCase();
        classNames = getClassNames(el);
        if (classNames.length) {
          label += '.' + classNames.join('.');
        }
      }
      if (title = el.getAttribute('title')) {
        label += '[title="' + title + '"]';
      } else if (alt = el.getAttribute('alt')) {
        label += '[alt="' + alt + '"]';
      } else if (name = el.getAttribute('name')) {
        label += '[name="' + name + '"]';
      }
      if (value = el.getAttribute('value')) {
        label += '[value="' + value + '"]';
      }
      parts.unshift(label);
      if (!(!el.id && (el = el.parentNode) && el.tagName)) {
        break;
      }
    }
    if (!parts.length) {
      throw new Error('Failed to identify CSS selector');
    }
    return parts;
  };

  unique = function(el) {
    var i, matches, selector;
    if (!el || !el.tagName) {
      throw new TypeError('Element expected');
    }
    selector = selectors(el).join(' > ');
    matches = document.querySelectorAll(selector);
    if (matches.length > 1) {
      i = 0;
      while (i < matches.length) {
        if (el === matches[i]) {
          i = [].indexOf.call(el.parentNode.children, el);
          selector += ':nth-child(' + i + 1 + ')';
          break;
        }
        i++;
      }
    }
    return selector;
  };

  loadJs = function(src, cb) {
    var s;
    s = document.createElement('script');
    s.src = src;
    s.type = "text/javascript";
    document.getElementsByTagName('head')[0].appendChild(s);
    return s.onload = cb;
  };

  loadCss = function(src, cb) {
    var l;
    l = document.createElement('link');
    l.setAttribute('rel', 'stylesheet');
    l.setAttribute('href', src);
    document.getElementsByTagName('head')[0].appendChild(l);
    return l.onload = cb;
  };

  createXPathFromElement = function(elm) {
    var allNodes, i, n, segs, sib, uniqueIdCount;
    allNodes = document.getElementsByTagName('*');
    segs = [];
    while (elm && elm.nodeType === 1) {
      if (elm.hasAttribute('id')) {
        uniqueIdCount = 0;
        n = 0;
        while (n < allNodes.length) {
          if (allNodes[n].hasAttribute('id') && allNodes[n].id === elm.id) {
            uniqueIdCount = 0;
          }
          if (uniqueIdCount > 1) {
            break;
          }
          n++;
        }
        if (uniqueIdCount === 1) {
          segs.unshift('id("' + elm.getAttribute('id') + '")');
          return segs.join('/');
        } else {
          segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]');
        }
      } else if (elm.hasAttribute('class')) {
        segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]');
      } else {
        i = 1;
        sib = elm.previousSibling;
        while (sib) {
          if (sib.localName === elm.localName) {
            i++;
          }
          sib = sib.previousSibling;
        }
        segs.unshift(elm.localName.toLowerCase() + '[' + i + ']');
      }
      elm = elm.parentNode;
    }
    if (segs.length) {
      return '/' + segs.join('/');
    } else {
      return null;
    }
  };

  alert = window.alert;

  top = self;

  window.alert = window.confirm = function() {
    return null;
  };

  Object.defineProperty(document, 'domain', {
    get: function() {
      return window.location.hostname.split('.').slice(1, -2).join('.');
    },
    set: function(domain) {
      return null;
    }
  });

  Object.defineProperty(window, 'open', {
    get: function() {
      return function() {
        return {};
      };
    }
  });

  isMovingToNextUrl = false;

  selectedItem = null;

  window.onload = function() {
    loadCss('/css/elements.css', function() {
      return loadJs('/socket.io/socket.io.js', function() {
        var acceptBtn, acceptBtnContainer, logo, panel, selectedItemName, socket;
        socket = io();
        socket.on('data', function(data) {
          return console.log(data);
        });
        panel = document.createElement('div');
        panel.className = 'spynotify-panel ' + uniqueClass;
        document.body.insertBefore(panel, document.body.childNodes[0]);
        logo = document.createElement('div');
        logo.className = 'logo spynotify centered vertically fl_l ' + uniqueClass;
        panel.appendChild(logo);
        selectedItem = document.createElement('div');
        selectedItem.className = 'selected fl_l centered horizontally vertically ' + uniqueClass;
        selectedItemName = document.createElement('input');
        selectedItemName.id = 'spynotify-name';
        selectedItemName.setAttribute('placeholder', 'Имя элемента');
        selectedItemName.className = 'centered vertically ' + uniqueClass;
        selectedItem.appendChild(selectedItemName);
        panel.appendChild(selectedItem);
        acceptBtnContainer = document.createElement('div');
        acceptBtnContainer.className = 'complete fl_r centered horizontally vertically ' + uniqueClass;
        acceptBtn = document.createElement('div');
        acceptBtn.className = 'centered vertically horizontally ' + uniqueClass;
        acceptBtn.innerText = 'Готово';
        acceptBtnContainer.appendChild(acceptBtn);
        panel.appendChild(acceptBtnContainer);
        return acceptBtn.onclick = function() {
          var updateData;
          if (!spynotify.selectedItems.length) {
            return alert('Не выбран элемент');
          }
          if (!selectedItemName.value) {
            return alert('Не задано имя элемента');
          }
          updateData = {
            name: selectedItemName.value,
            url: window.location.href,
            element: spynotify.selectedItems[0]
          };
          return socket.emit('action::update', {
            name: selectedItemName.value,
            url: window.location.href,
            element: spynotify.selectedItems[0].selector
          }, function(result) {
            return window.open('', '_self').close();
          });
        };
      });
    });
    document.body.onmouseover = function(e) {
      var elem, elems, _i, _len;
      if (__indexOf.call(e.target.className.split(' '), uniqueClass) >= 0) {
        return;
      }
      elems = document.getElementsByTagName('*');
      for (_i = 0, _len = elems.length; _i < _len; _i++) {
        elem = elems[_i];
        elem.style.boxShadow = 'none';
      }
      return e.target.style.boxShadow = '0px 0px 5px #6C28CA';
    };
    return document.body.onclick = function(e) {
      var domain, nextUrl, _base, _base1;
      e.preventDefault();
      e.stopPropagation();
      if (__indexOf.call(e.target.classList, uniqueClass) >= 0) {
        return;
      }
      if ((_base = window.spynotify).selectedItems == null) {
        _base.selectedItems = [];
      }
      if ((_base1 = window.spynotify).selectCount == null) {
        _base1.selectCount = 0;
      }
      if (window.spynotify.selectedItems.length) {
        window.spynotify.selectedItems[window.spynotify.selectCount].element.classList.remove('spynotify-element');
      }
      window.spynotify.selectedItems[window.spynotify.selectCount] = {
        selector: unique(e.target),
        element: e.target
      };
      isMovingToNextUrl = true;
      if (e.target.tagName === 'A') {
        if (e.target.getAttribute('href').length && !(/^\/{0,1}#/.test(e.target.getAttribute('href')))) {
          if (e.target.hostname.split('.').slice(-2).join('.') !== 'deathstar.local') {
            domain = e.target.hostname + '.deathstar.local:3000';
          } else {
            domain = e.target.hostname + ':3000';
          }
          nextUrl = (e.target.protocol || location.protocol) + '//' + domain + e.target.pathname;
          window.location.href = nextUrl;
        }
      }
      e.target.className += ' spynotify-element';
      return null;
    };
  };

}).call(this);
