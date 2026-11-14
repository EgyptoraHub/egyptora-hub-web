import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sourceUrlWarning } from "./protected-areas";

describe("owner-approved EgyptERA sources", () => {
  it("accepts the approved EgyptERA complaints page", () => {
    assert.equal(sourceUrlWarning("https://egyptera.org/en/ComplaintsForm.aspx"), null);
  });
  it("accepts EgyptERA subdomains", () => {
    assert.equal(sourceUrlWarning("https://www.egyptera.org/"), null);
  });
  it("rejects a look-alike domain without a hostname boundary", () => {
    assert.equal(sourceUrlWarning("https://notegyptera.org/"), "warning: source_url is not an Egyptian website");
  });
  it("rejects EgyptERA as a subdomain of an unrelated domain", () => {
    assert.equal(sourceUrlWarning("https://egyptera.org.example.com/"), "warning: source_url is not an Egyptian website");
  });
  it("still warns about PDFs hosted on EgyptERA", () => {
    assert.equal(sourceUrlWarning("https://egyptera.org/en/complaints.pdf"), "warning: source_url is PDF link");
  });
});