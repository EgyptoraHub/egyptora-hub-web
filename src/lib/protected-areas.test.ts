import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sourceUrlWarning } from "./protected-areas";

describe("owner-approved EgyptAir Cargo sources", () => {
  it("accepts the official domain and www subdomain", () => {
    assert.equal(sourceUrlWarning("https://egyptair-cargo.com/"), null);
    assert.equal(sourceUrlWarning("https://www.egyptair-cargo.com/"), null);
  });
  it("rejects an unrelated domain with the approved name as a subdomain", () => {
    assert.equal(sourceUrlWarning("https://egyptair-cargo.com.example.org/"), "warning: source_url is not an Egyptian website");
  });
  it("rejects a look-alike without a hostname boundary", () => {
    assert.equal(sourceUrlWarning("https://notegyptair-cargo.com/"), "warning: source_url is not an Egyptian website");
  });
  it("still warns about PDFs on the approved domain", () => {
    assert.equal(sourceUrlWarning("https://www.egyptair-cargo.com/shipping.pdf"), "warning: source_url is PDF link");
  });
});

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