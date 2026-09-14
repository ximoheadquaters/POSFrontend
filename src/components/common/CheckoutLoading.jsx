import { useEffect } from "react";

export default function CheckoutLoading() {
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
        <div className="relative mx-auto mb-7 flex h-20 w-20 items-center justify-center" aria-hidden="true">
          <div className="absolute inset-0 rounded-full border-2 border-[#E1E8E2] border-t-primary motion-safe:animate-spin" />
          <img src="/ximo-logo-mark.png" alt="" className="h-9 w-11 object-contain" />
        </div>
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
