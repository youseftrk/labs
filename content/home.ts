export type BourdainQuote = {
  line: string;
  from: string;
};

/**
 * Pick with `bourdain`. Change the index. Do not invent lines.
 * 0 move, 1 winging it (live), 2 no smug clarity, 3 the journey changes you,
 * 4 hungry to learn, 5 sit and watch, 6 character, 7 context and memory.
 */
export const bourdainQuotes: BourdainQuote[] = [
  {
    line: "If I'm an advocate for anything, it's to move. As far as you can, as much as you can. Across the ocean, or simply across the river.",
    from: "Anthony Bourdain",
  },
  {
    line: "I'm a big believer in winging it. I'm a big believer that you're never going to find the perfect city travel experience or the perfect meal without a constant willingness to experience a bad one.",
    from: "Anthony Bourdain",
  },
  {
    line: "Maybe that's enlightenment enough: to know that there is no final resting place of the mind, no moment of smug clarity. Perhaps wisdom, at least for me, means realizing how small I am, and unwise, and how far I have yet to go.",
    from: "Anthony Bourdain",
  },
  {
    line: "Travel isn't always pretty. It isn't always comfortable. Sometimes it hurts, it even breaks your heart. But that's okay. The journey changes you. It should change you.",
    from: "Anthony Bourdain",
  },
  {
    line: "If you're 22, physically fit, hungry to learn and be better, I urge you to travel as far and as widely as possible. Sleep on floors if you have to. Find out how other people live and eat and cook. Learn from them, wherever you go.",
    from: "Anthony Bourdain",
  },
  {
    line: "Don't be afraid to just sit and watch.",
    from: "Anthony Bourdain",
  },
  {
    line: "Skills can be taught. Character you either have or you don't have.",
    from: "Anthony Bourdain, Kitchen Confidential",
  },
  {
    line: "Context and memory play powerful roles in all the truly great meals in one's life.",
    from: "Anthony Bourdain, A Cook's Tour",
  },
];

export const bourdain = bourdainQuotes[1];

export type StarkQuote = BourdainQuote & {
  /** Public path. The still on home is the Jericho demo, Iron Man (2008). */
  still: string;
  stillAlt: string;
};

/**
 * Pick with `stark`. Change the index. Real lines only, no fan edits.
 * 0 run before walk (live), 1 feared or respected, 2 shortest distance,
 * 3 I am Iron Man, 4 part of the journey.
 */
export const starkQuotes: StarkQuote[] = [
  {
    line: "Sometimes you gotta run before you can walk.",
    from: "Tony Stark, Iron Man (2008)",
    still: "/stark.png",
    stillAlt: "Tony Stark in a pinstripe suit and sunglasses, arms out, dust rising behind him in the desert.",
  },
  {
    line: "Is it better to be feared or respected? I say, is it too much to ask for both?",
    from: "Tony Stark, Iron Man (2008)",
    still: "/stark.png",
    stillAlt: "Tony Stark in a pinstripe suit and sunglasses, arms out, dust rising behind him in the desert.",
  },
  {
    line: "The shortest distance between two points is a straight line.",
    from: "Tony Stark, Iron Man (2008)",
    still: "/stark.png",
    stillAlt: "Tony Stark in a pinstripe suit and sunglasses, arms out, dust rising behind him in the desert.",
  },
  {
    line: "I am Iron Man.",
    from: "Tony Stark, Iron Man (2008)",
    still: "/stark.png",
    stillAlt: "Tony Stark in a pinstripe suit and sunglasses, arms out, dust rising behind him in the desert.",
  },
  {
    line: "Part of the journey is the end.",
    from: "Tony Stark, Avengers: Endgame (2019)",
    still: "/stark.png",
    stillAlt: "Tony Stark in a pinstripe suit and sunglasses, arms out, dust rising behind him in the desert.",
  },
];

export const stark = starkQuotes[0];

export type Experience = {
  title: string;
  who: string;
  detail: string;
  href?: string;
  link?: string;
};

/**
 * Ordered by impact, not by date. The rule, top to bottom:
 * 1. Research with an output someone else can check (paper, credential, lab work).
 * 2. Things he won or placed in, biggest result first.
 * 3. Roles he still holds, where the work is ongoing and other people depend on it.
 * 4. Things he built without a placement.
 * 5. Courses and certificates last. They are real, they are just the weakest signal.
 * Keep dates inside `who`, so reordering never hides when something happened.
 */
