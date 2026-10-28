import type { MedicationRecord } from "./types";

export type MedicationPresetId = "augmentin-500-125" | "augmentin-875-125" | "azithromycin-penicillin-allergy";

export interface MedicationPreset {
  id: MedicationPresetId;
  label: string;
  name: string;
  concentration: string;
  activeIngredients: string[];
  penicillinAllergyAlternative: boolean;
  requiresClinicianConfirmation: boolean;
}

export const MEDICATION_PRESETS: readonly MedicationPreset[] = [
  {
    id: "augmentin-500-125",
    label: "Аугментин 500/125 мг",
    name: "Augmentin",
    concentration: "500/125 mg",
    activeIngredients: ["amoxicillin", "clavulanic acid"],
    penicillinAllergyAlternative: false,
    requiresClinicianConfirmation: false,
  },
  {
    id: "augmentin-875-125",
    label: "Аугментин 875/125 мг",
    name: "Augmentin",
    concentration: "875/125 mg",
    activeIngredients: ["amoxicillin", "clavulanic acid"],
    penicillinAllergyAlternative: false,
    requiresClinicianConfirmation: false,
  },
  {
    id: "azithromycin-penicillin-allergy",
    label: "Азитромицин — при аллергии на пенициллин",
    name: "Azithromycin",
    concentration: "",
    activeIngredients: ["azithromycin"],
    penicillinAllergyAlternative: true,
    requiresClinicianConfirmation: true,
  },
] as const;

export function medicationPreset(id: MedicationPresetId): MedicationPreset {
  const preset = MEDICATION_PRESETS.find(item => item.id === id);
  if (!preset) throw new Error(`Unknown medication preset: ${id}`);
  return preset;
}

export function medicationFromPreset(id: MedicationPresetId, recordId: string): MedicationRecord {
  const preset = medicationPreset(id);
  return {
    id: recordId,
    presetId: preset.id,
    name: preset.name,
    ...(preset.concentration ? { concentration: preset.concentration } : {}),
    allergyCheck: preset.penicillinAllergyAlternative ? "allergy-present" : "not-checked",
    status: "prescribed",
    penicillinAllergyAlternative: preset.penicillinAllergyAlternative,
    clinicianSelectionConfirmed: !preset.requiresClinicianConfirmation,
  };
}
