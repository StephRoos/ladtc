import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/schemas";

describe("loginSchema", () => {
  it("accepts valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "mypassword",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "mypassword",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email invalide");
    }
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "mypassword",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Mot de passe requis");
    }
  });
});

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects firstName shorter than 2 characters", () => {
    const result = registerSchema.safeParse({
      firstName: "J",
      lastName: "Dupont",
      email: "jean@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const firstNameError = result.error.issues.find(
        (i) => i.path[0] === "firstName"
      );
      expect(firstNameError?.message).toBe(
        "Le prénom doit contenir au moins 2 caractères"
      );
    }
  });

  it("rejects lastName shorter than 2 characters", () => {
    const result = registerSchema.safeParse({
      firstName: "Jean",
      lastName: "D",
      email: "jean@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const lastNameError = result.error.issues.find(
        (i) => i.path[0] === "lastName"
      );
      expect(lastNameError?.message).toBe(
        "Le nom doit contenir au moins 2 caractères"
      );
    }
  });

  it("rejects invalid email format", () => {
    const result = registerSchema.safeParse({
      firstName: "Jean",
      lastName: "Dupont",
      email: "invalid",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailError = result.error.issues.find(
        (i) => i.path[0] === "email"
      );
      expect(emailError?.message).toBe("Email invalide");
    }
  });

  it("rejects password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean@example.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordError = result.error.issues.find(
        (i) => i.path[0] === "password"
      );
      expect(passwordError?.message).toBe(
        "Le mot de passe doit contenir au moins 8 caractères"
      );
    }
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean@example.com",
      password: "password123",
      confirmPassword: "differentpassword",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find(
        (i) => i.path[0] === "confirmPassword"
      );
      expect(confirmError?.message).toBe(
        "Les mots de passe ne correspondent pas"
      );
    }
  });

  it("accepts matching passwords at minimum length", () => {
    const result = registerSchema.safeParse({
      firstName: "Ab",
      lastName: "Cd",
      email: "ab@example.com",
      password: "12345678",
      confirmPassword: "12345678",
    });
    expect(result.success).toBe(true);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts valid email", () => {
    const result = resetPasswordSchema.safeParse({
      email: "test@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email format", () => {
    const result = resetPasswordSchema.safeParse({
      email: "not-valid",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email invalide");
    }
  });

  it("rejects empty email", () => {
    const result = resetPasswordSchema.safeParse({
      email: "",
    });
    expect(result.success).toBe(false);
  });
});
