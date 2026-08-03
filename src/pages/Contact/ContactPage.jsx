import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";

const steps = [
  ["01", "Tell us where the day gets difficult", "Share your current setup, business type, and the work you want to make easier."],
  ["02", "We map the right starting point", "Our team will help you understand whether Ximo POS is the right first move."],
  ["03", "Move forward with a clear plan", "Get a practical next step for setup, migration, and future growth."],
];

function Arrow() {
  return <span className="ml-3" aria-hidden="true">-&gt;</span>;
}

export default function ContactPage() {
  useEffect(() => window.scrollTo(0, 0), []);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const onSubmit = (data) => { console.log("Contact form submitted:", data); alert("Thank you for your message! We will get back to you soon."); reset(); };

  return (
    <div className="pt-20">
      <section className="bg-[#E7EEE7] px-5 py-20 sm:px-6 md:py-28"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} className="mx-auto max-w-[1280px]"><p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Contact Ximo</p><h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.94] tracking-[-0.065em] text-[#17241C] md:text-7xl">Let us make the workday easier to run.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#59645C]">Tell us what is happening in your business now. We will help you find a practical path forward, starting with the work that matters most.</p></motion.div></section>

      <section className="bg-white py-20 md:py-28"><div className="container-default grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"><aside><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">What happens next</p><div className="mt-7 border-t border-[#C9D6CB]">{steps.map(([number, title, body]) => <div key={number} className="border-b border-[#C9D6CB] py-6"><p className="font-mono text-xs text-primary">{number}</p><h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#17241C]">{title}</h2><p className="mt-2 text-sm leading-6 text-[#59645C]">{body}</p></div>)}</div></aside><form onSubmit={handleSubmit(onSubmit)} className="border border-[#D4DDD5] bg-[#F8F7F1] p-6 md:p-10"><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Start the conversation</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#17241C]">Tell us a little about your operation.</h2><div className="mt-8 grid gap-5 sm:grid-cols-2"><Input label="First name" name="firstName" placeholder="First name" register={register} error={errors.firstName?.message} {...register("firstName", { required: "Required" })} /><Input label="Last name" name="lastName" placeholder="Last name" register={register} error={errors.lastName?.message} {...register("lastName", { required: "Required" })} /></div><div className="mt-5"><Input label="Work email" name="email" type="email" placeholder="you@company.com" register={register} error={errors.email?.message} {...register("email", { required: "Required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })} /></div><div className="mt-5"><Input label="What can we help with?" name="subject" placeholder="Tell us what you are working on" register={register} error={errors.subject?.message} {...register("subject", { required: "Required" })} /></div><div className="mt-5"><Textarea label="Message" name="message" placeholder="A short overview of your business, current setup, and goals..." register={register} error={errors.message?.message} {...register("message", { required: "Required" })} /></div><button type="submit" className="mt-7 inline-flex w-full items-center justify-center bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#164F34]">Send inquiry <Arrow /></button><p className="mt-4 text-xs leading-5 text-[#68736A]">We use your details only to respond to this inquiry.</p></form></div></section>
    </div>
  );
}
