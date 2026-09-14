import { useEffect, useRef } from "react";
import lottie from "lottie-web/build/player/lottie_light";
import checkoutDots from "./checkoutDots";

export default function CheckoutLoading() {
  const animationRef = useRef(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animation = lottie.loadAnimation({
      container: animationRef.current,
      renderer: "svg",
      loop: true,
      autoplay: !reducedMotion.matches,
      animationData: structuredClone(checkoutDots),
    });
    const updateMotion = () => {
      if (reducedMotion.matches) animation.goToAndStop(0, true);
      else animation.play();
    };
    reducedMotion.addEventListener("change", updateMotion);
    return () => {
      reducedMotion.removeEventListener("change", updateMotion);
      animation.destroy();
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-[58px] z-40 flex items-center justify-center bg-[#F8FAF8] px-6 md:top-[62px] lg:top-[67px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="max-w-sm text-center">
        <div ref={animationRef} className="mx-auto mb-7 h-20 w-[120px]" aria-hidden="true" />
        <h1 className="text-2xl font-bold tracking-tight text-[#1F2923]">
          Preparing your plan
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#5A685D]">
          Just a moment while we get everything ready for your store.
        </p>
      </div>
    </div>
  );
}
