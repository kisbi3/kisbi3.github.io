"""Build both reading views from one public content source. Python standard library only."""
from pathlib import Path
import json,re,html,base64
ROOT=Path(__file__).resolve().parent;SRC=ROOT/'source';OUT=ROOT/'dist'
def build():
 OUT.mkdir(exist_ok=True)
 content=json.loads((SRC/'content.json').read_text(encoding='utf8'))
 assets=json.loads((SRC/'assets.json').read_text(encoding='utf8'))
 doc=(SRC/'layout.html').read_text(encoding='utf8')
 def replace(m):
  type,key=m.groups()
  if type=='FILE':return (SRC/key).read_text(encoding='utf8')
  if type=='ASSET':return assets[key]+','+base64.b64encode((SRC/'assets'/key).read_bytes()).decode()
  item=content[key];v=item['value']
  if type in ['SVG','SVGWEB','SVGHOME']:
   if type in ['SVGWEB','SVGHOME']:
    ids=re.findall(r'\bid="([^"]+)"',v)
    prefix='home-copy-' if type=='SVGHOME' else 'web-copy-'
    for id in ids:v=v.replace('id="'+id+'"','id="'+prefix+id+'"').replace('url(#'+id+')','url(#'+prefix+id+')')
   return v
  return html.escape(v,quote=type=='ATTR') if item['kind']!='html' else v
 doc=re.sub(r'@@(CONTENT|ATTR|SVGHOME|SVGWEB|SVG|FILE|ASSET):([^@]+)@@',replace,doc)
 assert '@@CONTENT:' not in doc and '@@ASSET:' not in doc
 (OUT/'index.html').write_text(doc,encoding='utf8')
 (OUT/'slides.html').write_text(doc.replace('data-default-mode="web"','data-default-mode="deck"',1),encoding='utf8')
 (OUT/'.nojekyll').touch()
 print('Built dist/index.html and dist/slides.html')
if __name__=='__main__':build()
