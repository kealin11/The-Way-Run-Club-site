/**
 * THE WAY RUN CLUB — website
 * ---------------------------------------------------------------------------
 * Everything (content, components, styles, form logic) lives in this one file.
 *
 *  1. CONFIG ........ edit links, meeting details and the form endpoint here
 *  2. PHOTOS ........ edit/replace image slots here (drop files in /public/photos)
 *  3. STYLES ........ one CSS string injected via <style>
 *  4. HELPERS ....... tiny hooks + <Photo/> component
 *  5. SECTIONS ...... Nav, Hero, About, Experience, Gallery, Community, Join form, Footer
 *
 * Brand palette (sampled from the logo):
 *   rose  #D49CA8  — "THE WAY" lettering
 *   blush #F8B8BC  — sun / dune shading
 *   peach #E8A890  — "RUN" lettering + runner
 *   cream #FCF0EA  — logo background glow
 *   ink   #150A0F  — deep aubergine-black base (editorial dark, per references)
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";

/* ==========================================================================
   1. CONFIG — placeholders are clearly marked. Replace them with real info.
   ========================================================================== */

const CLUB = {
  name: "The Way Run Club",
  tagline: "Find your pace. Find your people.",
  // Used for the copyright line
  year: new Date().getFullYear(),
};

/** Community links. (If a value is ever not a full https:// link, its button shows "link coming soon".) */
const LINKS = {
  whatsapp: "https://chat.whatsapp.com/B871BbONyNsLUWSr6QGJCJ?mode=gi_t",
  instagram: "https://www.instagram.com/the.wayrunclub/",
  strava:
    "https://www.strava.com/clubs/1998192?share_sig=0A9497A31772631924&_branch_match_id=1654056852263908886&_branch_referrer=H4sIAAAAAAAAA8soKSkottLXLy4pSixL1EssKNDLyczL1jf3LcsLKyt1TjVMsq8rSk1LLSrKzEuPTyrKLy9OLbJ1zijKz00FALQuTmQ9AAAA",
};

/** Run details shown in the hero and "What it's like" section. */
const MEETUP = {
  day: "Every Saturday",
  warmup: "6:00 AM",
  start: "6:30 AM",
  place: "Pantry, Bassonia",
  distances: "3 km walk · 5 km run · 7 km run",
};

/**
 * Form submissions are sent to Formspree.
 * Set VITE_FORMSPREE_ENDPOINT in a `.env` file (see README.md). If it is not set,
 * the form will tell the visitor that sign-ups are not connected — it will NEVER
 * pretend a submission was saved.
 */
const FORM_ENDPOINT = (import.meta.env.VITE_FORMSPREE_ENDPOINT ?? "").trim();

const isLinkSet = (url: string) => /^https?:\/\//i.test(url) || /^(mailto|tel):/i.test(url);

/* ==========================================================================
   2. PHOTOS — images are served from /public. Update these slots when photos
      change. Until a file exists, a branded placeholder tile is shown instead.
   ========================================================================== */

type Tone = "blush" | "rose" | "peach" | "dusk";
interface PhotoSlot {
  file: string;
  alt: string;
  caption: string;
  tone: Tone;
}

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

const PHOTOS = {
  hero: { file: "IMG_5450.jpeg", alt: "The Way Run Club group gathered for a running event", caption: "The club together", tone: "dusk" },
  about1: { file: "IMG_5447.jpeg", alt: "Two club members smiling together", caption: "Club members", tone: "blush" },
  about2: { file: "IMG_5446.jpeg", alt: "Two members jogging together", caption: "Running together", tone: "rose" },
  about3: { file: "IMG_5448.jpeg", alt: "Two runners getting ready to run", caption: "Ready to run", tone: "peach" },
  exp1: { file: "IMG_5442.jpeg", alt: "Club members gathering at an event", caption: "Meet the club", tone: "rose" },
  exp2: { file: "IMG_5441.jpeg", alt: "Members relaxing together over coffee", caption: "After the run", tone: "peach" },
  g1: { file: "IMG_5440.jpeg", alt: "Members meeting before a club event", caption: "Before we head out", tone: "blush" },
  g2: { file: "IMG_5446.jpeg", alt: "Two members jogging together", caption: "Out for a run", tone: "dusk" },
  g3: { file: "IMG_5445.jpeg", alt: "Two members sharing a post-run moment", caption: "Good run, good company", tone: "rose" },
  g4: { file: "IMG_5450.jpeg", alt: "The club gathered together at a running event", caption: "The whole club", tone: "peach" },
  g5: { file: "IMG_5447.jpeg", alt: "Two club members standing together", caption: "Club friends", tone: "blush" },
  g6: { file: "IMG_5443.jpeg", alt: "Members sitting together after a run", caption: "Time to catch up", tone: "dusk" },
  g7: { file: "IMG_5449.jpeg", alt: "Three members posing together", caption: "Our community", tone: "peach" },
  g8: { file: "IMG_5448.jpeg", alt: "Two runners getting ready to run", caption: "Run together", tone: "rose" },
  g9: { file: "IMG_5444.jpeg", alt: "Members sharing a meal together", caption: "Together after the run", tone: "blush" },
  cta: { file: "IMG_5442.jpeg", alt: "Club members gathering at an event", caption: "The club together", tone: "dusk" },
} satisfies Record<string, PhotoSlot>;

/** Gallery order + the grid shape each tile takes (see .g-* classes in CSS). */
const GALLERY: { slot: PhotoSlot; shape: "tall" | "wide" | "sq" | "big" }[] = [
  { slot: PHOTOS.g1, shape: "tall" },
  { slot: PHOTOS.g2, shape: "wide" },
  { slot: PHOTOS.g3, shape: "sq" },
  { slot: PHOTOS.g4, shape: "big" },
  { slot: PHOTOS.g5, shape: "tall" },
  { slot: PHOTOS.g6, shape: "sq" },
  { slot: PHOTOS.g7, shape: "sq" },
  { slot: PHOTOS.g8, shape: "wide" },
  { slot: PHOTOS.g9, shape: "sq" },
];

/* ==========================================================================
   3. STYLES
   ========================================================================== */

