import { it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { previewComplaintsCsv } from "./complaints-import";
import { shippingVisible, validateShippingValues, SHIPPING_PHASE2_FLAGS } from "./shipping-validation";
import { DISABLED_PHASE2_FLAGS, assertFeatureFlagChangeAllowed } from "./phase2-flags";
import { linkGatedOff, filterSearchEntries, gateForPath } from "./path-gates";
const csv = readFileSync("docs/prompt-63-data/shipping_platforms.csv", "utf8");
const preview = () => previewComplaintsCsv("shipping_platforms", csv, [], new Set());
it("seven supplied records pass the shared dry-run as inactive needs_check", () => {
 const p = preview(); assert.equal(p.rows.length, 7); assert.equal(p.plans.length, 7); assert.equal(p.rows.filter(r => r.action === "rejected").length, 0);
 for (const r of p.plans) { assert.equal(r.payload["is_active"], false); assert.equal(r.payload["review_status"], "needs_check"); }
});
it("exactly seven approved records satisfy editorial activation validation", () => {
 for (const r of preview().plans) assert.equal(validateShippingValues({...r.payload, is_active:true, review_status:"editorial_reviewed"}), null);
});
it("shipping hub and nested directory are hidden while empty and open with a public row", () => {
 for (const to of ["/do-business/shipping-logistics", "/do-business/shipping-logistics/platforms?q=port"]) {
 assert.equal(gateForPath(to), "shipping_platforms"); assert.equal(linkGatedOff(to,{shipping_platforms:false}),true); assert.equal(linkGatedOff(to,{shipping_platforms:true}),false);
 }
 assert.equal(gateForPath("/do-business/procedure-guides"), undefined);
 assert.equal(gateForPath("/do-business/shipping-logistics-fake"), undefined);
});
it("search gates both source and destination for shipping", () => {
 const entries=[{to:"/do-business/shipping-logistics",page:"/"},{to:"/",page:"/do-business/shipping-logistics/platforms"}];
 assert.equal(filterSearchEntries(entries,{shipping_platforms:false}).length,0); assert.equal(filterSearchEntries(entries,{shipping_platforms:true}).length,2);
});
it("21 shipping switches are disabled by the guard and non-energy Phase 2 switches remain 82", () => {
 assert.equal(SHIPPING_PHASE2_FLAGS.length,21); assert.equal(new Set(SHIPPING_PHASE2_FLAGS).size,21); assert.equal(DISABLED_PHASE2_FLAGS.filter(f => !f.startsWith("energy_") && !f.startsWith("community_")).length,82);
 for (const f of SHIPPING_PHASE2_FLAGS) assert.throws(() => assertFeatureFlagChangeAllowed(f),/shipping flags are disabled/);
});
it("only active reviewed shipping rows are visible", () => {
 assert.equal(shippingVisible({is_active:true,review_status:"editorial_reviewed"}),true);
 assert.equal(shippingVisible({is_active:true,review_status:"verified"}),true);
 assert.equal(shippingVisible({is_active:false,review_status:"editorial_reviewed"}),false);
 assert.equal(shippingVisible({is_active:true,review_status:"needs_check"}),false);
});
const row={ name_en:"Official", category:"customs", official_url:"https://customs.gov.eg/", source_url:"https://customs.gov.eg/",last_verified_at:"2026-11-21",is_active:true,review_status:"editorial_reviewed" };
it("activation requires a source and date",()=>{assert.match(validateShippingValues({...row,source_url:null})??"",/source URL/);assert.match(validateShippingValues({...row,last_verified_at:null})??"",/verification date/);});
it("activation requires reviewed status",()=>assert.match(validateShippingValues({...row,review_status:"needs_check"})??"",/reviewed status/));
it("official URLs must be HTTPS",()=>assert.match(validateShippingValues({...row,official_url:"http://customs.gov.eg/"})??"",/HTTPS/));
it("PDF sources are rejected",()=>assert.match(validateShippingValues({...row,source_url:"https://customs.gov.eg/rules.pdf"})??"",/PDF/));
it("future verification dates are rejected",()=>assert.match(validateShippingValues({...row,last_verified_at:"2999-01-01"})??"",/future/));
it("a fee requires its own source",()=>assert.match(validateShippingValues({...row,published_fee_text:"Published fee",fee_source_url:null})??"",/fee source/));
