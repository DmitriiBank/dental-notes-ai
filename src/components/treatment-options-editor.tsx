"use client";
import {useExamStore} from "@/store/examination-store";
import {TREATMENTS} from "@/domain/catalog";

const descriptions=new Map<string,string>(TREATMENTS.map(([id,label])=>[id,label]));
export function TreatmentOptionsEditor(){
  const s=useExamStore(),d=s.draft;
  const plan=[...Object.values(d.teeth).flatMap(tooth=>tooth.treatments),...d.generalTreatments]
    .filter(item=>item.status==="planned"||item.status==="recommended");
  const defaultFirst=plan.map(item=>[descriptions.get(item.kind)??item.kind,item.tooth?`שן ${item.tooth}`:item.jaw==="upper"?"לסת עליונה":item.jaw==="lower"?"לסת תחתונה":""].filter(Boolean).join(" · ")).join("; ");
  const options=d.treatmentOptions??{first:"",second:"",confirmed:false};
  const update=(patch:Partial<NonNullable<typeof d.treatmentOptions>>)=>s.update(x=>{x.treatmentOptions={first:x.treatmentOptions?.first??defaultFirst,second:x.treatmentOptions?.second??"",confirmed:x.treatmentOptions?.confirmed??false,...x.treatmentOptions,...patch}});
  const first=options.first||defaultFirst;
  return <section className="space-y-3 rounded-xl border p-3">
    <div className="label">Два варианта лечения и решение пациента</div>
    <p className="text-xs text-slate-500">Вариант 1 сформирован из предложенного плана лечения. Вариант 2 вносится врачом отдельно. Решение не выбирается автоматически.</p>
    <label className="block text-xs font-bold">Вариант 1 · предложенное лечение</label>
    <textarea className="w-full rounded-lg border p-2 text-sm" rows={3} value={first} onChange={e=>update({first:e.target.value,confirmed:false})} placeholder="Сначала добавьте процедуры в разделе «Лечение»"/>
    <label className="block text-xs font-bold">Вариант 2 · альтернативный план</label>
    <textarea className="w-full rounded-lg border p-2 text-sm" rows={3} value={options.second} onChange={e=>update({second:e.target.value,confirmed:false})} placeholder="Опишите второй вариант лечения"/>
    <label className="block text-xs font-bold">Выбор пациента</label>
    <select className="w-full rounded-lg border p-2 text-sm" value={options.decision??""} onChange={e=>update({decision:e.target.value?e.target.value as "no-treatment"|"first"|"second":undefined,confirmed:false})}>
      <option value="">Решение не подтверждено</option>
      <option value="no-treatment">1. Не хочет лечиться</option>
      <option value="first">2. Выбрал вариант лечения 1</option>
      <option value="second" disabled={!options.second.trim()}>3. Выбрал вариант лечения 2</option>
    </select>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={options.confirmed} onChange={e=>update({confirmed:e.target.checked})}/> Подтверждаю, что варианты и решение обсуждены с пациентом</label>
    {(d.alternatives.length||d.patientDecisions?.length)?<p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">В записи присутствуют данные прежнего редактора альтернатив/решений. Они сохранены для совместимости; при подтверждении новой формы старые альтернативы не дублируются, но старые решения пациента требуют проверки.</p>:null}
  </section>;
}
