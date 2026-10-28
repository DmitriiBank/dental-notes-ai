import type {ClinicalDraft,PerformedAct} from "./types";

const relevant=new Set(["crown-impression","framework-try-in","pfz-try-in","seat-check","occlusion-contact-check","crown-preparation","temporary-crown-placement"]);
const labels:Record<string,string>={"crown-impression":"בוצעו מטבעים או סריקה","framework-try-in":"בוצעה מדידת שלד","pfz-try-in":"בוצעה מדידת שלד זירקוניה/PFZ","seat-check":"נבדקה התאמת המבנה","occlusion-contact-check":"נבדקו הסגר ונקודות המגע","crown-preparation":"בוצעה הכנת שן לכתר","temporary-crown-placement":"הותקן כתר זמני"};
const teethFor=(act:PerformedAct)=>act.target.type==="tooth"?act.target.teeth:[];
const unique=<T,>(items:T[])=>[...new Set(items)];
export function generateLabLetter(draft:ClinicalDraft,teeth:number[],additionalInstructions=""):string{
  const eligible=(draft.performedActs??[]).filter(a=>a.category==="fixed"&&a.status==="completed"&&a.clinicianConfirmed&&relevant.has(a.kind)&&(teeth.length===0||teethFor(a).some(t=>teeth.includes(t))));
  const positions=unique(eligible.flatMap(teethFor));
  const selected=teeth.length?teeth:positions;
  if(!eligible.length)return "";
  const lines:string[]=[];
  if(selected.length)lines.push(`שיניים: ${selected.join(", ")}.`);
  const steps=unique(eligible.map(a=>labels[a.kind]).filter(Boolean));
  if(steps.length)lines.push(`טיפול שבוצע: ${steps.join("; ")}.`);
  const shades=unique(eligible.flatMap(a=>"shade" in a&&a.shade?[a.shade]:[]));
  if(shades.length===1)lines.push(`גוון: ${shades[0]}.`);
  if(shades.length>1)lines.push("יש לוודא גוון לכל שן בנפרד.");
  // Core materials are not automatically described as crown materials.
  const materials=unique(eligible.filter(a=>a.kind!=="crown-preparation"&&a.kind!=="crown-impression").flatMap(a=>a.material?[a.material]:[]));
  if(materials.length===1)lines.push(`חומר שתועד בשלב הטיפול: ${materials[0]}.`);
  if(additionalInstructions.trim())lines.push(additionalInstructions.trim());
  return lines.join("\n");
}