export const experiences: Experience[] = [
  {
    title: "Global Research Challenge 2026",
    who: "Top 40 globally. Credential GRC26-G5XH86.",
    detail:
      "I wrote a paper on planning gene edits in the right order, because the second edit lands on a cell the first one already changed. It runs as a simulator: thousands of cell trajectories on one GPU, on public Perturb-seq data. The lab page explains the whole thing in plain terms. I don't have a wet lab, and I say so in the paper.",
    href: "/lab/cell-steering",
    link: "lab",
  },
  {
    title: "NYUAD robotics summer program",
    who: "Completed, summer 2026.",
    detail:
      "I worked with Prof. Farah Shamout and Costanza Armanini in the research labs at NYU Abu Dhabi. The capstone was a search-and-rescue robot: soft, snake-shaped, long reach, so it can get into a collapsed space a rigid robot can't. The model reads heartbeats and other signals to help a team find people. I built the model and worked through the edge cases. It's also where I learned MuJoCo and Isaac Sim.",
    href: "https://nyuad.nyu.edu/",
    link: "NYUAD",
  },
  {
    title: "Abu Dhabi University engineering hackathon",
    who: "First place. AED 5,000. May 2026.",
    detail:
      "I was technical lead. We were a school team against university undergrads from across the UAE, and we won it. We built Bondly, a family AI with five voice modules that runs encrypted on the device, so no copy of your family's audio sits on someone's server.",
  },
  {
    title: "MBZUAI Hybrid Intelligence bootcamp",
    who: "Five days. 2026.",
    detail:
      "We tokenmaxxed for five days and built a mini startup, then presented it to MBZUAI professors and the president of the IEC. That's where I saw how MBZUAI actually treats startups, which is a big part of why I'm applying there.",
    href: "https://mbzuai.ac.ae/",
    link: "MBZUAI",
  },
  {
    title: "Vice president, robotics team",
    who: "Liwa, 2026 to 2027. Current.",
    detail:
      "I write the control code and keep the mechanical and programming sides talking to each other, which is most of the job. I mentor 15+ younger students a week and split the team across hackathons and events.",
  },
  {
    title: "Synthica",
    who: "Associate researcher and editor. 2025 to now.",
    detail:
      "I review CS and AI papers written by students, both the code and the writing. It's a nonprofit that partners with MIT. My job is getting a draft to the point where it could actually be published, which usually means telling someone their result isn't supported yet.",
  },
  {
    title: "NODE",
    who: "SWE and AI / Advanced Systems Developer. Current.",
    detail:
      "Student-led CS initiative. I build the software and the AI systems behind it.",
    href: "https://www.node-ae.org/",
    link: "NODE",
  },
  {
    title: "eVoost × Cursor PropTech challenge",
    who: "Sixth place. June 2026.",
    detail:
      "I built Xpand. It finds service gaps across 39 UAE districts, forecasts 12 months of demand, and drafts investor RFPs from live eVoost data and K2 Think V2. The point was to turn a map of where nobody is operating into something an investor can act on.",
  },
  {
    title: "Cerebras × Gemma 4 hackathon",
    who: "24 hours. June 2026.",
    detail:
      "We built Cue in a day. Four Gemma 4 31B models on Cerebras hardware, hooked up to a live Shopify store, watching for commerce incidents. We ran a slower setup next to it so people could see the latency gap themselves instead of taking our word for it.",
  },
  {
    title: "TII OrbitSight Challenge",
    who: "Entered 2026. Still in it.",
    detail:
      "I'm detecting objects in orbit with neuromorphic cameras, which report each pixel's change the instant it happens instead of taking full frames, so a fast-moving satellite doesn't smear. Results aren't out yet.",
    href: "https://challengeon.atrc.ae/en/challenges/tiiosc",
    link: "challenge",
  },
  {
    title: "Build with K2 Think V2",
    who: "Abu Dhabi, 2026.",
    detail:
      "I led a student team. We built an app on K2 Think V2, split the work, and shipped before the deadline.",
  },
  {
    title: "Workshop lead, Future-proofing in the age of AI",
    who: "2026. 50+ underclassmen.",
    detail:
      "I ran workshops at school for more than 50 younger students on working in AI. How to start something, how to get into a lab, that kind of thing.",
  },
  {
    title: "INSEAD NextGen Bootcamp",
    who: "December 2025. Vertigrow.",
    detail:
      "I co-founded Vertigrow, a modular vertical farming idea, and pitched it to judges from Samsung, NVIDIA, Tiffany, and Cartier.",
  },
  {
    title: "Stanford Probability for AI",
    who: "In it now. 2026.",
    detail:
      "Same Stanford group as Code in Place. Probability first, then what a neural net is actually doing with it.",
    href: "https://pai.stanford.edu/",
    link: "PAI",
  },
  {
    title: "Stanford Code in Place",
    who: "Completed, 2026.",
    detail:
      "Stanford's intro Python course, CS106A, taught online with volunteer section leaders. I finished it.",
    href: "https://codeinplace.stanford.edu/",
    link: "course",
  },
  {
    title: "Google AI Professional Certificate",
    who: "Coursera, 2026. Seven courses.",
    detail:
      "I finished the seven courses and built 20+ projects. Credential MZ98ZIG87XH4.",
  },
];
