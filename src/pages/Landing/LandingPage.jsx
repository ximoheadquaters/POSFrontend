import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import { mockFaqs } from "../../data/faqs";
import { mockServices } from "../../data/services";

const pos = mockServices[0];

const operatingPrinciples = [
  [
    "01",
    "Serve the customer, not the screen",
    "A faster, calmer checkout keeps the line moving and lets staff stay present.",
  ],
  [
    "02",
    "Keep the numbers close",
    "Sales and stock signals are visible when decisions need to be made, not after the day ends.",
  ],
  [
    "03",
    "Build for the next location",
    "Start with one store and keep the same operating picture as your business grows.",
  ],
];

const roadmap = [
  ["POS", "Available", true],
  ["Business software", "In development", false],
  ["Automation", "Planned", false],
  ["Integrations", "Planned", false],
];

const ximoApproach = [
  [
    "01",
    "Make daily work visible",
    "Bring sales, stock, and team activity into one dependable view.",
  ],
  [
    "02",
    "Design for the busy hour",
    "Keep essential tasks quick, clear, and easy to repeat.",
  ],
  [
    "03",
    "Leave room to grow",
    "Build a foundation that can travel with the next location.",
  ],
];

const operatingSignals = [
  ["Sales", "See what is moving now."],
  ["Stock", "Know what needs attention."],
  ["Team", "Give every handoff context."],
];

