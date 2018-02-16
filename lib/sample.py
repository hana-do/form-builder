from lib.FormBuilder import eForm
from lib.helper import *
from lxml import etree

# initialize
t = eForm(formName='NCTC Fresh Start eForm', withLogin=True, forMSU=False, css='nctcFreshStart.css',js='nctcFreshStart.js')

# logo & header
t.insert(container(id='logo-header'), el='innerTable', pos=-1)
t.insert(img(src='logo.jpg', alt='Northland Community & Technical College'), el='logo-header-content')
t.insert(container('nctc-header'), el='loginSection', pos=-1)
t.insert(tag('h1', txt='Fresh Start'), el='nctc-header-content')

## center logo
t.insert(row())
t.insert(col(), id='col-1')
t.changeAttrById(id='col-1', opt=1, attrs={'align':'center'})

# form
## general info
t.insert(container(id='general-info'), el='formSection')
t.insert(p('Students who are requesting a Fresh Start must demonstrate renewed academic motivation by passing the first twelve (12) credits with a minimum GPA of 2.0 prior to academic forgiveness being granted.'), id='p1', el='general-info-content')

## fields (required for login: name, techid, email)
t.insert(container(id='student-info'), el='formSection')
t.insert(headingBar('Student Information'), el='student-info-content', pos=-1)
t.insert(input(type='text', lbl='Star ID / Student ID:', id='displayStarId', xmlNode='//page/displayStarId', readonly=True), el='student-info-content')
t.insert(input(type='text', lbl='First Name:', id='firstName', xmlNode='//page/firstName', readonly=True), el='student-info-content')
t.insert(input(type='email', id='email', xmlNode='//page/email', readonly=True), el='student-info-content')

## hidden
t.insert(tag('div', attrs={'style': 'display:none;'}), el='student-info-content', id='hiddenSec')
t.insert(input(type='hidden', id='fullName', xmlNode='//page/fullName', readonly=True), el='hiddenSec')
t.insert(input(type='hidden', id='techId', xmlNode='//page/techId', readonly=True), el='hiddenSec')

## radio
t.insert(container('effective'), el='formSection')
t.insert(label(txt='Effective Start Date: ', required=True), el='effective')
t.insert(radio({'Fall': 'fall', 'Spring': 'spring', 'Summer': 'summer'}, {'name': 'termRadio'}, xmlNode='//page/term', hidden='term', m=12, l=12), el='effective')
t.insert(input(type='text', lbl='Year:', id='year', xmlNode='//page/year', required=True, m=6, l=4), el='effective')

## textarea
t.insert(tag('textarea', id='', pos=0, el='', n=1), el='')

## signature
t.insert(container(id='sig-info'), el='formSection')
t.insert(headingBar('Electronic Signature'), el='sig-info-content', pos=-1)
t.insert(p('By entering your password and clicking the box below, you consent to use electronic communications, electronic records, and electronic signatures rather than paper documents for this form.'), el='sig-info-content')

## footer
t.insert(tag('footer', txt='Northland Community and Technical College is a proud member of the Minnesota State Colleges and Universities system and is an Equal Opportunity employer and educator.'))

# output
t.save('NCTC Fresh Start eForm/NCTC Fresh Start eForm.xsl')
