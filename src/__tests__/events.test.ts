import { describe, it, expect } from "vitest";
import { eventSchema } from "@/lib/schemas";

describe("eventSchema validation", () => {
  it("validates a valid event", () => {
    const result = eventSchema.safeParse({
      title: "Entraînement du mercredi",
      description: "Un super entraînement",
      date: "2026-03-15T19:00:00.000Z",
      location: "Place d'Ellezelles",
      type: "TRAINING",
      difficulty: "Moyen",
      maxParticipants: 30,
    });
    expect(result.success).toBe(true);
  });

  it("validates minimal required fields", () => {
    const result = eventSchema.safeParse({
      title: "Course",
      date: "2026-04-01T08:00:00.000Z",
      location: "Renaix",
      type: "RACE",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a title shorter than 3 characters", () => {
    const result = eventSchema.safeParse({
      title: "AB",
      date: "2026-04-01T08:00:00.000Z",
      location: "Renaix",
      type: "RACE",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("title");
    }
  });

  it("rejects an empty location", () => {
    const result = eventSchema.safeParse({
      title: "Course",
      date: "2026-04-01T08:00:00.000Z",
      location: "",
      type: "RACE",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("location");
    }
  });

  it("rejects an invalid date format", () => {
    const result = eventSchema.safeParse({
      title: "Course",
      date: "not-a-date",
      location: "Renaix",
      type: "RACE",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("date");
    }
  });

  it("rejects an invalid event type", () => {
    const result = eventSchema.safeParse({
      title: "Course",
      date: "2026-04-01T08:00:00.000Z",
      location: "Renaix",
      type: "MARATHON",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("type");
    }
  });

  it("rejects negative maxParticipants", () => {
    const result = eventSchema.safeParse({
      title: "Course",
      date: "2026-04-01T08:00:00.000Z",
      location: "Renaix",
      type: "RACE",
      maxParticipants: -5,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("maxParticipants");
    }
  });

  it("rejects non-integer maxParticipants", () => {
    const result = eventSchema.safeParse({
      title: "Course",
      date: "2026-04-01T08:00:00.000Z",
      location: "Renaix",
      type: "RACE",
      maxParticipants: 10.5,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("maxParticipants");
    }
  });

  it("allows null maxParticipants", () => {
    const result = eventSchema.safeParse({
      title: "Course",
      date: "2026-04-01T08:00:00.000Z",
      location: "Renaix",
      type: "RACE",
      maxParticipants: null,
    });
    expect(result.success).toBe(true);
  });

  it("allows optional fields to be omitted", () => {
    const result = eventSchema.safeParse({
      title: "Stage weekend",
      date: "2026-05-10T07:00:00.000Z",
      location: "Flobecq",
      type: "CAMP",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
      expect(result.data.difficulty).toBeUndefined();
      expect(result.data.maxParticipants).toBeUndefined();
    }
  });

  it("validates all event types", () => {
    const types = ["TRAINING", "RACE", "CAMP", "SOCIAL"] as const;
    for (const type of types) {
      const result = eventSchema.safeParse({
        title: `Test ${type}`,
        date: "2026-04-01T08:00:00.000Z",
        location: "Ellezelles",
        type,
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts datetime-local format (no seconds/timezone)", () => {
    const result = eventSchema.safeParse({
      title: "Stage de Trail",
      date: "2026-02-20T12:00",
      location: "La Roche-en-Ardenne",
      type: "CAMP",
    });
    expect(result.success).toBe(true);
  });

  it("validates partial schema for updates", () => {
    const partial = eventSchema.partial();
    const result = partial.safeParse({
      title: "Nouveau titre",
    });
    expect(result.success).toBe(true);
  });
});
