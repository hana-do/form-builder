from lib.FormBuilder import eForm
from lib.helper import *
from lxml import etree

# initialize
t = eForm(formName='SPC Enr Release of Info eForm', withLogin=True, forMSU=False, css='spcInfoRelease.css',js='spcInfoRelease.js')

# logo & header
t.insert(container(id='logo-header'), el='innerTable', pos=-1)
t.insert(img(src='logo.jpg', alt='Saint Paul College'), el='logo-header-content')
t.insert(container('spc-header'), el='container', pos=-1)
t.insert(tag('h1', txt='Authorization To Release Student Information'), el='spc-header-content')

# form
## fields
t.insert(container(id='student-info'), el='formSection')
t.insert(headingBar('Student Information'), el='student-info-content', pos=-1)
t.insert(input(type='text', lbl='First Name:', id='firstName', xmlNode='//page/firstName'), el='student-info-content')
t.insert(input(type='text', lbl='Middle Name:', id='middleName', xmlNode='//page/middleName'), el='student-info-content')
t.insert(input(type='text', lbl='Last Name:', id='lastName', xmlNode='//page/lastName'), el='student-info-content')
t.insert(input(type='text', lbl='Tech ID:', id='techId', xmlNode='//page/techId'), el='student-info-content')
t.insert(input(type='text', lbl='Star ID:', id='displayStarId', xmlNode='//page/login/starId'), el='student-info-content')
t.insert(input(type='email', lbl='Email Address: ', id='email', xmlNode='//page/email'), el='student-info-content')

## hidden
t.insert(tag('div', attrs={'style': 'display:none;'}), el='student-info-content', id='hiddenSec')
t.insert(input(type='hidden', id='fullName', xmlNode='//page/fullName', readonly=True), el='hiddenSec')

## fields
t.insert(p('A new form must be submitted for each person/department you are releasing your information to.'), el='student-info-content')
t.insert(p('I hereby authorize Minnesota State Community and Technical College to release and/or orally discuss the education records described below about me to: (list names of both parents, guardians, others).'), el='student-info-content')
t.insert(input(type='text', lbl='Name:', id='name', xmlNode='//page/name'), el='student-info-content')
t.insert(input(type='text', lbl='Relationship:', id='relationship', xmlNode='//page/relationship'), el='student-info-content')

# output
t.save('SPC Enr Release of Info eForm/SPC Enr Release of Info eForm.xsl')
