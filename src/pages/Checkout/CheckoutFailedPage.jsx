import { Link } from "react-router-dom";

export default function CheckoutFailedPage() {
  return (
    <div className="bg-[#F8FAF8] min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#E1E8E2] shadow-sm text-center space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          !
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#1F2923]">
            We couldn’t finish setting up your store.
          </h1>
          <p className="text-xs text-[#5A685D]">
            An issue occurred during checkout verification or store provisioning. Your account remains safe.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/pricing"
            className="flex-1 min-h-[44px] flex items-center justify-center py-3 px-4 bg-primary text-white font-bold text-xs rounded-xl hover:bg-[#164F34] transition-colors"
          >
            Try Checkout Again
          </Link>
          <Link
            to="/contact"
            className="flex-1 min-h-[44px] flex items-center justify-center py-3 px-4 bg-white border border-[#E1E8E2] text-[#4B574E] font-bold text-xs rounded-xl hover:bg-[#F0F4F1] transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
