from lib.FormBuilder import eForm
from lib.helper import *
from lxml import etree

# initialize
t = eForm(formName='AnokaT Exception to Policy eForm', withLogin=True, forMSU=False, css='anokatExceptionToPolicy.css',js='anokatExceptionToPolicy.js')

# logo & header
t.insert(container(id='logo-header'), el='innerTable', pos=-1)
t.insert(img(src='anokat_logo.jpg', alt='Anoka Technical College'), el='logo-header-content')
t.insert(container('anokat-header'), el='container', pos=-1)
t.insert(tag('h1', txt='Exception to Policy Appeal'), el='anokat-header-content')

# form
## fields
t.insert(container(id='student-info'), el='formSection')
t.insert(headingBar('Student Information'), el='student-info-content', pos=-1)
t.insert(input(type='text', lbl='First Name:', id='firstName', xmlNode='//page/firstName'), el='student-info-content')
t.insert(input(type='text', lbl='Middle Name:', id='middleName', xmlNode='//page/middleName'), el='student-info-content')
t.insert(input(type='text', lbl='Last Name:', id='lastName', xmlNode='//page/lastName'), el='student-info-content')
t.insert(input(type='email', lbl='Email Address: ', id='email', xmlNode='//page/email'), el='student-info-content')
t.insert(input(type='text', lbl='Phone Number:', id='phone', xmlNode='//page/phone'), el='student-info-content')
t.insert(input(type='text', lbl='Street Address:', id='add', xmlNode='//page/address'), el='student-info-content')
t.insert(input(type='text', lbl='City:', id='city', xmlNode='//page/city'), el='student-info-content')
t.insert(input(type='text', lbl='Zip Code:', id='zip', xmlNode='//page/zip'), el='student-info-content')

## hidden
t.insert(tag('div', attrs={'style': 'display:none;'}), el='student-info-content', id='hiddenSec')
t.insert(input(type='hidden', id='fullName', xmlNode='//page/fullName', readonly=True), el='hiddenSec')

## fields
t.insert(container(id='explanation'), el='formSection')
t.insert(headingBar('Explanation'), el='explanation-content', pos=-1)
t.insert(p('Students submitting an Exception to Policy Appeal must describe in detail the circumstances they faced in the text below. Supporting documentation must be submitted for the appeal to be considered for appeal.'), el='explanation-content')
t.insert(tag('textarea'), el='explanation-content')

## radio
t.insert(p('Year and Term requesting to appeal.'), el='explanation-content')
t.insert(container('term-year'), el='explanation-content')
t.insert(label(txt='Semester: ', required=True), el='term-year')
t.insert(radio({'Fall': 'fall', 'Spring': 'spring', 'Summer': 'summer'}, {'name': 'termRadio'}, xmlNode='//page/term', hidden='term', m=12, l=12), el='term-year')
t.insert(input(type='text', lbl='Year:', id='year', xmlNode='//page/year', required=True, m=6, l=4), el='term-year')

t.insert(p('Appeal Information'), el='explanation-content')
t.insert(container('request'), el='explanation-content')
t.insert(label(txt='I am requesting: ', required=True), el='request')
t.insert(radio({'Late withdrawal from course(s) with potential refund.': 'withdrawal', 'Late drop (ONLY applicable for course(s) that never attended.': 'drop'}, {'name': 'requestRadio'}, xmlNode='//page/request', hidden='request', l=6), el='request')

t.insert(p('Please list course(s) for which you are appealing to drop or withdraw below:'), el='explanation-content')

t.insert(container('isReviewed'), el='explanation-content')
t.insert(label(txt='Have you reviewed this with an Enrollment Services Staff Member  or Program Advisor? ', required=True), el='isReviewed')
t.insert(radio({'Yes': 'yes', 'No': 'no'}, {'name': 'isReviewedRadio'}, xmlNode='//page/isReviewed', hidden='isReviewed', l=6), el='isReviewed')

t.insert(input(type='text', lbl='Name of the Enrollment Services Staff Member or Program Advisor:', id='advisor', xmlNode='//page/advisor'), el='explanation-content')

t.insert(p('NOTE: Appeals must be submitted complete with detailed statement and supporting documentation of an extenuating circumstance to be reviewed by the committee. Unawareness of college policies/deadline are not extenuating circumstance.'), el='explanation-content')

# output
t.save('AnokaT Exception to Policy eForm/AnokaT Exception to Policy eForm.xsl')
