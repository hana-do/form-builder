from lib.FormBuilder import eForm
from lib.helper import *

# initialize
t = eForm(formName="PTC Records Complaint eForm", withLogin=True, forMSU=False, css="ptcComplaint.css", js="ptcComplaint.js")

# logo & header (withLogin: loginSection, no login: formSection)
t.insert(logo_header(logo_src="Logo.jpg", logo_txt="Pine Technical & Community College", header_txt="Student Complaint Form"), pos=-1, el="loginSection")

# general info
t.insert(p(txt='Please read the policy and procedure regarding student complaints prior to submitting this form. Information can be found at http://www.pine.edu/about/public-information-and-policies/campus-policies/student-affairs/303.pdf'), pos=0, el='general-info')
t.insert(p(txt='Reminder: Please submit any supporting documentation.'), pos=0, el='general-info')
t.insert(p(txt='By completing this form, I acknowledge that I have read, understand, and will abide by the procedure and instructions of procedure 303 Student Complaints and Reporting.'), pos=0, el='general-info')

# student info (required for login: name, techid, email)
t.insert(container(id='student-info', txt='Student Information'), pos=-1, el='sig-info')
t.insert(input(xml=t.xml, type='text', id='lastName', xmlNode='//page/lastName', lbl='Last Name:', required=True, readonly=True, s=12, m=6, l=4), pos=0, el='student-info-content')
t.insert(input(xml=t.xml, type='text', id='firstName', xmlNode='//page/firstName', lbl='First Name:', required=True, readonly=True, s=12, m=6, l=4), pos=0, el='student-info-content')
t.insert(input(xml=t.xml, type='text', id='middleName', xmlNode='//page/middleName', lbl='Middle Name:', required=True, readonly=True, s=12, m=6, l=4), pos=0, el='student-info-content')
t.insert(input(xml=t.xml, type='text', id='displayStarId', xmlNode='//page/login/starId', lbl='Star ID:', required=True, readonly=True, s=12, m=6, l=4), pos=0, el='student-info-content')
t.insert(input(xml=t.xml, type='text', id='techId', xmlNode='//page/techId', lbl='Tech ID:', required=True, readonly=True, s=12, m=6, l=4), pos=0, el='student-info-content')
t.insert(input(xml=t.xml, type='email', id='email', xmlNode='//page/email', lbl='Email Address:', required=True, readonly=False, s=12, m=6, l=4), pos=0, el='student-info-content')
t.insert(input(xml=t.xml, type='text', id='phone', xmlNode='//page/phone', lbl='Phone Number:', required=True, readonly=False, s=12, m=6, l=4), pos=0, el='student-info-content')
t.insert(input(xml=t.xml, type='text', id='streetAdd', xmlNode='//page/streetAdd', lbl='Street Address:', required=True, readonly=False, s=12, m=6, l=4), pos=0, el='student-info-content')
t.insert(input(xml=t.xml, type='text', id='city', xmlNode='//page/city', lbl='City:', required=True, readonly=False, s=12, m=6, l=4), pos=0, el='student-info-content')
t.insert(input(xml=t.xml, type='text', id='state', xmlNode='//page/state', lbl='State:', required=True, readonly=False, s=12, m=6, l=4), pos=0, el='student-info-content')
t.insert(input(xml=t.xml, type='text', id='zip', xmlNode='//page/zip', lbl='Zip:', required=True, readonly=False, s=12, m=6, l=4), pos=0, el='student-info-content')
t.insert(input(xml=t.xml, type='text', id='complaintAgainst', xmlNode='//page/complaintAgainst', lbl='Complaint filed against (Instructor Name):', required=True, readonly=False, s=12, m=6, l=4), pos=0, el='student-info-content')

## hidden
t.insert(tag('div', attrs={'style': 'display:none;', 'id': 'hidden-info'}), pos=0, el='student-info-content')
t.insert(input(xml=t.xml, type='hidden', id='fullName', xmlNode='//page/fullName', lbl='Full Name:', required=False, readonly=True, s=12, m=6, l=4), pos=0, el='hidden-info')

# complaint info
t.insert(container(id='complaint-info', txt='Complaint Detail'), pos=-1, el='sig-info')
t.insert(textarea(xml=t.xml, id='natureOfComplaint', xmlNode='//page/natureOfComplaint', lbl='Describe the nature of the complaint/grievance. Be Factual - include names, dates, locations, etc.', required=True, readonly=False), pos=0, el='complaint-info-content')
t.insert(textarea(xml=t.xml, id='actionTaken', xmlNode='//page/actionTaken', lbl='Describe the actions you have taken to resolve the issue.', required=True, readonly=False), pos=0, el='complaint-info-content')
t.insert(textarea(xml=t.xml, id='resolutionRequested', xmlNode='//page/resolutionRequested', lbl='Describe the resolution/action requested.', required=True, readonly=False), pos=0, el='complaint-info-content')

# output
t.save()