export function AboutSection() {
  return (
    <section id="about-us" className="relative isolate overflow-hidden border-b border-[#30315b] bg-[#11142f] px-6 py-20 text-white lg:px-10 lg:py-28">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:72px_72px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 text-[min(48vw,44rem)] font-black leading-none tracking-[-0.14em] text-white/[0.035]" aria-hidden="true">FS</div>
      <div className="relative mx-auto grid min-h-[560px] max-w-7xl gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e782f5]">About us</div>
          <h2 className="mt-7 max-w-2xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-6xl lg:text-8xl">We make complexity feel <span className="text-[#d65be0]">possible.</span></h2>
          <p className="mt-8 max-w-lg text-lg leading-8 text-white/65">FSudoLab is a digital innovation studio for teams ready to turn ambitious ideas into useful, lasting products.</p>
        </div>
        <div className="border-l border-white/20 pl-6 sm:pl-10 lg:pl-16">
          <div className="flex items-center justify-between border-b border-white/15 pb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45"><span>01 / Our point of view</span><span>FS / 2026</span></div>
          <p className="max-w-xl py-10 text-3xl font-medium leading-tight tracking-[-0.04em] text-white sm:text-4xl">The best digital work is not made to fit everyone. It is engineered to fit you.</p>
          <div className="grid gap-8 border-t border-white/15 pt-7 sm:grid-cols-3">
            <div><h3 className="text-lg font-semibold text-white">Discover</h3><p className="mt-3 text-sm leading-6 text-white/55">Find the signal, sharpen the direction, and align everyone around the opportunity.</p></div>
            <div><h3 className="text-lg font-semibold text-white">Design</h3><p className="mt-3 text-sm leading-6 text-white/55">Create intuitive identities and experiences that people understand and remember.</p></div>
            <div><h3 className="text-lg font-semibold text-white">Deliver</h3><p className="mt-3 text-sm leading-6 text-white/55">Build dependable digital products that move from first release to lasting momentum.</p></div>
          </div>
        </div>
      </div>
    </section>
  )
}
