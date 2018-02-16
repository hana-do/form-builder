from lib.FormBuilder import eForm
from lib.helper import *
from lxml import etree

# initialize
t = eForm(formName='ARCC Club Roster eForm', withLogin=False, forMSU=False, css='arccClubRoster.css',js='arccClubRoster.js')

# logo & header
t.insert(container(id='logo-header'), el='innerTable', pos=-1)
t.insert(img(src='arcc_logo.jpg', alt='Anoka-Ramsey Community College'), el='logo-header-content')
t.insert(container('arcc-header'), el='container', pos=-1)
t.insert(tag('h1', txt='Club Roster'), el='arcc-header-content')
t.insert(tag('span', txt='Club Roster'), el='arcc-header-content')

# form
## fields
t.insert(container(id='preparer-info'), el='formSection')
t.insert(headingBar('Preparer Information'), el='preparer-info-content', pos=-1)
t.insert(input(type='text', lbl='First Name:', id='firstName', xmlNode='//page/firstName'), el='preparer-info-content')
t.insert(input(type='text', lbl='Middle Name:', id='middleName', xmlNode='//page/middleName'), el='preparer-info-content')
t.insert(input(type='text', lbl='Last Name:', id='lastName', xmlNode='//page/lastName'), el='preparer-info-content')
t.insert(input(type='email', lbl='Email: ', id='email', xmlNode='//page/email'), el='preparer-info-content')
t.insert(input(type='text', lbl='Club:', id='club', xmlNode='//page/club'), el='preparer-info-content')

## hidden
t.insert(tag('div', attrs={'style': 'display:none;'}), el='preparer-info-content', id='hiddenSec')
t.insert(input(type='hidden', id='fullName', xmlNode='//page/fullName', readonly=True), el='hiddenSec')

## radio
t.insert(container('term-year'), el='formSection')
t.insert(label(txt='Semester: ', required=True), el='term-year')
t.insert(radio({'Fall': 'fall', 'Spring': 'spring', 'Summer': 'summer'}, {'name': 'termRadio'}, xmlNode='//page/term', hidden='term', m=12, l=12), el='term-year')
t.insert(input(type='text', lbl='Year:', id='year', xmlNode='//page/year', required=True, m=6, l=4), el='term-year')

t.insert(container('campus'), el='formSection')
t.insert(label(txt='Campus: ', required=True), el='campus')
t.insert(radio({'Cambridge (5005)': 'cambridge', 'Coon Rapids (5004)': 'coon'}, {'name': 'campusRadio'}, xmlNode='//page/campus', hidden='campus', l=6), el='campus')

t.insert(p('Needs to be completed prior to a funding request, or 6 weeks after the first meeting of the fall term.'), el='preparer-info-content')

# output
t.save('ARCC Club Roster eForm/ARCC Club Roster eForm.xsl')
