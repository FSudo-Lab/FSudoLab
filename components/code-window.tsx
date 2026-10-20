'use client'

import { useEffect, useState } from 'react'

const snippets = [
  ['const vision = await shape({', '  clarity: true,', '  energy: "high",', '})'],
  ['function launch(idea) {', '  return idea.makeUseful()', '}'],
  ['const studio = {', '  strategy: "sharp",', '  design: "human",', '  code: "solid",', '}'],
  ['export async function build() {', '  const signal = await discover()', '  return deliver(signal)', '}'],
]

export function CodeWindow() {
  const [snippetIndex, setSnippetIndex] = useState(0)
  const [visibleChars, setVisibleChars] = useState(0)
  const fullText = snippets[snippetIndex].join('\n')

  useEffect(() => {
    setVisibleChars(0)
    const typingTimer = window.setInterval(() => {
      setVisibleChars((current) => {
        if (current < fullText.length) return current + 1
        window.clearInterval(typingTimer)
        return current
      })
    }, 42)
    const reset = window.setTimeout(() => {
      setSnippetIndex((current) => (current + 1) % snippets.length)
    }, fullText.length * 42 + 2200)
    return () => {
      window.clearInterval(typingTimer)
      window.clearTimeout(reset)
    }
  }, [fullText])

  return (
    <div className="relative h-[360px] overflow-hidden rounded-[1.75rem] border border-[#30315b] bg-[#11142f] shadow-2xl shadow-[#24245d]/20">
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#191b3d] px-5 py-4">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-[11px] text-white/35">fsudolab / studio.ts</span>
      </div>
      <div className="h-[calc(100%-58px)] overflow-hidden p-6 font-mono text-sm leading-8 sm:p-8 sm:text-[15px]">
        <div className="mb-5 flex items-center gap-2 text-white/30"><span>01</span><span className="h-px w-8 bg-[#c13ad1]/70" /><span>building in public</span></div>
        <div className="whitespace-pre-wrap font-mono text-white/85">
          {fullText.slice(0, visibleChars).split('\n').map((line, lineIdx, arr) => (
            <div key={lineIdx} className="flex items-start gap-1">
              <span className="mr-4 inline-block w-3 text-right text-white/20">{String(lineIdx + 2).padStart(2, '0')}</span>
              <span className={lineIdx === 0 ? 'text-[#e68af0]' : 'text-[#c8c9ec]'}>
                {line}
                {lineIdx === arr.length - 1 && visibleChars < fullText.length && <span className="animate-pulse">▊</span>}
              </span>
            </div>
          ))}
          {visibleChars >= fullText.length && <span className="ml-4 inline-block h-5 w-2 animate-pulse bg-[#d03cd1]" aria-label="Typing" />}
        </div>
      </div>
      <div className="absolute -bottom-16 -right-16 size-48 rounded-full bg-[#b52ed0]/25 blur-3xl" />
    </div>
  )
}
