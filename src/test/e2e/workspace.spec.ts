import { test, expect } from "@playwright/test";

const acceptNextDialog=(page:import("@playwright/test").Page)=>page.once("dialog",dialog=>dialog.accept());
const dismissNextDialog=(page:import("@playwright/test").Page)=>page.once("dialog",dialog=>dialog.dismiss());

test("performed-treatment tab follows treatment and requires explicit confirmation",async({page})=>{
  await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  const tabs=page.locator(".sticky.top-0.z-10").first().getByRole("button");
  const labels=await tabs.allTextContents();
  expect(labels.indexOf("Проведённое лечение")).toBe(labels.indexOf("Лечение")+1);
  await page.getByRole("button",{name:"36",exact:true}).click();
  await page.getByRole("button",{name:"B",exact:true}).click();
  await page.getByRole("button",{name:"Проведённое лечение",exact:true}).click();
  await page.getByRole("button",{name:"Filtek",exact:true}).click();
  await page.getByRole("button",{name:"A2",exact:true}).click();
  const action=page.getByRole("button",{name:/Постоянная композитная пломба/u});
  dismissNextDialog(page);await action.click();
  await expect(page.getByLabel("Предпросмотр записи на иврите")).not.toHaveValue(/שחזור קומפוזיט/u);
  acceptNextDialog(page);await action.click();
  const record=page.getByLabel("Предпросмотр записи на иврите");
  await expect(record).toHaveValue(/שחזור קומפוזיט בשן 36 \(B\)/u);
  await expect(record).toHaveValue(/Filtek/u);
  await expect(record).toHaveValue(/A2/u);
});

test("bulk performed treatment creates reversible tooth-level acts",async({page})=>{
  await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  for(const tooth of [11,12,13])await page.getByRole("button",{name:String(tooth),exact:true}).click();
  await page.getByRole("button",{name:"Проведённое лечение",exact:true}).click();
  acceptNextDialog(page);await page.getByRole("button",{name:/Постоянная композитная пломба/u}).click();
  await expect(page.getByText(/Записанные выполненные этапы/u)).toBeVisible();
  await expect(page.getByLabel(/Удалить выполненное действие composite-filling/u)).toHaveCount(3);
  const record=page.getByLabel("Предпросмотр записи на иврите");
  await expect(record).toHaveValue(/11, 12 ו13/u);
  dismissNextDialog(page);await page.getByLabel(/Удалить выполненное действие composite-filling/u).nth(1).click();
  await expect(page.getByLabel(/Удалить выполненное действие composite-filling/u)).toHaveCount(3);
  acceptNextDialog(page);await page.getByLabel(/Удалить выполненное действие composite-filling/u).nth(1).click();
  await expect(page.getByLabel(/Удалить выполненное действие composite-filling/u)).toHaveCount(2);
  await expect(record).not.toHaveValue(/11, 12 ו13/u);
  await page.getByTitle("Отменить").click();
  await expect(page.getByLabel(/Удалить выполненное действие composite-filling/u)).toHaveCount(3);
});

test("deep-caries explanations remain independent and off by default",async({page})=>{
  await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  await page.getByRole("button",{name:"26",exact:true}).click();
  await page.getByRole("button",{name:"Проведённое лечение",exact:true}).click();
  await page.getByRole("button",{name:"Глубокий кариес",exact:true}).click();
  acceptNextDialog(page);await page.getByRole("button",{name:/Постоянная композитная пломба/u}).click();
  const record=page.getByLabel("Предпросмотр записи на иврите");
  await expect(record).not.toHaveValue(/ייתכנו כאבים|צורך בטיפול שורש/u);
  acceptNextDialog(page);await page.getByRole("button",{name:"Объяснена возможная боль после лечения",exact:true}).click();
  await expect(record).toHaveValue(/ייתכנו כאבים/u);
  await expect(record).not.toHaveValue(/צורך בטיפול שורש/u);
  acceptNextDialog(page);await page.getByRole("button",{name:"Объяснена возможная необходимость лечения корневых каналов",exact:true}).click();
  await expect(record).toHaveValue(/צורך בטיפול שורש/u);
});

