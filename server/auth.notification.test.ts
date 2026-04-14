import { beforeEach, describe, expect, it, vi } from "vitest";

const notifyOwnerMock = vi.fn();

vi.mock("./_core/notification", () => ({
  notifyOwner: notifyOwnerMock,
}));

import { notifyRegistration } from "./auth";

describe("notifyRegistration", () => {
  const user = {
    email: "new-user@example.com",
    name: "Ada",
    lastName: "Lovelace",
    age: 28,
    country: "UK",
    username: "adal",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("formats the new-user details for the owner notification", async () => {
    notifyOwnerMock.mockResolvedValue(true);

    await notifyRegistration(user);

    expect(notifyOwnerMock).toHaveBeenCalledWith({
      title: "Nuevo registro en PeraCut",
      content: [
        "Se registró un nuevo usuario.",
        "Nombre: Ada Lovelace",
        "Username: adal",
        "Email: new-user@example.com",
        "Edad: 28",
        "País: UK",
      ].join("\n"),
    });
  });

  it("does not throw when the notification service fails", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    notifyOwnerMock.mockRejectedValue(new Error("notification unavailable"));

    await expect(notifyRegistration(user)).resolves.toBeUndefined();

    expect(warnSpy).toHaveBeenCalledWith(
      "[Auth] Failed to send registration notification:",
      expect.any(Error)
    );
  });
});
