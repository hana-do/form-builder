from bs4 import BeautifulSoup

class eForm:
  """ An eForm object is basically a BeautifulSoup object with a cursor to note where to insert parts """
  def __init__(self, f='parts/template.xsl', css="form.css", js="form.js"):
    _markup = open(f, 'r')
    self.bs = BeautifulSoup(_markup, 'html.parser')

    """ Modify css and js file names """
    if self.bs.find('script', attrs={'src': 'form.js'})!= None:
      self.bs.find('script', attrs={'src': 'form.js'})['src']= js
    if self.bs.find('link', attrs={'href': 'form.css'}) != None:
      self.bs.find('link', attrs={'href': 'form.css'})['href'] = css

    _markup.close()

  def _getCount(self, part):
    """ Get current count """
    if part in self.count:
      c = self.count[part]
      tmp = part
    elif part.__contains__('<div class="small'):
      c = self.count['<div class="small']
      tmp = '<div class="small'
    elif part.__contains__('<img'):
      c = self.count['<img']
      tmp = '<img'
    elif part.__contains__('<p id="p-NUM">'):
      c = self.count['<p id="p-NUM">']
      tmp = '<p id="p-NUM">'
    else:
      c = 0
      tmp = ''

    return c, tmp

  def insert(self, part, pos=0, parent='innerTable', n=1):
    c, tmp = self._getCount(part)

    """ Rows in row """
    if parent[:3] == "row" and part.__contains__('row'):
      part = part.replace('NUM', parent[4:] + '-NUM')

    """ Fix descending id in 'after' case """
    if pos == 1:
      for i in range(n, 0, -1):
        c += n
        self.bs.find(attrs={'id': parent}).insert_after(part.replace('NUM', str(c)))
        c -= 1
    else:
      for i in range(n):
        if pos == 0: # append)
          self.bs.find(attrs={'id': parent}).append(part.replace('NUM', str(c+1)))
          c += 1
        elif pos == -1: # before
          self.bs.find(attrs={'id': parent}).insert_before(part.replace('NUM', str(c+1)))
          c += 1

    self._save()
    self.count[tmp] = c

    return self

  def _save(self):
    f = open('demo\output.xsl', 'w')
    f.write(str(self.bs.prettify(formatter=None)))
    f.close()
    return self.__init__(f='demo\output.xsl')

  """ Parts """
  row = '<div class="row" id="row-NUM"></div>'

  count = {
    row: 0,
    '<div class="small': 0,
    '<img': 0,
    '<p id="p-NUM">': 0,
    '': 0
  }

  def col(self, s=12, m=8, l=4):
    return '<div class="small-' + str(s) + ' medium-' + str(m) + ' large-' + str(l) + ' columns" id="col-NUM"></div>'

  def img(self, src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QsPDhss3LcOZQAAAU5JREFUOMvdkzFLA0EQhd/bO7iIYmklaCUopLAQA6KNaawt9BeIgnUwLHPJRchfEBR7CyGWgiDY2SlIQBT/gDaCoGDudiy8SLwkBiwz1c7y+GZ25i0wnFEqlSZFZKGdi8iiiOR7aU32QkR2c7ncPcljAARAkgckb8IwrGf1fg/oJ8lRAHkR2VDVmOQ8AKjqY1bMHgCGYXhFchnAg6omJGcBXEZRtNoXYK2dMsaMt1qtD9/3p40x5yS9tHICYF1Vn0mOxXH8Uq/Xb389wff9PQDbQRB0t/QNOiPZ1h4B2MoO0fxnYz8dOOcOVbWhqq8kJzzPa3RAXZIkawCenHMjJN/+GiIqlcoFgKKq3pEMAMwAuCa5VK1W3SAfbAIopum+cy5KzwXn3M5AI6XVYlVt1mq1U8/zTlS1CeC9j2+6o1wuz1lrVzpWXLDWTg3pz/0CQnd2Jos49xUAAAAASUVORK5CYII=', alt='required'):
    return '<img src="' + src + '" alt="' + alt + '" id="img-NUM" />'

  def p(self, txt=''):
    return '<p id="p-NUM">' + txt + '</p>'

if __name__ == "__main__":
  t = eForm(css='ARCC.css', js='ARCC.js')
  t.insert(t.row)
  t.insert(t.col(m=12, l=12), parent='row-1')
  t.insert(t.img("logo-arcc.svg", "Anoka-Ramsey Community College"), parent='col-1')
  t.insert(t.p('Certificate Application'), parent='col-1')

  t.insert(t.row)
  t.insert('A ', parent='p-2')
  t.insert(t.img(), parent='p-2')
  t.insert(' indicates required information', parent='p-2')

  t.insert(t.row)
  t.insert()


  print(t.bs.prettify(formatter=None))