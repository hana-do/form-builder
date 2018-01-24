from lib.FormBuilder import eForm
from lib.helper import *

t = eForm(withLogin=True, forMSU=True, css='ARCC.css', js='ARCC.js')
# t.insert(row(), id='loginSection')
# t.insert(col(s=3, m=5, l=3), el='loginSection')
# t.insert(tag('input', {'type': 'text'}), el='col-1')
#
# t.insert(row())
# t.insert(col(m=12, l=12), el='row-1')
# t.insert(img("logo-arcc.svg", "Anoka-Ramsey Community College"), el='col-1')
# t.insert(p('Certificate Application'), el='col-1')
#
# t.insert(row())
# t.insert(p('A '), el='p-1')
# t.insert(img(), el='p-2')
# t.insert(span(' indicates required information'), el='p-2')
#
# t.insert(row(), n=3, el='row-1')
#
# # t.insert('xyz')
# t.insert(tag('h2', {'onclick': 'enlarge()', 'class': 'headingBar'}), id='acb')
# t.insert(tag('xsl:value-of', {'select': '//page/StateInfo/Client/Type'}, txt='123'),el='acb')
# t.insert(tag('br'))
# t.insert(xslIf('viewer="FormView"'))
#
# t.insert(xslVal('//page/StateInfo/Client/Type'),el='loginSection', n=2)
t.insert(tag('xsl:value-of', {'select': '//page/StateInfo/Client/Type'}),el='loginSection', n=2)
t.insert(row(), n=3, el='loginSection')

t.save()
