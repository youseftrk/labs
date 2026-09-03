import { socials, type SocialId } from "@/content/social";

function Icon({ id }: { id: SocialId }) {
  if (id === "x") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-4.71-6.23-5.4 6.23H2.74l7.73-8.82L1.25 2.25H8.08l4.25 5.62 5.91-5.62zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z"
        />
      </svg>
    );
  }
  if (id === "kaggle") {
    return (
      <svg width="16" height="16" viewBox="0 0 32 32" aria-hidden>
        <path
          fill="currentColor"
          transform="matrix(.527027 0 0 .527027 -30.632 -22.456)"
          d="M105.75 102.968c-.06.238-.298.357-.713.357H97.1c-.477 0-.89-.208-1.248-.625L82.746 86.028l-3.655 3.477v12.93c0 .595-.298.892-.892.892h-6.152c-.595 0-.892-.297-.892-.892V43.5c0-.593.297-.89.892-.89H78.2c.594 0 .892.298.892.89v36.288l15.692-15.87c.416-.415.832-.624 1.248-.624h8.204c.356 0 .593.15.713.445.12.357.09.624-.09.803L88.274 80.588l17.297 21.488c.237.238.297.535.18.892"
        />
      </svg>
    );
  }
  if (id === "linkedin") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M4.98 3.5A2.48 2.48 0 1 1 2.5 6a2.48 2.48 0 0 1 2.48-2.5zM3.2 8.47h3.56V21H3.2zM9.13 8.47h3.41v1.71h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45V21h-3.56v-6.23c0-1.49-.03-3.4-2.07-3.4-2.07 0-2.39 1.62-2.39 3.29V21H9.13z"
        />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4 7.2 12 12.4 20 7.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SocialLinks() {
  return (
    <ul className="social-row">
      {socials.map((row) => (
        <li key={row.id}>
          <a
            className="social"
            href={row.href}
            aria-label={row.label}
            rel={row.href.startsWith("http") ? "noreferrer" : undefined}
            target={row.href.startsWith("http") ? "_blank" : undefined}
          >
            <Icon id={row.id} />
          </a>
        </li>
      ))}
    </ul>
  );
}
