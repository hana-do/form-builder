from ImageNow import eForm
from lib.parts import *

t = eForm(css='ARCC.css', js='ARCC.js')

t=t.insert(row())
t=t.insert(col(m=12, l=12), parent='row-1')
t.insert(img("logo-arcc.svg", "Anoka-Ramsey Community College"), parent='col-1')
t.insert(p('Certificate Application'), parent='col-1')

t.insert(row())
t.insert(p('A '), parent='p-1')
t.insert(img(), parent='p-2')
t.insert(span(' indicates required information'), parent='p-2')

t.insert(row(), n=3, parent='row-1')

t.insert('xyz')
t.insert(add('h2', {'onclick': 'enlarge()', 'class': 'headingBar'}), id='acb')
# t.insert(custom('xsl:attribute', {'name' : 'src'}), parent='custom-2')
t.save()


# print(t.bs.prettify(formatter=None))