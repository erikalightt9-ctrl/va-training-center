import {
  resolveTenantId,
  scopeToTenant,
  scopeViaCourse,
  assertTenantOwns,
  TenantMismatchError,
} from "@/lib/tenant-isolation";
import type { JWT } from "next-auth/jwt";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeToken(overrides: Partial<JWT> = {}): JWT {
  return {
    sub: "user-1",
    iat: 0,
    exp: 9999999999,
    jti: "test-jti",
    ...overrides,
  } as JWT;
}

// ─── resolveTenantId ──────────────────────────────────────────────────────────

describe("resolveTenantId", () => {
  it("returns null for a superadmin token", () => {
    const token = makeToken({ isSuperAdmin: true });
    expect(resolveTenantId(token)).toBeNull();
  });

  it("returns tenantId for a tenant admin token", () => {
    const token = makeToken({ isSuperAdmin: false, tenantId: "tenant-abc" });
    expect(resolveTenantId(token)).toBe("tenant-abc");
  });

  it("throws when a non-superadmin token has no tenantId", () => {
    const token = makeToken({ isSuperAdmin: false });
    expect(() => resolveTenantId(token)).toThrow(
      "Token missing tenantId for non-superadmin caller",
    );
  });
});

// ─── scopeToTenant ────────────────────────────────────────────────────────────

describe("scopeToTenant", () => {
  it("injects tenantId when scope is a string", () => {
    const result = scopeToTenant("tenant-123", { isActive: true });
    expect(result).toEqual({ isActive: true, tenantId: "tenant-123" });
  });

  it("returns the extra clause unchanged when scope is null (superadmin)", () => {
    const extra = { isActive: true };
    const result = scopeToTenant(null, extra);
    expect(result).toEqual({ isActive: true });
    expect(result).not.toHaveProperty("tenantId");
  });

  it("works with an empty extra clause", () => {
    expect(scopeToTenant("t-1")).toEqual({ tenantId: "t-1" });
    expect(scopeToTenant(null)).toEqual({});
  });

  it("does not mutate the original extra object", () => {
    const extra = { isActive: true };
    scopeToTenant("t-1", extra);
    expect(extra).toEqual({ isActive: true });
  });
});

// ─── scopeViaCourse ───────────────────────────────────────────────────────────

describe("scopeViaCourse", () => {
  it("injects course.tenantId when scope is a string", () => {
    const result = scopeViaCourse("tenant-xyz", { isPublished: true });
    expect(result).toEqual({
      isPublished: true,
      course: { tenantId: "tenant-xyz" },
    });
  });

  it("returns the extra clause unchanged when scope is null (superadmin)", () => {
    const result = scopeViaCourse(null, { isPublished: true });
    expect(result).toEqual({ isPublished: true });
    expect(result).not.toHaveProperty("course");
  });

  it("works with an empty extra clause", () => {
    expect(scopeViaCourse("t-1")).toEqual({ course: { tenantId: "t-1" } });
    expect(scopeViaCourse(null)).toEqual({});
  });

  it("does not mutate the original extra object", () => {
    const extra = { isPublished: false };
    scopeViaCourse("t-1", extra);
    expect(extra).toEqual({ isPublished: false });
  });
});

// ─── assertTenantOwns ─────────────────────────────────────────────────────────

describe("assertTenantOwns", () => {
  it("passes when resourceTenantId matches scope", () => {
    expect(() => assertTenantOwns("tenant-1", "tenant-1")).not.toThrow();
  });

  it("passes when scope is null (superadmin bypasses check)", () => {
    expect(() => assertTenantOwns("any-tenant", null)).not.toThrow();
    expect(() => assertTenantOwns("", null)).not.toThrow();
  });

  it("throws TenantMismatchError when tenantIds differ", () => {
    expect(() => assertTenantOwns("tenant-1", "tenant-2")).toThrow(
      TenantMismatchError,
    );
  });

  it("throws TenantMismatchError when resourceTenantId is null", () => {
    expect(() => assertTenantOwns(null, "tenant-1")).toThrow(TenantMismatchError);
  });

  it("throws TenantMismatchError when resourceTenantId is undefined", () => {
    expect(() => assertTenantOwns(undefined, "tenant-1")).toThrow(
      TenantMismatchError,
    );
  });
});

// ─── TenantMismatchError ──────────────────────────────────────────────────────

describe("TenantMismatchError", () => {
  it("has statusCode 403", () => {
    const err = new TenantMismatchError();
    expect(err.statusCode).toBe(403);
  });

  it("has the correct name and message", () => {
    const err = new TenantMismatchError();
    expect(err.name).toBe("TenantMismatchError");
    expect(err.message).toMatch(/Forbidden/);
  });

  it("is an instance of Error", () => {
    expect(new TenantMismatchError()).toBeInstanceOf(Error);
  });
});