test("performed treatment persists locally and never creates an appointment or code",async({page})=>{
  await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  await page.getByRole("button",{name:"47",exact:true}).click();
  await page.getByRole("button",{name:"Проведённое лечение",exact:true}).click();
  acceptNextDialog(page);await page.getByRole("button",{name:/Временная пломба/u}).click();
  await expect(page.getByText("Нет приемов для расписания",{exact:true})).toBeVisible();
  await expect(page.getByLabel("MaccabiDent codes review")).toContainText("Нет подтвержденных кодов");
  await page.getByRole("button",{name:"Сохранить локально",exact:true}).click();
  await page.reload();await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  await page.getByRole("button",{name:"Загрузить локальный черновик",exact:true}).click();
  await expect(page.getByLabel("Предпросмотр записи на иврите")).toHaveValue(/שחזור זמני בשן 47/u);
});

test("manual section editing remains live with performed-treatment source changes",async({page})=>{
  await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  await page.getByRole("button",{name:"36",exact:true}).click();
  await page.getByRole("button",{name:"Проведённое лечение",exact:true}).click();
  acceptNextDialog(page);await page.getByRole("button",{name:/Постоянная композитная пломба/u}).click();
  await page.getByRole("button",{name:"Редактировать раздел טיפול שבוצע"}).click();
  await page.getByLabel("Текст раздела טיפול שבוצע").fill("טיפול שבוצע ונערך ידנית.");
  await page.getByRole("button",{name:"Сохранить раздел"}).click();
  await page.getByRole("button",{name:"37",exact:true}).click();
  acceptNextDialog(page);await page.getByRole("button",{name:/Постоянная композитная пломба/u}).click();
  await expect(page.getByText(/Экспорт заблокирован/u)).toBeVisible();
  await expect(page.getByLabel("Предпросмотр записи на иврите")).toHaveValue(/טיפול שבוצע ונערך ידנית/u);
});
test("chart, multi-select, sample case and Hebrew preview work",async({page})=>{
  await page.goto("/");
  await expect(page.getByRole("heading",{name:"Dental Notes AI"})).toBeVisible();
  await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  for(const n of [18,11,21,28,48,41,31,38]) await expect(page.getByRole("button",{name:String(n),exact:true})).toBeVisible();
  await page.getByRole("button",{name:"11",exact:true}).click();
  await page.getByRole("button",{name:"12",exact:true}).click();
  await expect(page.getByText("Выбрано: 11, 12")).toBeVisible();
  await page.getByRole("combobox").first().selectOption("b");
  await expect(page.getByLabel("Предпросмотр записи на иврите")).toHaveValue(/עששת עמוקה/);
});

test("clinician edits one Hebrew section without freezing the others", async ({ page }) => {
  await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  await page.getByRole("combobox").first().selectOption("b");
  await page.getByRole("button",{name:"Редактировать раздел ממצאים קליניים"}).click();
  await page.getByLabel("Текст раздела ממצאים קליניים").fill("ממצא קליני שנערך ידנית.");
  await page.getByRole("button",{name:"Сохранить раздел"}).click();
  await expect(page.getByLabel("Предпросмотр записи на иврите")).toHaveValue(/ממצא קליני שנערך ידנית/u);
  await page.getByRole("button",{name:"26",exact:true}).click();await page.getByRole("button",{name:"Лечение",exact:true}).click();await page.getByRole("button",{name:/^Наблюдение/u}).click();
  await expect(page.getByLabel("Предпросмотр записи на иврите")).toHaveValue(/תוכנית טיפול והמלצות/u);
  await expect(page.getByLabel("Предпросмотр записи на иврите")).toHaveValue(/ממצא קליני שנערך ידנית/u);
});

