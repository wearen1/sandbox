window.spynotify = new Object

uniqueClass = "spynotify-#{ +new Date }"
console.log uniqueClass
console.log 'Loader loaded'

###*
# Get class names for an element
#
# @pararm {Element} el
# @return {Array}
###

getClassNames = (el) ->
  className = el.getAttribute('class')
  if !className or !className.length
    return []
  # remove duplicate whitespace
  className = className.replace(/\s+/g, ' ')
  # trim leading and trailing whitespace
  className = className.replace(/^\s+|\s+$/g, '')
  # split into separate classnames
  className.split ' '

###*
# CSS selectors to generate unique selector for DOM element
#
# @param {Element} el
# @return {Array}
# @api prviate
###

selectors = (el) ->
  parts = []
  label = null
  title = null
  alt = null
  name = null
  value = null
  loop
    # IDs are unique enough
    if el.id
      label = '#' + el.id
    else
      # Otherwise, use tag name
      label = el.tagName.toLowerCase()
      classNames = getClassNames(el)
      # Tag names could use classes for specificity
      if classNames.length
        label += '.' + classNames.join('.')
    # Titles & Alt attributes are very useful for specificity and tracking
    if title = el.getAttribute('title')
      label += '[title="' + title + '"]'
    else if alt = el.getAttribute('alt')
      label += '[alt="' + alt + '"]'
    else if name = el.getAttribute('name')
      label += '[name="' + name + '"]'
    if value = el.getAttribute('value')
      label += '[value="' + value + '"]'
    parts.unshift label
    unless !el.id and (el = el.parentNode) and el.tagName
      break
  # Some selectors should have matched at least
  if !parts.length
    throw new Error('Failed to identify CSS selector')
  parts


unique = (el) ->
  if !el or !el.tagName
    throw new TypeError('Element expected')
  selector = selectors(el).join(' > ')
  matches = document.querySelectorAll(selector)
  # If selector is not unique enough (wow!), then
  # force the `nth-child` pseido selector
  if matches.length > 1
    i = 0
    while i < matches.length
      if el == matches[i]
        # Recalculate index based on position of el amongst siblings
        i = [].indexOf.call(el.parentNode.children, el)
        selector += ':nth-child(' + i + 1 + ')'
        break
      i++
  selector


loadJs = (src, cb)->
  s = document.createElement 'script'
  s.src = src
  s.type = "text/javascript"
  document.getElementsByTagName('head')[0].appendChild s
  s.onload = cb

loadCss = (src, cb)->
  l = document.createElement 'link'
  l.setAttribute 'rel', 'stylesheet'
  l.setAttribute 'href', src
  document.getElementsByTagName('head')[0].appendChild l
  l.onload = cb

createXPathFromElement = (elm) ->
  allNodes = document.getElementsByTagName('*')
  segs = []
  while elm and elm.nodeType == 1
    if elm.hasAttribute('id')
      uniqueIdCount = 0
      n = 0
      while n < allNodes.length
        if allNodes[n].hasAttribute('id') and allNodes[n].id == elm.id
          uniqueIdCount = 0
        if uniqueIdCount > 1
          break
        n++
      if uniqueIdCount == 1
        segs.unshift 'id("' + elm.getAttribute('id') + '")'
        return segs.join('/')
      else
        segs.unshift elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]'
    else if elm.hasAttribute('class')
      segs.unshift elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]'
    else
      i = 1
      sib = elm.previousSibling
      while sib
        if sib.localName == elm.localName
          i++
        sib = sib.previousSibling
      segs.unshift elm.localName.toLowerCase() + '[' + i + ']'
    elm = elm.parentNode
  if segs.length then '/' + segs.join('/') else null


alert = window.alert
top = self

window.alert = window.confirm = ->
  null

Object.defineProperty document, 'domain',
  get: ->
    window.location.hostname.split('.').slice(1, -2).join('.')
  set: (domain)->
    null

# Object.defineProperty window, 'parent',
#   get: ->
#     window

Object.defineProperty window, 'open',
  get: ->
    return ->
      {}

isMovingToNextUrl = false

selectedItem = null

window.onload = ->
  loadCss '/css/elements.css', ->
    loadJs '/socket.io/socket.io.js', ->
      socket = io()

      socket.on 'data', (data)->
        console.log data

      panel = document.createElement 'div'
      panel.className = 'spynotify-panel ' + uniqueClass
      # document.body.style.position = 'relative'
      # document.body.style.transition = 'top 0.8s linear'
      # document.body.style.top = '100px'

      # document.body.parentNode.insertBefore panel, document.body
      document.body.insertBefore panel, document.body.childNodes[0]

      logo = document.createElement 'div'
      logo.className = 'logo spynotify centered vertically fl_l ' + uniqueClass
      panel.appendChild logo

      selectedItem = document.createElement 'div'
      selectedItem.className = 'selected fl_l centered horizontally vertically ' + uniqueClass

      selectedItemName = document.createElement 'input'
      selectedItemName.id = 'spynotify-name'
      selectedItemName.setAttribute 'placeholder', 'Имя элемента'
      selectedItemName.className = 'centered vertically ' + uniqueClass

      selectedItem.appendChild selectedItemName

      panel.appendChild selectedItem

      acceptBtnContainer = document.createElement 'div'
      acceptBtnContainer.className = 'complete fl_r centered horizontally vertically ' + uniqueClass
      acceptBtn = document.createElement 'div'
      acceptBtn.className = 'centered vertically horizontally ' + uniqueClass
      acceptBtn.innerText = 'Готово'

      acceptBtnContainer.appendChild acceptBtn
      panel.appendChild acceptBtnContainer

      acceptBtn.onclick = ->
        return alert 'Не выбран элемент' unless spynotify.selectedItems.length
        return alert 'Не задано имя элемента' unless selectedItemName.value
        updateData =
          name: selectedItemName.value
          url: window.location.href
          element: spynotify.selectedItems[0]

        # console.log updateData

        # parent.postMessage 'close', '*'

        socket.emit 'action::update',
          name: selectedItemName.value
          url: window.location.href
          element: spynotify.selectedItems[0].selector
        , (result)->
          window.open('','_self').close()


  document.body.onmouseover = (e)->
    return if uniqueClass in e.target.className.split(' ')
    elems = document.getElementsByTagName '*'
    for elem in elems
      elem.style.boxShadow = 'none'
    e.target.style.boxShadow = '0px 0px 5px #6C28CA'


  document.body.onclick = (e)->
    e.preventDefault()
    e.stopPropagation()

    return if uniqueClass in e.target.classList

    window.spynotify.selectedItems ?= []
    window.spynotify.selectCount ?= 0

    window.spynotify.selectedItems[window.spynotify.selectCount].element.classList.remove 'spynotify-element' if window.spynotify.selectedItems.length
    window.spynotify.selectedItems[window.spynotify.selectCount] =
      selector: unique e.target
      element: e.target

    isMovingToNextUrl = true

    if e.target.tagName is 'A'
      if e.target.getAttribute('href').length and not (/^\/{0,1}#/.test e.target.getAttribute('href'))
        if e.target.hostname.split('.').slice(-2).join('.') isnt 'deathstar.local'
          domain = e.target.hostname + '.deathstar.local:3000'
        else
          domain = e.target.hostname + ':3000'

        nextUrl = (e.target.protocol or location.protocol) + '//' + domain + e.target.pathname
        window.location.href = nextUrl

    e.target.className += ' spynotify-element'

    null

    # alert createXPathFromElement e.target

    # console.log("postMessage " + curXpath);
    # window.parent.postMessage(
    #       curXpath,
    #         "*"
    #       )
