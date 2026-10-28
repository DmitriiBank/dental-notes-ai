import type { ClinicalDraft } from "./types";
import { appointmentLines, scheduleAppointments } from "./appointment-rules";

const HEB_FINDING: Record<string,string> = {
  "primary-caries":"עששת", "secondary-caries":"עששת משנית", "deep-caries":"עששת עמוקה", "root-caries":"עששת שורש",
  "crown-destruction":"הרס חלקי של הכותרת האנטומית", "residual-root":"שורש נותר", "fracture":"שבר בשן", "crack":"סדק בשן",
  "wear":"שחיקת שיניים", "filling":"סתימה קיימת", "defective-filling":"סתימה לקויה", "artificial-crown":"כתר מלאכותי קיים",
  "defective-crown":"כתר מלאכותי לקוי", "loose-crown":"כתר רופף", "crown-with-root":"הכתר נע יחד עם רקמת השורש",
  "mobility":"ניידות", "recession":"נסיגת חניכיים", "pocket":"כיס פריודונטלי", "inflammation":"דלקת חניכיים",
  "bleeding":"דימום", "bone-loss":"אובדן עצם", "treated-canals":"טיפול שורש קודם", "incomplete-rct":"מילוי תעלות חסר",
  "periapical":"הצללה רדיולוצנטית פריאפיקלית", "fistula":"פיסטולה", "swelling":"נפיחות", "impacted":"שן כלואה",
  "partially-impacted":"שן כלואה חלקית", "dystopic":"שן דיסטופית"
};
const HEB_TREATMENT: Record<string,string> = {
  filling:"שחזור", "filling-replacement":"החלפת שחזור", "temporary-filling":"שחזור זמני", observation:"מעקב",
  rct:"טיפול שורש", retreatment:"חידוש טיפול שורש", "endo-consult":"ייעוץ אנדודונטי", core:"מבנה", "fiber-core":"מבנה עם פוסט סיבי",
  "temporary-crown":"כתר זמני", "zirconia-crown":"כתר זירקוניה", "crown-recement":"הדבקת כתר מחדש", extraction:"עקירה אצל רופא אחר",
  "surgical-extraction":"עקירה כירורגית", "implant-consult":"ייעוץ להשתלה", "implant-placement":"השתלת שתל", hygienist:"טיפול שיננית",
  "complete-denture":"תותבת שלמה נשלפת", "partial-denture":"תותבת חלקית נשלפת", "immediate-denture":"תותבת מיידית", "denture-adjustment":"התאמת תותבת"
};
const STATUS: Record<string,string> = { recommended:"מומלץ", planned:"מתוכנן", completed:"בוצע", cancelled:"בוטל", refused:"נדחה על ידי המטופל" };
const IMAGE: Record<string,string> = { status:"סטטוס", panoramic:"צילום פנורמי", periapical:"צילום פריאפיקלי", bitewing:"צילום נשך", cbct:"CT / CBCT" };

export function generateHebrewRecord(d: ClinicalDraft): string {
  const sections: string[] = [];
  if (d.examination.complaint) sections.push(`סיבת הביקור:\n${d.examination.complaint}`);
  if (d.examination.extraoral) sections.push(`EO: ${d.examination.extraoral}`);
  if (d.examination.softTissues) sections.push(`רקמות רכות: ${d.examination.softTissues}`);
  if (d.examination.occlusion) sections.push(`סגר: ${d.examination.occlusion}`);
  if (d.examination.hygiene) sections.push(`OH: ${d.examination.hygiene}`);
  if (d.examination.periodontal) sections.push(`פמ"ר: ${d.examination.periodontal}`);
  if (d.examination.medicalFlags.length) sections.push(`אנמנזה רפואית:\n${d.examination.medicalFlags.join("; ")}.`);
  if (d.edentulous.includes("upper")) sections.push("חוסר שיניים מלא בלסת העליונה.");
  if (d.edentulous.includes("lower")) sections.push("חוסר שיניים מלא בלסת התחתונה.");

  const findings = Object.values(d.teeth).filter(t => t.findings.length && !t.missing).map(t => {
    const surfaces = t.surfaces.length ? ` משטחים ${t.surfaces.join(",")}` : "";
    const deep = t.findings.includes("deep-caries") ? " ייתכן צורך בטיפול שורש בהתאם למצב המוך ולממצאים במהלך הטיפול; אין בכך אבחנה סופית." : "";
    return `שן ${t.number}: ${t.findings.map(x => HEB_FINDING[x] ?? x).join(", ")}${surfaces}.${deep}`;
  });
  Object.values(d.teeth).filter(t => t.missing).forEach(t => findings.push(`שן ${t.number} חסרה.`));
  d.implants.forEach(i => findings.push(`שתל באזור ${i.region}: ${i.findings.join(", ") || "שתל קיים"}.`));
  if (findings.length) sections.push(`ממצאים קליניים:\n${findings.join(" ")}`);

  const imaging = d.imaging.map(x => `${IMAGE[x.kind] ?? x.kind} (${x.status})${x.target ? `, ${x.target}` : ""}${x.findings.length ? `: ${x.findings.map(f => HEB_FINDING[f] ?? f).join(", ")}` : ""}.`);
  if (imaging.length) sections.push(`ממצאים רדיולוגיים:\n${imaging.join(" ")}`);

  const allTreatments = [...Object.values(d.teeth).flatMap(t => t.treatments), ...d.generalTreatments];
  const completed = allTreatments.filter(t => t.status === "completed").map(t => `${t.tooth ? `שן ${t.tooth}: ` : ""}${HEB_TREATMENT[t.kind] ?? t.kind}${t.material ? `, חומר ${t.material}` : ""}${t.shade ? `, גוון ${t.shade}` : ""}`);
  if (completed.length) sections.push(`טיפול שבוצע:\n${completed.join("; ")}.`);
  const planned = allTreatments.filter(t => t.status !== "completed" && t.status !== "cancelled").map(t => `${t.tooth ? `בשן ${t.tooth} ` : ""}${STATUS[t.status]} ${HEB_TREATMENT[t.kind] ?? t.kind}`);
  d.alternatives.forEach(a => planned.push(`${a.tooth ? `בשן ${a.tooth} ` : ""}הוצגה חלופה: ${a.label}; החלטת המטופל: ${a.decision === "selected" ? "נבחרה" : a.decision === "refused" ? "נדחתה" : "ממתינה"}${a.risksExplained ? ", הסיכונים הוסברו" : ""}${a.prognosisDiscussed ? ", הפרוגנוזה נדונה" : ""}`));
  if (planned.length) sections.push(`תוכנית טיפול והמלצות:\n${planned.join("; ")}.`);
  const lines = appointmentLines(scheduleAppointments(d));
  if (lines) sections.push(lines);
  return sections.join("\n\n").replace(/[“”]/g, '"');
}