test("first-aid crown scenario uses the selected chart tooth and updates Hebrew live", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
  await page.getByRole("button", { name:"12", exact:true }).click();
  await page.getByRole("button", { name:"Первая помощь", exact:true }).click();
  await page.getByRole("button", { name:"Расфиксация коронки", exact:true }).click();
  await page.getByRole("button", { name:"Искусственная коронка", exact:true }).click();
  await page.getByRole("button", { name:/Коронка временно фиксирована Temp-Bond/u }).click();
  await page.getByRole("button", { name:/Объяснено, что фиксация временная/u }).click();
  const record = page.getByLabel("Предпросмотр записи на иврите");
  await expect(record).toHaveValue(/השתחררות כתר בשן 12/u);
  await expect(record).toHaveValue(/בוצעה הדבקה זמנית של הכתר בשן 12 באמצעות Temp-Bond/u);
  await expect(record).toHaveValue(/הוסבר למטופל כי מדובר בהדבקה זמנית בלבד/u);
});

test("surface-specific posterior filling shows code review independently from appointments",async({page})=>{
  await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  await page.getByRole("button",{name:"47",exact:true}).click();
  await page.getByRole("button",{name:"O",exact:true}).click();
  await page.getByRole("button",{name:"Лечение",exact:true}).click();
  await page.getByRole("button",{name:/^Пломба/u}).click();
  await page.getByRole("button",{name:"Коды Maccabi",exact:true}).click();
  await expect(page.getByText("שקא1",{exact:true}).first()).toBeVisible();
  await expect(page.getByText("13505",{exact:false}).first()).toBeVisible();
  await expect(page.getByLabel("MaccabiDent codes review")).toContainText("שקא1");
  await expect(page.getByText("תור 1:",{exact:true})).toBeVisible();
  await expect(page.getByText("30 דקות",{exact:true})).toBeVisible();
});

test("jaw edentulism is reversible with undo",async({page})=>{
  await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  await page.getByRole("button",{name:"Полная адентия — верх",exact:true}).click();
  const record=page.getByLabel("Предпросмотр записи на иврите");
  await expect(record).toHaveValue(/חוסר שיניים מלא בלסת העליונה/u);
  await page.getByTitle("Отменить").click();
  await expect(record).not.toHaveValue(/חוסר שיניים מלא בלסת העליונה/u);
});

test("quick exam expands and patient alternative remains pending until selected",async({page})=>{
  await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  await page.getByRole("button",{name:/Осмотр пациента/u}).click();
  await expect(page.getByText("Медицинские факторы (только известные)")).toBeVisible();
  await page.getByRole("button",{name:"27",exact:true}).click();
  await page.getByRole("button",{name:"Альтернативы",exact:true}).click();
  await page.getByRole("button",{name:"Добавить вариант",exact:true}).click();
  await page.getByPlaceholder("Клинически корректный вариант").fill("בירור נוסף ומעקב");
  await expect(page.getByLabel("Предпросмотр записи на иврите")).toHaveValue(/החלטת המטופל ממתינה/u);
  await page.locator("select").filter({has:page.locator('option[value="selected"]')}).selectOption("selected");
  await expect(page.getByLabel("Предпросмотр записи на иврите")).toHaveValue(/המטופל בחר באפשרות זו/u);
});

test("clipboard contains the generated Hebrew record",async({page,context,browserName})=>{
  test.skip(browserName!=="chromium","Clipboard permissions are verified in Chromium only");
  await context.grantPermissions(["clipboard-read","clipboard-write"]);
  await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  await page.getByRole("button",{name:"26",exact:true}).click();await page.getByRole("button",{name:"O",exact:true}).click();await page.getByRole("button",{name:"Первичный кариес",exact:true}).click();
  await page.getByRole("button",{name:"Копировать итоговую запись",exact:true}).click();
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain("שן 26");
});

