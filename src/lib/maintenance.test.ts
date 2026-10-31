import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isMaintenancePreviewHost, maintenanceVisibility, requireMaintenanceAdmin } from "../config/maintenance";

describe("maintenance rules", () => {
  it("allows local and supported preview hosts", () => {
    for (const host of ["localhost", "id-preview--project.lovable.app", "id-preview-6--project.lovable.app", "id-preview-abc123--project.lovable.app", "preview-6--slug.workspace.lovable.app", "project--abc-dev.lovable.app", "live.lovableproject.com", "live.lovableproject-dev.com", "preview--slug.gpt-eng.com", "preview--slug.gptengineer.run"]) assert.equal(isMaintenancePreviewHost(host), true, host);
  });
  it("keeps public and lookalike hosts closed", () => {
    for (const host of ["egyptora-hub.com", "www.egyptora-hub.com", "sketch-to-site-whisperer.lovable.app", "project--abc.lovable.app", "id-preview--abc.evil.com", "id-preview--abc.lovable.app.evil.com", "not-preview.lovable.app"]) assert.equal(maintenanceVisibility(true, isMaintenancePreviewHost(host), false).closed, true, host);
  });
  it("ON shows the real site and badge only for previews or verified admins", () => {
    assert.deepEqual(maintenanceVisibility(true, true, false), { closed: false, badge: true });
    assert.deepEqual(maintenanceVisibility(true, false, true), { closed: false, badge: true });
    assert.deepEqual(maintenanceVisibility(true, false, false), { closed: true, badge: false });
  });
  it("OFF never displays a badge", () => {
    for (const preview of [true, false]) for (const admin of [true, false]) assert.deepEqual(maintenanceVisibility(false, preview, admin), { closed: false, badge: false });
  });
  it("rejects signed-out toggles", () => { assert.throws(() => requireMaintenanceAdmin(false, true), /Forbidden/); });
  it("rejects non-admin toggles", () => { assert.throws(() => requireMaintenanceAdmin(true, false), /Forbidden/); });
  it("permits authenticated verified admins", () => { assert.doesNotThrow(() => requireMaintenanceAdmin(true, true)); });
});