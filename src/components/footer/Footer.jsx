import { Link } from "react-router-dom";
import XimoIcon from "../../assets/ximoIcon2.PNG";

const columns = [
  { title: "Explore", links: [{ label: "About Ximo", path: "/about" }, { label: "Ximo POS", path: "/services?service=pos-system" }, { label: "Pricing", path: "/pricing" }] },
  { title: "Company", links: [{ label: "Contact", path: "/contact" }, { label: "Log in", path: "/login" }, { label: "Support", path: "/#faq" }] },
];

export default function Footer() {
  return (
    <footer className="bg-[#17241C] text-white">
      <div className="container-default py-8 md:max-w-[1152px] md:py-10">
        <div className="grid gap-8 border-b border-white/15 pb-7 md:grid-cols-[1.35fr_0.65fr_0.65fr] md:gap-8 md:pb-8">
          <div><Link to="/" className="inline-flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center overflow-hidden"><img src={XimoIcon} alt="" className="w-6" /></span><span className="text-lg font-semibold tracking-[-0.04em]">ximo</span></Link><p className="mt-3 max-w-sm text-sm leading-6 text-white/65">Practical business technology for the work that has to move well, every day.</p></div>
          {columns.map((column) => <div key={column.title}><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BDE1C6]">{column.title}</p><ul className="mt-3 space-y-2">{column.links.map((link) => <li key={link.label}><Link to={link.path} className="text-sm text-white/70 transition-colors hover:text-white">{link.label}</Link></li>)}</ul></div>)}
        </div>
        <div className="flex flex-col gap-2 pt-4 text-[11px] text-white/45 sm:flex-row sm:items-center sm:justify-between"><p>Copyright {new Date().getFullYear()} Ximo. All rights reserved.</p><p>Built for the businesses that keep moving.</p></div>
      </div>
    </footer>
  );
}

