import Image from 'next/image'

const partners = [
  { label: 'CWM', image: '/partners/CWM.webp' },
  { label: 'Genzslangs', image: '/partners/genzslangs.webp' },
  { label: 'JuanT', image: '/partners/JuanT.webp' },
  { label: 'Jentaime', image: '/partners/jentaime_logo.webp' },
  { label: 'SmartFshop', image: '/partners/smartFshop.webp' },
  { label: 'Smart Farming', image: '/partners/smartfarming.webp' },
]

export function PartnersSection() {
  return (
    <section id="partners" className="overflow-hidden bg-white py-20 lg:py-28">
      <div className="mx-auto mb-8 max-w-7xl px-6 lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#a329c8]">Trusted collaborations</p>
        <p className="mt-4 max-w-md text-lg leading-7 text-[#5a5b70]">People we build with, growing a circle of ambitious teams building what comes next.</p>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 lg:gap-8 lg:px-10">
        {partners.map((partner) => <PartnerLogo key={partner.label} {...partner} />)}
      </div>
    </section>
  )
}

function PartnerLogo({ label, image }: { label: string; image: string }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center transition">
      <Image src={image} alt={`${label} logo`} width={190} height={96} className="h-16 w-auto max-w-full object-contain lg:h-20" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
