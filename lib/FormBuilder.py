from lxml import etree
from lib.helper import *
import re

class eForm:
  """
  Create a new instance of eForm
  :param formName: name of the form
  :param formName_abbr: abbreviated name of the form
  :param withLogin: containing login section or not
  :param forMSU: MSU or Mnscu
  """
  def __init__(self, formName, formName_abbr, schoolCode, withLogin=True, forMSU=False):
    """ DATA DEFINITION """
    # a separate folder for each eForm
    self.formPath = formName + '/' + formName

    # initialize the data definition file
    _fxml = open(self.formPath + '.xml', 'w')

    # add processing instructions
    _fxml.write('<?xml-stylesheet type="text/xsl" href="' + formName + '.xsl" ?>\n')

    # add root node
    self.xml = etree.Element('page')

    # add children nodes
    _node = etree.Element('formTitle')
    _node.text = formName
    self.xml.append(_node)

    if withLogin == True:
      _node = etree.Element('rdtoken')
      _node.text = "" # to get the closing tag
      self.xml.append(_node)

      # login
      _node = etree.Element('login')
      etree.SubElement(_node, 'starId', {'infd_required': 'true', 'infd_name': 'A StarID is required'})
      etree.SubElement(_node, 'loginTimestamp').text = ""
      etree.SubElement(_node, 'userAgent').text = ""
      self.xml.append(_node)

      # signature
      _node = etree.Element('signature')
      _child = etree.Element('signatureConfirm',
                             {'infd_required': 'true', 'infd_name': 'You must agree to all terms and conditions'})
      _node.append(_child)
      _child = etree.Element('signatureString')
      _child.text = ""
      _node.append(_child)
      _child = etree.Element('signatureTimestamp')
      _child.text = ""
      _node.append(_child)
      self.xml.append(_node)

      if forMSU == True:
        _f = 'lib/templateLoginMSU.xsl'
      else:
        _f = 'lib/templateLogin.xsl'
    else:
      _f = 'lib/template.xsl'

      # signature
      _node = etree.Element('signature')
      self.xml.append(_node)
      _node = etree.Element('signatureDate', {'infd_name': 'You must affirm that the information provided is correct.', 'infd_required': 'true'})
      self.xml.append(_node)

    # office
    _node = etree.Element('office')
    etree.SubElement(_node, 'adminNotes').text = ""
    etree.SubElement(_node, 'adminSig').text =""
    etree.SubElement(_node, 'adminSigDate').text = ""
    self.xml.append(_node)

    # add stateinfo nodes for local testing
    _node = etree.Element('StateInfo')

    _client = etree.Element('Client')
    _type = etree.Element('Type')
    _type.text = 'ImageNow'
    _client.append(_type)

    _queue = etree.Element('CurrentQueueName')
    _queue.text = ""

    _username = etree.Element('UserName')
    _username.text = 'zm7430nd'

    _node.append(_client)
    _node.append(_queue)
    _node.append(_username)
    self.xml.append(_node)

    """ STYLESHEET """
    # initialize stylesheet for data definition file
    _markup = open(_f, 'r')
    _parser = etree.XMLParser(remove_blank_text=True) # pretty print
    self.doc = etree.parse(_markup, _parser)

    # modify css and js file names
    _el = self.doc.xpath("//*[@href=$href]", href='form.css')[0]
    _el.attrib['href'] = formName_abbr + '.css'
    _el = self.doc.xpath("//*[@src=$src]", src='form.js')[0]
    _el.attrib['src'] = formName_abbr + '.js'

    # modify form name in log and school code
    _el = self.doc.xpath("//*[@value=$value]", value='formName_abbr')[0]
    _el.attrib['value'] = formName_abbr
    _el = self.doc.xpath("//*[@value=$value]", value='schoolCode')[0]
    _el.attrib['value'] = schoolCode

    _markup.close()

  """
  Insert form elements into eForm
  :param tag: html tag to be inserted
  :param pos: inside, before, after the el element
  :param el: the mark
  """
  def insert(self, tag, pos, el):
    if isinstance(tag, str):
      print("please put plain text in a tag")
      return

    _el = self.doc.xpath("//*[@id=$id]", id=el)[0]
    if pos == 1:
      _el.addnext(tag)
    elif pos == 0:  # append
      _el.append(tag)
    elif pos == -1:  # before
      _el.addprevious(tag)

    return self

  """
  Save eForm
  """
  def save(self):
    # write to data definition file
    f = open(self.formPath + '.xml', 'a')
    f.write(etree.tostring(self.xml, pretty_print=True, encoding="unicode"))
    f.close()

    # write to stylesheet
    f = open(self.formPath + '.xsl', 'w')
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n') # add xml instruction
    f.write(etree.tostring(self.doc, pretty_print=True, encoding="unicode"))
    f.close()

