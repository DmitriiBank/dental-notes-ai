"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";
import { useExamStore } from "@/store/examination-store";
import { COMPLAINT_CATALOG, COMPLAINT_CATEGORIES, COMPLAINT_MODIFIERS, COMPLAINT_REGIONS, type ComplaintCatalogItem, type ComplaintModifier } from "@/domain/complaint-catalog";
import type { ComplaintSelection } from "@/domain/types";

const field="w-full rounded-lg border bg-white p-2 text-xs";
const categoryOrder=Object.keys(COMPLAINT_CATEGORIES) as Array<keyof typeof COMPLAINT_CATEGORIES>;

export function ComplaintsEditor(){
  const s=useExamStore(),d=s.draft;
  const [region,setRegion]=useState<string>(COMPLAINT_REGIONS[0].id);
  const toothEntries=COMPLAINT_CATALOG.filter(entry=>entry.scope==="tooth"||entry.scope==="any");
  const regionalEntries=COMPLAINT_CATALOG.filter(entry=>entry.scope==="region"||entry.scope==="any");
  const generalEntries=COMPLAINT_CATALOG.filter(entry=>entry.scope==="general"||entry.scope==="any");
  const toothSelected=(id:string)=>s.selected.length>0&&s.selected.every(number=>(d.teeth[number].complaints??[]).some(item=>item.complaintId===id));
  const toggleScoped=(scope:"regional"|"general",id:string)=>s.update(x=>{
    const list=scope==="regional"?(x.regionalComplaints??=[]):(x.generalComplaints??=[]);
    const targetRegion=scope==="regional"?region:undefined;
    const index=list.findIndex(item=>item.complaintId===id&&item.region===targetRegion);
    if(index>=0){list.splice(index,1);return}
    if(id==="no-complaints"){
      for(let i=list.length-1;i>=0;i--)if(scope==="general"||list[i].region===targetRegion)list.splice(i,1);
    }else{
      const none=list.findIndex(item=>item.complaintId==="no-complaints"&&(scope==="general"||item.region===targetRegion));
      if(none>=0)list.splice(none,1);
    }
    list.push({complaintId:id,...(targetRegion?{region:targetRegion}:{})});
  });
  const scopedSelected=(scope:"regional"|"general",id:string)=>(scope==="regional"?d.regionalComplaints:d.generalComplaints)?.some(item=>item.complaintId===id&&item.region===(scope==="regional"?region:undefined))??false;
  const selections=[...s.selected.flatMap(number=>(d.teeth[number].complaints??[]).map(selection=>({scope:"tooth" as const,target:String(number),selection}))),...(d.regionalComplaints??[]).map(selection=>({scope:"regional" as const,target:selection.region??"",selection})),...(d.generalComplaints??[]).map(selection=>({scope:"general" as const,target:"",selection}))];
  return <div className="space-y-5">
    <section className="rounded-xl border border-teal-100 bg-teal-50/40 p-3"><div className="label">Частые жалобы</div><p className="mt-1 text-xs text-slate-600">Выбор применяется ко всем отмеченным зубам. Для изменения одного зуба оставьте выбранным только его.</p>{s.selected.length?<ComplaintButtons entries={toothEntries.filter(entry=>entry.frequent)} selected={toothSelected} toggle={id=>s.toggleComplaint(id)}/>:<p className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-500">Выберите один или несколько зубов для зубных жалоб.</p>}</section>
    {s.selected.length>0&&<section><div className="label">Жалобы выбранных зубов</div><div className="mt-2 space-y-2">{categoryOrder.map(category=>{const entries=toothEntries.filter(entry=>entry.category===category&&!entry.frequent);return entries.length?<details className="rounded-xl border bg-white" key={category}><summary className="cursor-pointer p-3 text-sm font-semibold">{COMPLAINT_CATEGORIES[category]} <span className="text-xs font-normal text-slate-400">· {entries.length}</span></summary><div className="border-t p-3"><ComplaintButtons entries={entries} selected={toothSelected} toggle={id=>s.toggleComplaint(id)}/></div></details>:null})}</div></section>}
    <section className="rounded-xl border p-3"><div className="label">Жалобы по области</div><select aria-label="Область жалобы" className={`${field} mt-2`} value={region} onChange={event=>setRegion(event.target.value)}>{COMPLAINT_REGIONS.map(value=><option key={value.id} value={value.id}>{value.labelRu}</option>)}</select><CatalogByCategory entries={regionalEntries} selected={id=>scopedSelected("regional",id)} toggle={id=>toggleScoped("regional",id)}/></section>
    <section className="rounded-xl border p-3"><div className="label">Общие жалобы и причина обращения</div><CatalogByCategory entries={generalEntries} selected={id=>scopedSelected("general",id)} toggle={id=>toggleScoped("general",id)}/></section>
    {selections.length>0&&<section className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="label">Уточнения выбранных жалоб</div><p className="mt-1 text-xs text-slate-500">Все уточнения необязательны и выбираются без ввода текста.</p><div className="mt-3 space-y-2">{selections.map(({scope,target,selection})=><ComplaintDetails key={`${scope}-${target}-${selection.complaintId}`} scope={scope} target={target} selection={selection}/>)}</div></section>}
  </div>;
}

function ComplaintButtons({entries,selected,toggle}:{entries:readonly ComplaintCatalogItem[];selected:(id:string)=>boolean;toggle:(id:string)=>void}){return <div className="mt-2 grid gap-2 sm:grid-cols-2">{entries.map(entry=>{const active=selected(entry.id);return <button type="button" aria-pressed={active} className={`flex min-h-11 items-center justify-between rounded-xl border p-3 text-left text-sm ${active?"border-teal-500 bg-teal-50 text-teal-800":"bg-white hover:border-teal-300"}`} key={entry.id} onClick={()=>toggle(entry.id)}><span>{entry.ru}</span>{active&&<Check size={16}/>}</button>})}</div>}

function CatalogByCategory({entries,selected,toggle}:{entries:readonly ComplaintCatalogItem[];selected:(id:string)=>boolean;toggle:(id:string)=>void}){const frequent=entries.filter(entry=>entry.frequent);return <div className="mt-3 space-y-2">{frequent.length>0&&<ComplaintButtons entries={frequent} selected={selected} toggle={toggle}/>} {categoryOrder.map(category=>{const categoryEntries=entries.filter(entry=>entry.category===category&&!entry.frequent);return categoryEntries.length?<details className="rounded-xl border bg-white" key={category}><summary className="cursor-pointer p-3 text-sm font-semibold">{COMPLAINT_CATEGORIES[category]} <span className="text-xs font-normal text-slate-400">· {categoryEntries.length}</span></summary><div className="border-t p-3"><ComplaintButtons entries={categoryEntries} selected={selected} toggle={toggle}/></div></details>:null})}</div>}

function ComplaintDetails({scope,target,selection}:{scope:"tooth"|"regional"|"general";target:string;selection:ComplaintSelection}){
  const s=useExamStore();const entry=COMPLAINT_CATALOG.find(item=>item.id===selection.complaintId);if(!entry)return null;
  const update=(key:keyof ComplaintSelection,value:string)=>s.update(x=>{const item=findSelection(x,scope,target,selection.complaintId);if(item)(item as unknown as Record<string,unknown>)[key]=value||undefined});
  const remove=()=>s.update(x=>{const list=selectionList(x,scope,target);const index=list.findIndex(item=>item.complaintId===selection.complaintId&&(scope!=="regional"||item.region===target));if(index>=0)list.splice(index,1)});
  const updateTriggers=(value:string)=>s.update(x=>{const item=findSelection(x,scope,target,selection.complaintId);if(item)item.triggers=value?[value]:[]});
  return <div className="rounded-lg border bg-white p-2"><div className="flex items-center justify-between gap-2"><div><strong className="text-xs">{entry.ru}</strong><span className="ml-2 text-[11px] text-slate-400">{scope==="tooth"?`зуб ${target}`:scope==="regional"?target:"общее"}</span></div><button type="button" aria-label={`Удалить жалобу ${entry.ru} ${target}`} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={remove}><X size={14}/></button></div>{entry.id!=="no-complaints"&&<div className="mt-2 grid grid-cols-2 gap-2 xl:grid-cols-5"><ModifierSelect label={`Начало: ${entry.ru} ${target}`} placeholder="Начало" items={COMPLAINT_MODIFIERS.onset} value={selection.onset??""} onChange={value=>update("onset",value)}/><ModifierSelect label={`Интенсивность: ${entry.ru} ${target}`} placeholder="Интенсивность" items={COMPLAINT_MODIFIERS.intensity} value={selection.intensity??selection.severity??""} onChange={value=>update("intensity",value)}/><ModifierSelect label={`Характер: ${entry.ru} ${target}`} placeholder="Характер" items={COMPLAINT_MODIFIERS.pattern} value={selection.pattern??""} onChange={value=>update("pattern",value)}/><ModifierSelect label={`Триггер: ${entry.ru} ${target}`} placeholder="Триггер" items={COMPLAINT_MODIFIERS.trigger} value={selection.triggers?.[0]??selection.trigger??""} onChange={updateTriggers}/><ModifierSelect label={`Цель: ${entry.ru} ${target}`} placeholder="Цель пациента" items={COMPLAINT_MODIFIERS.patient_goal} value={selection.patientGoal??""} onChange={value=>update("patientGoal",value)}/></div>}</div>;
}

function ModifierSelect({label,placeholder,items,value,onChange}:{label:string;placeholder:string;items:ComplaintModifier[];value:string;onChange:(value:string)=>void}){return <select aria-label={label} className={field} value={value} onChange={event=>onChange(event.target.value)}><option value="">{placeholder}</option>{items.map(item=><option key={item.id} value={item.id}>{item.labelRu}</option>)}</select>}

function selectionList(draft:ReturnType<typeof useExamStore.getState>["draft"],scope:"tooth"|"regional"|"general",target:string){if(scope==="tooth"){const tooth=draft.teeth[Number(target)];tooth.complaints??=[];return tooth.complaints}if(scope==="regional"){draft.regionalComplaints??=[];return draft.regionalComplaints}draft.generalComplaints??=[];return draft.generalComplaints}
function findSelection(draft:ReturnType<typeof useExamStore.getState>["draft"],scope:"tooth"|"regional"|"general",target:string,id:string){return selectionList(draft,scope,target).find(item=>item.complaintId===id&&(scope!=="regional"||item.region===target))}
