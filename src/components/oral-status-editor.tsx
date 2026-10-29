"use client";
import {useExamStore} from "@/store/examination-store";
import {ORAL_DEPOSITS} from "@/domain/oral-status";
export function OralStatusEditor(){
 const s=useExamStore(),e=s.draft.examination,selected=e.oralDeposits??[];
 return <section className="mt-4 rounded-xl border p-3"><div className="text-sm font-bold">Общий статус полости рта и зубные отложения</div><p className="mt-1 text-xs text-slate-500">Общие объективные находки, независимо от выбора зуба. Не заменяют подробный осмотр.</p>
 <button type="button" aria-pressed={e.oralCavityNormal??false} className={`mt-3 w-full rounded-lg border p-3 text-left text-sm ${e.oralCavityNormal?"border-teal-500 bg-teal-50":"hover:border-teal-400"}`} onClick={()=>s.update(d=>{d.examination.oralCavityNormal=!d.examination.oralCavityNormal})}>Полость рта: патологических изменений не выявлено</button>
 <div className="mt-3 grid grid-cols-2 gap-2">{ORAL_DEPOSITS.map(item=><button key={item.id} type="button" aria-pressed={selected.includes(item.id)} className={`rounded-lg border p-2 text-left text-xs ${selected.includes(item.id)?"border-teal-500 bg-teal-50":"hover:border-teal-400"}`} onClick={()=>s.update(d=>{const current=d.examination.oralDeposits??[];d.examination.oralDeposits=current.includes(item.id)?current.filter(id=>id!==item.id):item.id==="no-deposits"?[item.id]:[...current.filter(id=>id!=="no-deposits"),item.id]})}>{item.label}</button>)}</div>
 </section>;
}
