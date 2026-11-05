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
function validate(f,arr,id){
 if(!f.title.trim()||f.title.trim().length<2)return 'Title must be at least 2 characters.';
 if(!categories.slice(1).includes(f.category))return 'Choose a category.';
 if(!statuses.includes(f.status))return 'Choose lost, found or claimed.';
 if(arr.some(r=>r.id!==id&&r.title.toLowerCase()===f.title.trim().toLowerCase()&&(r.location||'').toLowerCase()===(f.location||'').trim().toLowerCase()))return 'An item with the same title has already been reported at this location.';
 return '';
}
export default function App(){
 const [items,setItems]=useState(getSaved);
 const [page,setPage]=useState('board');
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [filterStatus,setFilterStatus]=useState('all');
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [error,setError]=useState('');
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
 function openForm(f){setForm(f);setInitialForm(f);setError('');setPage('form');}
 function create(){leaveForm(()=>{setCurrent(null);openForm({...clean});});}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);openForm({title:row.title,category:row.category,status:row.status,location:row.location||'',description:row.description||''});}
 function submit(e){e.preventDefault();const v=validate(form,items,current);if(v){setError('Please review your entries.');return;}const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',emoji:current?items.find(x=>x.id===current)?.emoji:'📌',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
 if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage('Report updated.');}else{setItems([{id:`f-${Date.now()}`,...d},...items]);setMessage('Your report has been posted.');}setPage('board');setCurrent(null);}
 function reset(){setItems(seed);setPage('board');setQ('');setCat('all');setFilterStatus('all');setMessage('Example reports restored.');}
 return <div className="notice-app"><header className="header"><div className="headline"><span className="sun">✺</span><button onClick={()=>goBoard('all')} className="wordmark">FOUND<span>on campus</span></button><p>Community noticeboard</p></div><nav className="header-links" aria-label="Main">{[{key:'board',status:'all',label:'All notices'},{key:'lost',status:'lost',label:'Missing items'},{key:'found',status:'found',label:'Recently found'}].map(n=><button key={n.key} className={activeNav===n.key?'active':''} aria-current={activeNav===n.key?'page':undefined} onClick={()=>goBoard(n.status)}>{n.label}</button>)}</nav><button className="report-button" onClick={create}>+ Post a report</button></header>
  <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>
  {page==='board'?<main className="workspace"><aside className="filters"><p className="kicker">YOUR NOTICEBOARD</p><h1>Lost something?<br/><em>You're in the right place.</em></h1><p className="intro">Browse what the campus community has shared or post what you've lost or found.</p><div className="filterbox"><h3>Browse reports</h3><label>Search items<input value={q} onChange={e=>setQ(e.target.value)} placeholder="What are you looking for?"/></label><label>Item category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label><label>Report status<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label><p className="filter-hint">Results update as you type.</p><div className="filterbuttons"><button onClick={clearFilters} disabled={!activeFilters.length}>Clear filters</button></div></div><div className="side-message"><span>📍</span><strong>Lost or found something?</strong><p>Every report gets us a little closer.</p><button onClick={create}>Share your report →</button></div><button className="reset" onClick={reset}>Reset demo data</button></aside>
   <section className="board"><div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>Latest notices <span>({filtered.length})</span></h2></div><span className="time-note">Updated today</span></div>{message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')} aria-label="Dismiss message">✕</button></div>}{activeFilters.length>0&&<div className="active-filters" aria-label="Active filters"><span>Showing only:</span>{activeFilters.map(f=><button key={f.key} className="chip" onClick={f.clear} aria-label={`Remove filter ${f.label}`}>{f.label} <b aria-hidden="true">✕</b></button>)}<button className="chip-clear" onClick={clearFilters}>Clear all</button></div>}
    <div className="board-grid">{[{key:'lost',title:'LOST',sub:'Searching for these things',icon:'↗'},{key:'found',title:'FOUND',sub:'Looking for the owners',icon:'⌁'},{key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'}].map(col=><div className="board-column" key={col.key}><div className="column-head"><span className={'col-icon '+col.key}>{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{filtered.filter(r=>r.status===col.key).length}</span></div><div className="sticky-list">{filtered.filter(r=>r.status===col.key).map((item,i)=><article className={'sticky'+(item.owner==='you'?' mine':'')} key={item.id}><div className="sticky-top"><span>{item.category}</span>{item.owner==='you'&&<span className="mine-badge">Your report</span>}</div><div className="sticky-emoji">{item.emoji}</div><h3>{item.title}</h3><p>{item.description||'No additional description.'}</p>{item.status!=='lost'&&<div className="handover-note">{item.handoverStatus==='received'&&item.collectionPoint?`Received at ${item.collectionPoint}`:item.handoverStatus==='released'?'Collected by owner':'Reported found - not confirmed at a collection point'}</div>}<div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div>{item.owner==='you'&&<button className="edit-button" onClick={()=>edit(item)} aria-label={`Edit your report: ${item.title}`}>✎ Edit report</button>}</article>)}{filtered.every(x=>x.status!==col.key)&&<div className="empty-column">Nothing here yet</div>}</div></div>)}</div>
   </section></main>:<main className="report-page"><div className="crumbs"><button onClick={()=>goBoard()}>← Noticeboard</button><span>/</span><span>{current?'Edit your report':'Report an item'}</span></div><div className="report-layout"><div className="report-intro"><span className="seal">✺</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current?'Update your report':'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div><section className="form-paper"><header><p>{current?'EDIT NOTICE':'NEW NOTICE / FORM 01'}</p><h2>{current?'Edit report':'Report an item'}</h2></header><form onSubmit={submit}><label>Item title <b>*</b><input value={form.title} onChange={e=>setForm(s=>({...s,title:e.target.value}))} placeholder="e.g., Black backpack"/></label><label>Status <b>*</b><select value={form.status} onChange={e=>setForm(s=>({...s,status:e.target.value}))}><option value="">Choose one</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label><label>Category <b>*</b><select value={form.category} onChange={e=>setForm(s=>({...s,category:e.target.value}))}><option value="">Select item category</option>{categories.slice(1).map(s=><option key={s}>{s}</option>)}</select></label><label>Last known location<input value={form.location} onChange={e=>setForm(s=>({...s,location:e.target.value}))} placeholder="Location (optional)"/></label><label>More details<textarea rows="6" value={form.description} onChange={e=>setForm(s=>({...s,description:e.target.value}))} placeholder="Describe your item"/></label>{error&&<div className="form-error" role="alert">{error}</div>}<div className="form-actions"><button type="button" onClick={()=>goBoard()}>{current?'Cancel':'Go back'}</button><button className="report-button" type="submit">{current?'Save report':'Publish notice'}</button></div></form></section></div></main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
