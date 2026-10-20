export function VideoSection() {
  return (
    <section id="video" className="bg-[#fbfafc] px-6 py-16 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#a329c8]">Inside FSudoLab</p>
        <video className="aspect-video w-full rounded-sm border border-[#e7e2ee] bg-black object-cover shadow-[0_16px_40px_rgba(37,28,74,0.08)]" controls controlsList="nodownload noremoteplayback" disablePictureInPicture preload="metadata">
          <source src="/video/fsudolab_team.MP4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  )
}
