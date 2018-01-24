from lib.ImageNow import eForm
from lib.parts import *

t = eForm(css='ARCC.css', js='ARCC.js')
# t.insert(row(), id='loginSection')
# t.insert(col(s=3, m=5, l=3), parent='loginSection')
# t.insert(tag('input', {'type': 'text'}), parent='col-1')
#
# t.insert(row())
# t.insert(col(m=12, l=12), parent='row-1')
# t.insert(img("logo-arcc.svg", "Anoka-Ramsey Community College"), parent='col-1')
# t.insert(p('Certificate Application'), parent='col-1')
#
# t.insert(row())
# t.insert(p('A '), parent='p-1')
# t.insert(img(), parent='p-2')
# t.insert(span(' indicates required information'), parent='p-2')
#
# t.insert(row(), n=3, parent='row-1')
#
# t.insert('xyz')
# t.insert(tag('h2', {'onclick': 'enlarge()', 'class': 'headingBar'}), id='acb')
# t.insert(tag('xsl:value-of', {'select': '//page/StateInfo/Client/Type'}, txt='123'),parent='acb')
# t.insert(tag('br'))
# t.insert(xslIf('viewer="FormView"'))
# t.modAttr('acb', {'id': 'ABC', 'class': 'hBar', 'onblur': 'hide()'})
# t.insert(fieldsetLegend('Star ID Auth'))
# t.insert(login())
#
# t.insert(p(), parent='formSection')

t.save()
# print(t.bs.prettify(formatter=None))