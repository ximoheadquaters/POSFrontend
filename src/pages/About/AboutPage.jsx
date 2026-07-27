import { useEffect } from "react";
import { motion } from "framer-motion";
import SectionTitle from "../../components/common/SectionTitle";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";

const stats = [
  { label: "Years in Business", value: "5+" },
  { label: "Businesses Served", value: "500+" },
  { label: "Transactions Processed", value: "10M+" },
  { label: "Customer Satisfaction", value: "98%" },
];

const values = [
  {
    title: "Innovation",
    description:
      "We constantly push boundaries to deliver cutting-edge solutions that keep our clients ahead of the curve.",
  },
  {
    title: "Reliability",
    description:
      "Our systems are built for mission-critical operations with 99.9% uptime and enterprise-grade security.",
  },
  {
    title: "Partnership",
    description:
      "We work alongside our clients as true partners, understanding their unique needs and challenges.",
  },
  {
    title: "Excellence",
    description:
      "From code to customer support, we strive for the highest standards in everything we do.",
  },
];

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
              subtitle="About Us"
              title="Building Technology That Powers Business Growth"
              description="Ximo is a software development company dedicated to creating modern technology solutions that help businesses streamline operations, increase efficiency, and achieve sustainable growth."
              align="left"
            />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-primary">
        <div className="container-default">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-neutral-50">
        <div className="container-default">
          <SectionTitle
            subtitle="Our Values"
            title="What Drives Us"
            description="These core principles guide every decision we make and every solution we build."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {value.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-white text-center">
        <div className="container-default max-w-2xl">
          <h2 className="text-section text-neutral-900 mb-4">
            Want to Learn More?
          </h2>
          <p className="text-lg text-neutral-500 mb-8">
            Get in touch with our team to discuss how Ximo can help your
            business.
          </p>
          <Button size="lg" onClick={() => (window.location.href = "/contact")}>
            Contact Us
          </Button>
        </div>
      </section>
    </div>
  );
}