const CSS = String.raw`
:root{
  --ink:#150a0f; --ink-2:#1d1017; --ink-3:#2a1a23;
  --cream:#fcf0ea; --blush:#f8b8bc; --rose:#d49ca8; --peach:#e8a890;
  --muted:rgba(252,240,234,.62); --line:rgba(252,240,234,.16);
  --display:"Anton","Impact",sans-serif;
  --serif:"Cormorant Garamond",Georgia,serif;
  --sans:"Manrope",system-ui,-apple-system,"Segoe UI",sans-serif;
  --pad:clamp(20px,5vw,72px);
  --nav-h:76px;
  --ease:cubic-bezier(.2,.7,.2,1);
}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:calc(var(--nav-h) + 8px);-webkit-text-size-adjust:100%}
body{margin:0;background:var(--ink);color:var(--cream);font-family:var(--sans);font-size:16px;line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit;cursor:pointer}
:focus-visible{outline:2px solid var(--blush);outline-offset:3px}
.skip{position:absolute;left:-999px;top:8px;background:var(--cream);color:var(--ink);padding:10px 16px;z-index:200;font-weight:700}
.skip:focus{left:8px}
::selection{background:var(--blush);color:var(--ink)}

/* grain overlay for the editorial/film feel */
.grain{position:fixed;inset:-50%;pointer-events:none;z-index:90;opacity:.07;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}

/* type */
.display{font-family:var(--display);font-weight:400;text-transform:uppercase;line-height:.92;letter-spacing:.005em;margin:0}
.serif{font-family:var(--serif);font-style:italic;font-weight:500;text-transform:none;letter-spacing:0}
.eyebrow{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;font-size:12px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--blush);margin:0 0 clamp(22px,3vw,34px)}
.eyebrow::after{content:"";height:1px;width:56px;background:var(--rose)}
.wrap{padding-inline:var(--pad);max-width:1480px;margin-inline:auto}
section{position:relative}

/* reveal on scroll */
.reveal{opacity:0;transform:translateY(34px);transition:opacity .9s var(--ease),transform .9s var(--ease);transition-delay:var(--d,0s)}
.reveal.in{opacity:1;transform:none}

/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:54px;padding:0 30px;border-radius:999px;border:1.5px solid var(--cream);
  font-weight:800;font-size:13px;letter-spacing:.14em;text-transform:uppercase;background:transparent;position:relative;overflow:hidden;isolation:isolate;transition:color .35s var(--ease),border-color .35s,transform .35s var(--ease)}
.btn::before{content:"";position:absolute;inset:0;background:var(--cream);transform:translateY(101%);transition:transform .45s var(--ease);z-index:-1}
.btn:hover::before{transform:none}
.btn:hover{color:var(--ink)}
.btn.solid{background:var(--blush);border-color:var(--blush);color:var(--ink)}
.btn.solid::before{background:var(--cream)}
.btn .arrow{transition:transform .35s var(--ease)}
.btn:hover .arrow{transform:translateX(5px)}
.btn[disabled]{opacity:.6;cursor:progress}

/* ===== NAV ===== */
.nav{position:fixed;inset:0 0 auto 0;height:var(--nav-h);z-index:100;display:flex;align-items:center;transition:background .35s,backdrop-filter .35s,border-color .35s;border-bottom:1px solid transparent}
.nav.scrolled{background:rgba(21,10,15,.78);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-color:var(--line)}
.nav .wrap{width:100%;display:flex;align-items:center;justify-content:space-between;gap:24px}
.brand{display:flex;align-items:center;gap:12px}
.brand img{width:46px;height:46px;border-radius:50%;background:var(--cream)}
.brand span{font-family:var(--display);text-transform:uppercase;font-size:20px;letter-spacing:.04em;line-height:1}
.nav-links{display:flex;gap:34px;list-style:none;margin:0;padding:0}
.nav-links a{font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);transition:color .25s;position:relative;padding:6px 0}
.nav-links a::after{content:"";position:absolute;left:0;bottom:0;height:1px;width:100%;background:var(--blush);transform:scaleX(0);transform-origin:left;transition:transform .4s var(--ease)}
.nav-links a:hover{color:var(--cream)}
.nav-links a:hover::after{transform:scaleX(1)}
.nav .btn{min-height:44px;padding:0 22px;font-size:12px;background:var(--cream);color:var(--ink);border-color:var(--cream)}
.nav .btn::before{background:var(--blush)}
.burger{display:none;width:48px;height:48px;border:1.5px solid var(--line);border-radius:50%;background:transparent;position:relative}
.burger i{position:absolute;left:14px;right:14px;height:1.5px;background:var(--cream);transition:transform .35s var(--ease),top .35s var(--ease),opacity .2s}
.burger i:nth-child(1){top:19px}.burger i:nth-child(2){top:27px}
.burger[aria-expanded="true"] i:nth-child(1){top:23px;transform:rotate(45deg)}
.burger[aria-expanded="true"] i:nth-child(2){top:23px;transform:rotate(-45deg)}
.drawer{position:fixed;inset:0;z-index:99;background:var(--ink);padding:calc(var(--nav-h) + 24px) var(--pad) 40px;display:flex;flex-direction:column;justify-content:space-between;
  clip-path:circle(0 at calc(100% - 48px) 38px);transition:clip-path .7s var(--ease);visibility:hidden}
.drawer.open{clip-path:circle(150% at calc(100% - 48px) 38px);visibility:visible}
.drawer ul{list-style:none;margin:0;padding:0}
.drawer li a{display:flex;align-items:baseline;gap:14px;font-family:var(--display);text-transform:uppercase;font-size:clamp(44px,13vw,72px);line-height:1.1;padding:6px 0;border-bottom:1px solid var(--line)}
.drawer li a small{font-family:var(--sans);font-size:12px;color:var(--rose);letter-spacing:.2em}
.drawer .btn{width:100%}

/* ===== HERO ===== */
.hero{min-height:100svh;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;padding-top:var(--nav-h);background:var(--ink)}
.hero-inner{position:relative;z-index:2;padding-bottom:clamp(28px,5vh,56px)}
.hero h1{font-size:clamp(70px,min(17vw,25vh),280px);color:var(--cream);margin:0 0 0 -.04em}
.hero h1 .line{display:block;overflow:hidden;white-space:nowrap;padding-top:.04em}
.hero h1 .line>span{display:block;transform:translateY(105%);animation:rise 1.1s var(--ease) forwards;animation-delay:var(--d,.2s)}
.hero h1 .outline{color:transparent;-webkit-text-stroke:2px var(--blush)}
.hero h1 .accent{font-family:var(--serif);font-style:italic;text-transform:none;font-weight:500;color:var(--blush);font-size:.3em;letter-spacing:0;margin-left:.2em;vertical-align:.1em}
@keyframes rise{to{transform:none}}
.hero-row{display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(24px,5vw,80px);align-items:end;margin-top:clamp(22px,4vh,44px)}
.hero-copy p{margin:0 0 28px;max-width:46ch;font-size:clamp(16px,1.5vw,19px);color:rgba(252,240,234,.86)}
.hero-cta{display:flex;flex-wrap:wrap;gap:14px}
.hero-meta{justify-self:end;display:grid;grid-template-columns:repeat(3,auto);gap:0 34px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
.hero-meta b{display:block;color:var(--cream);font-weight:700;letter-spacing:.08em;margin-top:4px;font-size:12px}
.stamp{position:absolute;right:var(--pad);top:calc(var(--nav-h) + 28px);z-index:2;width:clamp(96px,11vw,150px);aspect-ratio:1;animation:spin 28s linear infinite}
.stamp img{width:100%;height:100%;border-radius:50%;background:var(--cream);box-shadow:0 0 0 6px rgba(252,240,234,.14)}
@keyframes spin{to{transform:rotate(360deg)}}
.scroll-cue{position:absolute;left:50%;bottom:18px;z-index:2;transform:translateX(-50%);font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:var(--muted);display:none}

/* ===== MARQUEE ===== */
.marquee{border-block:1px solid var(--line);overflow:hidden;background:var(--ink-2);padding:20px 0}
.marquee-track{display:flex;width:max-content;animation:marq 38s linear infinite}
.marquee:hover .marquee-track{animation-play-state:paused}
.marquee-track span{font-family:var(--display);text-transform:uppercase;font-size:clamp(28px,4.4vw,56px);padding-right:.8em;white-space:nowrap;display:flex;align-items:center;gap:.8em}
.marquee-track span em{font-family:var(--serif);color:var(--blush);text-transform:none;font-size:1.05em}
.marquee-track span i{width:.32em;height:.32em;border-radius:50%;background:var(--peach);display:inline-block}
@keyframes marq{to{transform:translateX(-50%)}}

/* ===== PHOTO + PLACEHOLDER ===== */
.photo{position:relative;overflow:hidden;background:var(--ink-3)}
.photo img{width:100%;height:100%;object-fit:cover;transition:transform 1.2s var(--ease),filter .6s}
.ph{position:absolute;inset:0;display:flex;align-items:flex-end;padding:16px;overflow:hidden;
  background:
    radial-gradient(120% 90% at 78% 12%,var(--c1),transparent 58%),
    radial-gradient(90% 80% at 12% 95%,var(--c2),transparent 60%),
    var(--ink-3)}
.ph::before{content:"";position:absolute;inset:-20%;opacity:.5;filter:blur(3px);
  background:repeating-linear-gradient(100deg,transparent 0 22px,rgba(252,240,234,.09) 22px 26px,transparent 26px 70px,rgba(21,10,15,.25) 70px 80px)}
.ph span{position:relative;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:rgba(252,240,234,.78);background:rgba(21,10,15,.5);padding:6px 10px;backdrop-filter:blur(4px);border-radius:2px;max-width:100%}
.tone-blush{--c1:rgba(248,184,188,.75);--c2:rgba(212,156,168,.45)}
.tone-rose{--c1:rgba(212,156,168,.8);--c2:rgba(232,168,144,.35)}
.tone-peach{--c1:rgba(232,168,144,.8);--c2:rgba(248,184,188,.4)}
.tone-dusk{--c1:rgba(212,156,168,.55);--c2:rgba(232,168,144,.5)}
/* consistent treatment: slightly warm, soft contrast */
.photo img{filter:saturate(.92) contrast(1.04)}

/* ===== ABOUT ===== */
.about{padding:clamp(80px,12vw,180px) 0}
.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(32px,7vw,120px);align-items:start}
.about h2{font-size:clamp(44px,6vw,104px)}
.about h2 .serif{color:var(--blush);font-size:1.02em}
.about-text p{color:var(--muted);font-size:clamp(16px,1.35vw,19px);max-width:52ch}
.about-text p.lead{color:var(--cream);font-size:clamp(19px,1.9vw,26px);line-height:1.45;margin-top:0}
.pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:38px;border-top:1px solid var(--line)}
.pillars div{padding:20px 18px 0 0;font-size:13px;color:var(--muted)}
.pillars b{display:block;font-family:var(--display);font-weight:400;text-transform:uppercase;font-size:22px;color:var(--cream);margin-bottom:4px;letter-spacing:.02em}
/* Layered collage: a fixed aspect ratio keeps every layer proportional at any column width */
.about-collage{position:relative;aspect-ratio:1/1.12;width:100%}
.about-collage .photo{position:absolute}
.about-collage .a1{top:0;left:0;width:66%;aspect-ratio:4/5}
.about-collage .a2{top:27%;right:0;width:42%;aspect-ratio:3/4;box-shadow:0 0 0 10px var(--ink)}
.about-collage .a3{bottom:0;left:6%;width:38%;aspect-ratio:1;box-shadow:0 0 0 10px var(--ink)}
.about-collage .badge{position:absolute;right:7%;bottom:3%;width:clamp(92px,9vw,130px);aspect-ratio:1;border-radius:50%;background:var(--blush);color:var(--ink);display:grid;place-items:center;text-align:center;font-family:var(--serif);font-style:italic;font-size:clamp(15px,1.5vw,20px);line-height:1.05;padding:10px;transform:rotate(-8deg)}
.about-collage .photo:hover img{transform:scale(1.06)}
.about-photo-lead{display:contents}

/* ===== EXPERIENCE ===== */
.exp{padding:clamp(70px,10vw,150px) 0;background:var(--ink-2);border-block:1px solid var(--line)}
.exp-head{display:flex;justify-content:space-between;align-items:flex-end;gap:32px;flex-wrap:wrap;margin-bottom:clamp(36px,6vw,80px)}
.exp-head h2{font-size:clamp(40px,7.6vw,124px)}
.exp-head h2 span{color:var(--blush)}
.exp-head p{max-width:38ch;color:var(--muted);margin:0}
.exp-layout{display:grid;grid-template-columns:1.25fr 1fr;gap:clamp(28px,6vw,100px);align-items:start}
.exp-list{list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}
.exp-item{display:grid;grid-template-columns:64px 1fr auto;gap:18px;align-items:baseline;padding:26px 0;border-bottom:1px solid var(--line);cursor:default;transition:padding .45s var(--ease),background .3s}
.exp-item .n{font-size:12px;font-weight:800;letter-spacing:.2em;color:var(--rose)}
.exp-item h3{margin:0;font-family:var(--display);font-weight:400;text-transform:uppercase;font-size:clamp(26px,3.6vw,52px);line-height:1;transition:color .3s,transform .45s var(--ease)}
.exp-item p{grid-column:2;margin:8px 0 0;color:var(--muted);max-width:50ch;font-size:15px}
.exp-item .go{font-size:22px;color:var(--blush);opacity:0;transform:translateX(-10px);transition:all .4s var(--ease);grid-row:1;grid-column:3}
.exp-item:hover,.exp-item:focus-within{padding-left:14px}
.exp-item:hover h3{color:var(--blush)}
.exp-item:hover .go{opacity:1;transform:none}
.exp-side{position:sticky;top:calc(var(--nav-h) + 24px);display:grid;gap:18px}
.exp-side .photo{aspect-ratio:4/5}
.exp-side .photo+.photo{aspect-ratio:16/10;margin-left:22%;margin-top:-14%;box-shadow:0 0 0 10px var(--ink-2)}
.meet{margin-top:clamp(40px,6vw,80px);display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line)}
.meet div{padding:clamp(18px,2vw,26px) clamp(18px,2vw,26px);background:var(--ink-2)}
.meet small{display:block;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--rose);font-weight:700;margin-bottom:6px}
.meet b{font-weight:600;font-size:15px;overflow-wrap:anywhere}

/* ===== GALLERY ===== */
.gallery{padding:clamp(80px,11vw,160px) 0}
.gallery-head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;margin-bottom:clamp(28px,4vw,56px)}
.gallery-head h2{font-size:clamp(46px,9vw,150px)}
.gallery-head h2 .outline{color:transparent;-webkit-text-stroke:1.5px var(--blush)}
.gallery-head p{max-width:34ch;margin:0;color:var(--muted)}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:repeat(4,clamp(150px,19vw,300px));gap:clamp(8px,1.2vw,16px);list-style:none;margin:0;padding:0}
.tile{position:relative;padding:0;border:0;background:none;overflow:hidden;text-align:left;display:block;width:100%;height:100%}
.tile .photo{position:absolute;inset:0}
/* Explicit placement (4 cols x 4 rows = 16 cells, 9 tiles) so the grid is always perfectly filled.
   grid-area: row-start / col-start / row-end / col-end */
.grid>li{list-style:none;min-width:0;min-height:0}
.grid>li:nth-child(1){grid-area:1/1/3/2}
.grid>li:nth-child(2){grid-area:1/2/2/4}
.grid>li:nth-child(3){grid-area:1/4/2/5}
.grid>li:nth-child(4){grid-area:2/2/4/4}
.grid>li:nth-child(5){grid-area:2/4/4/5}
.grid>li:nth-child(6){grid-area:3/1/4/2}
.grid>li:nth-child(7){grid-area:4/1/5/2}
.grid>li:nth-child(8){grid-area:4/2/5/4}
.grid>li:nth-child(9){grid-area:4/4/5/5}
.tile .cap{position:absolute;left:0;right:0;bottom:0;padding:34px 16px 14px;background:linear-gradient(0deg,rgba(21,10,15,.85),transparent);font-size:11px;letter-spacing:.18em;text-transform:uppercase;font-weight:700;opacity:0;transform:translateY(10px);transition:all .45s var(--ease);display:flex;justify-content:space-between;pointer-events:none}
.tile:hover .cap,.tile:focus-visible .cap{opacity:1;transform:none}
.tile:hover img{transform:scale(1.07);filter:saturate(1.05) contrast(1.06)}

/* lightbox */
.lb{position:fixed;inset:0;z-index:150;background:rgba(21,10,15,.96);display:grid;grid-template-rows:auto 1fr auto;padding:16px;animation:fade .3s}
@keyframes fade{from{opacity:0}}
.lb-top,.lb-bot{display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.lb-stage{position:relative;min-height:0;display:grid;place-items:center;padding:12px 0}
.lb-stage .photo{width:min(1100px,100%);height:100%;max-height:100%;background:transparent}
.lb-stage .photo img{object-fit:contain}
.lb-stage .ph{position:relative;width:100%;height:100%;min-height:240px}
.icon-btn{width:48px;height:48px;border-radius:50%;border:1.5px solid var(--line);background:transparent;display:grid;place-items:center;font-size:20px;transition:background .25s,color .25s}
.icon-btn:hover{background:var(--cream);color:var(--ink)}

/* ===== COMMUNITY ===== */
.community{padding:clamp(70px,10vw,150px) 0;background:var(--blush);color:var(--ink);overflow:hidden}
.community .eyebrow{color:var(--ink)}.community .eyebrow::after{background:var(--ink)}
.community h2{font-size:clamp(50px,10.5vw,170px);margin-bottom:clamp(28px,5vw,64px)}
.community h2 .serif{color:var(--ink);font-size:1.02em}
.social-list{list-style:none;margin:0;padding:0;border-top:2px solid var(--ink)}
.social{display:grid;grid-template-columns:72px 1fr auto;align-items:center;gap:20px;padding:clamp(18px,2.6vw,34px) 0;border-bottom:2px solid var(--ink);position:relative;isolation:isolate;transition:padding .5s var(--ease),color .4s}
.social::before{content:"";position:absolute;inset:0;background:var(--ink);transform:scaleY(0);transform-origin:bottom;transition:transform .5s var(--ease);z-index:-1}
.social:hover::before,.social:focus-visible::before{transform:scaleY(1)}
.social:hover,.social:focus-visible{color:var(--cream);padding-inline:clamp(12px,2vw,28px)}
.social svg{width:clamp(40px,5vw,60px);height:clamp(40px,5vw,60px)}
.social h3{margin:0;font-family:var(--display);text-transform:uppercase;font-weight:400;font-size:clamp(34px,6.4vw,100px);line-height:1}
.social p{margin:6px 0 0;font-size:14px;font-weight:500;opacity:.8}
.social .tag{font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;display:flex;align-items:center;gap:10px;border:1.5px solid currentColor;border-radius:999px;padding:12px 20px;white-space:nowrap}
.social.off{cursor:not-allowed}
.social.off .tag{opacity:.7;border-style:dashed}

/* ===== JOIN FORM ===== */
.join{padding:clamp(80px,12vw,180px) 0;position:relative}
.join-bg{position:absolute;inset:0;z-index:0;opacity:.28}
.join-bg .photo{position:absolute;inset:0}
.join-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,var(--ink),rgba(21,10,15,.55) 30%,rgba(21,10,15,.75) 70%,var(--ink))}
.join .wrap{position:relative;z-index:1}
.join-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:clamp(32px,7vw,120px);align-items:start}
.join-intro{position:sticky;top:calc(var(--nav-h) + 32px)}
.join-intro h2{font-size:clamp(50px,8vw,128px)}
.join-intro h2 .serif{color:var(--blush)}
.join-intro p{color:var(--muted);max-width:36ch;margin:24px 0 0}
.steps{list-style:none;padding:0;margin:34px 0 0;display:grid;gap:14px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;font-weight:700}
.steps li{display:flex;gap:14px;align-items:center;color:var(--muted)}
.steps li b{width:30px;height:30px;border-radius:50%;border:1.5px solid var(--rose);display:grid;place-items:center;font-size:11px;color:var(--blush)}

.form{background:rgba(29,16,23,.82);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--line);padding:clamp(22px,4vw,52px)}
.fieldset{border:0;padding:0;margin:0 0 clamp(30px,4vw,44px);min-width:0}
.fieldset>legend,.label{display:block;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin:0 0 14px;padding:0;line-height:1.5}
.fieldset>legend{float:left;width:100%;margin-bottom:16px}
.fieldset>legend+*{clear:both}
.q{display:inline-block;font-family:var(--display);font-size:20px;color:var(--rose);letter-spacing:.04em;font-weight:400;margin-right:12px;line-height:1}
.opt{display:inline-block;font-weight:500;letter-spacing:.06em;color:var(--muted);text-transform:none;font-size:12px;margin-left:8px}
.hint{font-size:13px;color:var(--muted);margin:-4px 0 12px}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.field{margin-bottom:clamp(24px,3vw,32px)}
.input,.select,.textarea{width:100%;background:transparent;border:0;border-bottom:1.5px solid var(--line);color:var(--cream);font:inherit;font-size:17px;padding:12px 0;border-radius:0;transition:border-color .3s;appearance:none;-webkit-appearance:none}
.textarea{border:1.5px solid var(--line);padding:14px;min-height:130px;resize:vertical}
.input::placeholder,.textarea::placeholder{color:rgba(252,240,234,.34)}
.input:focus,.select:focus,.textarea:focus{outline:0;border-color:var(--blush)}
.select{background-image:linear-gradient(45deg,transparent 50%,var(--blush) 50%),linear-gradient(135deg,var(--blush) 50%,transparent 50%);background-position:calc(100% - 14px) 50%,calc(100% - 8px) 50%;background-size:6px 6px;background-repeat:no-repeat;padding-right:30px}
.select option{background:var(--ink-2);color:var(--cream)}
[aria-invalid="true"]{border-color:#ff8f9d !important}
.err{color:#ffa3ae;font-size:13px;margin:8px 0 0;font-weight:600;display:flex;gap:8px}
.err::before{content:"!";width:17px;height:17px;border-radius:50%;background:#ffa3ae;color:var(--ink);display:grid;place-items:center;font-size:11px;font-weight:800;flex:none;margin-top:2px}

/* choice cards (radios) and chips (checkboxes) share a custom look but use real inputs */
.choices{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.choice{position:relative}
.choice input{position:absolute;opacity:0;inset:0;width:100%;height:100%;margin:0;cursor:pointer;z-index:2}
.choice span{display:flex;align-items:center;gap:12px;min-height:56px;padding:12px 16px;border:1.5px solid var(--line);font-weight:600;font-size:15px;transition:all .3s var(--ease);background:transparent}
.choice span::before{content:"";width:18px;height:18px;flex:none;border:1.5px solid var(--rose);border-radius:50%;transition:all .25s}
.choice input[type=checkbox]+span::before{border-radius:3px}
.choice:hover span{border-color:var(--rose)}
.choice input:checked+span{background:var(--blush);color:var(--ink);border-color:var(--blush)}
.choice input:checked+span::before{background:var(--ink);border-color:var(--ink);box-shadow:inset 0 0 0 3px var(--blush)}
.choice input:focus-visible+span{outline:2px solid var(--cream);outline-offset:3px}
.chips{display:flex;flex-wrap:wrap;gap:10px}
.chips .choice span{min-height:48px;padding:10px 20px;border-radius:999px}
.chips .choice span::before{display:none}
.chips .choice input:checked+span{box-shadow:none}
.other{margin-top:14px}
.form-foot{display:flex;flex-direction:column;gap:18px;align-items:flex-start;border-top:1px solid var(--line);padding-top:28px}
.form-foot small{color:var(--muted);font-size:12px;max-width:52ch}
.alert{width:100%;padding:16px 18px;border:1.5px solid;font-size:14px;font-weight:600}
.alert.bad{border-color:#ff8f9d;color:#ffc2c9;background:rgba(255,143,157,.08)}
.hp{position:absolute !important;left:-9999px;width:1px;height:1px;overflow:hidden}
.success{background:var(--blush);color:var(--ink);padding:clamp(30px,6vw,72px);text-align:left}
.success .big{font-size:clamp(46px,7vw,100px);margin-bottom:18px}
.success .big .serif{color:var(--ink)}
.success p{max-width:46ch;font-size:clamp(16px,1.5vw,19px);margin:0 0 26px}
.success .btn{border-color:var(--ink);color:var(--ink)}
.success .btn::before{background:var(--ink)}.success .btn:hover{color:var(--cream)}
.spinner{width:16px;height:16px;border-radius:50%;border:2px solid currentColor;border-right-color:transparent;animation:spin 0.8s linear infinite}

/* ===== FOOTER ===== */
.footer{border-top:1px solid var(--line);padding:clamp(56px,8vw,110px) 0 28px;background:var(--ink-2);overflow:hidden}
.foot-top{display:grid;grid-template-columns:auto 1fr auto;gap:clamp(24px,5vw,80px);align-items:center}
.foot-logo{width:clamp(110px,12vw,170px);height:auto;aspect-ratio:1;object-fit:cover;align-self:start;border-radius:50%;background:var(--cream)}
.brand img,.stamp img{object-fit:cover}
.foot-tag{font-size:clamp(32px,5vw,76px);margin:0}
.foot-tag .serif{color:var(--blush)}
.foot-links{display:grid;gap:8px;justify-items:start}
.foot-links a{font-size:12px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);transition:color .25s,transform .35s var(--ease)}
.foot-links a:hover{color:var(--blush);transform:translateX(6px)}
.foot-links a.off{opacity:.45;cursor:not-allowed}
.foot-links a.off:hover{color:var(--muted);transform:none}
.foot-word{font-family:var(--display);text-transform:uppercase;font-size:clamp(20px,7vw,120px);line-height:.95;text-align:center;margin:clamp(40px,6vw,80px) 0 0;color:transparent;-webkit-text-stroke:1.5px rgba(248,184,188,.4);white-space:normal}
.foot-bot{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:26px;padding-top:22px;border-top:1px solid var(--line);font-size:12px;color:var(--muted);letter-spacing:.06em}

/* ===== RESPONSIVE ===== */
@media (max-width:1020px){
  .nav-links,.nav .btn{display:none}
  .burger{display:block}
  .hero-row{grid-template-columns:1fr}
  .hero-meta{justify-self:start}
  .about-grid,.exp-layout,.join-grid{grid-template-columns:1fr}
  .exp-side,.join-intro{position:static}
  .exp-side{grid-template-columns:1fr 1fr;align-items:start}
  .exp-side .photo,.exp-side .photo+.photo{margin:0;aspect-ratio:4/3;box-shadow:none}
  /* tablet/mobile: about collage becomes a tidy 2-column grid instead of overlapping layers */
  .about-collage{min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .about-collage .photo{position:relative;inset:auto;width:auto !important;box-shadow:none !important}
  .about-collage .a1{grid-column:1/-1;aspect-ratio:16/10}
  .about-collage .a2,.about-collage .a3{aspect-ratio:1}
  .about-collage .badge{right:14px;top:14px;bottom:auto}
  .meet{grid-template-columns:repeat(2,minmax(0,1fr))}
  .meet div:last-child{grid-column:1/-1}
  .foot-top{grid-template-columns:auto 1fr}
  .foot-links{grid-column:1/-1;grid-auto-flow:column;justify-content:start;gap:26px}
  /* 2 columns x 8 rows = 16 cells, 9 tiles, fully filled */
  .grid{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(8,clamp(120px,27vw,230px))}
  .grid>li:nth-child(1){grid-area:1/1/3/2}
  .grid>li:nth-child(2){grid-area:1/2/2/3}
  .grid>li:nth-child(3){grid-area:2/2/3/3}
  .grid>li:nth-child(4){grid-area:3/1/5/3}
  .grid>li:nth-child(5){grid-area:5/1/7/2}
  .grid>li:nth-child(6){grid-area:5/2/6/3}
  .grid>li:nth-child(7){grid-area:6/2/7/3}
  .grid>li:nth-child(8){grid-area:7/1/8/3}
  .grid>li:nth-child(9){grid-area:8/1/9/3}
  .tile .cap{opacity:1;transform:none}
}
@media (max-width:640px){
  :root{--nav-h:68px}
  .brand span{font-size:17px}.brand img{width:40px;height:40px}
  .stamp{display:none}
  .hero h1{font-size:25vw}
  .hero h1 .outline{-webkit-text-stroke:1.5px var(--blush)}
  .hero h1 .accent{display:block;font-size:.36em;margin:.1em 0 0}
  .hero-cta .btn{flex:1 1 100%}
  .hero-meta{grid-template-columns:1fr 1fr;gap:14px 24px}
  .hero-meta>div:last-child{grid-column:1/-1}
  .eyebrow{letter-spacing:.16em;font-size:11px}
  .eyebrow::after{width:32px}
  .exp-head h2{max-width:none}
  .exp-item{gap:0 16px}
  .exp-item p{margin-top:10px}
  .exp-side .photo,.exp-side .photo+.photo{aspect-ratio:4/3}
  .meet{grid-template-columns:1fr}
  .row2{gap:0}
  .about-collage{gap:10px}
  .about-collage .a1{aspect-ratio:4/3}
  .about-collage .badge{width:86px;right:10px;top:10px}
  .pillars{grid-template-columns:1fr}
  .pillars div{padding:14px 0;border-bottom:1px solid var(--line)}
  .exp-item{grid-template-columns:44px 1fr}
  .exp-item .go{display:none}
  .exp-side{grid-template-columns:1fr}
  .social{grid-template-columns:48px 1fr}
  .social .tag{grid-column:1/-1;justify-self:start}
  .row2{grid-template-columns:1fr}
  .choices{grid-template-columns:1fr}
  .form-foot .btn{width:100%}
  .foot-top{grid-template-columns:1fr;justify-items:start}
  .foot-links{grid-auto-flow:row}
  .foot-bot{flex-direction:column}
  .lb{padding:10px}
}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  *,*::before,*::after{animation-duration:.001ms !important;animation-iteration-count:1 !important;transition-duration:.001ms !important}
  .reveal{opacity:1;transform:none}
  .hero h1 .line>span{transform:none}
}
`;

