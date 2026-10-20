import { CodeWindow } from '@/components/code-window'

export function ProjectsSection() {
  return (
    <section id="projects" className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#a329c8]">Selected work</p>
        <p className="mt-4 max-w-md text-lg leading-7 text-[#5a5b70]">Ideas in motion, translated into useful digital experiences.</p>
      </div>
      <CodeWindow />
    </section>
  )
}
