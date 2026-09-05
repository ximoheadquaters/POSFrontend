import { Component } from "react";

export default class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[Ximo] render failure", {
      stage: "render",
      message: error?.message,
      componentStack: info?.componentStack,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-5 py-12 text-[#252B3A]">
        <section className="w-full max-w-lg rounded-3xl border border-[#E2E6EB] bg-white p-8 text-center shadow-[0_20px_60px_rgba(31,39,52,0.08)] sm:p-10">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#FCECEA] text-xl text-[#A13E35]">!</div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#1A593B]">Ximo workspace</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">This page needs a reload.</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#737D8C]">
            The application hit an unexpected rendering error. Your session is still protected; reload to try again.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1A593B] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(26,89,59,0.16)] transition hover:bg-[#154A31]"
          >
            Reload application
          </button>
        </section>
      </main>
    );
  }
}