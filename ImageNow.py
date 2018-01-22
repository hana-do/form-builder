from bs4 import BeautifulSoup
from lib.helper import *
from lib.parts import *

class eForm:
  """ Component count """
  _count = {alias(row()): 0, alias(col()): 0, alias(img()): 0, alias(p()): 0, alias(span()): 0, 'custom': 0}

  """ An eForm object is basically a BeautifulSoup object with a cursor to note where to insert parts """
  def __init__(self, f='lib/template.xsl', css="form.css", js="form.js"):
    _markup = open(f, 'r')
    self.bs = BeautifulSoup(_markup, 'html.parser')

    """ Modify css and js file names """
    findMod(self, 'script', {'src': 'form.js'}, {'src': js})
    findMod(self, 'link', {'href': 'form.css'}, {'href': css})

    _markup.close()

  def insert(self, part, id='', pos=0, parent='innerTable', n=1):
    c  = self._count[alias(part)]

    """ id must be unique """
    if id != '' and n > 1:
      print('id must be unique')
      return

    """ Fix descending id in 'after' case """
    if pos == 1:
      for i in range(n, 0, -1):
        c += n
        self.bs.find(attrs={'id': parent}).insert_after(changeId(part, str(c), id))
        c -= 1
    else:
      for i in range(n):
        if pos == 0: # append
          self.bs.find(attrs={'id': parent}).append(changeId(part, str(c+1), id))
          c += 1
        elif pos == -1: # before
          self.bs.find(attrs={'id': parent}).insert_before(changeId(part, str(c+1), id))
          c += 1

    self._count[alias(part)] = c

    return self

  def save(self):
    f = open('demo\output.xsl', 'w')
    f.write(str(self.bs.prettify(formatter=None)))
    f.close()