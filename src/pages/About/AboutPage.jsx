import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const commitments = [
  ["01", "Start with the work", "We design around the routines that have to happen well every day, not a list of features looking for a problem."],
  ["02", "Make the next move clearer", "A useful system gives people the signal they need to act with confidence when the day gets busy."],
  ["03", "Build to stay useful", "We prefer practical, reliable foundations that grow with a business instead of chasing novelty."],
];

function Arrow() {
  return <span className="ml-3" aria-hidden="true">-&gt;</span>;
}

export default function AboutPage() {
  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <div className="pt-20">
      <section className="bg-[#17241C] px-5 py-20 text-white sm:px-6 md:py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#C9E4CF]">About Ximo</p><h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.94] tracking-[-0.065em] md:text-7xl">Technology that helps the day make sense.</h1></div>
          <p className="max-w-xl border-l border-white/25 pl-6 text-lg leading-8 text-white/72">Ximo builds practical business technology around the work people actually need to do: serving customers, managing the moving parts, and making the next decision with better information.</p>
        </motion.div>
      </section>

      <section className="bg-[#F5F4EE] py-20 md:py-28"><div className="container-default grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"><div><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Why we begin with POS</p><h2 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-[#17241C] md:text-5xl">The counter is where the whole operation meets.</h2></div><div className="max-w-2xl text-lg leading-8 text-[#59645C]"><p>Sales, stock, customers, and teams all meet at the point of sale. That makes it the right place to begin building a clearer operating picture for a growing business.</p><p className="mt-6">Ximo POS is our first live product. The wider platform will expand from the same simple principle: make important work easier to see and easier to move forward.</p></div></div></section>

      <section className="bg-white py-20 md:py-28"><div className="container-default"><div className="flex flex-col gap-5 border-b border-[#C9D6CB] pb-10 md:flex-row md:items-end md:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Our approach</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-[#17241C] md:text-5xl">Built with restraint.</h2></div><p className="max-w-md text-base leading-7 text-[#59645C]">We care about systems that feel reliable on the busiest day, not just impressive in a demo.</p></div><div className="grid md:grid-cols-3">{commitments.map(([number, title, body]) => <article key={number} className="py-9 md:px-8 md:py-12 first:md:pl-0 last:md:pr-0 not-last:border-b not-last:border-[#DCE4DD] md:not-last:border-b-0 md:not-last:border-r"><p className="font-mono text-xs text-primary">{number}</p><h3 className="mt-12 text-2xl font-semibold tracking-[-0.035em] text-[#17241C]">{title}</h3><p className="mt-4 max-w-sm text-sm leading-7 text-[#59645C]">{body}</p></article>)}</div></div></section>

      <section className="bg-primary py-20 text-white md:py-28"><div className="container-default flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C9E4CF]">Start with Ximo</p><h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] md:text-5xl">A better operating day starts with the right foundation.</h2></div><Link to="/contact" className="inline-flex w-fit items-center bg-white px-6 py-3.5 text-sm font-semibold text-primary transition hover:bg-[#E6F2E9]">Talk to the team <Arrow /></Link></div></section>
    </div>
  );
}
