import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const { registerUserMock, notifyRegistrationMock } = vi.hoisted(() => ({
  registerUserMock: vi.fn(),
  notifyRegistrationMock: vi.fn(),
}));

vi.mock("./auth", async () => {
  const actual = await vi.importActual<typeof import("./auth")>("./auth");
  return {
    ...actual,
    registerUser: registerUserMock,
    notifyRegistration: notifyRegistrationMock,
  };
});

import { appRouter } from "./routers";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as any as TrpcContext["res"],
  };
}

describe("auth.register", () => {
  const input = {
    email: "new-user@example.com",
    name: "Ada",
    lastName: "Lovelace",
    username: "adal",
    age: 28,
    country: "UK",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    registerUserMock.mockResolvedValue(7);
    notifyRegistrationMock.mockResolvedValue(undefined);
  });

  it("registers the user and triggers the optional owner notification", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.auth.register(input);

    expect(result).toEqual({
      success: true,
      userId: 7,
      message: "Usuario registrado exitosamente",
    });
    expect(registerUserMock).toHaveBeenCalledWith(input);
    expect(notifyRegistrationMock).toHaveBeenCalledWith(input);
  });

  it("returns the registration error without notifying the owner", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    registerUserMock.mockRejectedValue(new Error("El email ya está registrado"));

    const result = await caller.auth.register(input);

    expect(result).toEqual({
      success: false,
      message: "El email ya está registrado",
    });
    expect(notifyRegistrationMock).not.toHaveBeenCalled();
  });
});
