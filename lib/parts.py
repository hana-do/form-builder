""" Form parts """
from bs4 import BeautifulSoup

def add(tag_name, attrs={}, txt=''):
    bs = BeautifulSoup('', 'html.parser')
    tag = bs.new_tag(tag_name)
    for a in attrs.keys():
        tag[a] = attrs[a]
    tag.string = txt

    return tag

def row():
    return add('div', {'class': 'row'})

def col(s=12, m=8, l=4):
    return add('div', {'class': 'small-' + str(s) + ' medium-' + str(m) + ' large-' + str(l) + ' columns'})

def img(src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QsPDhss3LcOZQAAAU5JREFUOMvdkzFLA0EQhd/bO7iIYmklaCUopLAQA6KNaawt9BeIgnUwLHPJRchfEBR7CyGWgiDY2SlIQBT/gDaCoGDudiy8SLwkBiwz1c7y+GZ25i0wnFEqlSZFZKGdi8iiiOR7aU32QkR2c7ncPcljAARAkgckb8IwrGf1fg/oJ8lRAHkR2VDVmOQ8AKjqY1bMHgCGYXhFchnAg6omJGcBXEZRtNoXYK2dMsaMt1qtD9/3p40x5yS9tHICYF1Vn0mOxXH8Uq/Xb389wff9PQDbQRB0t/QNOiPZ1h4B2MoO0fxnYz8dOOcOVbWhqq8kJzzPa3RAXZIkawCenHMjJN/+GiIqlcoFgKKq3pEMAMwAuCa5VK1W3SAfbAIopum+cy5KzwXn3M5AI6XVYlVt1mq1U8/zTlS1CeC9j2+6o1wuz1lrVzpWXLDWTg3pz/0CQnd2Jos49xUAAAAASUVORK5CYII=', alt='required'):
    return add('img', {'src': src, 'alt': alt})

def p(txt=''):
    return add('p', txt=txt)

def span(txt=''):
    return add('span', txt=txt)

