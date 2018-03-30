from lxml import etree
import re

"""
Create an element in HTML
:param tag_name: HTML tag name
:param attrs: dictionary of keys and values for attributes
:return: an etree element
"""
def tag(tag_name, attrs={}, txt=''):
    if 'xsl' in tag_name:
        el = etree.Element(etree.QName("http://www.w3.org/1999/XSL/Transform", tag_name[4:]), attrs)
    else:
        el = etree.Element(tag_name, attrs)

    if tag_name != "xsl:value-of":
        el.text = txt

    return el


"""
Create an image element
:param src: source of image
:param alt: alternate text
:return: an etree element
"""
def img(src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QsPDhss3LcOZQAAAU5JREFUOMvdkzFLA0EQhd/bO7iIYmklaCUopLAQA6KNaawt9BeIgnUwLHPJRchfEBR7CyGWgiDY2SlIQBT/gDaCoGDudiy8SLwkBiwz1c7y+GZ25i0wnFEqlSZFZKGdi8iiiOR7aU32QkR2c7ncPcljAARAkgckb8IwrGf1fg/oJ8lRAHkR2VDVmOQ8AKjqY1bMHgCGYXhFchnAg6omJGcBXEZRtNoXYK2dMsaMt1qtD9/3p40x5yS9tHICYF1Vn0mOxXH8Uq/Xb389wff9PQDbQRB0t/QNOiPZ1h4B2MoO0fxnYz8dOOcOVbWhqq8kJzzPa3RAXZIkawCenHMjJN/+GiIqlcoFgKKq3pEMAMwAuCa5VK1W3SAfbAIopum+cy5KzwXn3M5AI6XVYlVt1mq1U8/zTlS1CeC9j2+6o1wuz1lrVzpWXLDWTg3pz/0CQnd2Jos49xUAAAAASUVORK5CYII=', alt='required'):
    return tag('img', {'src': src, 'alt': alt})


"""
Create a paragraph element
:param txt: paragraph text 
:return: an etree element
"""
def p(txt):
    return tag('p', txt=txt)

"""
Create an inline text element
:param txt: inline text 
:return: an etree element
"""
def span(txt):
    return tag('span', txt=txt)

"""
Create a section for logo and header only
:param img: source of image for logo
:param txt: text of header
:return: an etree element
"""
def logo_header(logo_src, logo_txt, header_txt):
    el = tag('div', {'id': 'logo-header'})

    # logo
    logo_row = tag('div', {'class': 'row'})
    logo_col = tag('div', {'class': 'columns', 'align': 'center'})
    logo = img(src=logo_src, alt=logo_txt)

    logo_col.append(logo)
    logo_row.append(logo_col)
    el.append(logo_row)

    # header
    header_row = tag('div', {'class': 'row'})
    header_col = tag('div', {'class': 'columns'})
    header = tag('h1', txt=header_txt)

    header_col.append(header)
    header_row.append(header_col)
    el.append(header_row)

    return el

"""
Create a container for other elements with a heading bar
:param id: id of the container
:return: an etree element
"""
def container(id, txt):
    el = tag('div', {'id': id})

    # heading bar
    el.append(tag('div', {'class': 'headingBar'}, txt))

    # content
    childId = id + "-content"
    el.append(tag('div', {'class': 'row columns', 'id': childId}))

    return el

"""
Create a line break
:return: an etree element
"""
def br():
    return tag('br')

"""
Create an input element
:param xml: data definition file of the form
:param type: type of input
:param id: id of input
:param xmlNode: value node
:param lbl: label of input
:param required: required or not
:param readonly: readonly or not
:param s: size for small screen
:param m: size for medium screen
:param l: size for large screen
:return: an etree element
"""
def input(xml, type, id, xmlNode, lbl, required, readonly, s, m, l):
    el = tag('div', {'class': 'small-' + str(s) + ' medium-' + str(m) + ' large-' + str(l) + ' columns'})

    # label
    child = tag('label', {'for': id})
    child.text = lbl
    el.append(child)
    el.append(br())

    # input
    if readonly == False and required == False:
        child = tag('input', {'type': type, 'name': id, 'id': id})
    elif (readonly == True and required == True):
        child = tag('input', {'type': type, 'name': id, 'id': id, 'required': 'True', 'readonly':'True'})
    elif (readonly == True and required == False):
        child = tag('input', {'type': type, 'name': id, 'id': id, 'readonly':'True'})
    elif (readonly == False and required == True):
        child = tag('input', {'type': type, 'name': id, 'id': id, 'required': 'True'})

    xsl = tag('xsl:attribute', {'name': 'value'})
    xsl_child = tag('xsl:value-of', {'select': xmlNode})
    xsl.append(xsl_child)
    child.append(xsl)
    el.append(child)

    update_xml(xml, xmlNode, required)

    return el

"""
Create a textarea element
:param xml: data definition file of the form
:param id: id of textarea
:param xmlNode: value node
:param lbl: label of textarea
:param required: required or not
:param readonly: readonly or not
:param row: size of textarea
:return: an etree element
"""
def textarea(xml, id, xmlNode, lbl, required, readonly):
    el = tag('div', {'class': 'small-12 columns'})

    # label
    child = tag('label', {'for': id})
    child.text = lbl
    el.append(child)
    el.append(br())

    # textarea
    if readonly == False and required == False:
        child = tag('textarea', {'name': id, 'id': id, 'rows': '5', 'cols': '60'})
    elif (readonly == True and required == True):
        child = tag('textarea', {'name': id, 'id': id, 'required': 'True', 'readonly':'True', 'rows': '5', 'cols': '60'})
    elif (readonly == True and required == False):
        child = tag('textarea', {'name': id, 'id': id, 'readonly':'True', 'rows': '5', 'cols': '60'})
    elif (readonly == False and required == True):
        child = tag('textarea', {'name': id, 'id': id, 'required': 'True', 'rows': '5', 'cols': '60'})

    xsl = tag('xsl:value-of', {'select': xmlNode})
    child.append(xsl)
    el.append(child)

    update_xml(xml, xmlNode, required)

    return el

"""
Create group of radiobuttons with label
:param xml: data definition part of the form
:param items: dictionary of labels as keys and ids as values
:param attrs: attributes
:param xmlNode: value node
:param hidden: id of hidden field
:param s: size for small screen
:param m: size for medium screen
:param l: size for large screen
:return: an etree element
"""
def radio(xml, items, attrs, xmlNode, hidden, lbl, required, s=12, m=6, l=4):
    result = tag('div', {'class': 'row columns'})

    for i in items.keys():
        tmp_1 = etree.SubElement(result, "div")
        tmp_1.attrib['class'] = 'small-' + str(s) + ' medium-' + str(m) + ' large-' + str(l) + ' columns'

        # add fieldset for accessibility
        fieldset = tag('fieldset', {'style': 'border:none;'})
        legend = tag('legend', txt=lbl)
        fieldset.append(legend)
        tmp_1.append(fieldset)

        etree.SubElement(fieldset, "div").attrib['id'] = 'tmp123xyz'

        # input
        el = tag('input', {'type': 'radio'})
        for a in attrs.keys():
            el.attrib[a] = attrs[a]
        el.attrib['id'] = items[i]
        el.attrib['onclick'] = 'setRadioValue(\'' + i + '\', \'' + hidden + '\')'

        xsl_child = tag('xsl:if', {'test': xmlNode + '=\'' + i + '\''})
        xsl_child_1 = tag('xsl:attribute', {'name': 'checked'})
        xsl_child_1.text = 'true'
        xsl_child.append(xsl_child_1)

        el.append(xsl_child)
        tmp = result.xpath("//*[@id='tmp123xyz']")[0]
        tmp.append(el)

        # items
        el_1 = tag('label', {'for': el.attrib['id']})
        el_1.text = i
        tmp.append(el_1)

    # hidden element
    hidden = tag('input', {'type': 'hidden', 'name': hidden, 'id': hidden})
    xsl_child = tag('xsl:attribute', {'name': 'value'})
    xsl_child_1 = tag('xsl:value-of', {'select': xmlNode})
    xsl_child.append(xsl_child_1)
    hidden.append(xsl_child)
    tmp.append(hidden)

    del tmp.attrib['id']

    update_xml(xml, xmlNode, required)

    return result


"""
Update the data definition file
:param xml: data definition part of the form  
:param xmlNode: value node
:param required: required node or not
"""
def update_xml(xml, xmlNode, required):
  # assume page is the root node
  nodes = xmlNode[7:].split('/')
  xml_nodes = []
  for i in xml.iterdescendants():
    xml_nodes.append(i.tag)

  for i in range(len(nodes)):
    if nodes[i] not in xml_nodes:
      new_nodes = create_nodes(nodes[i:])
      new_nodes.text = ""
      xml.append(new_nodes)
      break

  if required == True:
    el = xml.xpath(xmlNode)[0]
    # create warning message
    node_name = nodes[-1][0].upper() + nodes[-1][1:]
    words = re.findall('[A-Z][^A-Z]*', node_name)
    lowercase_words = [word.lower() for word in words]
    phrase = ' '.join(lowercase_words)
    el.attrib['infd_name'] = 'A ' + phrase + ' is required'
    el.attrib['infd_required'] = 'true'

"""
Create nested children nodes if not existed 
:param nodes: list of nodes to be nested
:return: an etree element
"""
def create_nodes(nodes):
  if len(nodes) == 0:
    return
  else:
    node = etree.Element(nodes[0])
    child = create_nodes(nodes[1:])
    if not child is None:
      node.append(child)
    return node

"""
Create attachment button to be added anywhere in the form
:param xml: doc attribute of the form
:return: an etree element
"""
def attachButton(xml):
  xsl = tag('xsl:if', {'test': '$viewer = "FormViewer"'})
  xsl_child = tag('input', {'type': 'button', 'value': "Upload Attachments", 'class': 'button', 'onclick': 'window.parent.ImageNowForms.ButtonAction.addAttachments();'})
  xsl.append(xsl_child)
  return xsl