test("dentist can define a temporary mobile bridge without marking abutments mobile",async({page})=>{
  await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  for(const tooth of [15,16,17])await page.getByRole("button",{name:String(tooth),exact:true}).click();
  await page.getByRole("button",{name:"Лечение",exact:true}).click();
  await page.getByRole("button",{name:/^Мост/u}).first().click();
  await expect(page.getByLabel("Предпросмотр записи на иврите")).toHaveValue(/גשר משן 15 עד שן 17/u);
  await page.getByRole("button",{name:"Лаборатория",exact:true}).click();
  await page.getByRole("button",{name:"Добавить мост",exact:true}).click();
  await page.getByLabel("Материал конструкции").fill("zirconia");
  await page.getByLabel("Постоянство моста").selectOption("temporary");
  await page.getByLabel("Подвижность всего моста").selectOption("mobile");
  const record=page.getByLabel("Предпросмотр записи на иврите");
  await expect(record).toHaveValue(/יחידות ביניים 16/u);
  await expect(record).toHaveValue(/מבנה זמני/u);
  await expect(record).toHaveValue(/ניידות של הגשר כולו/u);
  await expect(record).not.toHaveValue(/שן 15 מאחזת ניידת/u);
});

test("patient refusal is linked to a proposed treatment and does not imply risk discussion",async({page})=>{
  await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  await page.getByRole("button",{name:"47",exact:true}).click();
  await page.getByRole("button",{name:"Лечение",exact:true}).click();
  await page.getByRole("button",{name:/^Временная пломба/u}).click();
  await page.getByRole("button",{name:"Альтернативы",exact:true}).click();
  await page.getByRole("button",{name:"Добавить решение пациента",exact:true}).click();
  await page.getByLabel("Статус решения пациента").selectOption("refused");
  await page.getByLabel("Описание решения пациента").fill("סתימה זמנית בשן 47");
  await page.getByLabel("Причина отказа").fill("המטופל מבקש להמתין");
  const record=page.getByLabel("Предпросмотр записи на иврите");
  await expect(record).toHaveValue(/המטופל סירב: סתימה זמנית בשן 47/u);
  await expect(record).not.toHaveValue(/הסיכונים הוסברו/u);
});

test("unsupported age eligibility is visibly needs_review and no suffix is invented",async({page})=>{
  await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  await page.getByRole("button",{name:"47",exact:true}).click();
  await page.getByRole("button",{name:"O",exact:true}).click();
  await page.getByRole("button",{name:"Лечение",exact:true}).click();
  await page.getByRole("button",{name:/^Пломба/u}).click();
  await page.getByRole("button",{name:"Коды Maccabi",exact:true}).click();
  await page.getByLabel("Возрастная группа тарифа").selectOption("over75");
  await expect(page.getByText("needs_review",{exact:true}).first()).toBeVisible();
  await expect(page.getByText(/суффикс не добавлен/u)).toBeVisible();
  await expect(page.getByLabel("MaccabiDent codes review")).not.toContainText(/שקא1-75|13505-75/u);
});

test("reviewed imaging can document normal periapical tissues without contradictory pathology",async({page})=>{
  await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  await page.getByRole("button",{name:"26",exact:true}).click();
  await page.getByRole("button",{name:"Снимки",exact:true}).click();
  await page.getByRole("button",{name:"Добавить исследование",exact:true}).click();
  await page.getByLabel("Статус снимка").selectOption("reviewed");
  const normal=page.getByRole("button",{name:"Без изменений в периапикальных тканях",exact:true});
  await normal.click();
  const record=page.getByLabel("Предпросмотр записи на иврите");
  await expect(record).toHaveValue(/לא הודגמו שינויים ברקמות הפריאפיקליות/u);
  await page.getByRole("button",{name:"Периапикальное просветление",exact:true}).click();
  await expect(normal).toHaveAttribute("aria-pressed","false");
  await expect(record).not.toHaveValue(/לא הודגמו שינויים ברקמות הפריאפיקליות/u);
  await expect(record).toHaveValue(/הצללה רדיולוצנטית פריאפיקלית/u);
});

