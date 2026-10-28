export const MACCABI_CATALOG_VERSION = "contract-appendix-2026-07-15-main-codes";
export const MACCABI_CATALOG_NOTICE = "Тарифное приложение от 15.07.2026: основные коды без цен; исключены Assuta, ג3, детские, специалисты, системные программы и акции. Применимость к врачу и договору необходимо проверить.";

export interface MaccabiCatalogEntry { shortCode:string; catalogNumber:string; descriptionHe:string; eligibility:"base"|"requires-context" }
export const MACCABI_CATALOG = {
  posterior1:{shortCode:"שקא1",catalogNumber:"13505",descriptionHe:"שחזור קומפוזיט בשן אחורית, משטח אחד",eligibility:"base"},
  posterior2:{shortCode:"שקא2",catalogNumber:"13510",descriptionHe:"שחזור קומפוזיט בשן אחורית, שני משטחים",eligibility:"base"},
  posterior3:{shortCode:"שקא3",catalogNumber:"13515",descriptionHe:"שחזור קומפוזיט בשן אחורית, שלושה משטחים",eligibility:"base"},
  anteriorComposite:{shortCode:"צהק",catalogNumber:"13500",descriptionHe:"ציפוי קומפוזיט בשן קדמית/השלמת כותרת שן קדמית",eligibility:"requires-context"},
  anteriorClass4:{shortCode:"סל4",catalogNumber:"13530",descriptionHe:"סתימה לבנה קלאס class 4",eligibility:"requires-context"},
  anteriorClass35:{shortCode:"סל",catalogNumber:"13535",descriptionHe:"סתימה לבנה קלאס class 3,5",eligibility:"requires-context"},
  temporaryFilling:{shortCode:"סז",catalogNumber:"13520",descriptionHe:"סתימה זמנית",eligibility:"base"},
  acrylicFlipper:{shortCode:"תחלא",catalogNumber:"13440",descriptionHe:"פליפר אקרילי זמני עד שתי שיניים",eligibility:"base"},
  valplastFlipper:{shortCode:"תחפו",catalogNumber:"10104",descriptionHe:"פליפר Valplast עד שתי שיניים",eligibility:"base"},
  mesh:{shortCode:"רשי",catalogNumber:"13425",descriptionHe:"רשת יצוקה לחיזוק תותבת",eligibility:"base"},
  zirconia:{shortCode:"כחלמ",catalogNumber:"10011",descriptionHe:"כתר זירקוניה ללא מתכת",eligibility:"base"},
  monolithic:{shortCode:"כחלז",catalogNumber:"10229",descriptionHe:"כתר זירקוניה מונוליטי",eligibility:"base"},
  multiUnit:{shortCode:"מולטי",catalogNumber:"10194",descriptionHe:"Multi-Unit לשיקום מוברג",eligibility:"base"},
  fiberCore:{shortCode:"מסז",catalogNumber:"10186",descriptionHe:"מבנה עם פוסט סיבי",eligibility:"base"},
  immediateCore:{shortCode:"מ",catalogNumber:"13260",descriptionHe:"מבנה מיידי",eligibility:"requires-context"},
  immediateCorePin:{shortCode:"סמ",catalogNumber:"15070",descriptionHe:"מבנה מיידי כולל פין אחד",eligibility:"requires-context"},
  castCore:{shortCode:"מי",catalogNumber:"13255",descriptionHe:"מבנה יצוק ממתכת",eligibility:"requires-context"},
  crownRecement:{shortCode:"ערהכ",catalogNumber:"10041",descriptionHe:"עזרה ראשונה הדבקת כתר (לכל יחידה מאחזת עד 3 יחידות)",eligibility:"requires-context"},
  nightGuard:{shortCode:"סד",catalogNumber:"13410",descriptionHe:"סד לילה",eligibility:"base"},
  emergencyTreatment:{shortCode:"ער",catalogNumber:"13560",descriptionHe:"עזרה ראשונה / טיפול ללא קוד נפרד עד 20 דקות",eligibility:"requires-context"},
  emergencyExam:{shortCode:"ערא",catalogNumber:"13555",descriptionHe:"עזרה ראשונה: אבחון ומתן מרשם",eligibility:"requires-context"},
  castPartial:{shortCode:"תחלו",catalogNumber:"13445",descriptionHe:"תותבת חלקית יצוקה",eligibility:"base"},
  acrylicPartial:{shortCode:"תחל",catalogNumber:"13450",descriptionHe:"תותבת חלקית אקרילית זמנית משלוש שיניים",eligibility:"base"},
  immediateFull:{shortCode:"תשמ",catalogNumber:"13460",descriptionHe:"תותבת שלמה מעברית מיידית",eligibility:"base"},
  completeDenture:{shortCode:"תש",catalogNumber:"13465",descriptionHe:"תותבת שלמה עליונה/תחתונה כולל ריפודים לשנה",eligibility:"base"},
  implant:{shortCode:"שתל",catalogNumber:"13125",descriptionHe:"שתל דנטלי — הליך כירורגי",eligibility:"base"},
  wisdomExtraction:{shortCode:"עשב",catalogNumber:"13080",descriptionHe:"עקירת שן בינה",eligibility:"base"},
  abscess:{shortCode:"פמ",catalogNumber:"13090",descriptionHe:"פתיחת מורסה",eligibility:"requires-context"},
  implantCrown:{shortCode:"שכח",catalogNumber:"13675-0",descriptionHe:"כתר חרסינה/ויניר על שתל",eligibility:"base"},
  implantCore:{shortCode:"מבש",catalogNumber:"13690",descriptionHe:"מבנה לשתל",eligibility:"base"},
} as const satisfies Record<string,MaccabiCatalogEntry>;

