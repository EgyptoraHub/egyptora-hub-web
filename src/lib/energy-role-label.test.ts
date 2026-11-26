import { it } from "node:test";
import assert from "node:assert/strict";
import { energyRoleLabel } from "@/i18n/energy-translations";
import { ENERGY_ROLES, energyInterestSchema } from "@/lib/energy-validation";

const english = [
  "Buyer / operator",
  "Engineering or construction contractor",
  "Supplier or manufacturer",
  "Recycler or waste handler",
  "Logistics provider",
  "Other",
];
const arabic = [
  "مشتري / مشغّل",
  "مقاول هندسي أو إنشاءات",
  "مورد أو مُصنّع",
  "جهة تدوير أو معالجة نفايات",
  "مقدم خدمات لوجستية",
  "أخرى",
];

it("company roles have readable English labels", () => {
  assert.deepEqual(ENERGY_ROLES.map((role) => energyRoleLabel(role, "en")), english);
});

it("company roles have the approved Arabic labels", () => {
  assert.deepEqual(ENERGY_ROLES.map((role) => energyRoleLabel(role, "ar")), arabic);
});

it("unknown role labels fall back unchanged and submission keeps the stored key", () => {
  assert.equal(energyRoleLabel("future_role", "en"), "future_role");
  assert.equal(energyRoleLabel("future_role", "ar"), "future_role");
  const parsed = energyInterestSchema.parse({
    company_name: "Display label test",
    country: "Egypt",
    company_role: ENERGY_ROLES[0],
    disciplines: ["civil"],
    contact_name: "Test contact",
    contact_email: "role-test@example.invalid",
    message: "Checks the submitted role value.",
    consent_given: true,
    website: "",
  });
  assert.equal(parsed.company_role, "buyer/operator");
});
