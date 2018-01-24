from lib.FormBuilder import eForm
from lib.helper import *

t = eForm(withLogin=True, forMSU=True, css='ARCC.css', js='ARCC.js')

t.insert(container('student-info'), el='formSection')
t.insert(headingBar('Student Information'), el='student-info-content', pos=-1)
t.insert(input(type='text', lbl='First Name:', id='firstName', xmlNode='//page/firstName', readonly=True), el='student-info-content')
t.insert(input(type='text', lbl='Middle Name:', id='middleName', xmlNode='//page/middleName', readonly=True, required=False), el='student-info-content')
t.insert(input(type='text', lbl='Last Name:', id='lastName', xmlNode='//page/lastName', readonly=True), el='student-info-content')
t.insert(input(type='text', lbl='Tech ID:', id='techId', xmlNode='//page/techId', readonly=True), el='student-info-content')
t.insert(input(type='text', lbl='Star ID:', id='starId', xmlNode='//page/login/starId', readonly=True), el='student-info-content')
t.insert(input(type='text', lbl='Email Address:', id='email', xmlNode='//page/email'), el='student-info-content')
t.insert(input(type='text', lbl='Phone Number:', id='phone', xmlNode='//page/phone'), el='student-info-content')
t.insert(input(type='text', lbl='Name as you would like it to appear on your certificate:', id='certName', xmlNode='//page/certName', l=8), el='student-info-content')

t.insert(container('all-that-applies'), el='formSection')
t.insert(headingBar('Please select all that applies'), el='all-that-applies-content', pos=-1)


t.save()
