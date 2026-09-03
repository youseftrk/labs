export type VaultKind = "project" | "study" | "note" | "paper" | "writeup";

export type VaultShelf =
  | "papers"
  | "components"
  | "designs"
  | "research"
  | "notes"
  | "writeups";

export type VaultLink = { label: string; href: string };

export type PlayKind =
  | "typer"
  | "squircle"
  | "ghosty"
  | "arcade-pixel"
  | "holo"
  | "pixel-brushes"
  | "fade-motion"
  | "liquid-ui"
  | "kinetic-typography"
  | "ransom-note"
  | "chroma-glow"
  | "emboss"
  | "color-depth"
  | "sandbox"
  | "dia-gradient"
  | "vector-editor"
  | "amo"
  | "midjourney"
  | "orb"
  | "metal"
  | "gooey"
  | "scrollbar"
  | "glossy"
  | "glow"
  | "bevel"
  | "flat"
  | "qr"
  | "athlos"
  | "loom"
  | "fade-grid"
  | "warp-grid"
  | "ring-letters"
  | "acme-login"
  | "wave-grid"
  | "drag-button"
  | "op-grid"
  | "island"
  | "accounts"
  | "pipeline"
  | "kanban"
  | "list"
  | "icons"
  | "buttons"
  | "charts"
  | "pie"
  | "bar"
  | "line"
  | "dropdown"
  | "dialog"
  | "loader"
  | "sidebars"
  | "fohe"
  | "oymo"
  | "spina";

/**
 * A generated figure from `research/figures`. `file` is the name in
 * `public/figures` without the extension. `after` is the index of the body
 * paragraph it follows, so figures sit next to the sentence they belong to.
 */
export type FigureRef = {
  file: string;
  caption: string;
  after: number;
  source?: string;
};

export type VaultEntry = {
  slug: string;
  title: string;
  kind: VaultKind;
  shelf: VaultShelf;
  /** Shown on the page. */
  date: string;
  /** ISO, newest first. */
  when: string;
  tags: string[];
  blurb: string;
  venue?: string;
  authors?: string;
  mark?: string;
  body: string[];
  links: VaultLink[];
  figures?: FigureRef[];
  playground?: PlayKind;
  credit?: { source: string; href: string };
};

export function labPath(slug: string) {
  return `/lab/${slug}`;
}

/** @deprecated Use labPath. Kept so old imports still compile during the rename. */
export const vaultPath = labPath;

export function entryMarkdown(entry: VaultEntry, url: string) {
  return [`# ${entry.title}`, "", ...entry.body, "", url].join("\n");
}

export const SHELF_LABEL: Record<VaultShelf, string> = {
  papers: "Papers",
  components: "Components",
  designs: "Designs",
  research: "Personal AI research papers",
  notes: "School",
  writeups: "Writeups",
};

export const SHELF_KICKER: Record<VaultShelf, string> = {
  papers: "Paper",
  components: "Component",
  designs: "Design",
  research: "Research",
  notes: "Note",
  writeups: "Writeup",
};

/** Jump list on /lab. School sits under the fold so it stays honest, not a fifth brand. */
export const TOC_SHELVES: VaultShelf[] = [
  "writeups",
  "papers",
  "designs",
  "research",
];

/**
 * Add a row here and it is live at /lab/<slug>. That URL is what you send.
 * Dates are the dates of the work. Do not put a year on something you did not do then.
 * Pipeline / notebook pages: kind "writeup", shelf "writeups". They show on
 * home, /lab#writeups, and /writing. Do not invent a writeup to fill the shelf.
 */
