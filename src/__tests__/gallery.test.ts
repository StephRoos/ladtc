import { describe, it, expect } from "vitest";
import { galleryPhotoSchema } from "@/lib/schemas";

describe("galleryPhotoSchema", () => {
  const validPhoto = {
    title: "Trail des Collines 2026",
    description: "Photos de la course annuelle",
    category: "Course",
  };

  it("validates a correct gallery photo", () => {
    const result = galleryPhotoSchema.safeParse(validPhoto);
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = galleryPhotoSchema.safeParse({ ...validPhoto, title: "" });
    expect(result.success).toBe(false);
  });

  it("allows optional description to be omitted", () => {
    const result = galleryPhotoSchema.safeParse({ title: "Photo test" });
    expect(result.success).toBe(true);
  });

  it("allows optional category to be omitted", () => {
    const result = galleryPhotoSchema.safeParse({
      title: "Photo test",
      description: "Une description",
    });
    expect(result.success).toBe(true);
  });

  it("validates minimal data with only title", () => {
    const result = galleryPhotoSchema.safeParse({ title: "Titre minimal" });
    expect(result.success).toBe(true);
  });

  it("validates partial schema for updates", () => {
    const partial = galleryPhotoSchema.partial();
    const result = partial.safeParse({ category: "Entraînement" });
    expect(result.success).toBe(true);
  });

  it("rejects missing title field", () => {
    const result = galleryPhotoSchema.safeParse({
      description: "Sans titre",
      category: "Social",
    });
    expect(result.success).toBe(false);
  });
});