test("medication safety flags are rendered in Hebrew without internal English keys",async({page})=>{
  await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  await page.getByRole("button",{name:"Лекарства",exact:true}).click();
  await page.getByRole("button",{name:"Добавить проверку безопасности",exact:true}).click();
  await page.getByLabel("Известность лекарственного анамнеза").selectOption("unknown");
  await page.getByText("Остеопороз",{exact:true}).click();
  await page.getByText("Требуется клиническая проверка",{exact:true}).click();
  const record=page.getByLabel("Предпросмотр записи на иврите");
  await expect(record).toHaveValue(/היסטוריית הטיפול התרופתי אינה ידועה/u);
  await expect(record).toHaveValue(/גורמי סיכון מתועדים: אוסטאופורוזיס/u);
  await expect(record).toHaveValue(/נדרשת בדיקה קלינית/u);
  await expect(record).not.toHaveValue(/osteoporosis|clinical review/u);
});

test("dentist can prescribe exact Augmentin strengths and explicitly confirm a penicillin-allergy alternative",async({page})=>{
  await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  await page.getByRole("button",{name:"Лекарства",exact:true}).click();
  await page.getByRole("button",{name:"Аугментин 500/125 мг",exact:true}).click();
  await page.getByRole("button",{name:"Аугментин 875/125 мг",exact:true}).click();
  const record=page.getByLabel("Предпросмотр записи на иврите");
  await expect(record).toHaveValue(/Augmentin; ריכוז 500\/125 mg/u);
  await expect(record).toHaveValue(/Augmentin; ריכוז 875\/125 mg/u);
  await expect(record).not.toHaveValue(/תדירות|משך|מנה/u);
  await page.getByRole("button",{name:"Азитромицин — при аллергии на пенициллин",exact:true}).click();
  await expect(record).toHaveValue(/הבחירה כחלופה לאלרגיה לפניצילין טרם אושרה על ידי רופא/u);
  await page.getByText("Подтверждаю выбор препарата после проверки аллергической реакции и клинического показания",{exact:true}).click();
  await expect(record).toHaveValue(/נבחרה חלופה עקב אלרגיה מתועדת לפניצילין/u);
});

test("complaint tab supports bulk assignment and tooth-level isolation with live Hebrew output",async({page})=>{
  await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  await expect(page.locator("button.chip.whitespace-nowrap")).toHaveText(["Жалобы","Находки","Лечение","Проведённое лечение","Консультации и направления","Первая помощь","Снимки","Альтернативы","Лаборатория","Лекарства","Коды Maccabi"]);
  await page.getByRole("button",{name:"Жалобы",exact:true}).click();
  await page.getByRole("button",{name:"11",exact:true}).click();await page.getByRole("button",{name:"12",exact:true}).click();
  await page.getByRole("button",{name:"Боль при накусывании",exact:true}).click();
  const record=page.getByLabel("Предпросмотр записи на иврите");
  await expect(record).toHaveValue(/סיבת הביקור:\nלדברי המטופל\/ת, כאב בעת נשיכה, בשיניים 11 ו12/u);
  await page.getByRole("button",{name:"12",exact:true}).click();
  await page.getByRole("button",{name:"Боль при накусывании",exact:true}).click();
  await expect(record).toHaveValue(/כאב בעת נשיכה, בשן 12/u);
  await expect(record).not.toHaveValue(/כאב בעת נשיכה, בשן 11/u);
});

