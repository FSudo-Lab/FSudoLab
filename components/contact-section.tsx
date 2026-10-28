import { ArrowUpRight } from 'lucide-react'

export function ContactSection() {
  return (
    <section id="contact" className="relative overflow-hidden bg-[#202456] px-6 py-20 text-white lg:px-10 lg:py-28">
      <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-[#ba31cd]/40 blur-3xl" />
      <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e782f5]">Have a challenge?</p>
          <h2 className="mt-4 max-w-xl text-5xl font-semibold leading-[1.02] tracking-[-0.05em]">Let&apos;s make the next thing matter.</h2>
        </div>
        <a href="mailto:hello@fsudolab.com" className="w-fit rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#24265b] transition hover:bg-[#f1dcff]">hello@fsudolab.com <ArrowUpRight className="ml-2 inline h-4 w-4" /></a>
      </div>
    </section>
  )
}
