import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import XimoIcon from "../../assets/ximoIcon2.PNG";
import XimoIconGreen from "../../assets/greenXimo.PNG";
import { mockServices } from "../../data/services";
import useAuth from "../../hooks/useAuth";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Pricing", path: "/pricing" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

function ProfileIcon() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path
        strokeLinecap="round"
        d="M4.5 20c.8-3.4 3.4-5.2 7.5-5.2s6.7 1.8 7.5 5.2"
      />
    </svg>
  );
}

const serviceIcons = {
  "pos-system": "https://img.icons8.com/ios7/100/1A593B/pos-terminal--v1.png",
  "business-management": "https://img.icons8.com/ios7/100/1A593B/management.png",
  "workflow-automation": "https://img.icons8.com/ios7/100/1A593B/settings-3--v1.png",
  integrations: "https://img.icons8.com/ios7/100/1A593B/combine.png",
};

function ServiceIcon({ slug, className = "" }) {
  return (
    <img
      src={serviceIcons[slug] ?? serviceIcons["workflow-automation"]}
      alt=""
      aria-hidden="true"
      className={`h-5 w-5 object-contain ${className}`}
    />
  );
}

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
      const hero = document.getElementById("landing-hero");
      setIsPastHero(hero ? hero.getBoundingClientRect().bottom <= 0 : true);
    };
    requestAnimationFrame(handleScroll);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsServicesOpen(false);
  }, [location]);

  useEffect(() => {
    const closeMenu = (event) => {
      if (
        event.key === "Escape" ||
        (event.type === "mousedown" && !menuRef.current?.contains(event.target))
      )
        setIsServicesOpen(false);
    };
    document.addEventListener("keydown", closeMenu);
    document.addEventListener("mousedown", closeMenu);
    return () => {
      document.removeEventListener("keydown", closeMenu);
      document.removeEventListener("mousedown", closeMenu);
    };
  }, []);

  const isOverHero = isLanding && !isPastHero;
  const useLightControls = isOverHero || !isScrolled;
  const surface = isOverHero
    ? "border-transparent bg-transparent"
    : isScrolled
      ? "border-[#DDE5DE] bg-white"
      : "border-primary bg-primary";
  const navItem = useLightControls
    ? "text-white/78 hover:bg-white/10 hover:text-white"
    : "text-[#4B574E] hover:bg-[#E6F2E9] hover:text-primary";
  const activeNavItem = useLightControls
    ? "bg-white/12 text-white"
    : "bg-[#E6F2E9] text-primary";
  const loginStyle = useLightControls
    ? "border-white/40 text-white hover:border-white hover:bg-white/10"
    : "border-[#B7CEBD] text-primary hover:border-primary hover:bg-[#E6F2E9]";
  const ctaStyle = useLightControls
    ? "bg-white text-primary hover:bg-[#E6F2E9]"
    : "bg-primary text-white hover:bg-[#164F34]";
  const isServicesPage = location.pathname === "/services";
  const handleHomeClick = (event) => {
    if (location.pathname === "/") {
      event.preventDefault();
      document.getElementById("landing-hero")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      ref={menuRef}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${surface}`}
    >
      <nav className="container-default flex h-[72px] items-center justify-between md:h-20">
        <Link
          to="/"
          className="flex h-10 w-10 items-center justify-center overflow-hidden"
          aria-label="Ximo home" onClick={handleHomeClick}
        >
          <img
            src={useLightControls ? XimoIcon : XimoIconGreen}
            alt="Ximo"
            className={useLightControls ? "w-10 scale-150" : "w-8"}
          />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <div className="flex items-center gap-1">
            {isAuthenticated && (
              <Link
                to="/settings/billing"
                className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors ${location.pathname === "/settings/billing" ? activeNavItem : navItem}`}
              >
                Manage Plan
              </Link>
            )}
            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={link.path === "/" ? handleHomeClick : undefined}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors ${location.pathname === link.path ? activeNavItem : navItem}`}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setIsServicesOpen((open) => !open)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${isServicesPage || isServicesOpen ? activeNavItem : navItem}`}
              aria-expanded={isServicesOpen}
              aria-controls="services-menu"
            >
              Services
              <svg
                className={`h-3.5 w-3.5 transition-transform ${isServicesOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6 9 6 6 6-6"
                />
              </svg>
            </button>
            {navLinks.slice(2).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={link.path === "/" ? handleHomeClick : undefined}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors ${location.pathname === link.path ? activeNavItem : navItem}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <span
            className={`h-6 w-px ${useLightControls ? "bg-white/25" : "bg-[#D6DED7]"}`}
            aria-hidden="true"
          />
          <div className="flex items-center gap-3">
            <Link
              to="/pricing"
              className={`inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors ${ctaStyle}`}
            >
              Get Started
            </Link>
            <Link
              to="/login"
              aria-label="Log in"
              title="Log in"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${loginStyle}`}
            >
              <ProfileIcon />
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/login"
            aria-label="Log in"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${loginStyle}`}
          >
            <ProfileIcon />
          </Link>
          <button
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${useLightControls ? "border-white/40 text-white" : "border-[#B7CEBD] text-primary"}`}
            onClick={() => setIsMobileOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  isMobileOpen
                    ? "M6 18 18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isServicesOpen && (
          <motion.div
            id="services-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-full hidden max-h-[calc(100vh-80px)] overflow-y-auto border-t border-[#E1E6E1] bg-white shadow-2xl shadow-[#17241C]/10 md:block"
          >
            <div className="container-default py-5">
              <div className="grid gap-x-8 gap-y-5 md:grid-cols-2 lg:grid-cols-3">
                {mockServices.map((service) => (
                  <Link key={service.id} to={`/services?service=${service.slug}`} className="group flex gap-3 rounded-xl p-4 transition-colors hover:bg-[#E6F2E9]">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#E6F2E9] shadow-sm shadow-primary/5 transition-colors group-hover:bg-primary">
                      <ServiceIcon slug={service.slug} className="transition group-hover:brightness-0 group-hover:invert" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-[#17241C]">{service.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#657069]">{service.tagline}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-[#DDE5DE] bg-white md:hidden"
          >
            <div className="container-default space-y-1 py-4">
              {isAuthenticated && (
                <Link
                  to="/settings/billing"
                  className={`block rounded-lg px-3 py-3 text-sm font-semibold ${location.pathname === "/settings/billing" ? "bg-[#E6F2E9] text-primary" : "text-[#4B574E]"}`}
                >
                  Manage Plan
                </Link>
              )}
              {navLinks.slice(0, 2).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={link.path === "/" ? handleHomeClick : undefined}
                className={`block rounded-lg px-3 py-3 text-sm font-semibold ${location.pathname === link.path ? "bg-[#E6F2E9] text-primary" : "text-[#4B574E]"}`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => setIsServicesOpen((open) => !open)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-semibold ${isServicesPage ? "bg-[#E6F2E9] text-primary" : "text-[#4B574E]"}`}
              >
                Services
                <svg
                  className={`h-4 w-4 transition-transform ${isServicesOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m6 9 6 6 6-6"
                  />
                </svg>
              </button>
              {isServicesOpen && (
                <div className="space-y-3 px-3 pb-3">
                  {mockServices.map((service) => (
                    <Link key={service.id} to={`/services?service=${service.slug}`} className="flex items-center gap-3 rounded-xl bg-[#F4F8F4] px-4 py-3 text-sm font-semibold text-primary">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm shadow-primary/5">
                        <ServiceIcon slug={service.slug} />
                      </span>
                      <span>
                        {service.title}
                        <span className="mt-1 block text-xs font-normal text-[#657069]">{service.tagline}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              {navLinks.slice(2).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={link.path === "/" ? handleHomeClick : undefined}
                className={`block rounded-lg px-3 py-3 text-sm font-semibold ${location.pathname === link.path ? "bg-[#E6F2E9] text-primary" : "text-[#4B574E]"}`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/pricing"
                className="mt-3 flex h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