test("complaints support no-complaint exclusivity, optional dropdown details and local saving",async({page})=>{
  await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  await page.getByRole("button",{name:"Жалобы",exact:true}).click();
  await page.getByRole("button",{name:"36",exact:true}).click();
  await page.getByRole("button",{name:"Самопроизвольная боль",exact:true}).click();
  await page.getByRole("button",{name:"Жалоб нет",exact:true}).first().click();
  await expect(page.getByRole("button",{name:"Жалоб нет",exact:true}).first()).toHaveAttribute("aria-pressed","true");
  await expect(page.getByRole("button",{name:"Самопроизвольная боль",exact:true})).toHaveAttribute("aria-pressed","false");
  await page.getByRole("button",{name:"Жалоб нет",exact:true}).first().click();
  await page.getByRole("button",{name:"На холодное",exact:true}).click();
  await page.getByLabel("Интенсивность: На холодное 36").selectOption("severe");
  await expect(page.getByLabel("Предпросмотр записи на иврите")).toHaveValue(/רגישות לקור, בשן 36, בעוצמה חזקה/u);
  await page.getByRole("button",{name:"Сохранить локально",exact:true}).click();
  await page.reload();await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  await page.getByRole("button",{name:"Загрузить локальный черновик",exact:true}).click();
  await expect(page.getByLabel("Предпросмотр записи на иврите")).toHaveValue(/רגישות לקור, בשן 36, בעוצמה חזקה/u);
});

test("region and general complaints remain separate from objective findings",async({page})=>{
  await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");
  await page.getByRole("button",{name:"Жалобы",exact:true}).click();
  await page.getByLabel("Область жалобы").selectOption("upper-right");
  await page.getByRole("button",{name:"Опухла десна",exact:true}).click();
  await page.getByRole("button",{name:"Пришёл на осмотр",exact:true}).click();
  const record=page.getByLabel("Предпросмотр записи на иврите");
  await expect(record).toHaveValue(/נפיחות בחניכיים, בלסת העליונה מימין/u);
  await expect(record).toHaveValue(/הגעה לבדיקה שגרתית/u);
  await expect(record).not.toHaveValue(/ממצאים קליניים/u);
});

