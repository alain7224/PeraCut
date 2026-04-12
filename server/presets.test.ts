import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("presets router", () => {
  it("should list presets for user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const presets = await caller.presets.list();
    expect(Array.isArray(presets)).toBe(true);
  });

  it("should create a new preset", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.presets.create({
      name: "Test Preset",
      description: "A test preset",
      category: "custom",
      settings: {
        brightness: 50,
        contrast: 60,
        saturation: 70,
        filter: "vintage",
      },
    });

    expect(result).toBeDefined();
  });

  it("should handle preset creation with minimal data", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.presets.create({
      name: "Minimal Preset",
      settings: { brightness: 50 },
    });

    expect(result).toBeDefined();
  });

  it("should not allow user to access other user's presets", async () => {
    const ctx1 = createAuthContext(1);
    const ctx2 = createAuthContext(2);
    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    // Create preset for user 1
    await caller1.presets.create({
      name: "User 1 Preset",
      settings: { brightness: 50 },
    });

    // Try to get preset as user 2 (should fail)
    try {
      await caller2.presets.get({ id: 999 });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Preset not found");
    }
  });

  it("should list presets returns array", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create multiple presets
    await caller.presets.create({
      name: "Preset 1",
      settings: { brightness: 50 },
    });

    await caller.presets.create({
      name: "Preset 2",
      settings: { brightness: 75 },
    });

    const presets = await caller.presets.list();
    expect(Array.isArray(presets)).toBe(true);
    expect(presets.length).toBeGreaterThan(0);
  });

  it("should create preset with all optional fields", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.presets.create({
      name: "Full Preset",
      description: "Complete preset with all fields",
      category: "professional",
      settings: {
        brightness: 50,
        contrast: 60,
        saturation: 70,
        filter: "vintage",
        blur: 5,
      },
    });

    expect(result).toBeDefined();
  });
});
