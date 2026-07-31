import { useEffect } from "react";
import { motion } from "framer-motion";
import SectionTitle from "../../components/common/SectionTitle";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { mockServices } from "../../data/services";

const iconMap = {
  package: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  chart:
    "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  "credit-card":
    "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  truck:
    "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1h2.586a1 1 0 00.707-.293l3.414-3.414a1 1 0 00.293-.707V11a1 1 0 00-1-1h-1m-4-1V6",
  building:
    "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  users:
    "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  heart:
    "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
};

export default function ServicesPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const service = mockServices[0];

  if (!service) {
    return (
      <div className="pt-20">
        <div className="container-default section-padding text-center">
          <h1 className="text-section text-neutral-900 mb-4">Services</h1>
          <p className="text-neutral-500">More services coming soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="section-padding bg-white">
        <div className="container-default">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <SectionTitle
              subtitle="Services"
              title={service.title}
              description={service.description}
              align="left"
            />
            <div className="flex flex-wrap gap-4 mt-8">
              <Button
                size="lg"
                onClick={() =>
                  document
                    .getElementById("pricing")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                View Pricing
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() =>
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-neutral-50">
        <div className="container-default">
          <SectionTitle
            subtitle="Features"
            title={`Everything ${service.title} Offers`}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d={iconMap[feature.icon] || iconMap["package"]}
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section-padding bg-white">
        <div className="container-default">
          <SectionTitle
            subtitle="Pricing"
            title="Choose Your Plan"
            description="All plans include a 14-day free trial. No credit card required."
          />
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {service.pricing.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-card border-2 p-6 md:p-8 flex flex-col ${
                  plan.popular
                    ? "border-primary shadow-lg"
                    : "border-neutral-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-semibold px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-neutral-500 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-neutral-900">
                      ${plan.price}
                    </span>
                    <span className="text-sm text-neutral-400">
                      /{plan.period}
                    </span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-neutral-600"
                    >
                      <svg
                        className="w-4 h-4 text-primary mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.popular ? "primary" : "secondary"}
                  className="w-full"
                  size="md"
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-20 bg-primary">
        <div className="container-default text-center">
          <h2 className="text-section text-white mb-4">
            Need a Custom Solution?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
            Contact our sales team for custom pricing, integrations, and
            enterprise solutions tailored to your business.
          </p>
          <Button variant="secondary" size="lg">
            Talk to Sales
          </Button>
        </div>
      </section>
    </div>
  );
}