export const vault: VaultEntry[] = [
  {
    slug: "reflow-is-low-dimensional",
    title: "The one line rule beat ridge. It did not beat a tree.",
    kind: "writeup",
    shelf: "writeups",
    date: "Sep 2026",
    when: "2026-09-02",
    tags: ["Layout", "Eval", "Taste Labs"],
    blurb:
      "I measured 3,056 elements across 65 viewport widths. A linear model lost to a one-line CSS rule. Histogram gradient boosting, same split, cut median error from 26.7px to 7.3px. Ridge was underfitting, not a law of layout.",
    venue: "Writeup",
    authors: "Yousef Turk",
    body: [
      "Taste Labs' request for research opens with a gap I keep thinking about. Physics has coordinates and free body diagrams. The web has none of that, so a model looking at an interface has no frame to reason in. They want high fidelity environments of the digital world. I wanted to know whether the web has any measurable dynamics to build one out of, so I picked the smallest honest version of the question: when you drag a window narrower, is there structure in how the boxes move?",
      "The setup is a page held open in headless Chromium while the viewport sweeps from 320px to 1600px in 20px steps. At every width I record every visible element's box. Viewport width plays the role of time, so each element becomes a trajectory. Twenty five pages went in: seven from this site, seventeen components from my design library, and one multi component preview page. That is 3,056 element trajectories, 65 samples each.",
      "First question. How many dimensions does the movement actually use? I stacked each page's x and width values into a matrix and took the singular values. The first component carries a median 84.7% of all the variance in how boxes move, and three components reach 99.9%. So yes, reflow is a low dimensional dynamical system. A page full of hundreds of boxes is really one or two numbers moving, and everything else riding along.",
      "That result is real but it is not the interesting half. If the motion is one shared mode, the next question is whether a model can learn it well enough to predict a page it has never seen. I set that up as leave one page out: train on 24 pages, predict boxes on the 25th, with no page identity and no element identity in the features. All the model gets is one box measured at 1600px, a few CSS facts about the element, and the width you are asking about.",
      "Then the baselines, which is where this went sideways in a useful way. The dumbest one keeps the box exactly as it was. The next one scales x and width by the ratio of the two viewport widths and leaves y and height alone. That is one line of arithmetic. I also hand wrote a clamp rule, because `width: min(42rem, 100% - 2.5rem)` is what my own layout actually does, so I encoded it: keep your width until the viewport squeezes you, then take what is left minus the gutter, and stay centred if you were centred.",
      "The one line rule won against ridge. Median error across held out pages was 26.7px for scaling with the viewport against 44.1px for the fitted linear model. It won 14 of 25 pages outright when those were the only learned options, the clamp rule took 6, and ridge took 5. I gave ridge a second chance by handing it the baseline for free and asking it to predict only the correction, with the penalty tuned on a validation split that never touched the test page. It came back at 45.2px, meaning it could not even improve on a correction of zero.",
      "That is the point where I should have stopped calling ridge 'the model'. Histogram gradient boosting is a tree model that learns piecewise constant jumps, which is exactly what a breakpoint looks like. I trained it on the same leave one page out split, the same features, and the same residual (predict the correction to the one-line rule, not the box from scratch). Median error fell to 7.3px. A second version that could also see the two hand rules as extra columns came in at 6.8px. Together they beat the better hand rule on 19 of 25 pages. On elements that actually move, the gap is larger still: 7.8px against 33.4px for scaling.",
      "I also checked whether this was just more training of a weak net. A small neural net with two hidden layers kept improving out to 200 steps and still sat at 32.3px on the capacity pages, next to the rule at 36.0px and the trees at 8.5px. More boosting rounds help until about 64, then flatten, and 256 is slightly worse. Five percent of the training rows already beat the rule. So the first result was the wrong kind of model, not too few epochs, and not too little data.",
      "Trees do not win everything. The clamp rule still takes 6 pages, and on those pages its error is already about 0px because the component is the CSS I encoded. On `clocks` the trees are worse than scaling, 32.0px against 16.8px, because they add jumps where the layout does not have any. The one multi-component preview page is still hard for everyone: 95.5px for boosting against 140.0px for scaling. Library components, which is the transfer that is not just my site talking to itself, go from 24.5px under the rule to 7.8px under the trees.",
      "I checked the collector the same way as before. Holding out alternate widths on the same page instead of whole pages gives 0.189px error and 98.5% of coordinates inside 2px, so the traces are clean. Extrapolating a per element straight line from narrow viewports to wide ones is worse than not moving the box at all, 43.2px against 38.9px, because the layout does not travel in straight lines.",
      "It jumps. Every page has a median of five widths where a chunk of boxes move together, and they cluster in two places: 340 to 400px, where small phone layouts give up, and around 700px. That second one is not a media query. My content column is `min(42rem, 100% - 2.5rem)`, and 42rem plus the gutters lands right there. The largest layout event on my own site is a clamp switching which side of the `min()` it is on, and I did not know that until the sweep told me.",
      "So the honest reading. Claim one holds: web reflow is low dimensional and measurable, and 3,056 trajectories is a real environment you can put a model in. Claim two was a linear result dressed as a layout result. A tree that can put a jump at a breakpoint transfers. The remaining difficulty is the pages where a one-line clamp is already exact, and the pages where many components interact, not the smooth scaling in between.",
      "What I would not claim. This is still 25 pages, most of them mine, and my CSS habits are all over the dataset. The library split is the better check and it still favours the trees, but it is one author's components. I did not need a transformer or a GPU job for this. It is tabular box regression, and boosting is the boring default that I skipped the first time.",
      "The code is in `research/reflow-dynamics`. The collector is Playwright. The linear numbers are numpy in `evaluate.py` writing `results.json`. The tree numbers are sklearn in `train_stronger.py` writing `results_stronger.json`. Every figure on this page is generated from those files, and re-running them re-draws the figures. If a figure disagrees with what I wrote here, the file wins.",
    ],
    figures: [
      {
        file: "reflow-pipeline",
        caption:
          "The collector. One page stays open while the viewport is swept in 20px steps, and every visible box is recorded at every width.",
        after: 1,
        source: "Frames drawn from the Webpage frames Excalidraw library by dhaval_godwani.",
      },
      {
        file: "reflow-dimension",
        caption:
          "Share of layout variance held by the first component, one bar per page. Accent bars are pages from this site.",
        after: 2,
      },
      {
        file: "reflow-error",
        caption:
          "Prediction error against viewport width on pages the model never saw. Accent is the boosted correction. The dashed lines are the hand rules and ridge.",
        after: 6,
      },
      {
        file: "reflow-capacity",
        caption:
          "Left: more boosting rounds. Right: more of the training set. The dashed line is the one-line rule on those same held-out pages.",
        after: 7,
      },
      {
        file: "reflow-trajectory",
        caption:
          "Two real elements from the home page. The flat sections are the clamp holding a width, and the dashed lines mark widths where many boxes jump together.",
        after: 10,
      },
    ],
    links: [
      { label: "lab", href: "/lab/reflow-is-low-dimensional" },
      {
        label: "the request this answers",
        href: "https://tastelabs.com/blog/requests-for-research",
      },
    ],
  },
  {
    slug: "floor-worth-raising",
    title: "The floor is worth raising",
    kind: "paper",
    shelf: "papers",
    date: "Aug 2026",
    when: "2026-08-31",
    tags: ["Taste", "Eval", "HCI"],
    blurb:
      "I read Taste Labs' research request the week it went up. This is me answering it in public so I can't pretend I didn't.",
    venue: "On Taste Labs, Requests for research, 16 Aug 2026",
    authors: "Yousef Turk",
    body: [
      "I read Taste Labs' request for research the week Hamidah Oderinwale posted it, 16 August 2026. It was that annoying feeling where someone writes down the thing you've been circling in your notes, and does it cleaner.",
      "They're bored of the word taste. Fair. I've used it as a shrug too. What they want is dumber and harder. Measure it. Label it. Let a model fail at it in a way you can see. Then maybe we can stop arguing about genius.",
      "I keep that next to the science stuff I like. In a lab the world grades you. Mass does not care if you're confident. FutureHouse talks about a loop. Guess, test, update. I'm trying to build checkers like that for CAD. Labs. Fixture. You cannot sweet-talk a physics engine. Design is the part that still lets you lie with a screenshot. Their patent loop is the number I wrote in the margin. Zero of twenty-four runs closed on a look they couldn't pin down. That's the job.",
      "If a model only knows its training set, put the expensive thing in the set. Companies buy more tokens. They don't pay a designer to sit there and say this spacing is dead. They call it subjective so they can skip the invoice. Taste Labs is trying to turn that invoice into something a lab can train on. Click-through built search. Edit traces could build this. They asked how you watch a design session all the way through. I think that's the assignment.",
      "They want coordinates for websites the way physics has coordinates for objects. I don't have that. I want to help make rooms a model can actually move around in, not another quiz where a person ticks looks nice.",
      "They asked what versioning looks like when you think in states, not diffs. I don't know. I cook the same way. You remember the heat, not the line in the recipe.",
      "I'm in grade 12 in Abu Dhabi. I'm not on their fellowship. I'm doing the reading and building the checkers I can reach.",
    ],
    links: [
      { label: "lab", href: "/lab/floor-worth-raising" },
      {
        label: "source",
        href: "https://tastelabs.com/blog/requests-for-research",
      },
    ],
    credit: {
      source: "tastelabs.com/blog/requests-for-research",
      href: "https://tastelabs.com/blog/requests-for-research",
    },
  },
  {
    slug: "taste-is-the-thing",
    title: "Taste is the thing we actually hire",
    kind: "note",
    shelf: "papers",
    date: "Aug 2026",
    when: "2026-08-31",
    tags: ["Taste"],
    blurb:
      "A chair that holds you and a chair you want in the room are different jobs. We keep scoring the first one.",
    venue: "Note",
    authors: "Yousef Turk",
    body: [
      "A page can validate and still be something you forget by dinner. We score the easy half because the easy half has a test. Then we act surprised when everything looks the same.",
      "Taste is how people decide what gets to stay. You feel it in a kitchen. Bourdain knew that about food. Context does more work than the perfect plate. Same with interfaces. If it doesn't move you, I don't care that it compiled.",
      "I'm tired of models that can write anything and want nothing. I want to be around the people trying to fix that, even if right now that just means reading, building checkers, and putting the notes here.",
    ],
    links: [{ label: "lab", href: "/lab/taste-is-the-thing" }],
  },
  {
    slug: "train-on-taste",
    title: "If it only knows the data, put taste in the data",
    kind: "note",
    shelf: "papers",
    date: "Aug 2026",
    when: "2026-08-30",
    tags: ["Taste", "Training"],
    blurb:
      "A model is what you feed it. We keep feeding it the average of the web and then asking why it has no pulse.",
    venue: "Note",
    authors: "Yousef Turk",
    body: [
      "A model does not grow a soul. It compresses a pile of examples. If the pile is whatever was cheap to scrape, the output is that scrape, spoken fluently. That's the method working. It isn't a mystery.",
      "So why is taste the last thing anyone pays to label? They'll buy another billion tokens. They won't sit with a designer long enough to hear this spacing is a funeral. Subjective is a polite word for expensive. Taste Labs is trying to make that expense into data a frontier lab can actually use.",
      "Science already does the honest version. You don't argue with a mass spec. You measure. I want that bet for judgment. Not a vibes slider. A loop that doesn't die at zero of twenty-four. If we don't train on taste we should stop acting shocked when the machine has none.",
    ],
    links: [{ label: "lab", href: "/lab/train-on-taste" }],
  },
  {
    slug: "cell-steering",
    title: "Steering cellular attractor trajectories",
    kind: "paper",
    shelf: "research",
    date: "2026",
    when: "2026-08-20",
    tags: ["RL", "Biology", "GRC"],
    blurb:
      "If you edit one gene and then another, the second edit lands on a cell that already moved. This is a simulator that plans the order. Top 40 at the Global Research Challenge 2026.",
    venue: "Global Research Challenge 2026, Global Finalist",
    authors: "Yousef Turk",
    body: [
      "I wrote this for the Global Research Challenge 2026. It placed in the Top 40. Credential GRC26-G5XH86.",
      "Here is the whole problem in one go. Say you switch on gene A in a cell. The cell changes. Now you switch on gene B. That second edit is not landing on the cell you started with, it is landing on the one the first edit already moved. So the order you make the edits in changes where the cell ends up.",
      "Most models that predict what an edit does are built for one edit on an untouched cell. You give them a starting cell and an edit, they give you the end state. They have no slot for \"the cell as it is right now, halfway through a sequence,\" so they cannot plan a second step.",
      "The title says attractor, so here is what that means. A cell does not wander anywhere it likes. It settles into a handful of stable states, the way a marble rolls to the bottom of a bowl and stays. Biologists call those bowls attractors, and a cell type is basically which bowl you are in. Steering is picking edits that walk the cell out of one bowl and into another, instead of shoving once and hoping.",
      "So I built it as a control problem, the same shape as steering a vehicle: read the state, pick a move, see what happened, pick again. Three pieces do that. A VAE squeezes each cell's gene activity readout, thousands of numbers, down to a small set, so the model plans on a compact map instead of the raw data. A neural SDE learns how a cell drifts across that map over time, and it models the randomness on purpose, because two identical cells given the same edit do not land in the same spot. Then PPO, a reinforcement learning algorithm, chooses which gene to edit next, watches where the cell went, and updates its policy.",
      "The data is Norman et al. 2019, a Perturb-seq dataset. Perturb-seq means a lab used CRISPR to change one or two specific genes in each cell across a large pool, then sequenced the cells one at a time, so you get thousands of labelled before-and-afters instead of one averaged result. K562 is the cell line they used, a leukemia line labs pick because it grows predictably and everyone's numbers stay comparable.",
      "Because it is a simulator, thousands of these trajectories run on a single GPU. That is the actual point. It does not tell you the answer, it tells you which edit orders are worth spending real lab time on.",
      "Two limits, and I would rather say them here than have you find them. It is a simulator, so nothing in it has been checked in a dish. And the spatial part of the model ran on neighbour graphs I generated rather than measured, meaning I told it which cells sit next to which instead of getting that from real spatial data, so those results carry less weight than the rest. Both are in the paper.",
    ],
    links: [
      { label: "lab", href: "/lab/cell-steering" },
      { label: "pdf", href: "/research/cell-steering-grc.pdf" },
    ],
  },
];

export const projects = vault.filter((e) => e.shelf === "research");

export const writeups = vault
  .filter((e) => e.shelf === "writeups")
  .sort((a, b) => b.when.localeCompare(a.when));

export const writing = vault
  .filter((e) => e.shelf === "papers")
  .sort((a, b) => {
    const k = (a.kind === "paper" ? 0 : 1) - (b.kind === "paper" ? 0 : 1);
    if (k !== 0) return k;
    return b.when.localeCompare(a.when);
  });

export function entriesOn(shelf: VaultShelf) {
  return vault
    .filter((e) => e.shelf === shelf)
    .sort((a, b) => b.when.localeCompare(a.when));
}

export function entryBySlug(slug: string) {
  return vault.find((e) => e.slug === slug);
}
