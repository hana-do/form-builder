from lxml import etree

doc = etree.parse('template.xsl')
# print(etree.tostring(doc, pretty_print=True, encoding="unicode"))
login = doc.find("//input[@id='loginTimestamp']")
login.append(etree.Element('p', {'id': 'anc', 'onclick': 'func()'}))
print(etree.tostring(login, pretty_print=True, encoding="unicode"))

# print(etree.tostring(login, pretty_print=True, encoding="unicode"))
# doc.write('demo\output.xsl')
# etree.tostring(doc, pretty_print=True)
print(etree.tostring(doc, pretty_print=True, encoding="unicode"))
