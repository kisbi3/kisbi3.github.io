(() => {
 'use strict';
 const root=document.getElementById('research-home');
 if(!root)return;
 const filters=Array.from(root.querySelectorAll('[data-home-filter]'));
 const entries=Array.from(root.querySelectorAll('[data-home-category]'));
 filters.forEach(button=>button.addEventListener('click',()=>{
  const value=button.dataset.homeFilter;
  filters.forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  entries.forEach(entry=>entry.hidden=value!=='all'&&entry.dataset.homeCategory!==value);
 }));
})();
