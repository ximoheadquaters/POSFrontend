import { useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import Button from "../../components/common/Button";
import SectionTitle from "../../components/common/SectionTitle";
import Card from "../../components/common/Card";
import ServiceCard from "../../components/services/ServiceCard";
import TestimonialCard from "../../components/testimonials/TestimonialCard";
import FAQAccordion from "../../components/faq/FAQAccordion";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import { mockServices } from "../../data/services";
import { mockTestimonials } from "../../data/testimonials";
import { mockFaqs } from "../../data/faqs";

function FadeInSection({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-primary overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.05),transparent_60%)]" />
      <div className="container-default relative z-10 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4"
          >
            Modern Technology Solutions
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-hero text-white text-balance"
          >
            Enterprise-Grade Software for{" "}
            <span className="text-white/90">Growing Businesses</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-lg text-white/70 max-w-xl leading-relaxed"
          >
            Ximo provides modern technology solutions that help businesses
            streamline operations, increase efficiency, and drive growth. Start
            with our flagship POS system.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Button
              variant="secondary"
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
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/10"
              onClick={() =>
                document
                  .getElementById("services")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Learn More
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="section-padding bg-white">
      <div className="container-default">
        <FadeInSection>
          <SectionTitle
            subtitle="Our Services"
            title="What We Offer"
            description="We provide cutting-edge technology solutions designed to transform your business operations."
          />
        </FadeInSection>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockServices.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
        {mockServices.length === 0 && (
          <p className="text-center text-neutral-400 py-12">
            More services coming soon.
          </p>
        )}
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = mockServices[0]?.features || [];
  return (
    <section className="section-padding bg-neutral-50">
      <div className="container-default">
        <FadeInSection>
          <SectionTitle
            subtitle="Features"
            title="Everything You Need to Run Your Business"
            description="Our POS system comes packed with powerful features designed to simplify every aspect of your operations."
          />
        </FadeInSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FadeInSection key={index} delay={index * 0.05}>
              <Card className="h-full">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const steps = [
    {
      number: "01",
      title: "Discovery",
      description: "We learn about your business, goals, and challenges.",
    },
    {
      number: "02",
      title: "Setup",
      description: "We configure and customize the system for your needs.",
    },
    {
      number: "03",
      title: "Migration",
      description: "We migrate your data and ensure everything works.",
    },
    {
      number: "04",
      title: "Launch",
      description: "Go live with full support and training for your team.",
    },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-default">
        <FadeInSection>
          <SectionTitle
            subtitle="Our Process"
            title="How We Get You Started"
            description="A streamlined onboarding process designed to get your business up and running quickly."
          />
        </FadeInSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <FadeInSection key={index} delay={index * 0.1}>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary/20 mb-3">
                  {step.number}
                </div>
                <h3 className="text-base font-semibold text-neutral-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-500">{step.description}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const pricing = mockServices[0]?.pricing || [];
  return (
    <section id="pricing" className="section-padding bg-neutral-50">
      <div className="container-default">
        <FadeInSection>
          <SectionTitle
            subtitle="Pricing"
            title="Simple, Transparent Pricing"
            description="Choose the plan that fits your business. All plans include a 14-day free trial."
          />
        </FadeInSection>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricing.map((plan, index) => (
            <FadeInSection key={index} delay={index * 0.1}>
              <div
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
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-default">
        <FadeInSection>
          <SectionTitle
            subtitle="Testimonials"
            title="Trusted by Business Leaders"
            description="Hear from our clients about how Ximo has transformed their operations."
          />
        </FadeInSection>
        <div className="grid md:grid-cols-2 gap-6">
          {mockTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section id="faq" className="section-padding bg-neutral-50">
      <div className="container-default max-w-3xl">
        <FadeInSection>
          <SectionTitle
            subtitle="FAQ"
            title="Frequently Asked Questions"
            description="Have questions? We have answers."
          />
        </FadeInSection>
        <FadeInSection>
          <Card hover={false}>
            {mockFaqs.map((faq, index) => (
              <FAQAccordion key={faq.id} faq={faq} index={index} />
            ))}
          </Card>
        </FadeInSection>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 bg-primary">
      <div className="container-default text-center">
        <FadeInSection>
          <h2 className="text-section text-white mb-4 text-balance">
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
            Join thousands of businesses that trust Ximo for their technology
            needs. Start your free trial today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="secondary" size="lg">
              Start Free Trial
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/10"
            >
              Talk to Sales
            </Button>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

function ContactSection() {
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
    <section id="contact" className="section-padding bg-white">
      <div className="container-default max-w-3xl">
        <FadeInSection>
          <SectionTitle
            subtitle="Contact"
            title="Get in Touch"
            description="Have a question or want to learn more? We'd love to hear from you."
          />
        </FadeInSection>
        <FadeInSection>
          <Card hover={false} className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <Input
                  label="First Name"
                  name="firstName"
                  placeholder="John"
                  register={register}
                  error={errors.firstName?.message}
                  {...register("firstName", { required: "Required" })}
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  placeholder="Doe"
                  register={register}
                  error={errors.lastName?.message}
                  {...register("lastName", { required: "Required" })}
                />
              </div>
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="john@company.com"
                register={register}
                error={errors.email?.message}
                {...register("email", {
                  required: "Required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                })}
              />
              <Input
                label="Subject"
                name="subject"
                placeholder="How can we help?"
                register={register}
                error={errors.subject?.message}
                {...register("subject", { required: "Required" })}
              />
              <Textarea
                label="Message"
                name="message"
                placeholder="Tell us more about your needs..."
                register={register}
                error={errors.message?.message}
                {...register("message", { required: "Required" })}
              />
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                Send Message
              </Button>
            </form>
          </Card>
        </FadeInSection>
      </div>
    </section>
  );
}

export default function LandingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <HeroSection />
      <ServicesSection />
      <FeaturesSection />
      <ProcessSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <ContactSection />
    </>
  );
}
