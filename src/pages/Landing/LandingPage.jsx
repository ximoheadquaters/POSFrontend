import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import { mockFaqs } from "../../data/faqs";
import { mockServices } from "../../data/services";

const pos = mockServices[0];

const operatingPrinciples = [
  ["01", "Serve the customer, not the screen", "A faster, calmer checkout keeps the line moving and lets staff stay present."],
  ["02", "Keep the numbers close", "Sales and stock signals are visible when decisions need to be made, not after the day ends."],
  ["03", "Build for the next location", "Start with one store and keep the same operating picture as your business grows."],
];

const roadmap = [
  ["POS", "Live", true],
  ["Business software", "In development", false],
  ["Automation", "Planned", false],
  ["Integrations", "Planned", false],
];

function Reveal({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.72, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
function Arrow() {
  return <span className="ml-3 text-base" aria-hidden="true">-&gt;</span>;
}

function Check({ inverse = false }) {
  return (
    <span className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${inverse ? "bg-[#BDE1C6] text-primary" : "bg-[#E6F2E9] text-primary"}`}>
      <svg className="h-3 w-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2.5"><path d="m3 8 3 3 7-7" /></svg>
    </span>
  );
}

function SectionIntro({ eyebrow, title, body, light = false, align = "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${light ? "text-[#C9E4CF]" : "text-primary"}`}>{eyebrow}</p>
      <h2 className={`mt-4 text-4xl font-semibold leading-[1.02] tracking-[-0.055em] md:text-6xl ${light ? "text-white" : "text-[#17241C]"}`}>{title}</h2>
      {body && <p className={`mt-5 max-w-2xl text-base leading-7 md:text-lg ${align === "center" ? "mx-auto" : ""} ${light ? "text-white/72" : "text-[#59645C]"}`}>{body}</p>}
    </div>
  );
}

function Hero() {
  return (
    <section id="landing-hero" className="relative isolate flex min-h-[720px] items-center overflow-hidden bg-primary text-white md:min-h-[790px]">
      <img src="/ximo-retail-counter.jpg" alt="A retail counter using a point-of-sale system" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 -z-10 bg-primary/50" aria-hidden="true" />
      <div className="container-default relative w-full pt-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#D7EFDC]">Ximo business technology</p>
          <h1 className="mx-auto mt-6 max-w-5xl text-5xl font-semibold leading-[0.92] tracking-[-0.07em] md:text-7xl lg:text-8xl">Systems that keep business moving.</h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/90">Ximo POS gives growing businesses one reliable place to sell, manage stock, lead their team, and make better decisions every day.</p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })} className="bg-white px-6 py-3.5 text-sm font-semibold text-primary transition hover:bg-[#E6F2E9]">Explore services</button>
            <Link to={`/services?service=${pos.slug}`} className="border border-white px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-white hover:text-primary">Explore Ximo POS</Link>
          </div>
          <p className="mt-7 text-sm font-semibold text-white/85">Built for checkout, inventory, and the busy hour.</p>
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="scroll-transition scroll-mt-20 bg-[#17241C] py-20 text-white md:py-32">
      <div className="container-default">
        <div className="grid gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
          <SectionIntro eyebrow="The Ximo platform" title="One strong product now. More practical tools next." body="We are starting where the daily work is most visible: the counter. Everything else is being built from that same commitment to simpler operations." light />
          <div className="border-t border-white/20 lg:mb-1">
            {roadmap.map(([name, status, active], index) => <div key={name} className={`flex items-center justify-between gap-5 border-b border-white/20 py-4 ${active ? "text-white" : "text-white/45"}`}><div className="flex items-center gap-4"><span className={`font-mono text-xs ${active ? "text-[#BDE1C6]" : "text-white/35"}`}>0{index + 1}</span><span className="text-lg font-semibold tracking-[-0.02em]">{name}</span></div><span className={`text-[10px] font-bold uppercase tracking-[0.16em] ${active ? "text-[#BDE1C6]" : "text-white/35"}`}>{status}</span></div>)}
          </div>
        </div>
        <article className="mt-16 grid overflow-hidden border border-white/15 bg-[#F5F4EE] text-[#17241C] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex min-h-[390px] flex-col justify-between p-8 md:p-12">
            <div>
              <div className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-primary" /><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Available now</p></div>
              <h3 className="mt-7 max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-5xl">Ximo POS is the operating system behind the counter.</h3>
              <p className="mt-6 max-w-lg text-base leading-7 text-[#59645C]">A dependable retail system for checkout, live inventory, team activity, and the decisions that happen between opening and closing.</p>
            </div>
            <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div className="flex gap-5 text-sm font-semibold text-[#39443D]"><span>Fast checkout</span><span>Live inventory</span><span>Ready to grow</span></div><Link to={`/services?service=${pos.slug}`} className="inline-flex w-fit items-center border-b-2 border-primary pb-2 text-sm font-bold text-primary transition hover:border-[#17241C] hover:text-[#17241C]">See Ximo POS <Arrow /></Link></div>
          </div>
          <div className="min-h-[340px] bg-[#C9D8CA] p-5 md:p-8"><img src="/ximo-retail-counter.jpg" alt="Ximo POS in a retail setting" className="h-full w-full object-cover" /></div>
        </article>
      </div>
    </section>
  );
}

function Operations() {
  return (
    <section className="scroll-transition bg-[#E7EEE7] py-20 md:py-32">
      <div className="container-default">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-end"><SectionIntro eyebrow="Made for the workday" title="The right information, in the right moment." body="Ximo removes the small points of friction that turn a busy shift into a difficult one." /><p className="max-w-xl border-l-2 border-primary pl-5 text-lg leading-8 text-[#39443D]">It is not another dashboard to maintain. It is a clearer way to see the work already happening across your business.</p></div>
        <div className="mt-16 grid border-y border-[#B9CDBC] md:grid-cols-3">
          {operatingPrinciples.map(([number, title, body]) => <article key={number} className="group px-0 py-8 md:px-8 md:py-10 first:md:pl-0 last:md:pr-0 not-last:border-b not-last:border-[#B9CDBC] md:not-last:border-b-0 md:not-last:border-r"><p className="font-mono text-xs text-primary">{number}</p><h3 className="mt-14 max-w-xs text-2xl font-semibold leading-tight tracking-[-0.035em] text-[#17241C]">{title}</h3><p className="mt-4 max-w-sm text-sm leading-7 text-[#59645C]">{body}</p></article>)}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const [billing, setBilling] = useState("annual");
  const plans = useMemo(() => pos.pricing.map((plan) => {
    const shared = ["14-day free trial", "Upgrade anytime"];
    return { ...plan, displayPrice: billing === "annual" ? Math.round(plan.price * 0.82) : plan.price, features: [...plan.features, ...shared].slice(0, 7) };
  }), [billing]);

  return (
    <section id="pricing" className="scroll-transition scroll-mt-20 bg-[#F8F7F1] py-20 md:py-32">
      <div className="container-default">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><SectionIntro eyebrow="Ximo POS pricing" title="Straightforward plans for the way you operate." body="Start with the plan that matches your day today. Move when your business is ready." /><div className="flex w-fit border border-[#B7CEBD] bg-white p-1"><button type="button" onClick={() => setBilling("monthly")} className={`px-5 py-2.5 text-sm font-bold transition-colors ${billing === "monthly" ? "bg-primary text-white" : "text-[#59645C] hover:text-primary"}`}>Monthly</button><button type="button" onClick={() => setBilling("annual")} className={`px-5 py-2.5 text-sm font-bold transition-colors ${billing === "annual" ? "bg-primary text-white" : "text-[#59645C] hover:text-primary"}`}>Annual</button></div></div>
        <p className="mt-5 text-sm text-[#59645C]">Annual billing saves 18% and includes the same Ximo POS experience.</p>
        <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-3">
          {plans.map((plan) => <article key={plan.name} className={`relative flex min-h-[600px] flex-col border p-7 md:p-9 ${plan.popular ? "border-primary bg-primary text-white" : "border-[#CFD9D0] bg-white text-[#17241C]"}`}>
            {plan.popular && <span className="absolute right-0 top-0 bg-[#C9E4CF] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Most chosen</span>}
            <h3 className="text-2xl font-semibold tracking-[-0.03em]">{plan.name}</h3><p className={`mt-4 min-h-12 text-sm leading-6 ${plan.popular ? "text-white/72" : "text-[#59645C]"}`}>{plan.description}</p>
            <div className={`mt-8 border-y py-6 ${plan.popular ? "border-white/20" : "border-[#E1E5E0]"}`}><span className="text-5xl font-semibold tracking-[-0.06em]">${plan.displayPrice}</span><span className={`ml-2 text-sm ${plan.popular ? "text-white/70" : "text-[#59645C]"}`}>per month</span><p className={`mt-2 text-[11px] font-bold uppercase tracking-[0.14em] ${plan.popular ? "text-[#C9E4CF]" : "text-primary"}`}>{billing === "annual" ? "Billed annually" : "Billed monthly"}</p></div>
            <ul className="mt-7 space-y-4">{plan.features.map((feature) => <li key={feature} className={`flex gap-3 text-sm leading-5 ${plan.popular ? "text-white/85" : "text-[#39443D]"}`}><Check inverse={plan.popular} />{feature}</li>)}</ul>
            <Link to="/login" className={`mt-auto mt-10 inline-flex items-center justify-center px-5 py-3.5 text-sm font-semibold transition-colors ${plan.popular ? "bg-white text-primary hover:bg-[#E6F2E9]" : "bg-primary text-white hover:bg-[#164F34]"}`}>{plan.cta}<Arrow /></Link>
          </article>)}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="scroll-transition scroll-mt-20 bg-white py-20 md:py-32">
      <div className="container-default grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <aside className="flex min-h-[440px] flex-col justify-between bg-[#4C4239] p-8 text-white md:p-10"><div><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#D9E5D7]">The Ximo point of view</p><p className="mt-7 max-w-sm text-4xl font-semibold leading-[1.02] tracking-[-0.05em]">Software should make the work feel more certain.</p></div><div className="border-t border-white/20 pt-5"><p className="text-sm leading-6 text-white/70">We start with the routines that have to work every day, then design the system around the people doing them.</p></div></aside>
        <div className="flex flex-col justify-center"><SectionIntro eyebrow="About Ximo" title="Practical technology for businesses with places to be." body="Ximo begins with POS because it sits at the center of your sales floor, stock room, and team decisions. We are building an intentional platform around the work that has to happen well, every day." /><div className="mt-12 grid gap-8 sm:grid-cols-2"><div className="border-t-2 border-primary pt-4"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Focused</p><h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#17241C]">A product people can trust on a busy day.</h3></div><div className="border-t-2 border-primary pt-4"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Ready</p><h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#17241C]">A foundation built to grow with the business.</h3></div></div></div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <section id="faq" className="scroll-transition scroll-mt-20 bg-[#F1F0E8] py-20 md:py-32"><Reveal className="container-default grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"><SectionIntro eyebrow="Support" title="The questions that come up before day one." body="Clear answers, so you can decide whether Ximo POS is right for your operation." /><div className="border-t border-[#B9CDBC]">{mockFaqs.map((faq, index) => <div key={faq.id} className="border-b border-[#C9D6CB]"><button type="button" onClick={() => setOpenIndex(openIndex === index ? -1 : index)} aria-expanded={openIndex === index} className="flex w-full items-start justify-between gap-6 py-6 text-left"><span className="text-base font-semibold leading-6 text-[#17241C]">{faq.question}</span><span className="mt-0.5 text-xl font-light text-primary">{openIndex === index ? "-" : "+"}</span></button>{openIndex === index && <p className="-mt-2 max-w-2xl pb-6 text-sm leading-7 text-[#59645C]">{faq.answer}</p>}</div>)}</div></Reveal></section>
  );
}

function Contact() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = (data) => { console.log("Contact form submitted:", data); alert("Thank you for your message! We will get back to you soon."); };
  return (
    <section id="contact" className="scroll-transition scroll-mt-20 bg-primary py-20 text-white md:py-32"><Reveal className="container-default grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20"><div><SectionIntro eyebrow="Talk to Ximo" title="Let us map out a better operating day." body="Tell us about your business, your current setup, and where things get difficult. We will help you find the right starting point." light /><div className="mt-12 grid gap-5 border-t border-white/25 pt-6 text-sm sm:grid-cols-3 lg:grid-cols-1"><p className="text-white/78">Discuss setup and migration</p><p className="text-white/78">Plan for multiple locations</p><p className="text-white/78">Ask about the right plan</p></div></div><form onSubmit={handleSubmit(onSubmit)} className="bg-[#F8F7F1] p-6 text-[#17241C] md:p-10"><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Start the conversation</p><div className="mt-7 grid gap-5 sm:grid-cols-2"><Input label="First name" name="firstName" placeholder="First name" register={register} error={errors.firstName?.message} {...register("firstName", { required: "Required" })} /><Input label="Last name" name="lastName" placeholder="Last name" register={register} error={errors.lastName?.message} {...register("lastName", { required: "Required" })} /></div><div className="mt-5"><Input label="Email" name="email" type="email" placeholder="you@company.com" register={register} error={errors.email?.message} {...register("email", { required: "Required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })} /></div><div className="mt-5"><Input label="Subject" name="subject" placeholder="How can Ximo help?" register={register} error={errors.subject?.message} {...register("subject", { required: "Required" })} /></div><div className="mt-5"><Textarea label="Message" name="message" placeholder="Tell us about your business..." register={register} error={errors.message?.message} {...register("message", { required: "Required" })} /></div><button type="submit" className="mt-7 inline-flex w-full items-center justify-center bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#164F34]">Send inquiry <Arrow /></button></form></Reveal></section>
  );
}

export default function LandingPage() {
  useEffect(() => window.scrollTo(0, 0), []);

  useEffect(() => {
    const sections = [...document.querySelectorAll(".scroll-transition")];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      sections.forEach((section) => section.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.06 });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return <><Hero /><Services /><Operations /><Pricing /><About /><FAQSection /><Contact /></>;
}




