import { profile } from "@/content/site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-inner footer-inner">
        <span className="mono">{profile.alias} · the laboratory</span>
        <span className="mono footer-mid">
          built with next.js, three.js & gsap — no template
        </span>
        <span className="mono">© {new Date().getFullYear()} Prashant Dubey</span>
      </div>
    </footer>
  );
}