/* ==========================================================================
   4. HELPERS
   ========================================================================== */

/** Reveals any `.reveal` element as it scrolls into view. */
function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/**
 * Shows the photo file if it exists; otherwise a branded placeholder tile.
 * (So the site never shows a broken-image icon.)
 */
function Photo({ slot, className = "", eager = false, showLabel = true }: { slot: PhotoSlot; className?: string; eager?: boolean; showLabel?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`photo ${className}`}>
      {failed ? (
        <div className={`ph tone-${slot.tone}`} role="img" aria-label={slot.alt}>
          {showLabel && <span>Placeholder · replace with public/{slot.file}</span>}
        </div>
      ) : (
        <img
          src={asset(slot.file)}
          alt={slot.alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "auto"}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

/* Simple inline brand icons (no icon library needed) */
const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 21l1.65-4.9A8.5 8.5 0 1 1 8 19.4L3 21z" />
    <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1.2-1.4-2.1-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2.1L9 8.5z" />
  </svg>
);
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.4" cy="6.6" r=".6" fill="currentColor" />
  </svg>
);
const IconStrava = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M13 3l6 11h-4.2L13 10.6 11.2 14H7L13 3z" />
    <path d="M15 14l2.4 4.4L19.8 14" />
  </svg>
);

/* ==========================================================================
   5. DATA used by sections
   ========================================================================== */

