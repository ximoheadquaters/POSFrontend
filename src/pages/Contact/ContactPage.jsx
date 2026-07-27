import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import SectionTitle from "../../components/common/SectionTitle";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = (data) => {
    console.log("Contact form submitted:", data);
    alert("Thank you for your message! We will get back to you soon.");
    reset();
  };

  return (
    <div className="pt-20">
      <section className="section-padding bg-white">
        <div className="container-default">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SectionTitle
              subtitle="Contact"
              title="Get in Touch"
              description="Have a question about our services or want to discuss how Ximo can help your business? We'd love to hear from you."
            />
          </motion.div>
          <div className="grid md:grid-cols-5 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="md:col-span-2 space-y-6"
            >
              <Card hover={false}>
                <h3 className="text-base font-semibold text-neutral-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-primary mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        Email
                      </p>
                      <p className="text-sm text-neutral-500">hello@ximo.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-primary mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        Phone
                      </p>
                      <p className="text-sm text-neutral-500">
                        +1 (555) 123-4567
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-primary mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        Address
                      </p>
                      <p className="text-sm text-neutral-500">
                        123 Tech Street
                        <br />
                        San Francisco, CA 94105
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="md:col-span-3"
            >
              <Card hover={false} className="p-6 md:p-8">
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
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Invalid email",
                      },
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
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
