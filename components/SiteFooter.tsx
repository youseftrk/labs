import Link from "next/link";
import { SocialLinks } from "@/components/SocialLinks";

export function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="site-foot-copy">
        <p className="dia-cta">Let&apos;s build something</p>
        <a className="dia-hi" href="mailto:hello@yousefturk.com">
          Say hi!
        </a>
        <SocialLinks />
        <ul className="dia-foot-links">
          <li>
            <Link href="/lab">Lab</Link>
          </li>
          <li>
            <Link href="/writing">Writing</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