const NAV = [
  { id: "about", label: "The Club" },
  { id: "experience", label: "The Run" },
  { id: "gallery", label: "Gallery" },
  { id: "community", label: "Community" },
];

const EXPERIENCE = [
  { t: "Group runs", d: "Every run is run together. Groups form naturally around pace, so you're never left behind and never running alone." },
  { t: "Meet new people", d: "Come for the run, stay for the conversation. Most friendships start somewhere around kilometre two." },
  { t: "Build consistency", d: "A standing time, a place to be, and people expecting you. That's the easiest way to make running a habit." },
  { t: "Improve your fitness", d: "Whether you're going from 1 km to 5 km or chasing a new personal best, there's a way to progress at your own speed." },
  { t: "Community events", d: "Races, challenges and special runs through the year. Details are shared in our WhatsApp community." },
  { t: "Life beyond the run", d: "Coffee after, plans on the weekend, a crew to cheer you on. The run is only half of it." },
];

const MARQUEE = ["All paces", "All welcome", "Run together", "Find your way", "Every kilometre counts", "Show up"];

/* ==========================================================================
   6. SECTIONS
   ========================================================================== */

function Nav({ onJoin }: { onJoin: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // lock body scroll + close on Escape when the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="wrap">
          <a href="#top" className="brand" aria-label={`${CLUB.name} — back to top`} onClick={() => setOpen(false)}>
            <img src={asset("logo.png")} alt="" width={46} height={46} />
            <span>{CLUB.name}</span>
          </a>
          <nav aria-label="Primary">
            <ul className="nav-links">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`}>{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <a href="#join" className="btn" onClick={onJoin}>
            Join the club
          </a>
          <button className="burger" aria-expanded={open} aria-controls="drawer" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}>
            <i />
            <i />
          </button>
        </div>
      </header>

      <div className={`drawer ${open ? "open" : ""}`} id="drawer" aria-hidden={!open}>
        <ul>
          {NAV.map((n, i) => (
            <li key={n.id}>
              <a href={`#${n.id}`} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>
                <small>0{i + 1}</small>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <a href="#join" className="btn solid" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>
          Join the club <span className="arrow">→</span>
        </a>
      </div>
    </>
  );
}

