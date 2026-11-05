import React,{useEffect,useMemo,useState} from 'react';

const STORE='acl-foundboard-v3';
// Fictional campus locations for this standalone teaching demo.
// A found report can exist before the item has been received by staff.
const seed=[
 {id:'f1',title:'Black backpack',category:'accessories',status:'lost',location:'Library - second floor',description:'Black backpack with a small red keychain. Left near the study desks.',owner:'you',created:'Oct 23',emoji:'🎒'},
 {id:'f2',title:'Dark backpack',category:'accessories',status:'found',location:'Library - main stairwell',description:'Found a dark backpack with a small red keychain near the library stairs.',owner:'other',created:'Oct 24',emoji:'🎒',collectionPoint:'Campus Security Desk',handoverStatus:'received'},
 {id:'f3',title:'Student ID card',category:'documents',status:'found',location:'Near Gate 3',description:'A student card was turned in. No personal details are published.',owner:'other',created:'Oct 24',emoji:'🪪',collectionPoint:'Student Services Office',handoverStatus:'received'},
 {id:'f4',title:'Wireless earbuds',category:'electronics',status:'lost',location:'Main cafeteria',description:'White earbuds in a distinctive blue case. Lost on Monday.',owner:'other',created:'Oct 24',emoji:'🎧'},
 {id:'f5',title:'Earbuds in blue case',category:'electronics',status:'found',location:'Cafeteria entrance',description:'White earbuds in a blue charging case found near the coffee counter.',owner:'other',created:'Oct 25',emoji:'🎧',collectionPoint:'',handoverStatus:'reported'},
 {id:'f6',title:'Blue sports bottle',category:'other',status:'lost',location:'Sports Hall - lockers',description:'Tall blue metal water bottle, possibly left after practice.',owner:'other',created:'Oct 25',emoji:'🥤'},
 {id:'f7',title:'Metal water bottle',category:'other',status:'found',location:'Sports Hall - benches',description:'Blue reusable metal bottle found after a basketball session.',owner:'other',created:'Oct 25',emoji:'🥤',collectionPoint:'Campus Security Desk',handoverStatus:'received'},
 {id:'f8',title:'Engineering lab coat',category:'clothing',status:'claimed',location:'Building C',description:'Owner verified the item and collected it from the reception desk.',owner:'you',created:'Oct 22',emoji:'🥼',collectionPoint:'Library Reception',handoverStatus:'released'},
 {id:'f9',title:'Small notebook',category:'other',status:'lost',location:'C7 lecture room',description:'Brown cover with handwritten engineering notes.',owner:'other',created:'Oct 25',emoji:'📒'},
 {id:'f10',title:'Scientific calculator',category:'electronics',status:'lost',location:'B2 lecture hall',description:'Black scientific calculator with a protective cover.',owner:'other',created:'Oct 26',emoji:'🧮'},
 {id:'f11',title:'Calculator',category:'electronics',status:'found',location:'B2 study area',description:'Scientific calculator with a black cover, found on a desk.',owner:'you',created:'Oct 26',emoji:'🧮',collectionPoint:'Library Reception',handoverStatus:'received'},
 {id:'f12',title:'Canvas tote bag',category:'accessories',status:'lost',location:'Main campus bus stop',description:'Beige tote with green writing on one side.',owner:'other',created:'Oct 26',emoji:'👜'},
 {id:'f13',title:'USB flash drive',category:'electronics',status:'found',location:'Building A computer lab',description:'A small black flash drive was found beside a workstation.',owner:'other',created:'Oct 27',emoji:'💾',collectionPoint:'',handoverStatus:'reported'},
];
const categories=['all','electronics','clothing','documents','accessories','other'];
const statuses=['lost','found','claimed'];
const clean={title:'',category:'',status:'',location:'',description:''};
function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
// Issue 1: return an error per field (same rules as before) so the form can say exactly what to fix.
function validate(f,arr,id){
 const e={};
 if(!statuses.includes(f.status))e.status='Choose lost, found or claimed.';
 if(!f.title.trim()||f.title.trim().length<2)e.title='Title must be at least 2 characters.';
 else if(arr.some(r=>r.id!==id&&r.title.toLowerCase()===f.title.trim().toLowerCase()&&(r.location||'').toLowerCase()===(f.location||'').trim().toLowerCase()))e.title='An item with the same title has already been reported at this location. Use a more specific title, or edit your existing report.';
 if(!categories.slice(1).includes(f.category))e.category='Choose a category.';
 return e;
}
const fieldOrder=['status','title','category'];
const fieldNames={status:'Status',title:'Item title',category:'Category'};
// Issue 2: find likely matches between a lost report and found reports.
const stop=new Set(['with','from','near','found','lost','small','left','after','possibly','this','that','have','were','into','your']);
const words=x=>new Set(`${x.title} ${x.description||''}`.toLowerCase().match(/[a-z]{4,}/g)?.filter(w=>!stop.has(w))||[]);
function matchesFor(item,all){
 if(item.status!=='lost')return [];
 const w=words(item);
 return all.filter(o=>o.status==='found'&&o.id!==item.id&&o.category===item.category&&[...words(o)].filter(x=>w.has(x)).length>=2);
}
const collectionPoints=['Campus Security Desk','Student Services Office','Library Reception'];
export default function App(){
 const [items,setItems]=useState(getSaved);
 const [page,setPage]=useState('board');
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [filterStatus,setFilterStatus]=useState('all');
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [errors,setErrors]=useState({});
 const [message,setMessage]=useState('');
 const [initialForm,setInitialForm]=useState(clean);
 useEffect(()=>{try{localStorage.setItem(STORE,JSON.stringify(items))}catch{}},[items]);
 const filtered=useMemo(()=>items.filter(x=>(cat==='all'||x.category===cat)&&(filterStatus==='all'||x.status===filterStatus)&&`${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q.trim().toLowerCase())),[items,q,cat,filterStatus]);
 // Issue 3: make the active filter state visible and removable.
 const activeFilters=[
  q.trim()&&{key:'q',label:`Search: “${q.trim()}”`,clear:()=>setQ('')},
  cat!=='all'&&{key:'cat',label:`Category: ${cap(cat)}`,clear:()=>setCat('all')},
  filterStatus!=='all'&&{key:'status',label:`Status: ${cap(filterStatus)}`,clear:()=>setFilterStatus('all')},
 ].filter(Boolean);
 function clearFilters(){setQ('');setCat('all');setFilterStatus('all');}
 const activeNav=page!=='board'?null:filterStatus==='all'?'board':filterStatus;
 // Issue 3: warn before leaving the form with unsaved changes.
 const dirty=page==='form'&&JSON.stringify(form)!==JSON.stringify(initialForm);
 function leaveForm(action){if(dirty&&!window.confirm('Discard your unsaved changes?'))return;action();}
 function goBoard(status){leaveForm(()=>{if(status)setFilterStatus(status);setPage('board');});}
 function openForm(f){setForm(f);setInitialForm(f);setErrors({});setPage('form');}
 // Issue 1: mark invalid fields, link them to their message, and clear the message once the user fixes the field.
 function field(k){return {id:`field-${k}`,value:form[k],onChange:e=>{const v=e.target.value;setForm(s=>({...s,[k]:v}));const clears=k==='location'?['title']:[k];if(clears.some(c=>errors[c]))setErrors(x=>{const n={...x};clears.forEach(c=>delete n[c]);return n;});},className:errors[k]?'invalid':undefined,'aria-invalid':errors[k]?true:undefined,'aria-describedby':errors[k]?`err-${k}`:undefined};}
 const fieldError=k=>errors[k]&&<span className="field-error" id={`err-${k}`}>⚠ {errors[k]}</span>;
 const errorList=fieldOrder.filter(k=>errors[k]);
 // Issue 2: tell each reader what to do next, depending on where the item is.
 function nextStep(item){
  if(item.status==='lost'){const m=matchesFor(item,items);return m.length?<div className="guide match"><strong>🔎 Possible {m.length===1?'match':'matches'} in Found</strong><ul>{m.map(o=><li key={o.id}>{o.title} — {o.handoverStatus==='received'&&o.collectionPoint?`held at ${o.collectionPoint}`:'not yet at a collection point'}</li>)}</ul></div>:null;}
  if(item.status==='claimed'||item.handoverStatus==='released')return <div className="guide done"><strong>✓ Collected by owner</strong><span>Ownership was verified before release.</span></div>;
  if(item.handoverStatus==='received'&&item.collectionPoint)return <div className="guide held"><strong>📍 Held at {item.collectionPoint}</strong><span>Is this yours? Go there with proof of ownership, such as your student ID and a detail only the owner would know. Staff release it after verifying.</span></div>;
  if(item.owner==='you')return <div className="guide pending"><strong>⏳ Not yet at a collection point</strong><span>Please hand it in at {collectionPoints.join(', ')} so the owner can recover it.</span></div>;
  return <div className="guide pending"><strong>⏳ Not yet at a collection point</strong><span>The finder has reported it but staff have not received it yet. Check back later. It will show a collection point once handed in.</span></div>;
 }
 // Issue 2: form wording that matches what the user is reporting.
 const formCopy={
  lost:{loc:'Where did you last have it?',locPh:'e.g., Library – second floor',desc:'Describe your item',descPh:'Colour, brand, case, stickers… details that help someone recognise it',tip:'Tip: you will need proof of ownership (e.g., student ID or a detail only you know) to collect an item from a collection point.'},
  found:{loc:'Where did you find it?',locPh:'e.g., Library – main stairwell',desc:'Describe what you found',descPh:'What it looks like. Leave out personal details from IDs or documents.',tip:`Next step: please hand the item to a campus collection point (${collectionPoints.join(', ')}). Your notice will show “Not yet at a collection point” until staff confirm they have it.`},
  claimed:{loc:'Location',locPh:'Location (optional)',desc:'More details',descPh:'Describe your item',tip:''},
 }[form.status]||{loc:'Location',locPh:'Location (optional)',desc:'More details',descPh:'Describe your item',tip:''};
 function create(){leaveForm(()=>{setCurrent(null);openForm({...clean});});}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);openForm({title:row.title,category:row.category,status:row.status,location:row.location||'',description:row.description||''});}
 function submit(e){e.preventDefault();const v=validate(form,items,current);const bad=fieldOrder.filter(k=>v[k]);if(bad.length){setErrors(v);setTimeout(()=>document.getElementById(`field-${bad[0]}`)?.focus(),0);return;}const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',emoji:current?items.find(x=>x.id===current)?.emoji:'📌',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
 if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage('Report updated.');}else{setItems([{id:`f-${Date.now()}`,...d},...items]);setMessage(d.status==='found'?'Your report has been posted. Next step: hand the item to a campus collection point so the owner can recover it.':'Your report has been posted.');}setPage('board');setCurrent(null);}
 function reset(){setItems(seed);setPage('board');setQ('');setCat('all');setFilterStatus('all');setMessage('Example reports restored.');}
 return <div className="notice-app"><header className="header"><div className="headline"><span className="sun">✺</span><button onClick={()=>goBoard('all')} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div><nav className="header-links" aria-label="Main">{[{key:'board',status:'all',label:'All notices'},{key:'lost',status:'lost',label:'Missing items'},{key:'found',status:'found',label:'Recently found'}].map(n=><button key={n.key} className={activeNav===n.key?'active':''} aria-current={activeNav===n.key?'page':undefined} onClick={()=>goBoard(n.status)}>{n.label}</button>)}</nav><button className="report-button" onClick={create}>+ Post a report</button></header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
  {page==='board'?<main className="workspace"><aside className="filters"><p className="kicker">YOUR NOTICEBOARD</p><h1>Lost something?<br/><em>You're in the right place.</em></h1><p className="intro">Browse what the campus community has shared or post what you've lost or found.</p><div className="filterbox"><h3>Browse reports</h3><label>Search items<input value={q} onChange={e=>setQ(e.target.value)} placeholder="What are you looking for?"/></label><label>Item category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label><label>Report status<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label><p className="filter-hint">Results update as you type.</p><div className="filterbuttons"><button onClick={clearFilters} disabled={!activeFilters.length}>Clear filters</button></div></div><div className="side-message"><span>📍</span><strong>Lost or found something?</strong><p>Every report gets us a little closer.</p><button onClick={create}>Share your report →</button></div><button className="reset" onClick={reset}>Reset demo data</button></aside>
   <section className="board"><div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>Latest notices <span>({filtered.length})</span></h2></div><span className="time-note">Updated today</span></div>{message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')} aria-label="Dismiss message">✕</button></div>}{activeFilters.length>0&&<div className="active-filters" aria-label="Active filters"><span>Showing only:</span>{activeFilters.map(f=><button key={f.key} className="chip" onClick={f.clear} aria-label={`Remove filter ${f.label}`}>{f.label} <b aria-hidden="true">✕</b></button>)}<button className="chip-clear" onClick={clearFilters}>Clear all</button></div>}
    <div className="board-grid">{[{key:'lost',title:'LOST',sub:'Searching for these things',icon:'↗'},{key:'found',title:'FOUND',sub:'Looking for the owners',icon:'⌁'},{key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'}].map(col=><div className="board-column" key={col.key}><div className="column-head"><span className={'col-icon '+col.key}>{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{filtered.filter(r=>r.status===col.key).length}</span></div><div className="sticky-list">{filtered.filter(r=>r.status===col.key).map((item,i)=><article className={'sticky'+(item.owner==='you'?' mine':'')} key={item.id}><div className="sticky-top"><span>{item.category}</span>{item.owner==='you'&&<span className="mine-badge">Your report</span>}</div><div className="sticky-emoji">{item.emoji}</div><h3>{item.title}</h3><p>{item.description||'No additional description.'}</p>{nextStep(item)}<div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div>{item.owner==='you'&&<button className="edit-button" onClick={()=>edit(item)} aria-label={`Edit your report: ${item.title}`}>✎ Edit report</button>}</article>)}{filtered.every(x=>x.status!==col.key)&&<div className="empty-column">Nothing here yet</div>}</div></div>)}</div>
   </section></main>:<main className="report-page"><div className="crumbs"><button onClick={()=>goBoard()}>← Noticeboard</button><span>/</span><span>{current?'Edit your report':'Report an item'}</span></div><div className="report-layout"><div className="report-intro"><span className="seal">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div><section className="form-paper"><header><p>{current?'EDIT NOTICE':'NEW NOTICE / FORM 01'}</p><h2>{current?'Edit report':'Report an item'}</h2></header><form onSubmit={submit} noValidate>{errorList.length>0&&<div className="form-error" role="alert"><strong>Please fix {errorList.length===1?'1 field':`${errorList.length} fields`} before publishing:</strong><ul>{errorList.map(k=><li key={k}><a href={`#field-${k}`} onClick={e=>{e.preventDefault();document.getElementById(`field-${k}`)?.focus();}}>{fieldNames[k]}</a>: {errors[k]}</li>)}</ul></div>}<label><span className="label-text">Status <b>*</b></span><select {...field('status')}><option value="">Choose one</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select>{fieldError('status')}</label>{formCopy.tip&&<div className="form-tip" role="note">{formCopy.tip}</div>}<label><span className="label-text">Item title <b>*</b></span><input {...field('title')} placeholder="e.g., Black backpack"/><small className="field-hint">At least 2 characters.</small>{fieldError('title')}</label><label><span className="label-text">Category <b>*</b></span><select {...field('category')}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s} value={s}>{cap(s)}</option>)}</select>{fieldError('category')}</label><label><span className="label-text">{formCopy.loc} <small className="optional">(optional)</small></span><input {...field('location')} placeholder={formCopy.locPh}/></label><label><span className="label-text">{formCopy.desc} <small className="optional">(optional)</small></span><textarea rows="6" {...field('description')} placeholder={formCopy.descPh}/></label><div className="form-actions"><button type="button" onClick={()=>goBoard()}>{current?'Cancel':'Go back'}</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div></form></section></div></main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
