import { describe, it, expect } from "vitest";
import { energyBodyTypeLabel } from "@/i18n/energy-translations";
describe("energy body type labels", () => {
  it("maps known keys in English", () => {
    expect(energyBodyTypeLabel("ministry", "en")).toBe("Ministry");
    expect(energyBodyTypeLabel("holding_company", "en")).toBe("Holding company");
    expect(energyBodyTypeLabel("authority", "en")).toBe("Authority");
    expect(energyBodyTypeLabel("standards_body", "en")).toBe("Standards body");
  });
  it("maps known keys in Arabic", () => {
    expect(energyBodyTypeLabel("ministry", "ar")).toBe("وزارة");
    expect(energyBodyTypeLabel("holding_company", "ar")).toBe("شركة قابضة");
    expect(energyBodyTypeLabel("authority", "ar")).toBe("هيئة");
    expect(energyBodyTypeLabel("standards_body", "ar")).toBe("جهة مواصفات");
  });
  it("shows unknown keys unchanged", () => {
    expect(energyBodyTypeLabel("regulator_x", "en")).toBe("regulator_x");
    expect(energyBodyTypeLabel("constructor", "ar")).toBe("constructor");
  });
});
