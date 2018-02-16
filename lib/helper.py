from lxml import etree
import copy

""" Auto increment """
def changeId(el, id, num):
    tmp = copy.copy(el)
    if alias(tmp) != "noId" and not isinstance(tmp, str) and 'id' not in tmp.attrib:
        if id == "":
            tmp.attrib['id'] = alias(tmp) + '-' + str(num)
        else:
            tmp.attrib['id'] = id
    return tmp

""" Get shorthand aliases of components """
def alias(el):
    if isinstance(el, str):
        return 'custom'

    if '<div class="row' in str(etree.tostring(el)):
        return 'row'
    elif '<div class="small' in str(etree.tostring(el)):
        return 'col'
    elif '<img' in str(etree.tostring(el)):
        return 'img'
    elif '<p' in str(etree.tostring(el)):
        return 'p'
    elif '<span' in str(etree.tostring(el)):
        return 'span'
    elif '<xsl' in str(etree.tostring(el)) or '<br' in str(etree.tostring(el)) or '<hr' in str(etree.tostring(el)):
        return 'noId'
    else:
        return 'custom'

""" Add custom tags """
def tag(tag_name, attrs={}, txt=''):
    if 'xsl' in tag_name:
        _el = etree.Element(etree.QName("http://www.w3.org/1999/XSL/Transform", tag_name[4:]), attrs)
    else:
        _el = etree.Element(tag_name, attrs)

    if tag_name != "xsl:value-of":
        _el.text = txt

    return _el

""" Shortcuts """
def row():
    return tag('div', {'class': 'row'})

def col(s=12, m=6, l=4):
    return tag('div', {'class': 'small-' + str(s) + ' medium-' + str(m) + ' large-' + str(l) + ' columns'})

def img(src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QsPDhss3LcOZQAAAU5JREFUOMvdkzFLA0EQhd/bO7iIYmklaCUopLAQA6KNaawt9BeIgnUwLHPJRchfEBR7CyGWgiDY2SlIQBT/gDaCoGDudiy8SLwkBiwz1c7y+GZ25i0wnFEqlSZFZKGdi8iiiOR7aU32QkR2c7ncPcljAARAkgckb8IwrGf1fg/oJ8lRAHkR2VDVmOQ8AKjqY1bMHgCGYXhFchnAg6omJGcBXEZRtNoXYK2dMsaMt1qtD9/3p40x5yS9tHICYF1Vn0mOxXH8Uq/Xb389wff9PQDbQRB0t/QNOiPZ1h4B2MoO0fxnYz8dOOcOVbWhqq8kJzzPa3RAXZIkawCenHMjJN/+GiIqlcoFgKKq3pEMAMwAuCa5VK1W3SAfbAIopum+cy5KzwXn3M5AI6XVYlVt1mq1U8/zTlS1CeC9j2+6o1wuz1lrVzpWXLDWTg3pz/0CQnd2Jos49xUAAAAASUVORK5CYII=', alt='required'):
    return tag('img', {'src': src, 'alt': alt})

def p(txt=''):
    return tag('p', txt=txt)

def span(txt=''):
    return tag('span', txt=txt)

def xslVal(sel):
    return tag('xsl:value-of', {'select': sel})

def xslIf(test):
    return tag('xsl:if', {'test': '$' + test})

def xslAttr(name, txt):
    return tag('xsl:attribute', {name: txt})

def br():
    return tag('br')

""" Composite elements """
def container(id):
    """ A div that contains a child section for content """
    _el = tag('div', {'id': id})

    childId = id + "-content"
    _el.append(tag('div', {'class': 'row columns', 'id': childId}))
    return _el

def headingBar(txt):
    """ A heading bar with format for each container """
    _el = tag('div', {'class': 'headingBar'})
    _el.text = txt
    return _el

def input(type, id, xmlNode, lbl='', required=True, readonly=False, s=12, m=6, l=4):
    """ An input field with label that spans small-12 medium-6 large-4 by default """
    _el = col(s, m, l)

    # label
    _child = tag('label', {'for': id})
    _child.text = lbl
    _el.append(_child)
    _el.append(br())

    # input
    if readonly == False:
        _child = tag('input', {'type': type, 'name': id, 'id': id, 'required': str(required == True)})
    else:
        _child = tag('input', {'type': type, 'name': id, 'id': id, 'required': str(required == True), 'readonly':'True'})
    _xsl = tag('xsl:attribute', {'name': 'value'})
    _xsl_child = tag('xsl:value-of', {'select': xmlNode})
    _xsl.append(_xsl_child)
    _child.append(_xsl)
    _el.append(_child)

    return _el

def label(txt, required=True):
    """ A label with(out) asterisk for an item """
    _el = tag('p', {'id': 'term-label'})
    if required == True:
        _el.append(img())
    _el.append(span(txt))

    return _el

def radio(items, attrs, xmlNode, hidden, s=12, m=6, l=4):
    """ Radiobuttons with labels """
    _result = tag('div', {'class': 'row columns'})

    _count = 0
    for i in items.keys():
        _count += 1
        _tmp_1 = etree.SubElement(_result, "div")
        _tmp_1.attrib['class'] = 'small-' + str(s) + ' medium-' + str(m) + ' large-' + str(l) + ' columns'
        etree.SubElement(_tmp_1, "div").attrib['id'] = 'tmp123xyz'

        # input
        _el = tag('input', {'type': 'radio'})
        for a in attrs.keys():
            _el.attrib[a] = attrs[a]
        _el.attrib['id'] = items[i]
        _el.attrib['onclick'] = 'setRadioValue(\'' + i + '\', \'' + hidden + '\')'

        _xsl_child = tag('xsl:if', {'test': xmlNode + '=\'' + i + '\''})
        _xsl_child_1 = tag('xsl:attribute', {'name': 'checked'})
        _xsl_child_1.text = 'true'
        _xsl_child.append(_xsl_child_1)

        _el.append(_xsl_child)
        _tmp = _result.xpath("//*[@id='tmp123xyz']")[0]
        _tmp.append(_el)

        # items
        _el_1 = tag('label', {'for': _el.attrib['id']})
        _el_1.text = i
        _tmp.append(_el_1)

        # hidden element
        if _count == len(items.keys()):
            _hidden = tag('input', {'type': 'hidden', 'name': hidden, 'id': hidden})
            _xsl_child = tag('xsl:attribute', {'name': 'value'})
            _xsl_child_1 = tag('xsl:value-of', {'select': xmlNode})
            _xsl_child.append(_xsl_child_1)
            _hidden.append(_xsl_child)
            _tmp.append(_hidden)

        _tmp.attrib['id'] = ''

    return _result

def list(items, attrs={}, ordered=False):
    """ List of items """
    if ordered == True:
        _el = tag('ol')
    else:
        _el = tag('ul')

    for i in items:
        _child = tag('li')
        _child.text = i
        _el.append(_child)

    for a in attrs.keys():
        _el.attrib[a] = attrs[a]

    return _el
