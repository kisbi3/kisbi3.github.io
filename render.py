"""Generate public PDFs and verify the actual browser layouts."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,os,re,base64
ROOT=Path(__file__).resolve().parent;DIST=ROOT/'dist';QA=ROOT/'qa';QA.mkdir(exist_ok=True)
def render(channel=None):
 with sync_playwright() as p:
  options={'headless':True}
  if channel:options['channel']=channel
  b=p.chromium.launch(**options);page=b.new_page(viewport={'width':1440,'height':1000},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto((DIST/'index.html').as_uri());page.wait_for_function('window.Portfolio');page.evaluate('document.fonts.ready')
  if page.locator('#research-home').count():
   page.wait_for_timeout(900)
   page.screenshot(path=str(QA/'home-desktop.png'))
   for category,count in [('market',1),('physics',1),('engineering',2),('all',4)]:
    page.locator('[data-home-filter="'+category+'"]').click()
    assert page.locator('.work-entry:visible').count()==count
   assert page.locator('.home-photo img').count()==1
   assert page.locator('.hero-photo-credit a').count()==3
   page.locator('#selected-work').evaluate('(el)=>scrollTo(0,el.offsetTop-76)');page.screenshot(path=str(QA/'home-gallery.png'))
   for width in [1440,1024,768,390,360]:
    page.set_viewport_size({'width':width,'height':844})
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
   page.set_viewport_size({'width':1440,'height':1000});page.evaluate('scrollTo(0,0)')
  page.screenshot(path=str(QA/'web-desktop.png'),full_page=True)
  assert page.evaluate('window.Portfolio.getState().pages')==12
  assert page.locator('#toc-list li').count()==12
  assert page.locator('img').evaluate_all('(xs)=>xs.every(x=>x.complete&&x.naturalWidth>0)')
  ids=page.locator('#pages > .page').evaluate_all('(xs)=>xs.map(x=>x.id)')
  links=page.locator('a[href]').evaluate_all('(xs)=>[...new Set(xs.map(x=>x.getAttribute("href")))]')
  missing=page.evaluate('''()=>Array.from(document.querySelectorAll('a[href^="#"]')).map(x=>x.getAttribute('href')).filter(h=>h.length>1&&!document.getElementById(h.slice(1)))''')
  assert not missing,missing
  assert page.evaluate('''()=>{const ids=Array.from(document.querySelectorAll('[id]'),x=>x.id);return ids.length===new Set(ids).size}''')
  page.evaluate('window.Portfolio.setMode("deck")')
  bounds=[]
  for i,id in enumerate(ids):
   page.evaluate('(i)=>window.Portfolio.gotoPage(i)',i)
   bounds.append(page.locator('#'+id).evaluate('''el=>({id:el.id,h:el.clientHeight,scroll:el.scrollHeight,footer:el.querySelector('.page-footer').getBoundingClientRect().bottom,page:el.getBoundingClientRect().bottom})'''))
   page.screenshot(path=str(QA/f'slide-{i+1:02}.png'))
  assert all(x['scroll']<=x['h']+2 for x in bounds),bounds
  page.keyboard.press('Home');assert page.evaluate('window.Portfolio.getState().index')==0
  page.keyboard.press('ArrowRight');assert page.evaluate('window.Portfolio.getState().index')==1
  page.evaluate('window.Portfolio.setMode("web")')
  page.set_viewport_size({'width':390,'height':844});page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(QA/'web-mobile.png'),full_page=True)
  mobile=page.evaluate('({viewport:innerWidth,scroll:document.documentElement.scrollWidth})');assert mobile['scroll']<=mobile['viewport'],mobile
  (DIST/'downloads').mkdir(exist_ok=True)
  page.set_viewport_size({'width':1440,'height':1000})
  for target,name in [('deck','Jaesung_Kim_Portfolio_Slides.pdf'),('web','Jaesung_Kim_Portfolio_Web.pdf')]:
   page.evaluate('(t)=>window.Portfolio.preparePrint(t)',target)
   page.pdf(path=str(DIST/'downloads'/name),print_background=True,prefer_css_page_size=True,display_header_footer=False)
   page.evaluate('window.Portfolio.restorePrint()')
  payload={target:'data:application/pdf;base64,'+base64.b64encode((DIST/'downloads'/name).read_bytes()).decode() for target,name in [('web','Jaesung_Kim_Portfolio_Web.pdf'),('deck','Jaesung_Kim_Portfolio_Slides.pdf')]}
  for target,name in [('web','Jaesung_Kim_Portfolio_Web.html'),('deck','Jaesung_Kim_Portfolio_Slides.html')]:
   doc=page.evaluate('(t)=>window.Portfolio.serializeHTML(t)',target)
   doc=re.sub(r'(<script[^>]*id="pdf-downloads"[^>]*>).*?(</script>)',lambda m:m[1]+json.dumps(payload)+m[2],doc,flags=re.S)
   (DIST/'downloads'/name).write_text(doc,encoding='utf8')
  report={'slides':len(ids),'ids':ids,'mobile':mobile,'slideBounds':bounds,'consoleErrors':errors,'links':links}
  (QA/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
  assert not errors,errors
  b.close();print('Browser QA passed; PDFs and offline HTML generated.')
if __name__=='__main__':render(os.environ.get('BROWSER_CHANNEL'))
