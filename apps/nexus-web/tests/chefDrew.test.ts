/**
 * chefDrew.test.ts
 * Tests for Chef Drew web utilities.
 */

import {
  BlueprintStatus,
  HospitalityDomain,
  HospitalityObjective,
  formatBlueprintStatus,
  getBlueprintDomainLabel,
  validateHospitalityObjective,
} from "../src/utils/chefDrew";

describe("validateHospitalityObjective", () => {
  const validObjective: HospitalityObjective = {
    operationName: "The Grand Bistro",
    domain: "restaurant",
    description: "A fine dining restaurant experience",
  };

  it("should return valid for a complete objective", () => {
    const result = validateHospitalityObjective(validObjective);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should require operationName", () => {
    const result = validateHospitalityObjective({ ...validObjective, operationName: "" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("operationName is required");
  });

  it("should require domain", () => {
    const { domain: _domain, ...withoutDomain } = validObjective;
    const result = validateHospitalityObjective(withoutDomain);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("domain is required");
  });

  it("should require description", () => {
    const result = validateHospitalityObjective({ ...validObjective, description: "" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("description is required");
  });

  it("should reject negative coversPerDay", () => {
    const result = validateHospitalityObjective({ ...validObjective, coversPerDay: -1 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("coversPerDay must be non-negative");
  });

  it("should reject negative avgSpend", () => {
    const result = validateHospitalityObjective({ ...validObjective, avgSpend: -5 });
    expect(result.valid).toBe(false);
  });

  it("should reject negative teamSize", () => {
    const result = validateHospitalityObjective({ ...validObjective, teamSize: -2 });
    expect(result.valid).toBe(false);
  });

  it("should accept zero coversPerDay", () => {
    const result = validateHospitalityObjective({ ...validObjective, coversPerDay: 0 });
    expect(result.valid).toBe(true);
  });

  it("should return multiple errors for multiple invalid fields", () => {
    const result = validateHospitalityObjective({});
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe("formatBlueprintStatus", () => {
  it("should format 'pending' status", () => {
    expect(formatBlueprintStatus("pending")).toBe("Pending");
  });

  it("should format 'generating' status", () => {
    const result = formatBlueprintStatus("generating");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should format 'ready' status", () => {
    expect(formatBlueprintStatus("ready")).toBe("Ready");
  });

  it("should format 'failed' status", () => {
    expect(formatBlueprintStatus("failed")).toBe("Failed");
  });

  it("should handle all valid statuses", () => {
    const statuses: BlueprintStatus[] = ["pending", "generating", "ready", "failed"];
    for (const status of statuses) {
      expect(typeof formatBlueprintStatus(status)).toBe("string");
    }
  });
});

describe("getBlueprintDomainLabel", () => {
  it("should return readable label for restaurant domain", () => {
    expect(getBlueprintDomainLabel("restaurant")).toBe("Restaurant");
  });

  it("should return readable label for private_club domain", () => {
    expect(getBlueprintDomainLabel("private_club")).toBe("Private Members Club");
  });

  it("should return a non-empty string for all domains", () => {
    const domains: HospitalityDomain[] = [
      "restaurant",
      "hotel",
      "resort",
      "private_club",
      "luxury_destination",
      "culinary_operations",
      "hospitality_finance",
      "training",
      "guest_experience",
    ];
    for (const domain of domains) {
      const label = getBlueprintDomainLabel(domain);
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
    }
  });
});
