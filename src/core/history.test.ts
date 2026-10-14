import { describe, expect, it } from "vitest";
import { lastPracticedSkill } from "./history";
import { defaultData } from "./storage";
import type { Attempt } from "./types";

function attempt(skill: string, ts: number, mode: Attempt["mode"] = "serie"): Attempt {
  return {
    id: `${skill}-${ts}`,
    ts,
    sessionId: "s",
    skill,
    level: 1,
    mode,
    ok: true,
    tries: 1,
    ms: 1,
  };
}

describe("lastPracticedSkill", () => {
  it("renvoie null sans historique", () => {
    expect(lastPracticedSkill(defaultData())).toBeNull();
  });

  it("renvoie la compétence de la réponse la plus récente, même après une fusion désordonnée", () => {
    const data = defaultData();
    data.attempts = [attempt("maths.a.b", 30), attempt("maths.c.d", 10), attempt("maths.e.f", 20)];
    expect(lastPracticedSkill(data)).toBe("maths.a.b");
  });

  it("ignore les défis", () => {
    const data = defaultData();
    data.attempts = [attempt("maths.a.b", 10), attempt("maths.defi.tables", 20, "defi")];
    expect(lastPracticedSkill(data)).toBe("maths.a.b");
  });
});
