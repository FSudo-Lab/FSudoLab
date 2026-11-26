import { story } from '@/lib/story-content'

export function VideoSection() {
  const c = story.insights
  return (
    <section id="insights" data-bg={c.bg} data-theme="light" data-blob-anchor="insights" className="relative z-[2] px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <p data-reveal className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a329c8]">{c.chapter}</p>
        <div data-reveal className="mb-8 mt-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <h2 className="text-4xl font-semibold tracking-[-0.05em] text-[#11142f] sm:text-5xl">{c.title}</h2>
          <p className="max-w-sm text-lg leading-7 text-[#5a5b70]">{c.body}</p>
        </div>
        <video id="insights-video" playsInline data-reveal className="aspect-video w-full rounded-2xl border border-[#e7e2ee] bg-black object-cover shadow-[0_24px_60px_rgba(37,28,74,0.18)]" controls controlsList="nodownload noremoteplayback" disablePictureInPicture preload="metadata">
          <source src="/video/fsudolab_team.MP4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  )
}
