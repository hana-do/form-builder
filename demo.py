from lib.FormBuilder import eForm
from lib.helper import *
from lxml import etree

# initialize
t = eForm(formName='PTC Records Compaint eForm', withLogin=True, forMSU=False, css='ptcComplaint.css',js='ptcComplaint.js')

# logo & header
t.insert(container('ptc-header'), el='innerTable', pos=-1)
t.insert(img(src='Logo.jpg', alt='Pine Technical & Community College'), el='ptc-header-content')
t.insert(tag('h1', txt='Student Complaint Form'), el='ptc-header-content')

t.insert(p('Please read the policy and procedure regarding student complaints prior to submitting this form. Information can be found at http://www.pine.edu/about/public-information-and-policies/campus-policies/student-affairs/303.pdf'), el='innerTable')
t.insert(p('Reminder: Please submit any supporting documentation.'), el='innerTable')
t.insert(p('By completing this form, I acknowledge that I have read, understand, and will abide by the procedure and instructions of procedure 303 Student Complaints and Reporting.'), el='innerTable')

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
t.insert(input(type='text', lbl='Street Address: ', id='streetAdd', xmlNode='//page/streetAdd'), el='student-info-content')
t.insert(input(type='text', lbl='City: ', id='city', xmlNode='//page/city'), el='student-info-content')
t.insert(input(type='text', lbl='Zip: ', id='zip', xmlNode='//page/zip'), el='student-info-content')
t.insert(input(type='text', lbl='Complaint filed against (instructor name): ', id='instructorName', xmlNode='//page/instructorName'), el='student-info-content')

## hidden
t.insert(tag('div', attrs={'style': 'display:none;'}), el='student-info-content', id='hiddenSec')
t.insert(input(type='hidden', id='fullName', xmlNode='//page/fullName', readonly=True), el='hiddenSec')

## fields
t.insert(container(id='complaint-info'), el='formSection')
t.insert(headingBar('Student Information'), el='complaint-info-content', pos=-1)


t.insert(p('A new form must be submitted for each person/department you are releasing your information to.'), el='student-info-content')
t.insert(p('I hereby authorize Minnesota State Community and Technical College to release and/or orally discuss the education records described below about me to: (list names of both parents, guardians, others).'), el='student-info-content')
t.insert(input(type='text', lbl='Name:', id='name', xmlNode='//page/name'), el='student-info-content')
t.insert(input(type='text', lbl='Relationship:', id='relationship', xmlNode='//page/relationship'), el='student-info-content')

# output
# t.save('PTC Records Compaint eForm/PTC Records Compaint eForm.xsl')
