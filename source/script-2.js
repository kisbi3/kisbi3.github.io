(() => {
 'use strict';
 const pages = Array.from(document.querySelectorAll('#pages > .page'));
 const body = document.body;
 const exportDialog = document.getElementById('export-dialog');
 const tocDialog = document.getElementById('toc-dialog');
 const figureDialog = document.getElementById('figure-dialog');
 const fmt = document.getElementById('export-format');
 const layout = document.getElementById('export-layout');
 let index = 0, mode = 'web', restoring = null, toastTimer;
 const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
 const getHashIndex = () => pages.findIndex(p => '#'+p.id === location.hash);
 const hashIndex = getHashIndex();
 if (hashIndex >= 0) index = hashIndex;
 function toast(message) {
   const el = document.getElementById('toast'); el.textContent=message; el.classList.add('visible');
   clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('visible'),3500);
 }
 function viewTarget(i) {
   return mode==='web' && !body.dataset.print && window.PortfolioWeb ? window.PortfolioWeb.targetForPage(pages[i].id) : pages[i];
 }
 function resize() {
   if (mode !== 'deck') return;
   const rect = document.getElementById('stage').getBoundingClientRect();
   const scale = Math.min(rect.width/1280,rect.height/720);
   document.getElementById('pages').style.setProperty('--deck-scale', String(scale));
 }
 function updateControls() {
   document.getElementById('deck-position').textContent = String(index+1).padStart(2,'0')+' / '+pages.length;
   document.getElementById('prev').disabled=index===0;
   document.getElementById('deck-next').disabled=index===pages.length-1;
   document.getElementById('deck-title').textContent=pages[index].dataset.title;
 }
 function setMode(value, options={}) {
   if(value==='deck' && mode==='web' && !body.dataset.print && !options.preserveIndex && window.PortfolioWeb) index=window.PortfolioWeb.activeIndex(index);
   mode=value==='deck'?'deck':'web';
   if(mode==='deck'){document.querySelectorAll('#pages .event').forEach(e=>e.hidden=false);document.querySelectorAll('#pages [data-filter]').forEach(b=>{b.classList.toggle('selected',b.dataset.filter==='all');b.setAttribute('aria-pressed',String(b.dataset.filter==='all'));});}
   body.classList.toggle('mode-deck',mode==='deck');body.classList.toggle('mode-web',mode==='web');
   pages.forEach((p,i)=>p.classList.toggle('active',i===index));
   document.querySelectorAll('[data-mode-button]').forEach(b=>b.setAttribute('aria-pressed', String(b.dataset.modeButton===mode)));
   updateControls();resize();
   if (mode==='web' && !options.noScroll) requestAnimationFrame(()=>viewTarget(index).scrollIntoView({behavior:'instant',block:'start'}));
 }
 function gotoPage(i, setHash=true) {
   index=clamp(i,0,pages.length-1);pages.forEach((p,j)=>p.classList.toggle('active',j===index));
   updateControls();
   if (setHash) { try{history.replaceState(null,'','#'+pages[index].id);}catch(_){} }
   if (mode==='web') viewTarget(index).scrollIntoView({behavior:'smooth',block:'start'});
 }
 function closeAll() {document.querySelectorAll('dialog[open]').forEach(d=>d.close());}
 function openExport(){layout.value=mode;updateDescription();exportDialog.showModal();}
 function updateDescription() {
   const descriptions={
    'web-pdf':'펼침 내용을 모두 포함한 웹 읽기용 PDF입니다. 동일한 공개 내용으로 생성한 PDF를 다운로드합니다.',
    'deck-pdf':'본문 11장과 부록 1장을 16:9 PDF로 저장합니다. 동일한 공개 내용으로 생성한 PDF를 다운로드합니다.',
    'web-html':'스크롤형 웹페이지로 시작하는 단일 HTML입니다. 이미지·도식·두 가지 보기 방식이 파일 안에 포함됩니다.',
    'deck-html':'슬라이드 보기로 시작하는 단일 HTML입니다. 방향키·목차로 이동하며, 웹 보기로 전환할 수 있습니다.'
   };
   document.getElementById('download-description').textContent=descriptions[layout.value+'-'+fmt.value];
   document.getElementById('download-now').textContent=(layout.value==='web'?'웹페이지형':'슬라이드형')+(fmt.value==='pdf'?' PDF 다운로드':' HTML 다운로드');
 }
 function saveBlob(blob, filename) {
   const url=URL.createObjectURL(blob), a=document.createElement('a');
   a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),60000);
 }
 function serializeHTML(target) {
   const copy = document.documentElement.cloneNode(true);
   copy.dataset.defaultMode=target;
   const cb=copy.querySelector('body');cb.className=target==='deck'?'mode-deck':'mode-web';cb.removeAttribute('data-print');
   copy.querySelectorAll('dialog').forEach(d=>d.removeAttribute('open'));
   copy.querySelectorAll('.page').forEach((p,i)=>p.classList.toggle('active',i===0));
   copy.querySelectorAll('.event').forEach(p=>p.removeAttribute('hidden'));
   copy.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('selected',b.dataset.filter==='all');b.setAttribute('aria-pressed',String(b.dataset.filter==='all'));});
   copy.querySelectorAll('[data-mode-button]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.modeButton===target)));
   copy.querySelector('#pages').removeAttribute('style');
   copy.querySelector('#read-progress').removeAttribute('style');
   copy.querySelector('#toast').className='';copy.querySelector('#toast').textContent='';
   copy.querySelector('#figure-content').innerHTML='';
   { const ps=copy.querySelector('#print-size'); if(ps) ps.textContent=''; }
   copy.querySelector('#deck-position').textContent='01 / '+pages.length;
   copy.querySelector('#prev').setAttribute('disabled','');copy.querySelector('#deck-next').removeAttribute('disabled');
   if(window.PortfolioWeb) window.PortfolioWeb.resetExport(copy);
   return '<!DOCTYPE html>\n'+copy.outerHTML;
 }
 function downloadHTML(target) {
   if(location.protocol !== 'file:'){ const a=document.createElement('a'); a.href='downloads/'+(target==='web'?'Jaesung_Kim_Portfolio_Web.html':'Jaesung_Kim_Portfolio_Slides.html'); a.download=a.href.split('/').pop(); a.click(); return; }

   saveBlob(new Blob([serializeHTML(target)],{type:'text/html;charset=utf-8'}),target==='web'?'Jaesung_Kim_Portfolio_Web.html':'Jaesung_Kim_Portfolio_Slides.html');
   toast('HTML 파일을 저장했습니다. 브라우저에서 다시 열 수 있습니다.');
 }
 function downloadPDF(target) {
   let payload;
   try { payload=JSON.parse(document.getElementById('pdf-downloads').textContent); }
   catch (_) { toast('PDF 경로가 없습니다. 현재 내용 인쇄를 이용해 주세요.');return; }
   const href=payload[target];
   if (!href) { printCurrent(target); return; }
   const a=document.createElement('a');
   a.href=href;
   a.download=target==='web'?'Jaesung_Kim_Portfolio_Web.pdf':'Jaesung_Kim_Portfolio_Slides.pdf';
   document.body.appendChild(a);a.click();a.remove();
   toast('PDF 다운로드를 시작했습니다.');
 }
 async function preparePrint(target) {
   closeAll();
   if (!restoring) restoring={mode,index,scroll:scrollY};
   document.getElementById('print-size').textContent='';
   setMode(target,{noScroll:true});body.dataset.print=target;
   if (document.fonts && document.fonts.ready) await document.fonts.ready;
   await Promise.all(Array.from(document.images).map(im=>im.decode?im.decode().catch(()=>{}):Promise.resolve()));
   if(target==='web' && window.PortfolioWeb) return window.PortfolioWeb.preparePrint();
   if(target==='web') {
     // Temporary offscreen-width measurement; the actual printed document uses these same dimensions.
     const m=document.createElement('style');m.id='measure-print';
     m.textContent='body{width:1280px!important}#pages{max-width:none!important;width:1280px!important;margin:0!important;padding:0 48px!important}.page{padding:58px 0 37px!important}.page.hero{padding-top:36px!important}.filters{display:none!important}.event[hidden]{display:grid!important}.web-only{display:block!important}.narrative{columns:2!important}.narrative:has(.roadmap){columns:1!important}.diagram{min-width:0!important}.diagram-scroll{overflow:visible!important}.diagram-scroll::after{display:none!important}';
     document.head.appendChild(m);
     await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
     const height=Math.ceil(document.getElementById('pages').getBoundingClientRect().height)+4;
     document.getElementById('print-size').textContent='@page{size:1280px '+height+'px;margin:0}';
     m.remove();return {width:1280,height};
   }
   document.getElementById('print-size').textContent='@page{size:1280px 720px;margin:0}';return {width:1280,height:720};
 }
 function restorePrint() {
   const webScroll=window.PortfolioWeb ? window.PortfolioWeb.restorePrint() : null;
   body.removeAttribute('data-print');document.getElementById('print-size').textContent='';
   if(restoring){const prev=restoring;restoring=null;index=prev.index;setMode(prev.mode,{noScroll:true,preserveIndex:true});if(prev.mode==='web')scrollTo(0,prev.scroll);}else if(webScroll!==null && mode==='web')requestAnimationFrame(()=>scrollTo(0,webScroll));
 }
 async function printCurrent(target) {
   await preparePrint(target);await new Promise(r=>setTimeout(r,150));window.print();
 }
 document.querySelectorAll('[data-mode-button]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.modeButton)));
 document.querySelectorAll('[data-export]').forEach(b=>b.addEventListener('click',openExport));
 document.querySelectorAll('[data-toc]').forEach(b=>b.addEventListener('click',()=>tocDialog.showModal()));
 document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
 document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
 document.getElementById('prev').addEventListener('click',()=>gotoPage(index-1));
 document.getElementById('deck-next').addEventListener('click',()=>gotoPage(index+1));
 fmt.addEventListener('change',updateDescription);layout.addEventListener('change',updateDescription);
 document.getElementById('download-now').addEventListener('click',()=>{if(fmt.value==='html')downloadHTML(layout.value);else downloadPDF(layout.value);});
 document.getElementById('print-current').addEventListener('click',()=>printCurrent(layout.value));
 document.getElementById('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(_){toast('이 환경에서는 전체화면을 지원하지 않습니다.');}});
 document.querySelectorAll('.main-nav a,.brand,.web-end a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const i=pages.findIndex(p=>'#'+p.id===a.hash);if(i>=0){e.preventDefault();gotoPage(i);}}));
 document.getElementById('toc-list').replaceChildren();
 pages.forEach((p,i)=>{
   const li=document.createElement('li'),b=document.createElement('button');
   const small=document.createElement('small');small.textContent=p.dataset.number;
   const label=document.createElement('span');label.textContent=p.dataset.title;
   b.append(small,label);b.addEventListener('click',()=>{tocDialog.close();gotoPage(i);});li.appendChild(b);document.getElementById('toc-list').appendChild(li);
 });
 document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
   const v=b.dataset.filter, scope=b.closest('#web-reading') || document.getElementById('pages');scope.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});
   scope.querySelectorAll('.event').forEach(e=>e.hidden=!(v==='all'||e.dataset.kind===v||(v==='papers'&&['Publication','Preprint'].includes(e.dataset.kind))));
 }));
 function showGraphic(original, figcap) {
   const container=document.getElementById('figure-content'), viewport=document.createElement('div');
   viewport.className='figure-viewport';viewport.tabIndex=0;viewport.setAttribute('role','region');viewport.setAttribute('aria-label',figureDialog.dataset.panHint);
   const copy=original.cloneNode(true), ids=new Map();
   copy.querySelectorAll('[id]').forEach(n=>{ids.set(n.id,'figure-copy-'+n.id);n.id='figure-copy-'+n.id;});
   copy.querySelectorAll('*').forEach(n=>Array.from(n.attributes).forEach(a=>{
     let value=a.value;ids.forEach((next,prev)=>{value=value.replaceAll('url(#'+prev+')','url(#'+next+')');});
     if(value!==a.value)n.setAttribute(a.name,value);
   }));
   viewport.append(copy);container.replaceChildren(viewport);
   const hint=document.createElement('p');hint.className='figure-pan-hint';hint.textContent=figureDialog.dataset.panHint;container.prepend(hint);
   if(figcap){const p=document.createElement('p');p.innerHTML=figcap.innerHTML;container.append(p);}
   figureDialog.showModal();
 }
 document.querySelectorAll('.zoom-figure').forEach(b=>b.addEventListener('click',()=>showGraphic(b.querySelector('img'),b.closest('figure').querySelector('figcaption'))));
 document.querySelectorAll('#web-reading .diagram-scroll').forEach(view=>{
   const svg=view.querySelector('svg');if(!svg)return;
   view.tabIndex=0;view.setAttribute('role','button');view.setAttribute('aria-label',figureDialog.dataset.diagramLabel);
   view.addEventListener('click',()=>showGraphic(svg,null));
   view.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showGraphic(svg,null);}});
 });
 window.addEventListener('resize',resize);
 window.addEventListener('hashchange',()=>{const i=getHashIndex();if(i>=0)gotoPage(i,false);});
 window.addEventListener('afterprint',restorePrint);
 // Native Ctrl/Cmd+P uses the current view; generated exports always call preparePrint first.
 window.addEventListener('beforeprint',()=>{if(!body.dataset.print){body.dataset.print=mode;if(mode==='web' && window.PortfolioWeb) window.PortfolioWeb.preparePrint();else document.getElementById('print-size').textContent=mode==='deck'?'@page{size:1280px 720px;margin:0}':'@page{size:A4 landscape;margin:12mm}';}});
 let scrollPending=false;
 window.addEventListener('scroll',()=>{
  if(mode!=='web'||scrollPending||body.dataset.print)return;scrollPending=true;
  requestAnimationFrame(()=>{scrollPending=false;const h=document.documentElement.scrollHeight-innerHeight;document.getElementById('read-progress').style.width=(h>0?scrollY/h*100:0)+'%';
   let best=0;if(window.PortfolioWeb) best=window.PortfolioWeb.activeIndex(index);else pages.forEach((p,i)=>{if(p.getBoundingClientRect().top<=innerHeight*.35)best=i;});index=best;updateControls();});
 },{passive:true});
 document.addEventListener('keydown',e=>{
   if(document.querySelector('dialog[open]'))return;
   if(e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;
   if(document.activeElement.tagName==='BUTTON' && [' ','Enter'].includes(e.key))return;
   if(e.key.toLowerCase()==='t'){e.preventDefault();tocDialog.showModal();return;}
   if(e.key.toLowerCase()==='p'){e.preventDefault();openExport();return;}
   if(mode==='deck'){
    if(['ArrowRight','ArrowDown','PageDown',' '].includes(e.key)){e.preventDefault();gotoPage(index+1);}
    else if(['ArrowLeft','ArrowUp','PageUp'].includes(e.key)){e.preventDefault();gotoPage(index-1);}
    else if(e.key==='Home'){e.preventDefault();gotoPage(0);}
    else if(e.key==='End'){e.preventDefault();gotoPage(pages.length-1);}
    else if(e.key==='Escape')setMode('web');
   }
 });
 const initial=document.documentElement.dataset.defaultMode==='deck'?'deck':'web';
 setMode(initial,{noScroll:true});
 if(initial==='web'&&hashIndex>=0)requestAnimationFrame(()=>viewTarget(index).scrollIntoView({behavior:'instant'}));
 window.Portfolio={setMode,gotoPage,preparePrint,restorePrint,serializeHTML,downloadHTML,downloadPDF,getState:()=>({mode,index,pages:pages.length})};
})();
