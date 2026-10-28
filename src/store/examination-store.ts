"use client";
import { create } from "zustand";
import type { ClinicalDraft, Jaw, Surface, Treatment } from "@/domain/types";
import { emptyDraft } from "@/domain/fixtures";
import { LOWER, UPPER } from "@/domain/teeth";
import { normalizeDraft } from "@/domain/normalize-draft";

interface Store {
  draft: ClinicalDraft;
  selected: number[];
  history: ClinicalDraft[];
  saved: boolean;
  setDraft: (d: ClinicalDraft) => void;
  update: (fn: (d: ClinicalDraft) => void) => void;
  select: (n: number, multi?: boolean) => void;
  selectMany: (n: number[]) => void;
  clearSelection: () => void;
  toggleFinding: (id: string) => void;
  toggleComplaint: (id: string) => void;
  toggleSurface: (s: Surface) => void;
  addTreatment: (kind: string) => void;
  setEdentulous: (jaws: Jaw[]) => void;
  undo: () => void;
  reset: () => void;
  saveLocal: () => void;
  loadLocal: () => void;
}
const clone = (d: ClinicalDraft) => structuredClone(d);

export const useExamStore = create<Store>((set,get) => ({
  draft: emptyDraft(), selected: [], history: [], saved: true,
  setDraft: draft => set({draft:normalizeDraft(draft), selected:[], history:[], saved:false}),
  update: fn => set(s => { const next=clone(s.draft); fn(next); next.updatedAt=new Date().toISOString(); return {draft:next,history:[...s.history.slice(-19),clone(s.draft)],saved:false}; }),
  select: (n,multi=true) => set(s=>({selected:multi?(s.selected.includes(n)?s.selected.filter(x=>x!==n):[...s.selected,n]):[n]})),
  selectMany: selected => set({selected}), clearSelection:()=>set({selected:[]}),
  toggleFinding:id=>get().update(d=>get().selected.forEach(n=>{const a=d.teeth[n].findings;if(a.includes(id))a.splice(a.indexOf(id),1);else a.push(id)})),
  toggleComplaint:id=>get().update(d=>get().selected.forEach(n=>{const a=d.teeth[n].complaints??=[];d.teeth[n].complaints=a;const index=a.findIndex(item=>item.complaintId===id);if(index>=0){a.splice(index,1);return}if(id==="no-complaints")a.splice(0);else{const none=a.findIndex(item=>item.complaintId==="no-complaints");if(none>=0)a.splice(none,1)}a.push({complaintId:id})})),
  toggleSurface:surface=>get().update(d=>get().selected.forEach(n=>{const a=d.teeth[n].surfaces;if(a.includes(surface))a.splice(a.indexOf(surface),1);else a.push(surface)})),
  addTreatment:kind=>get().update(d=>get().selected.forEach(n=>{const id=crypto.randomUUID();const t:Treatment={id,kind,status:"planned",tooth:n,surfaces:[...d.teeth[n].surfaces]};d.teeth[n].treatments.push(t)})),
  setEdentulous:jaws=>get().update(d=>{const nums=jaws.flatMap(j=>j==="upper"?UPPER:LOWER);nums.forEach(n=>{d.teeth[n].missing=true;d.teeth[n].findings=[];d.teeth[n].surfaces=[];d.teeth[n].treatments=[]});d.edentulous=Array.from(new Set([...d.edentulous,...jaws]));}),
  undo:()=>set(s=>{const prev=s.history.at(-1);return prev?{draft:prev,history:s.history.slice(0,-1),saved:false}:s}),
  reset:()=>set({draft:emptyDraft(),selected:[],history:[],saved:true}),
  saveLocal:()=>{localStorage.setItem("dental-notes-demo",JSON.stringify(get().draft));set({saved:true})},
  loadLocal:()=>{const raw=localStorage.getItem("dental-notes-demo");if(raw)set({draft:normalizeDraft(JSON.parse(raw) as ClinicalDraft),selected:[],history:[],saved:true})}
}));