test("consultation editor creates multiple tooth and whole-plan referrals without appointments",async({page})=>{await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");await page.getByRole("button",{name:"11",exact:true}).click();await page.getByRole("button",{name:"12",exact:true}).click();await page.getByRole("button",{name:"Консультации и направления",exact:true}).click();await page.getByRole("button",{name:/יועץ שיקום/u}).click();await page.getByRole("button",{name:"Сложная ортопедическая реабилитация",exact:true}).click();await page.getByRole("button",{name:/מומחה לטיפולי שורש/u}).click();const scopes=page.getByLabel("Объект консультации");await scopes.nth(1).selectOption("plan");const record=page.getByLabel("Предпросмотр записи на иврите");await expect(record).toHaveValue(/יועץ שיקום לשיניים 11 ו12/u);await expect(record).toHaveValue(/מומחה לטיפולי שורש עבור תוכנית הטיפול הכוללת/u);await expect(page.getByText("Нет приемов для расписания",{exact:true})).toBeVisible()});

test("completed consultation requires confirmation and blocking errors disable copy and export",async({page})=>{await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");await page.getByRole("button",{name:"Консультации и направления",exact:true}).click();await page.getByRole("button",{name:/רופא שתלים/u}).click();await page.getByLabel("Статус консультации").selectOption("completed");await expect(page.getByRole("button",{name:"Копировать итоговую запись"})).toBeDisabled();await expect(page.getByRole("button",{name:"Экспортировать итоговую запись"})).toBeDisabled();await page.getByText("Выполнение консультации подтверждено врачом",{exact:true}).click();await expect(page.getByLabel("Предпросмотр записи на иврите")).toHaveValue(/התקיים ייעוץ אצל רופא שתלים/u);await expect(page.getByRole("button",{name:"Копировать итоговую запись"})).toBeEnabled()});

test("manual clinical section shows a revision conflict and blocks export",async({page})=>{await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");await page.getByRole("button",{name:"26",exact:true}).click();await page.getByRole("button",{name:"Первичный кариес",exact:true}).click();await page.getByRole("button",{name:"Редактировать раздел ממצאים קליניים"}).click();await page.getByLabel("Текст раздела ממצאים קליניים").fill("טקסט ידני");await page.getByRole("button",{name:"Сохранить раздел"}).click();await page.getByRole("button",{name:"Глубокий кариес",exact:true}).click();await expect(page.getByText("needs_review",{exact:true})).toBeVisible();await expect(page.getByText(/Экспорт заблокирован/u)).toBeVisible();await expect(page.getByRole("button",{name:"Копировать итоговую запись"})).toBeDisabled();await expect(page.getByRole("button",{name:"Экспортировать итоговую запись"})).toBeDisabled()});

test("identical findings and fillings consolidate in Hebrew while appointments remain available",async({page})=>{await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");for(const tooth of [11,12,13])await page.getByRole("button",{name:String(tooth),exact:true}).click();await page.getByRole("button",{name:"P",exact:true}).click();await page.getByRole("button",{name:"D",exact:true}).click();await page.getByRole("button",{name:"Первичный кариес",exact:true}).click();await page.getByRole("button",{name:"Лечение",exact:true}).click();await page.getByRole("button",{name:/^Пломба/u}).click();const record=page.getByLabel("Предпросмотр записи на иврите");await expect(record).toHaveValue(/עששת ראשונית בשיניים 11 \(PD\), 12 \(PD\) ו13 \(PD\)/u);await expect(record).toHaveValue(/ביצוע שחזור בשיניים 11 \(PD\), 12 \(PD\) ו13 \(PD\)/u);await expect(page.getByText(/תור 1:/u)).toBeVisible()});

test("complete dentures are selected by jaw and never enumerate selected teeth",async({page})=>{await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");await page.getByRole("button",{name:"11",exact:true}).click();await page.getByRole("button",{name:"12",exact:true}).click();await page.getByRole("button",{name:"Лечение",exact:true}).click();await page.getByRole("button",{name:"Полный съемный протез · верх",exact:true}).click();await page.getByRole("button",{name:"Полный съемный протез · низ",exact:true}).click();const record=page.getByLabel("Предпросмотр записи на иврите");await expect(record).toHaveValue(/תותבות שלמות נשלפות ללסת העליונה וללסת התחתונה/u);await expect(record).not.toHaveValue(/בשיניים 11|בשיניים 12/u)});

test("root fracture interpretation appears only after reviewed status",async({page})=>{await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");await page.getByRole("button",{name:"15",exact:true}).click();await page.getByRole("button",{name:"Снимки",exact:true}).click();await page.getByRole("button",{name:"Добавить исследование",exact:true}).click();await page.getByRole("button",{name:"Подозрение на перелом корня по снимку",exact:true}).click();const record=page.getByLabel("Предпросмотр записи на иврите");await expect(record).not.toHaveValue(/חשד לשבר בשורש/u);await page.getByLabel("Статус снимка").selectOption("reviewed");await expect(record).toHaveValue(/חשד לשבר בשורש על פי הממצא הרדיוגרפי/u);await expect(record).not.toHaveValue(/עקירה/u)});

test("bulk finding can be removed from only one selected tooth",async({page})=>{await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");for(const tooth of [11,12,13])await page.getByRole("button",{name:String(tooth),exact:true}).click();await page.getByRole("button",{name:"Первичный кариес",exact:true}).click();await page.getByRole("button",{name:"11",exact:true}).click();await page.getByRole("button",{name:"13",exact:true}).click();await page.getByRole("button",{name:"Первичный кариес",exact:true}).click();const record=page.getByLabel("Предпросмотр записи на иврите");await expect(record).toHaveValue(/עששת ראשונית בשיניים 11 ו13/u);await expect(record).not.toHaveValue(/עששת ראשונית בשן 12/u)});

test("completed treatment removal requires confirmation and cancel preserves it",async({page})=>{await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");await page.getByRole("combobox").first().selectOption("f");await page.getByRole("button",{name:"12",exact:true}).click();await page.getByRole("button",{name:"Лечение",exact:true}).click();page.once("dialog",dialog=>dialog.dismiss());await page.getByRole("button",{name:/Удалить процедуру crown-recement/u}).click();await expect(page.getByLabel("Предпросмотр записи на иврите")).toHaveValue(/הדבקת כתר מחדש/u)});

test("visible undo and redo restore a structured selection",async({page})=>{await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");await page.getByRole("button",{name:"11",exact:true}).click();await page.getByRole("button",{name:"Клинически интактный зуб",exact:true}).click();const record=page.getByLabel("Предпросмотр записи на иврите");await expect(record).toHaveValue(/ללא ממצא פתולוגי/u);await page.getByTitle("Отменить").click();await expect(record).not.toHaveValue(/ללא ממצא פתולוגי/u);await page.getByTitle("Повторить").click();await expect(record).toHaveValue(/ללא ממצא פתולוגי/u)});

test("accepting regenerated section resolves only its conflict",async({page})=>{await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");await page.getByRole("button",{name:"11",exact:true}).click();await page.getByRole("button",{name:"Первичный кариес",exact:true}).click();await page.getByRole("button",{name:"Редактировать раздел ממצאים קליניים"}).click();await page.getByLabel("Текст раздела ממצאים קליניים").fill("ידני");await page.getByRole("button",{name:"Сохранить раздел"}).click();await page.getByRole("button",{name:"Короткие корни",exact:true}).click();await expect(page.getByText("needs_review",{exact:true})).toBeVisible();await page.getByRole("button",{name:"Принять новую генерацию"}).click();await expect(page.getByText("needs_review",{exact:true})).toHaveCount(0);await expect(page.getByLabel("Предпросмотр записи на иврите")).toHaveValue(/שורשים קצרים/u);await expect(page.getByRole("button",{name:"Копировать итоговую запись"})).toBeEnabled()});

test("discarding one section override leaves another manual section intact",async({page})=>{await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");await page.getByRole("button",{name:"Жалобы",exact:true}).click();await page.getByRole("button",{name:"Пришёл на осмотр",exact:true}).click();await page.getByRole("button",{name:"11",exact:true}).click();await page.getByRole("button",{name:"Находки",exact:true}).click();await page.getByRole("button",{name:"Клинически интактный зуб",exact:true}).click();for(const [label,text] of [["סיבת הביקור","ידני תלונה"],["ממצאים קליניים","ידני ממצא"]] as const){await page.getByRole("button",{name:`Редактировать раздел ${label}`}).click();await page.getByLabel(`Текст раздела ${label}`).fill(text);await page.getByRole("button",{name:"Сохранить раздел"}).click()}await page.getByRole("button",{name:"Отменить ручную правку ממצאים קליניים"}).click();const record=page.getByLabel("Предпросмотр записи на иврите");await expect(record).toHaveValue(/ידני תלונה/u);await expect(record).not.toHaveValue(/ידני ממצא/u);await expect(record).toHaveValue(/ללא ממצא פתולוגי/u)});

test("local save and reload preserves section overrides and unresolved conflicts",async({page})=>{await page.goto("/");await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");await page.getByRole("button",{name:"11",exact:true}).click();await page.getByRole("button",{name:"Клинически интактный зуб",exact:true}).click();await page.getByRole("button",{name:"Редактировать раздел ממצאים קליניים"}).click();await page.getByLabel("Текст раздела ממצאים קליניים").fill("ידני נשמר");await page.getByRole("button",{name:"Сохранить раздел"}).click();await page.getByRole("button",{name:"Короткие корни",exact:true}).click();await page.getByRole("button",{name:"Сохранить локально",exact:true}).click();await page.reload();await expect(page.locator("main")).toHaveAttribute("data-hydrated","true");await page.getByRole("button",{name:"Загрузить локальный черновик",exact:true}).click();await expect(page.getByText("needs_review",{exact:true})).toBeVisible();await expect(page.getByLabel("Предпросмотр записи на иврите")).toHaveValue(/ידני נשמר/u)});
