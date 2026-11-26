// All storytelling copy lives here, so text can be edited without touching layout code.
// Blob positions per section and screen size live in components/blob/config.ts.

export const story = {
  hero: {
    title: 'Bring us the',
    accent: 'rough idea.',
    body: 'We’re FSudoLab. We design and build digital products, from the first sketch to the working release.',
    primary: 'See our work', // → #work, the finished featured project
    secondary: 'Start a project', // → #contact
    scrollCue: 'Scroll — the story begins',
  },
  spark: {
    chapter: 'Chapter 01 — The spark',
    title: 'Every great product begins as something',
    accent: 'unformed.',
    body: 'A hunch. A problem that will not go away. A shape without edges. That is exactly where we like to start.',
    bg: '#0f1230',
  },
  method: {
    chapter: 'Chapter 02 — The method',
    title: 'We make complexity feel',
    accent: 'possible.',
    body: 'FSudoLab is a digital innovation studio for teams ready to turn ambitious ideas into useful, lasting products.',
    quote: 'The best digital work is not made to fit everyone. It is engineered to fit you.',
    bg: '#11142f',
    steps: [
      { name: 'Discover', text: 'Find the signal, sharpen the direction, and align everyone around the opportunity.' },
      { name: 'Design', text: 'Create intuitive identities and experiences that people understand and remember.' },
      { name: 'Deliver', text: 'Build dependable digital products that move from first release to lasting momentum.' },
    ],
  },
  // Selected work: the featured project the Deliver box turns into. Swap in a client project
  // (image 16:10 in /public/work/, detailOrigin = the spot the close-up starts on) when you have one.
  work: {
    chapter: 'Selected work',
    project: 'FSudoLab website',
    tag: 'Studio project',
    summary: 'A young studio has seconds to explain itself, so we turned our homepage into a short scroll story that shows a rough idea becoming a real product.',
    image: '/work/fsudolab-hero.webp',
    imageAlt: 'The FSudoLab homepage hero: “Bring us the rough idea.” beside the purple blob',
    address: 'fsudolab.com',
    detailOrigin: '86% 8.6%', // zoom origin that centres the 2.6× close-up on the hero headline
    link: '',
    linkLabel: 'View case study',
    bg: '#fbfafc',
  },
  // "What we offer" — shown right after Selected work. Each service has an example of what you get.
  services: {
    chapter: 'What we offer',
    title: 'From first idea to',
    accent: 'lasting product.',
    body: 'Pick one step or bring us in for the whole journey. Every engagement ends with something real you can use.',
    bg: '#11142f',
    items: [
      {
        name: 'Strategy & discovery',
        text: 'We dig into the problem, the people and the market until the direction is obvious.',
        example: 'A one-week discovery sprint that turns a rough idea into a clear brief, user flows and a roadmap.',
      },
      {
        name: 'Brand & product design',
        text: 'Identities and interfaces people understand at a glance and remember afterwards.',
        example: 'A logo, colour and type system plus clickable app screens, ready to test with real users.',
      },
      {
        name: 'Web & mobile development',
        text: 'Fast, dependable websites, web apps and mobile apps, built to grow with you.',
        example: 'A booking web app with an admin dashboard and an Android/iOS companion app.',
      },
      {
        name: 'Launch & care',
        text: 'We ship, measure and keep improving, so the product keeps its momentum after launch.',
        example: 'Store release, analytics set-up and monthly updates with new features and fixes.',
      },
    ],
  },
  // The team film: its own full-screen scene right before "Meet our team".
  film: {
    chapter: 'The people behind it',
    title: 'This is FSudoLab.',
    body: 'A small team that turns rough ideas into products people use.',
    label: 'The FSudoLab team',
    src: '/video/fsudolab_team.MP4',
    bg: '#0f1230',
  },
  // "Meet our team": one card per member.
  // To add a photo, put it in /public/team/ and set photo: '/team/name.webp'.
  insights: {
    chapter: 'Chapter 04 — The people behind it',
    title: 'Meet our team',
    body: 'The people turning hunches into shipped products. Keep scrolling to meet them.',
    bg: '#0f1230',
    members: [
      { name: 'Team member', role: 'Project manager', photo: '' },
      { name: 'Team member', role: 'Lead developer', photo: '' },
      { name: 'Team member', role: 'UI/UX designer', photo: '' },
      { name: 'Team member', role: 'Full-stack developer', photo: '' },
      { name: 'Team member', role: 'Quality assurance', photo: '' },
    ],
  },
  // "Our story": the paragraph lights up word by word as you scroll; chips float around it.
  ourStory: {
    chapter: 'Our story',
    text: 'FSudoLab started with a few late nights and a simple belief: the best digital work is not made to fit everyone, it is engineered to fit you. We are strategists, designers and engineers who start with a hunch, shape it together with you, and build it to last.',
    chips: ['Strategy', 'Design', 'Technology'],
    bg: '#f7f3fb',
  },
  // Partners strip: each logo opens a pop-up. Fill in `about` (who they are) and `together`
  // (what you built with them); empty fields are simply left out of the pop-up.
  partners: {
    chapter: 'Chapter 05 — The circle',
    title: 'Trusted collaborations',
    body: 'People we build with, growing a circle of ambitious teams building what comes next. Tap a logo to meet them.',
    bg: '#0f1230',
    items: [
      { name: 'CWM', logo: '/partners/CWM.webp', kind: 'Collaboration', about: '', together: '', link: '' },
      { name: 'Genzslangs', logo: '/partners/genzslangs.webp', kind: 'Collaboration', about: '', together: '', link: '' },
      { name: 'JuanT', logo: '/partners/JuanT.webp', kind: 'Collaboration', about: '', together: '', link: '' },
      { name: 'Jentaime', logo: '/partners/jentaime_logo.webp', kind: 'Collaboration', about: '', together: '', link: '' },
      { name: 'SmartFshop', logo: '/partners/smartFshop.webp', kind: 'Collaboration', about: '', together: '', link: '' },
      { name: 'Smart Farming', logo: '/partners/smartfarming.webp', kind: 'Collaboration', about: '', together: '', link: '' },
      { name: 'Amen-Matt', logo: '/partners/Amen-Matt.webp', kind: 'Collaboration', about: '', together: '', link: '' },
    ],
  },
  // Testimonials: PLACEHOLDERS — replace each quote, name and role with a real one (and get the
  // person's permission before publishing it). `partner` should match a name in partners.items.
  testimonials: {
    chapter: 'In their words',
    title: 'What our partners say',
    bg: '#0f1230',
    items: [
      { quote: 'Placeholder testimonial. Replace this with a real quote from a partner about what it was like to work with FSudoLab.', name: 'Client name', role: 'Role, Company', partner: 'CWM' },
      { quote: 'Placeholder testimonial. A sentence or two on the result you delivered together works best — keep it short and specific.', name: 'Client name', role: 'Role, Company', partner: 'Smart Farming' },
      { quote: 'Placeholder testimonial. Ask a partner what changed for them after the launch, and put their answer here.', name: 'Client name', role: 'Role, Company', partner: 'JuanT' },
      { quote: 'Placeholder testimonial. One honest line from a happy partner beats a long paragraph.', name: 'Client name', role: 'Role, Company', partner: 'Genzslangs' },
    ],
  },
  contact: {
    chapter: 'Chapter 06 — Your turn',
    title: 'What are you working on?',
    email: 'hello@fsudolab.com',
    bg: '#1b1e4b',
  },
}
