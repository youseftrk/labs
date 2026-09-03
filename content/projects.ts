export type Status = "in-progress" | "shipped" | "planned";

export type Project = {
  slug: string;
  index: string;
  name: string;
  role: string;
  status: Status;
  summary: string;
  detail: string;
  stack: string[];
  links: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "fixture",
    index: "01",
    name: "Fixture",
    role: "Test environment for CAD",
    status: "in-progress",
    summary:
      "Hands an AI agent a real mechanical modelling task, lets it work in CAD, then checks what it produced against the geometry itself.",
    detail:
      "Most attempts at grading machine-made CAD ask a person whether the part looks right. Fixture asks the model instead: dimensions, mass properties, tolerance stack, whether the feature tree survives a parameter change. The agent never sees the checks. It gets a written spec, a sandbox, and the same tools a junior engineer would get. Seeded from a thousand hours of recorded professional CAD sessions, each one already carrying a task description and a scoring rubric.",
    stack: ["Python", "FreeCAD / OCC", "cad-1000-hours", "Docker"],
    links: [],
  },
  {
    slug: "labs",
    index: "02",
    name: "Labs",
    role: "One harness for robot simulators",
    status: "in-progress",
    summary:
      "Describe a robot task once. Run it in MuJoCo, in Isaac Sim, or against a real arm, without rewriting the task each time.",
    detail:
      "Every simulator has its own idea of what a scene, an episode and a reward are, so work done in one is mostly thrown away when you move to another. Labs puts a single interface over them: the task, the reset conditions and the success check live in one file, and the backend is a swap. Everything runs headless, so a laptop and a cloud box behave identically and a result can be replayed exactly.",
    stack: ["Python", "MuJoCo", "Isaac Sim", "Gymnasium"],
    links: [],
  },
  {
    slug: "taste",
    index: "03",
    name: "Taste",
    role: "Can design quality be scored?",
    status: "in-progress",
    summary:
      "A benchmark where the same interface is judged by models and by working designers, built to find exactly where the two disagree.",
    detail:
      "Correctness in software has an executable answer. Design does not, which is why it gets left out of evaluation entirely and why generated interfaces all drift toward the same shape. This is an attempt to measure the gap honestly: a fixed set of interfaces, a panel of designers scoring them under controlled conditions, the same set scored by models, and a public record of the disagreements. The interesting result is not the correlation. It is the cases where models are confidently wrong.",
    stack: ["Next.js", "Python", "Human evaluation"],
    links: [],
  },
];

export const statusLabel: Record<Status, string> = {
  "in-progress": "In progress",
  shipped: "Shipped",
  planned: "Planned",
};
