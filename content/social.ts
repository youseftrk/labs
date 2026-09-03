export const MAIL = "yousefturk.info@gmail.com";

export const socials = [
  {
    id: "x",
    label: "X",
    href: "https://x.com/yousefturkk",
  },
  {
    id: "kaggle",
    label: "Kaggle",
    href: "https://www.kaggle.com/yousefturk",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/yousefturk",
  },
  {
    id: "mail",
    label: "E-Mail",
    href: `mailto:${MAIL}`,
  },
] as const;

export type SocialId = (typeof socials)[number]["id"];