function Hero() {
  return (
    <section className="hero" id="top" aria-label="Welcome">
      <div className="stamp" aria-hidden="true">
        <img src={asset("logo.png")} alt="" />
      </div>

      <div className="wrap hero-inner">
        <h1 className="display" aria-label="Run the way">
          <span className="line">
            <span style={{ "--d": ".15s" } as CSSProperties}>Way</span>
          </span>
          <span className="line">
            <span style={{ "--d": ".3s" } as CSSProperties}>
              <span className="outline">The</span> Run<span className="accent">Club</span>
            </span>
          </span>
        </h1>

        <div className="hero-row">
          <div className="hero-copy reveal in" style={{ "--d": ".6s" } as CSSProperties}>
            <p>
              A community run club for every pace. Beginners, regulars and racers — we start together, we finish together, and we stay for coffee.
            </p>
            <div className="hero-cta">
              <a href="#join" className="btn solid">
                Join the club <span className="arrow">→</span>
              </a>
              <a href="#experience" className="btn">
                What to expect
              </a>
            </div>
          </div>
          <dl className="hero-meta" style={{ margin: 0 }}>
            <div>
              <dt>Run day</dt>
              <dd style={{ margin: 0 }}><b>{MEETUP.day}</b></dd>
            </div>
            <div>
              <dt>Warm-up · Start</dt>
              <dd style={{ margin: 0 }}><b>{MEETUP.warmup} · {MEETUP.start}</b></dd>
            </div>
            <div>
              <dt>Where</dt>
              <dd style={{ margin: 0 }}><b>{MEETUP.place}</b></dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((k) => (
          <div key={k} style={{ display: "flex" }}>
            {items.map((w, i) => (
              <span key={`${k}-${i}`}>
                {i % 2 ? <em>{w}</em> : w}
                <i />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function About() {
  return (
    <section className="about" id="about" aria-labelledby="about-h">
      <div className="wrap about-grid">
        <div className="about-text">
          <p className="eyebrow reveal">The club</p>
          <h2 className="display reveal" id="about-h" style={{ "--d": ".05s" } as CSSProperties}>
            More than <span className="serif">miles.</span>
            <br />
            It's a way.
          </h2>
          <p className="lead reveal" style={{ "--d": ".1s", marginTop: 34 } as CSSProperties}>
            The Way Run started with a simple idea: running is better when you're not doing it alone.
          </p>
          <p className="reveal" style={{ "--d": ".15s" } as CSSProperties}>
            We're a welcoming community of runners who meet, move and celebrate together. If you've never run a kilometre, you belong here. If you've run a
            hundred races, you belong here too. Pace groups mean nobody is left behind, and nobody is held back.
          </p>
          <p className="reveal" style={{ "--d": ".2s" } as CSSProperties}>
            Run with the sunrise, run with new friends, run your own way — and find that the way is easier together.
          </p>
          <div className="pillars reveal" style={{ "--d": ".25s" } as CSSProperties}>
            <div>
              <b>Beginners</b>Your first run starts here. No experience needed.
            </div>
            <div>
              <b>Regulars</b>Keep the habit with people who'll keep you accountable.
            </div>
            <div>
              <b>Racers</b>Train with a crew that'll push you and cheer you on.
            </div>
          </div>
        </div>

        <div className="about-collage reveal" style={{ "--d": ".1s" } as CSSProperties}>
          <Photo slot={PHOTOS.about1} className="a1" />
          <Photo slot={PHOTOS.about2} className="a2" />
          <Photo slot={PHOTOS.about3} className="a3" />
          <div className="badge" aria-hidden="true">
            all paces welcome
          </div>
        </div>
      </div>
    </section>
  );
}

function Experience() {
  return (
    <section className="exp" id="experience" aria-labelledby="exp-h">
      <div className="wrap">
        <div className="exp-head">
          <div>
            <p className="eyebrow reveal">The running experience</p>
            <h2 className="display reveal" id="exp-h">
              What it's like
              <br />
              to <span>run with us</span>
            </h2>
          </div>
          <p className="reveal">Show up as you are. Here's what happens next.</p>
        </div>

        <div className="exp-layout">
          <ol className="exp-list">
            {EXPERIENCE.map((e, i) => (
              <li className="exp-item reveal" key={e.t} style={{ "--d": `${i * 0.05}s` } as CSSProperties}>
                <span className="n">0{i + 1}</span>
                <h3>{e.t}</h3>
                <span className="go" aria-hidden="true">
                  ↗
                </span>
                <p>{e.d}</p>
              </li>
            ))}
          </ol>
          <div className="exp-side reveal">
            <Photo slot={PHOTOS.exp1} />
            <Photo slot={PHOTOS.exp2} />
          </div>
        </div>

        <div className="reveal">
          <div className="meet" role="group" aria-label="Run details">
            <div>
              <small>Day</small>
              <b>{MEETUP.day}</b>
            </div>
            <div>
              <small>Warm-up</small>
              <b>{MEETUP.warmup}</b>
            </div>
            <div>
              <small>Start</small>
              <b>{MEETUP.start}</b>
            </div>
            <div>
              <small>Where</small>
              <b>{MEETUP.place}</b>
            </div>
            <div>
              <small>Distances</small>
              <b>{MEETUP.distances}</b>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const [active, setActive] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const open = (i: number) => {
    lastFocus.current = document.activeElement as HTMLElement;
    setActive(i);
  };
  const close = useCallback(() => {
    setActive(null);
    lastFocus.current?.focus();
  }, []);
  const step = useCallback((dir: 1 | -1) => setActive((a) => (a === null ? a : (a + dir + GALLERY.length) % GALLERY.length)), []);

  useEffect(() => {
    if (active === null) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close, step]);

  return (
    <section className="gallery" id="gallery" aria-labelledby="gal-h">
      <div className="wrap">
        <div className="gallery-head">
          <div>
            <p className="eyebrow reveal">Gallery</p>
            <h2 className="display reveal" id="gal-h">
              Seen on <span className="outline">the run</span>
            </h2>
          </div>
          <p className="reveal">Real runs, real people. Tap any photo to see it bigger.</p>
        </div>

        <ul className="grid">
          {GALLERY.map((g, i) => (
            <li key={g.slot.file}>
              <button
                type="button"
                className={`tile ${g.shape} reveal`}
                style={{ "--d": `${(i % 4) * 0.06}s` } as CSSProperties}
                onClick={() => open(i)}
                aria-label={`Open photo: ${g.slot.alt}`}
              >
                <Photo slot={g.slot} showLabel={false} />
                <span className="cap">
                  <span>{g.slot.caption}</span>
                  <span aria-hidden="true">+</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {active !== null && (
        <div className="lb" role="dialog" aria-modal="true" aria-label="Photo viewer">
          <div className="lb-top">
            <span>
              {active + 1} / {GALLERY.length}
            </span>
            <button ref={closeRef} className="icon-btn" onClick={close} aria-label="Close photo viewer">
              ✕
            </button>
          </div>
          <div className="lb-stage" onClick={(e) => e.target === e.currentTarget && close()}>
            <Photo slot={GALLERY[active].slot} eager />
          </div>
          <div className="lb-bot">
            <button className="icon-btn" onClick={() => step(-1)} aria-label="Previous photo">
              ←
            </button>
            <span style={{ textAlign: "center" }}>{GALLERY[active].slot.caption}</span>
            <button className="icon-btn" onClick={() => step(1)} aria-label="Next photo">
              →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Community() {
  const items: { name: string; blurb: string; href: string; icon: ReactNode; cta: string }[] = [
    { name: "WhatsApp", blurb: "Run times, route changes and the daily chat. This is where the club lives.", href: LINKS.whatsapp, icon: <IconWhatsApp />, cta: "Join the chat" },
    { name: "Instagram", blurb: "Photos, club news and a first look at what's coming up.", href: LINKS.instagram, icon: <IconInstagram />, cta: "Follow us" },
    { name: "Strava", blurb: "Join the club on Strava, log your runs and cheer each other on.", href: LINKS.strava, icon: <IconStrava />, cta: "Join the club" },
  ];

  return (
    <section className="community" id="community" aria-labelledby="com-h">
      <div className="wrap">
        <p className="eyebrow reveal">Join the community</p>
        <h2 className="display reveal" id="com-h">
          Find us <span className="serif">everywhere</span>
        </h2>
        <ul className="social-list">
          {items.map((s, i) => {
            const live = isLinkSet(s.href);
            const inner = (
              <>
                {s.icon}
                <div>
                  <h3>{s.name}</h3>
                  <p>{live ? s.blurb : `${s.blurb} (Link coming soon.)`}</p>
                </div>
                <span className="tag">
                  {live ? s.cta : "Link coming soon"} <span aria-hidden="true">{live ? "↗" : "…"}</span>
                </span>
              </>
            );
            return (
              <li key={s.name} className="reveal" style={{ "--d": `${i * 0.08}s` } as CSSProperties}>
                {live ? (
                  <a className="social" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${s.name}: ${s.cta} (opens in a new tab)`}>
                    {inner}
                  </a>
                ) : (
                  <div className="social off" aria-disabled="true" role="group" aria-label={`${s.name} link not yet set`}>
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Questionnaire ---------- */

const REFERRAL_OPTS = ["Instagram", "Friend", "Flyer", "Strava", "TikTok", "Other"] as const;

interface FormValues {
  name: string;
  newMember: string;
  referral: string;
  _gotcha: string; // honeypot — real people never fill this in
}
type FieldKey = keyof FormValues;
type Errors = Partial<Record<FieldKey, string>>;
type Status = "idle" | "sending" | "success" | "error";

const EMPTY: FormValues = {
  name: "",
  newMember: "",
  referral: "",
  _gotcha: "",
};

function validate(v: FormValues): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Please tell us your full name.";
  if (!v.newMember) e.newMember = "Please choose yes or no.";
  if (!v.referral) e.referral = "Please choose how you heard about us.";
  return e;
}

function JoinForm() {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMsg, setServerMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends FieldKey>(key: K, val: FormValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    // clear that field's error as soon as the person edits it
    setErrors((p) => (p[key] ? { ...p, [key]: undefined } : p));
  };
  const onText = (key: FieldKey) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(key, e.target.value as never);
  const focusFirstError = (errs: Errors) => {
    const order: FieldKey[] = ["name", "newMember", "referral"];
    const first = order.find((k) => errs[k]);
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"] input, [data-field="${first}"] select, [data-field="${first}"] textarea`);
    el?.focus();
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (status === "sending") return;
    setServerMsg("");

    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      focusFirstError(errs);
      return;
    }
    // Bots fill the hidden honeypot; quietly ignore those.
    if (values._gotcha) return;

    // Honest handling: if no endpoint is configured, say so — don't pretend it was saved.
    if (!FORM_ENDPOINT || !/^https:\/\//.test(FORM_ENDPOINT)) {
      setStatus("error");
      setServerMsg("Sign-ups aren't connected yet, so your answers were NOT sent. Please message us on WhatsApp or Instagram instead — sorry about that!");
      return;
    }

    setStatus("sending");
    try {
      const payload = {
        "Full name": values.name.trim(),
        "Are you a new member?": values.newMember,
        "How did you hear about us?": values.referral,
        _subject: `New member sign-up — ${values.name.trim()}`,
      };
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus("success");
        setValues(EMPTY);
        document.getElementById("join")?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      let msg = "Something went wrong on our side, so your answers were not saved. Please try again in a moment.";
      try {
        const data = (await res.json()) as { errors?: { message?: string }[] };
        if (data.errors?.length) msg = data.errors.map((x) => x.message).filter(Boolean).join(" ");
      } catch {
        /* response wasn't JSON — keep the generic message */
      }
      setStatus("error");
      setServerMsg(msg);
    } catch {
      setStatus("error");
      setServerMsg("We couldn't reach the server — check your connection and try again. Your answers were not sent.");
    }
  };

  const ErrMsg = ({ k }: { k: FieldKey }) => (errors[k] ? <p className="err" id={`err-${k}`} role="alert">{errors[k]}</p> : null);

  return (
    <section className="join" id="join" aria-labelledby="join-h">
      <div className="join-bg" aria-hidden="true">
        <Photo slot={PHOTOS.cta} showLabel={false} />
      </div>
      <div className="wrap join-grid">
        <div className="join-intro">
          <p className="eyebrow reveal">New member questionnaire</p>
          <h2 className="display reveal" id="join-h">
            Join the <span className="serif">club</span>
          </h2>
          <p className="reveal">Tell us a little about you and we'll get you in the group. It takes about two minutes, and there are no wrong answers.</p>
          <ol className="steps reveal" aria-label="What happens next">
            <li><b>1</b> Fill in the questionnaire</li>
            <li><b>2</b> We get in touch</li>
            <li><b>3</b> Come run with us</li>
          </ol>
        </div>

        {status === "success" ? (
          <div className="success reveal in" role="status" aria-live="polite" tabIndex={-1}>
            <h3 className="display big">
              You're <span className="serif">in the</span> loop
            </h3>
            <p>Thank you! We've received your answers and will be in touch soon. In the meantime, follow us and say hi — we can't wait to run with you.</p>
            <a href="#community" className="btn">
              See where to find us <span className="arrow">→</span>
            </a>
          </div>
        ) : (
          <form ref={formRef} className="form reveal" onSubmit={onSubmit} noValidate aria-describedby={status === "error" ? "form-alert" : undefined}>
            {/* honeypot */}
            <div className="hp" aria-hidden="true">
              <label>
                Leave this empty
                <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" value={values._gotcha} onChange={onText("_gotcha")} />
              </label>
            </div>

            <fieldset className="fieldset">
              <legend>
                <span className="q">01</span> About you
              </legend>

              <div className="field" data-field="name">
                <label className="label" htmlFor="f-name">Full name</label>
                <input id="f-name" name="name" className="input" type="text" autoComplete="name" placeholder="e.g. Thandi Mokoena" value={values.name} onChange={onText("name")} required aria-required="true" aria-invalid={!!errors.name} aria-describedby={errors.name ? "err-name" : undefined} />
                <ErrMsg k="name" />
              </div>

              <div className="field" data-field="newMember">
                <label className="label" htmlFor="f-new-member">Are you a new member?</label>
                <select id="f-new-member" name="newMember" className="select" value={values.newMember} onChange={onText("newMember")} required aria-required="true" aria-invalid={!!errors.newMember} aria-describedby={errors.newMember ? "err-newMember" : undefined}>
                  <option value="" disabled>Choose yes or no</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                <ErrMsg k="newMember" />
              </div>
            </fieldset>

            <fieldset className="fieldset" data-field="referral">
              <legend><span className="q">02</span> How did you hear about us?</legend>
              <div className="choices" role="radiogroup" aria-required="true" aria-invalid={!!errors.referral}>
                {REFERRAL_OPTS.map((option, i) => (
                  <label className="choice" key={option}>
                    <input type="radio" name="referral" value={option} checked={values.referral === option} onChange={() => set("referral", option)} required={i === 0} aria-describedby={errors.referral ? "err-referral" : undefined} />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              <ErrMsg k="referral" />
            </fieldset>

            <div className="form-foot">
              {status === "error" && (
                <div className="alert bad" id="form-alert" role="alert">
                  {serverMsg}
                </div>
              )}
              <button type="submit" className="btn solid" disabled={status === "sending"}>
                {status === "sending" ? (
                  <>
                    <span className="spinner" aria-hidden="true" /> Sending…
                  </>
                ) : (
                  <>
                    Send my answers <span className="arrow">→</span>
                  </>
                )}
              </button>
              <small>We only use your details to contact you about the run club. Fields without “optional” are required.</small>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function Footer() {
  const links: [string, string][] = [
    ["Instagram", LINKS.instagram],
    ["WhatsApp", LINKS.whatsapp],
    ["Strava", LINKS.strava],
  ];
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="foot-top">
          <img className="foot-logo" src={asset("logo.png")} alt={`${CLUB.name} logo`} width={170} height={170} loading="lazy" />
          <p className="foot-tag display">
            Find your pace. <span className="serif">Find your people.</span>
          </p>
          <nav className="foot-links" aria-label="Social links">
            {links.map(([label, href]) =>
              isLinkSet(href) ? (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                  {label} ↗
                </a>
              ) : (
                <a key={label} className="off" aria-disabled="true" role="link" title="Link coming soon" onClick={(e) => e.preventDefault()}>
                  {label} (soon)
                </a>
              )
            )}
          </nav>
        </div>
        <p className="foot-word" aria-hidden="true">
          The Way Run Club
        </p>
        <div className="foot-bot">
          <span>
            © {CLUB.year} {CLUB.name}. All rights reserved.
          </span>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}

/* ==========================================================================
   APP
   ========================================================================== */

export default function App() {
  useReveal();
  const stable = useMemo(() => CSS, []);

  return (
    <>
      <style>{stable}</style>
      <a className="skip" href="#about">
        Skip to content
      </a>
      <div className="grain" aria-hidden="true" />
      <Nav onJoin={() => undefined} />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Experience />
        <Gallery />
        <Community />
        <JoinForm />
      </main>
      <Footer />
    </>
  );
}
