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
