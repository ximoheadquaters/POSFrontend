import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getServiceBySlug } from "../../data/services";

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.4"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
    </svg>
  );
}

export default function ServicesPage() {
  const [searchParams] = useSearchParams();
  const [billing, setBilling] = useState("monthly");
  const service = getServiceBySlug(searchParams.get("service"));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [service?.slug]);

  const plans = useMemo(() => {
    if (!service) return [];
    return service.pricing.map((plan) => ({
      ...plan,
      displayPrice:
        billing === "annual" ? Math.round(plan.price * 0.82) : plan.price,
    }));
  }, [billing, service]);

  // The route intentionally has no content until a service is chosen from the navigation menu.
  if (!service) {
    return (
      <div
        className="min-h-[calc(100vh-72px)] bg-white pt-20"
        aria-label="Services"
      />
    );
  }

  return (
    <div className="pt-20">
      <section className="overflow-hidden bg-[#17241C] px-5 py-16 text-white sm:px-6 md:py-24 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#C9E4CF]">
            Ximo services
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl md:text-6xl">
            {service.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/75 md:text-lg">
            {service.description}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-white/85">
            <span className="inline-flex items-center gap-2">
              <CheckIcon />
              14-day free trial
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckIcon />
              Guided onboarding
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckIcon />
              Cancel anytime
            </span>
          </div>
        </motion.div>
      </section>

      <section className="bg-[#F8F7F1] py-16 md:py-24">
        <div className="container-default">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                Plans & pricing
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#17241C] md:text-5xl">
                Choose the plan that fits your operation.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#59645C]">
                Every plan gives you the core tools to run a smoother day.
                Upgrade whenever your business needs more room.
              </p>
            </div>
            <div
              className="flex w-fit border border-[#B7CEBD] bg-white p-1"
              aria-label="Billing period"
            >
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`px-5 py-2.5 text-sm font-bold transition-colors ${billing === "monthly" ? "bg-[#17241C] text-white" : "text-[#59645C] hover:text-primary"}`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling("annual")}
                className={`px-5 py-2.5 text-sm font-bold transition-colors ${billing === "annual" ? "bg-[#17241C] text-white" : "text-[#59645C] hover:text-primary"}`}
              >
                Annual <span className="hidden sm:inline">· Save 18%</span>
              </button>
            </div>
          </div>

          <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.article
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={`relative flex min-h-[540px] flex-col border p-7 md:p-9 ${plan.popular ? "border-primary bg-primary text-white shadow-xl shadow-primary/15" : "border-[#DCE2DC] bg-white text-[#17241C]"}`}
              >
                {plan.popular && (
                  <span className="absolute right-0 top-0 bg-[#C9E4CF] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                    Most popular
                  </span>
                )}
                <h3 className="text-2xl font-semibold tracking-[-0.035em]">
                  {plan.name}
                </h3>
                <p
                  className={`mt-4 min-h-12 text-sm leading-6 ${plan.popular ? "text-white/72" : "text-[#59645C]"}`}
                >
                  {plan.description}
                </p>
                <div
                  className={`mt-8 border-y py-6 ${plan.popular ? "border-white/20" : "border-[#E3E6E1]"}`}
                >
                  <span className="text-5xl font-semibold tracking-[-0.065em]">
                    ${plan.displayPrice}
                  </span>
                  <span
                    className={`ml-2 text-sm ${plan.popular ? "text-white/70" : "text-[#59645C]"}`}
                  >
                    / month
                  </span>
                  <p
                    className={`mt-2 text-[11px] font-bold uppercase tracking-[0.14em] ${plan.popular ? "text-[#C9E4CF]" : "text-primary"}`}
                  >
                    {billing === "annual"
                      ? "Billed annually"
                      : "Billed monthly"}
                  </p>
                </div>
                <ul className="mt-7 space-y-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex gap-3 text-sm leading-5 ${plan.popular ? "text-white/85" : "text-[#39443D]"}`}
                    >
                      <span
                        className={
                          plan.popular ? "text-[#C9E4CF]" : "text-primary"
                        }
                      >
                        <CheckIcon />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className={`mt-auto inline-flex items-center justify-center px-5 py-3.5 text-sm font-semibold transition-colors ${plan.popular ? "bg-white text-primary hover:bg-[#E6F2E9]" : "bg-primary text-white hover:bg-[#164F34]"}`}
                >
                  {plan.cta}
                  <span className="ml-3" aria-hidden="true">
                    →
                  </span>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
