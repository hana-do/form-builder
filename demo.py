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

t.insert(row(), id='term-year', el='all-that-applies-content')
t.insert(col(s=12, m=8, l=8), id='term', el='term-year')
t.insert(label(txt='1. Term and Year you intend to complete your certification:', required=True), el='term')
t.insert(radio({'Spring': 'spring', 'Fall': 'fall', 'Summer': 'summer'}, {'name': 'termRadio'}, xmlNode='//page/term', hidden='term', m=4), el='term')
t.insert(input('text', 'Year:', 'year', '//page/year', required=True, m=4), el='term-year')

t.insert(row(), id='campus-sect', el='all-that-applies-content')
t.insert(col(m=12, l=12), id='campus', el='campus-sect')
t.insert(label(txt='2. Campus you intend to complete your certification from:', required=True), el='campus')
t.insert(radio({'Cambridge (5005)': 'cambridge', 'Coon Rapids (5004)': 'coon'}, {'name': 'campusRadio'}, xmlNode='//page/campus', hidden='campus', l=6), el='campus')

t.insert(row(), id='catalog-sect', el='all-that-applies-content')
t.insert(col(m=12, l=12), id='catalog', el='catalog-sect')
t.insert(label(txt='3. According to the college catalog, you may choose to fulfill degree requirements outlined in any single catalog under which you have been enrolled, provided the catalog was in effect no more than four years preceding the date of completion.', required=True), el='catalog')



t.save()
