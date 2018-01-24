from lxml import etree
from lib.helper import *

class eForm:
  """ Component count """
  _count = {alias(row()): 0, alias(col()): 0, alias(img()): 0, alias(p()): 0, alias(span()): 0, 'custom': 0, 'noId': 0}

  def __init__(self, withLogin=True, forMSU=False, css="form.css", js="form.js"):
    if withLogin == True:
      if forMSU == True:
        f = 'lib/templateLoginMSU.xsl'
      else:
        f = 'lib/templateLogin.xsl'
    else:
      f = 'lib/template.xsl'

    _markup = open(f, 'r')
    parser = etree.XMLParser(remove_blank_text=True) # pretty print
    self.doc = etree.parse(_markup, parser)

    """ Modify css and js file names """
    _el = self.doc.xpath("//*[@href=$href]", href='form.css')[0]
    _el.attrib['href'] = css
    _el = self.doc.xpath("//*[@src=$src]", src='form.js')[0]
    _el.attrib['src'] = js

    _markup.close()

  def insert(self, tag, id='', pos=0, el='innerTable', n=1):
    if isinstance(tag, str):
      print("please put plain text in a tag")
      return

    c = self._count[alias(tag)]

    """ id must be unique """
    if id != '' and n > 1:
      print('id must be unique')
      return

    """ Fix descending id in 'after' case """
    if pos == 1:
      for i in range(n, 0, -1):
        c += n
        _el = self.doc.xpath("//*[@id=$id]", id=el)[0]
        _el.addnext(changeId(tag, id, c))

        c -= 1
    else:
      for i in range(n):
        if pos == 0:  # append
          _el = self.doc.xpath("//*[@id=$id]", id=el)[0]
          _el.append(changeId(tag, id, c+1))

          c += 1
        elif pos == -1:  # before
          _el = self.doc.xpath("//*[@id=$id]", id=el)[0]
          _el.addprevious(changeId(tag, id, c+1))

          c += 1

    self._count[alias(tag)] = c

    return self

  def changeAttrById(self, id, opt=0, attrs={}):
    # default option 0: view only, opt=1: add/modify existing, opt=-1: remove, opt=-2: remove all
    _el = self.doc.xpath("//*[@id=$id]", id=id)[0]

    if opt == -2:
      for a in _el.attrib.keys():
        del _el.attrib[a]
    else:
      for a in attrs.keys():
        if opt == 1:
          _el.attrib[a] = attrs[a]
        elif opt == -1:
          del _el.attrib[a]

    print(_el.attrib)
    return self

  def save(self):
    f = open('demo\output.xsl', 'w')
    f.write(etree.tostring(self.doc, pretty_print=True, encoding="unicode"))
    f.close()