import { Link } from "react-router-dom";
import XimoIcon from "../../assets/ximoIcon2.PNG";

const columns = [
  { title: "Explore", links: [{ label: "About Ximo", path: "/about" }, { label: "Ximo POS", path: "/services" }, { label: "Pricing", path: "/#pricing" }] },
  { title: "Company", links: [{ label: "Contact", path: "/contact" }, { label: "Log in", path: "/login" }, { label: "Support", path: "/#faq" }] },
];

export default function Footer() {
  return (
    <footer className="bg-[#17241C] text-white">
      <div className="container-default py-14 md:py-20">
        <div className="grid gap-12 border-b border-white/15 pb-12 md:grid-cols-[1.35fr_0.65fr_0.65fr] md:pb-16">
          <div><Link to="/" className="inline-flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center overflow-hidden"><img src={XimoIcon} alt="" className="w-8" /></span><span className="text-xl font-semibold tracking-[-0.04em]">ximo</span></Link><p className="mt-6 max-w-sm text-base leading-7 text-white/65">Practical business technology for the work that has to move well, every day.</p></div>
          {columns.map((column) => <div key={column.title}><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#BDE1C6]">{column.title}</p><ul className="mt-5 space-y-3">{column.links.map((link) => <li key={link.label}><Link to={link.path} className="text-sm text-white/70 transition-colors hover:text-white">{link.label}</Link></li>)}</ul></div>)}
        </div>
        <div className="flex flex-col gap-3 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between"><p>Copyright {new Date().getFullYear()} Ximo. All rights reserved.</p><p>Built for the businesses that keep moving.</p></div>
      </div>
    </footer>
  );
}

