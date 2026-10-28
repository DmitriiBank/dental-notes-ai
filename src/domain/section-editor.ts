import type {ClinicalDraft,SectionOverride} from "./types";
import {generateHebrewRecord} from "./hebrew-templates";

export interface GeneratedSection {id:string;label:string;text:string;inline:boolean}
const sectionIds:Record<string,string>={"סיבת הביקור":"visit-reason",EO:"extraoral","רקמות רכות":"soft-tissues","סגר":"occlusion",OH:"hygiene",'פמ"ר':"periodontal","אנמנזה רפואית":"medical-history","תיעוד תרופתי":"medications","ממצאים קליניים":"clinical-findings","ממצאים רדיולוגיים":"radiology","טיפול שבוצע":"completed-treatment","תוכנית טיפול והמלצות":"treatment-plan"};
const labelsById=Object.fromEntries(Object.entries(sectionIds).map(([label,id])=>[id,label]));
const clean=(value:string)=>value.replace(/[“”]/gu,'"').trim();

export function generateHebrewSections(draft:ClinicalDraft):GeneratedSection[]{const record=generateHebrewRecord(draft);if(!record)return[];return record.split(/\n\n/u).map((block,index)=>{const newline=block.indexOf("\n");const colon=block.indexOf(":");const split=newline>=0?newline:colon;const rawLabel=split>=0?block.slice(0,split):block;const label=rawLabel.replace(/:$/u,"");const text=split>=0?block.slice(split+1).trim():"";return{id:sectionIds[label]??`section-${index}`,label,text,inline:newline<0}})}
export function mergeSectionsWithOverrides(sections:GeneratedSection[],overrides:Record<string,SectionOverride>):GeneratedSection[]{const ids=new Set(sections.map(section=>section.id));return[...sections,...Object.keys(overrides).filter(id=>!ids.has(id)).map(id=>({id,label:labelsById[id]??id,text:"",inline:["extraoral","soft-tissues","occlusion","hygiene","periodontal"].includes(id)}))]}
export const sectionHasConflict=(section:GeneratedSection,override?:SectionOverride)=>Boolean(override&&clean(override.originalGeneratedText)!==clean(section.text));
export function composeHebrewRecord(sections:GeneratedSection[],overrides:Record<string,SectionOverride>):string{return sections.map(section=>{const text=clean(overrides[section.id]?.text??section.text);return section.inline?`${section.label}: ${text}`:`${section.label}:\n${text}`}).join("\n\n").trim()}
export const normalizeSectionText=(sectionId:string,value:string)=>clean(sectionId==="treatment-plan"?value.replace(/\s*\n+\s*/gu," "):value);
