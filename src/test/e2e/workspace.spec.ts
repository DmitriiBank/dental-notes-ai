import { test, expect } from "@playwright/test";
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

test("clinician can edit the final record and return to live generation", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
  const record = page.getByLabel("Предпросмотр записи на иврите");
  await expect(record).toHaveAttribute("readonly", "");
  await page.getByTitle("Редактировать итог").click();
  await expect(record).not.toHaveAttribute("readonly", "");
  await record.fill("טקסט ידני שנבדק על ידי הרופא.");
  await expect(record).toHaveValue("טקסט ידני שנבדק על ידי הרופא.");
  await page.getByTitle("Вернуться к автогенерации").click();
  await expect(record).toHaveAttribute("readonly", "");
  await expect(record).toHaveValue("");
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