const conversationTopics = [
  "A clearer checkout and stock workflow",
  "A setup that supports more locations",
  "The right place to start with Ximo",
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
function SectionIntro({ eyebrow, title, body, light = false, align = "left" }) {
  return (
    <div
      className={
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"
      }
    >
      <p
        className={`text-[11px] font-bold uppercase tracking-[0.24em] ${light ? "text-[#C9E4CF]" : "text-primary"}`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-4 text-4xl font-semibold leading-[1.02] tracking-[-0.055em] md:text-[3.4rem] ${light ? "text-white" : "text-[#17241C]"}`}
      >
        {title}
      </h2>
      {body && (
        <p
          className={`mt-5 max-w-2xl text-base leading-7 md:text-[16px] ${align === "center" ? "mx-auto" : ""} ${light ? "text-white/72" : "text-[#59645C]"}`}
        >
          {body}
        </p>
      )}
    </div>
  );
}

function Hero() {
  return (
    <section
      id="landing-hero"
      className="relative isolate min-h-[680px] overflow-hidden bg-[#F9FAF7] text-black sm:min-h-[735px] lg:min-h-[818px]"
    >
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center opacity-[0.82]"
        style={{ backgroundImage: "url('/hero-brick-wall.png')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-[118px] bg-primary sm:h-[133px]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-[25px] bg-[#1A472F] sm:h-[28px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex max-w-[747px] flex-col items-center px-5 pt-[118px] text-center sm:px-6 sm:pt-[144px] lg:pt-[164px]">
        <p className="text-[10px] font-medium uppercase tracking-[0.31em] text-primary sm:text-[12px] lg:text-[13px]">
          Ximo business technology
        </p>
        <h1 className="mt-3.5 max-w-[730px] text-balance text-[clamp(2.18rem,2.52vw,2.88rem)] font-bold leading-[0.98] tracking-[-0.065em] text-black">
          Systems that keep business moving.
        </h1>
        <p className="mx-auto mt-4 max-w-[610px] text-balance text-[14px] leading-[1.28] tracking-[-0.035em] text-[#777974] sm:text-[15px] lg:text-[16px]">
          Ximo POS gives growing businesses one reliable place to sell, manage
          stock, lead their team, and make better decisions every day.
        </p>
        <div className="mt-6 flex w-full max-w-[486px] flex-col items-stretch justify-center gap-3 sm:mt-7 sm:flex-row sm:gap-8 lg:gap-[45px]">
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("services")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-[14px] bg-[#242424] px-5 text-[15px] font-medium tracking-[-0.045em] text-white shadow-[0_10px_13px_rgba(0,0,0,0.30)] transition-transform hover:-translate-y-0.5 hover:bg-black focus-visible:ring-black sm:min-h-[52px] sm:text-[17px] lg:text-[18px]"
          >
            Explore Services
          </button>
          <Link
            to="/signup"
            className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-[14px] bg-primary px-5 text-[15px] font-medium tracking-[-0.045em] text-white shadow-[0_10px_13px_rgba(23,70,48,0.34)] transition-transform hover:-translate-y-0.5 hover:bg-[#164F34] focus-visible:ring-primary sm:min-h-[52px] sm:text-[17px] lg:text-[18px]"
          >
            Create account
          </Link>
        </div>
      </div>

      <img
        src="/hero-pos-system.png"
        alt="Ximo POS terminal, receipt printer, cash drawer, and barcode scanner"
        className="pointer-events-none absolute bottom-[7px] left-1/2 z-20 ml-[45px] w-[min(794px,108vw)] max-w-none -translate-x-1/2 select-none drop-shadow-[0_18px_14px_rgba(0,0,0,0.35)] sm:bottom-[10px] lg:w-[min(794px,50vw)]"
      />
    </section>
  );
}

function Services() {
  return (
    <section
      id="services"
      className="scroll-mt-20 bg-[#1A472F] py-16 text-white md:py-24 lg:py-[7rem]"
    >
      <div className="container-default lg:max-w-[1152px]">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
          <SectionIntro
            eyebrow="The Ximo platform"
            title="One strong product now. More practical tools next."
            body="We are starting where the daily work is most visible: the counter. Everything else is being built from that same commitment to simpler operations."
            light
          />
          <div className="border-t border-white/20 lg:mb-1">
            {roadmap.map(([name, status, active], index) => (
              <div
                key={name}
                className={`flex items-center justify-between gap-5 border-b border-white/20 py-4 ${active ? "text-white" : "text-white/45"}`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`font-mono text-xs ${active ? "text-[#BDE1C6]" : "text-white/35"}`}
                  >
                    0{index + 1}
                  </span>
                  <span className="text-lg font-semibold tracking-[-0.02em]">
                    {name}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.16em] ${active ? "text-[#BDE1C6]" : "text-white/35"}`}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
        <article className="mt-12 grid overflow-hidden border border-white/15 bg-[#F8F7F1] text-[#17241C] lg:grid-cols-[1fr_0.98fr]">
          <div className="flex min-h-[390px] flex-col justify-between p-7 md:p-10">
            <div>
              <h3 className="max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-[2.8rem]">
                Ximo POS keeps the counter moving.
              </h3>
              <p className="mt-6 max-w-lg text-base leading-7 text-[#59645C]">
                A dependable retail system that brings checkout, live inventory,
                and daily team activity into one clear operating picture.
              </p>
            </div>
            <div className="mt-10">
              <div className="grid border-t border-[#CBD6CC] sm:grid-cols-3">
                <div className="border-b border-[#CBD6CC] py-4 last:border-b-0 sm:border-b-0 sm:pr-4 sm:not-last:border-r sm:not-last:pr-4">
                  <p className="text-sm font-semibold text-[#17241C]">
                    Fast checkout
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#59645C]">
                    Keep the line moving.
                  </p>
                </div>
                <div className="border-b border-[#CBD6CC] py-4 last:border-b-0 sm:border-b-0 sm:px-4 sm:not-last:border-r">
                  <p className="text-sm font-semibold text-[#17241C]">
                    Live inventory
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#59645C]">
                    Know what is on hand.
                  </p>
                </div>
                <div className="border-b border-[#CBD6CC] py-4 last:border-b-0 sm:border-b-0 sm:pl-4">
                  <p className="text-sm font-semibold text-[#17241C]">
                    Ready to grow
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#59645C]">
                    Stay clear across locations.
                  </p>
                </div>
              </div>
              <Link
                to={`/services?service=${pos.slug}`}
                className="mt-6 inline-flex min-h-[46px] items-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#164F34]"
              >
                Explore Ximo POS
              </Link>
            </div>
          </div>
          <div className="min-h-[300px] bg-[#C9D8CA] lg:min-h-[390px]">
            <img
              src="/ximo-retail-counter.jpg"
              alt="Ximo POS in a retail setting"
              className="h-full w-full object-cover"
            />
          </div>
        </article>
      </div>
    </section>
  );
}

function Operations() {
  return (
    <section className="scroll-transition bg-[#E7EEE7] py-16 md:py-24 lg:py-[7rem]">
      <div className="container-default lg:max-w-[1152px]">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <SectionIntro
            eyebrow="Made for the workday"
            title="The right information, in the right moment."
            body="Ximo removes the small points of friction that turn a busy shift into a difficult one."
          />
          <p className="max-w-xl border-l-2 border-primary pl-5 text-[16px] leading-7 text-[#39443D]">
            It is not another dashboard to maintain. It is a clearer way to see
            the work already happening across your business.
          </p>
        </div>
        <div className="mt-12 grid border-y border-[#B9CDBC] md:grid-cols-3">
          {operatingPrinciples.map(([number, title, body]) => (
            <article
              key={number}
              className="group px-0 py-7 md:px-7 md:py-9 first:md:pl-0 last:md:pr-0 not-last:border-b not-last:border-[#B9CDBC] md:not-last:border-b-0 md:not-last:border-r"
            >
              <p className="font-mono text-xs text-primary">{number}</p>
              <h3 className="mt-12 max-w-xs text-2xl font-semibold leading-tight tracking-[-0.035em] text-[#17241C]">
                {title}
              </h3>
              <p className="mt-4 max-w-sm text-sm leading-7 text-[#59645C]">
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section
      id="about"
      className="scroll-transition scroll-mt-20 bg-[#F5F7F2] py-16 md:py-24 lg:py-[7rem]"
    >
      <Reveal className="container-default lg:max-w-[1152px]">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1fr] lg:items-start lg:gap-16">
          <div className="max-w-[620px] lg:pt-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
              About Ximo
            </p>
            <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.01] tracking-[-0.055em] text-[#17241C] md:text-5xl">
              Built around the work that keeps a business moving.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#59645C] md:text-[17px]">
              Ximo brings the important parts of a workday into a clearer
              rhythm—from the first sale to the stock decision that comes next.
            </p>
            <div className="mt-10 max-w-md border-t border-[#B9CDBC] pt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                The Ximo promise
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#39443D]">
                Less time managing the system. More time running the business.
              </p>
            </div>
          </div>

          <aside className="relative overflow-hidden bg-[#1A472F] p-7 text-white shadow-[0_18px_40px_rgba(23,70,48,0.14)] md:p-9 lg:min-h-[380px]">
            <div
              className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/15"
              aria-hidden="true"
            />
            <div
              className="absolute -right-5 top-10 h-28 w-28 rounded-full border border-white/10"
              aria-hidden="true"
            />
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C9E4CF]">
                The Ximo approach
              </p>
              <h3 className="mt-5 max-w-[510px] text-3xl font-semibold leading-[1.03] tracking-[-0.05em] md:text-4xl">
                Technology should feel like a steady hand, not another thing to
                manage.
              </h3>
              <div className="mt-9 grid border-t border-white/20 md:grid-cols-3">
                {ximoApproach.map(([number, title, body]) => (
                  <article
                    key={number}
                    className="border-b border-white/20 py-5 last:border-b-0 md:border-b-0 md:px-5 md:first:pl-0 md:not-last:border-r md:last:pr-0"
                  >
                    <p className="font-mono text-[11px] text-[#BDE1C6]">
                      {number}
                    </p>
                    <h4 className="mt-5 text-base font-semibold leading-5 tracking-[-0.025em]">
                      {title}
                    </h4>
                    <p className="mt-3 text-sm leading-6 text-white/70">
                      {body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8 overflow-hidden border border-[#C8D6CA] bg-[#FCFDF9]">
          <div className="grid gap-7 p-7 md:p-9 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:gap-16">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                The operating picture
              </p>
              <h3 className="mt-4 max-w-md text-3xl font-semibold leading-[1.05] tracking-[-0.045em] text-[#17241C] md:text-4xl">
                One shared view for the work that matters.
              </h3>
            </div>
            <p className="max-w-xl text-base leading-7 text-[#59645C] md:text-[17px]">
              Ximo keeps sales, stock, and team context together—so the next
              decision starts with what is already happening, not a search for
              updates.
            </p>
          </div>

          <div className="grid border-y border-[#C8D6CA] sm:grid-cols-3">
            {operatingSignals.map(([title, body]) => (
              <article
                key={title}
                className="border-b border-[#C8D6CA] px-7 py-6 last:border-b-0 md:px-9 md:py-7 sm:border-b-0 sm:not-last:border-r sm:not-last:border-[#C8D6CA]"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  {title}
                </p>
                <p className="mt-3 max-w-[220px] text-base font-semibold leading-5 tracking-[-0.025em] text-[#17241C]">
                  {body}
                </p>
              </article>
            ))}
          </div>

          <div className="flex flex-col gap-3 px-7 py-5 md:px-9 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold leading-6 text-[#39443D]">
              Less time chasing updates. More confidence in the next move.
            </p>
            <p className="text-sm leading-6 text-[#59645C]">
              Built for real shifts, not ideal workflows.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <section
      id="faq"
      className="scroll-transition scroll-mt-20 bg-[#F1F0E8] py-16 md:py-24 lg:py-[7rem]"
    >
      <Reveal className="container-default grid gap-10 lg:max-w-[1152px] lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionIntro
          eyebrow="Support"
          title="The questions that come up before day one."
          body="Clear answers, so you can decide whether Ximo POS is right for your operation."
        />
        <div className="border-t border-[#B9CDBC]">
          {mockFaqs.map((faq, index) => (
            <div key={faq.id} className="border-b border-[#C9D6CB]">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                aria-expanded={openIndex === index}
                className="flex w-full items-start justify-between gap-6 py-5 text-left"
              >
                <span className="text-base font-semibold leading-6 text-[#17241C]">
                  {faq.question}
                </span>
                <span className="mt-0.5 text-xl font-light text-primary">
                  {openIndex === index ? "-" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <p className="-mt-2 max-w-2xl pb-5 text-sm leading-7 text-[#59645C]">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => {
    console.log("Contact form submitted:", data);
    alert("Thank you for your message! We will get back to you soon.");
  };
  return (
    <section
      id="contact"
      className="scroll-transition scroll-mt-20 bg-[#155A3B] py-16 text-white md:py-20 lg:py-24"
    >
      <Reveal className="container-default lg:max-w-[1152px]">
        <div className="overflow-hidden border border-white/20 bg-[#174D35] shadow-[0_22px_54px_rgba(10,48,30,0.22)] lg:grid lg:grid-cols-[0.84fr_1.16fr]">
          <div className="relative overflow-hidden p-7 md:p-9 lg:p-10">
            <div
              className="absolute -left-20 -top-24 h-72 w-72 rounded-full border border-white/10"
              aria-hidden="true"
            />
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#C9E4CF]">
                Talk to Ximo
              </p>
              <h2 className="mt-4 max-w-[480px] text-balance text-4xl font-semibold leading-[1.01] tracking-[-0.055em] text-white md:text-5xl">
                Start with the part of the day that needs to work better.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-white/80">
                Tell us where things feel slow, disconnected, or difficult. We
                will help you think through a more practical next step.
              </p>

              <div className="mt-8 border-t border-white/20 pt-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9E4CF]">
                  A focused conversation about
                </p>
                <ul className="mt-5 space-y-4">
                  {conversationTopics.map((topic) => (
                    <li
                      key={topic}
                      className="flex items-start gap-3 text-sm font-medium leading-5 text-white"
                    >
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#BDE1C6] text-primary">
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 16 16"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          aria-hidden="true"
                        >
                          <path d="m3 8 3 3 7-7" />
                        </svg>
                      </span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-[#FAFBF8] p-7 text-[#17241C] md:p-9 lg:p-10"
          >
            <div className="flex flex-col gap-3 border-b border-[#DDE5DE] pb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                Start the conversation
              </p>
              <h3 className="max-w-xl text-2xl font-semibold leading-[1.08] tracking-[-0.04em] md:text-3xl">
                Tell us what would make your operation easier.
              </h3>
              <p className="text-sm leading-6 text-[#657069]">
                Share the details that will help us understand your current
                setup.
              </p>
            </div>
            <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
              <Input
                label="First name"
                name="firstName"
                placeholder="First name"
                register={register}
                error={errors.firstName?.message}
                className="rounded-xl py-3 text-sm"
                {...register("firstName", { required: "Required" })}
              />
              <Input
                label="Last name"
                name="lastName"
                placeholder="Last name"
                register={register}
                error={errors.lastName?.message}
                className="rounded-xl py-3 text-sm"
                {...register("lastName", { required: "Required" })}
              />
            </div>
            <div className="mt-3.5">
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="you@company.com"
                register={register}
                error={errors.email?.message}
                className="rounded-xl py-3 text-sm"
                {...register("email", {
                  required: "Required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                })}
              />
            </div>
            <div className="mt-3.5">
              <Input
                label="Subject"
                name="subject"
                placeholder="How can Ximo help?"
                register={register}
                error={errors.subject?.message}
                className="rounded-xl py-3 text-sm"
                {...register("subject", { required: "Required" })}
              />
            </div>
            <div className="mt-3.5">
              <Textarea
                label="Message"
                name="message"
                placeholder="Tell us about your business..."
                rows={4}
                register={register}
                error={errors.message?.message}
                className="rounded-xl py-3 text-sm"
                {...register("message", { required: "Required" })}
              />
            </div>
            <button
              type="submit"
              className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#164F34]"
            >
              Send inquiry
            </button>
          </form>
        </div>
      </Reveal>
    </section>
  );
}

export default function LandingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const sections = [...document.querySelectorAll(".scroll-transition")];
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      sections.forEach((section) => section.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.06 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Hero />
      <Services />
      <Operations />
      <About />
      <FAQSection />
      <Contact />
    </>
  );
}
