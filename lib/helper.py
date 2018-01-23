from lib.parts import *
import copy

""" Find and modify:
obj - eForm object
type -  (str) component's tag
attrs - (dict) attributes and existing values of component to be modified
new - (dict) attributes and new values
"""
def findMod(obj, type, attrs, new):
    try:
        for key in new.keys():
            obj.bs.find(type, attrs)[key]= new[key]
    except:
        print("something off")

""" Change id attribute """
def changeId(tag, i, id):
    tmp = copy.copy(tag)
    if not isinstance(tmp, str) and alias(tmp) != "noId":
        if id == "":
            tmp['id'] = alias(tmp) + '-' + str(i)
        else:
            tmp['id'] = id
    return tmp

""" Get shorthand aliases of components """
def alias(part):
    if str(part).__contains__('<div class="row'):
        return 'row'
    elif str(part).__contains__('<div class="small'):
        return 'col'
    elif str(part).__contains__('<img'):
        return 'img'
    elif str(part).__contains__('<p'):
        return 'p'
    elif str(part).__contains__('<span'):
        return 'span'
    elif str(part).__contains__('<xsl') or str(part).__contains__('<br') or str(part).__contains__('<hr'):
        return 'noId'
    else:
        return 'custom'
