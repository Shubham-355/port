'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
interface Project {
  title: string;
  thumbnail: string;
  link: string;
}

const parseSocialLinks = () => {
  const env = process.env.NEXT_PUBLIC_SOCIAL_LINKS || '';
  const out = { github: '', linkedin: '', twitter: '', email: '' };
  if (!env) return out;
  env.split(',').forEach((item) => {
    const firstColon = item.indexOf(':');
    if (firstColon === -1) return;
    const platform = item.substring(0, firstColon).trim().toLowerCase();
    const rest = item.substring(firstColon + 1).trim();
    const lastColon = rest.lastIndexOf(':');
    const url = lastColon !== -1 ? rest.substring(0, lastColon).trim() : rest;
    if (!platform || !url) return;
    if (platform === 'github') out.github = url;
    else if (platform === 'linkedin') out.linkedin = url;
    else if (platform === 'twitter') out.twitter = url;
    else if (platform === 'email') out.email = url;
  });
  return out;
};

const getPersonalInfo = () => ({
  name: process.env.NEXT_PUBLIC_DEVELOPER_NAME || 'Developer',
  role:
    process.env.NEXT_PUBLIC_DEVELOPER_DESC ||
    '',
  email: process.env.NEXT_PUBLIC_EMAIL || '',
  aboutText:
    process.env.NEXT_PUBLIC_ABOUT_TEXT ||
    '',
  aboutAside1: process.env.NEXT_PUBLIC_ABOUT_ASIDE_1 || '',
  aboutAside2: process.env.NEXT_PUBLIC_ABOUT_ASIDE_2 || '',
});

const parseProjectDescriptions = (): Record<string, string> => {
  const env = process.env.NEXT_PUBLIC_PROJECT_DESCRIPTIONS || '';
  if (!env) return {};
  const out: Record<string, string> = {};
  env.split(';').forEach((item) => {
    const [title, ...descParts] = item.split(':');
    if (title && descParts.length > 0) {
      out[title.trim()] = descParts.join(':').trim().replace(/\\n/g, '\n');
    }
  });
  return out;
};

const parseProjects = (): Project[] => {
  const env = process.env.NEXT_PUBLIC_PROJECTS || '';
  if (!env) return [];
  return env
    .split(',')
    .map((row) => {
      const parts = row.trim().split('|');
      const title = parts[0]?.trim() || '';
      const link = parts[1]?.trim() || '';
      const thumbnail = `/${title.replace(/\s+/g, '')}.png`;
      return { title, thumbnail, link };
    })
    .filter((p) => p.title && p.link);
};

const placeholderFor = (letter: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500' preserveAspectRatio='xMidYMid slice'>` +
      `<defs>` +
        `<linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
          `<stop offset='0%' stop-color='#14110f'/><stop offset='100%' stop-color='#0a0908'/>` +
        `</linearGradient>` +
        `<pattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'>` +
          `<path d='M 40 0 L 0 0 0 40' fill='none' stroke='#252420' stroke-width='0.8'/>` +
        `</pattern>` +
        `<pattern id='dots' width='14' height='14' patternUnits='userSpaceOnUse'>` +
          `<circle cx='2' cy='2' r='1' fill='#8B0000' fill-opacity='0.18'/>` +
        `</pattern>` +
      `</defs>` +
      `<rect width='800' height='500' fill='url(#g)'/>` +
      `<rect width='800' height='500' fill='url(#grid)'/>` +
      `<rect width='800' height='500' fill='url(#dots)'/>` +
      `<text x='400' y='270' font-family='serif' font-size='120' font-style='italic' fill='#B5121B' opacity='0.85' text-anchor='middle' letter-spacing='-3'>${letter}.</text>` +
    `</svg>`
  );

const parseProjectMeta = (): Record<
  string,
  { year: string; stack: string[]; placeholder?: string }
> => {
  const env = process.env.NEXT_PUBLIC_PROJECT_META || '';
  if (!env) return {};
  const out: Record<string, { year: string; stack: string[]; placeholder?: string }> = {};
  env.split(';').forEach((row) => {
    const parts = row
      .split('|')
      .map((part) => part.trim())
      .filter(Boolean);
    if (!parts.length) return;
    const title = parts[0];
    const meta: { year: string; stack: string[]; placeholder?: string } = {
      year: '',
      stack: [],
    };
    parts.slice(1).forEach((part) => {
      const [key, ...rest] = part.split(':');
      if (!key || rest.length === 0) return;
      const value = rest.join(':').trim();
      if (key === 'year') meta.year = value;
      else if (key === 'stack') {
        meta.stack = value
          ? value.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
      } else if (key === 'placeholder') {
        meta.placeholder = value ? placeholderFor(value) : undefined;
      }
    });
    out[title] = meta;
  });
  return out;
};

const PROJECT_META = parseProjectMeta();

const tokenizeEmphasis = (text: string) => {
  const re = /\*([^*]+)\*/g;
  const out: Array<{ kind: 'text' | 'em'; value: string }> = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ kind: 'text', value: text.slice(last, m.index) });
    out.push({ kind: 'em', value: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ kind: 'text', value: text.slice(last) });
  return out;
};

const renderEm = (text: string) =>
  tokenizeEmphasis(text).map((t, i) =>
    t.kind === 'em' ? <em key={i}>{t.value}</em> : <span key={i}>{t.value}</span>
  );

const openExternal = (url: string) => {
  if (!url) return;
  let clean = url.trim();
  if (clean.startsWith('mailto:')) {
    window.location.href = clean;
    return;
  }
  if (!/^https?:\/\//.test(clean)) clean = `https://${clean}`;
  window.open(clean, '_blank', 'noopener,noreferrer');
};

const PLACEHOLDER_THUMB =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500' preserveAspectRatio='xMidYMid slice'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='#14110f'/>
          <stop offset='100%' stop-color='#0a0908'/>
        </linearGradient>
        <pattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'>
          <path d='M 40 0 L 0 0 0 40' fill='none' stroke='#252420' stroke-width='0.8'/>
        </pattern>
      </defs>
      <rect width='800' height='500' fill='url(#g)'/>
      <rect width='800' height='500' fill='url(#grid)'/>
      <text x='400' y='270' font-family='serif' font-size='120' font-style='italic' fill='#B5121B' opacity='0.85' text-anchor='middle'>.</text>
    </svg>`
  );

const STYLES = `
.shx-root {
  --bg: #0a0908;
  --bg-2: #14110f;
  --fg: #E8E2D1;
  --fg-dim: #a8a395;
  --muted: #6b6760;
  --line: #252420;
  --accent: #8B0000;
  --accent-bright: #B5121B;
  --serif: "Instrument Serif", "Times New Roman", serif;
  --mono: "JetBrains Mono", ui-monospace, Menlo, monospace;
  --sans: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --pad: clamp(20px, 4vw, 56px);
  background: var(--bg);
  color: var(--fg);
  font-family: var(--sans);
  font-weight: 300;
  font-size: 16px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  min-height: 100vh;
}
.shx-root *, .shx-root *::before, .shx-root *::after { box-sizing: border-box; }
.shx-root ::selection { background: var(--accent); color: var(--fg); }

.shx-root #hero h1.hero-name,
.shx-root #hero .role,
.shx-root #hero p { color: var(--fg) !important; }
.shx-root #hero h1.hero-name .ital,
.shx-root #hero .ital { color: var(--accent-bright) !important; font-style: italic; }

.shx-grain {
  position: fixed; inset: -10%;
  pointer-events: none;
  z-index: 60;
  opacity: 0.5;
  mix-blend-mode: soft-light;
}
.shx-grain::before {
  content: "";
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.42 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  background-size: 240px 240px;
  animation: shx-grain 1.4s steps(3) infinite;
}
@keyframes shx-grain {
  0%   { transform: translate(0,0); }
  25%  { transform: translate(-6%,4%); }
  50%  { transform: translate(5%,-3%); }
  75%  { transform: translate(-3%,-5%); }
  100% { transform: translate(0,0); }
}

.shx-root nav.top {
  position: fixed; top: 0; left: 0; right: 0;
  z-index: 50;
  padding: 18px var(--pad);
  display: flex; justify-content: space-between; align-items: center;
  backdrop-filter: blur(10px);
  background: linear-gradient(180deg, rgba(10,9,8,0.85), rgba(10,9,8,0));
  border-bottom: 1px solid transparent;
  transition: border-color .3s ease;
}
.shx-root nav.top.scrolled { border-bottom-color: var(--line); }
.shx-root .nav-group { display: flex; align-items: center; gap: 6px; }
.shx-root .nav-btn {
  background: none; border: 0; cursor: pointer; padding: 10px;
  width: 44px; height: 44px;
  display: grid; place-items: center;
  opacity: 0.55;
  transition: opacity .25s ease, transform .25s ease;
  position: relative;
}
.shx-root .nav-btn img { width: 100% !important; height: 100% !important; object-fit: contain; filter: brightness(0.95) contrast(1.1); }
.shx-root .nav-btn:hover { opacity: 1; transform: translateY(-1px); }
.shx-root .nav-btn::after {
  content: ""; position: absolute; left: 50%; bottom: 2px;
  width: 3px; height: 3px; border-radius: 50%;
  background: var(--accent);
  transform: translate(-50%, 6px); opacity: 0;
  transition: transform .25s ease, opacity .25s ease;
}
.shx-root .nav-btn.active::after { opacity: 1; transform: translate(-50%, 0); }

.shx-root .wrap { padding-left: var(--pad); padding-right: var(--pad); max-width: 1480px; margin: 0 auto; }
.shx-root .mono-sm { font-family: var(--mono); font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--muted); }
.shx-root .tag {
  font-family: var(--mono);
  font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase;
  color: var(--fg-dim);
  display: inline-flex; align-items: center; gap: 8px;
}
.shx-root .tag::before { content: ""; width: 22px; height: 1px; background: var(--accent); }

.shx-root section.hero {
  min-height: 100vh; padding-top: 96px; padding-bottom: 80px;
  position: relative;
  display: flex; flex-direction: column; justify-content: space-between;
}
.shx-root .hero-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: end;
  flex: 1;
}
.shx-root .hero-name {
  font-family: var(--serif);
  font-size: clamp(72px, 16vw, 260px);
  line-height: 0.88;
  letter-spacing: -0.04em;
  margin: 0;
  font-weight: 400;
  text-wrap: balance;
  perspective: 1400px;
  transform-style: preserve-3d;
}
.shx-root .hero-side {
  display: flex; flex-direction: column; align-items: flex-end; gap: 14px;
  text-align: right;
  padding-bottom: 12px;
}
.shx-root .hero-side-late {
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.9s ease, transform 0.9s cubic-bezier(.2,.7,.2,1);
}
.shx-root .hero-side-late.in { opacity: 1; transform: none; }
.shx-root .hero-side .role {
  font-family: var(--serif); font-style: italic;
  font-size: 22px; line-height: 1.15;
  max-width: 280px;
  margin: 0;
}
.shx-root .hero-side .role-link {
  color: var(--fg);
  text-decoration: none;
  border-bottom: 1px solid var(--line);
  padding-bottom: 4px;
  transition: color .25s ease, border-color .25s ease;
}
.shx-root .hero-side .role-link:hover {
  color: var(--accent-bright);
  border-bottom-color: var(--accent-bright);
}
.shx-root .hero-footer {
  display: flex; justify-content: space-between; align-items: end;
  gap: 24px;
  margin-top: 64px;
}
.shx-root .scroll-line {
  width: 60px; height: 1px; background: var(--fg-dim);
  position: relative; overflow: hidden;
}
.shx-root .scroll-line::after {
  content: ""; position: absolute; left: -30%; top: 0; height: 100%; width: 30%;
  background: var(--accent);
  animation: shx-sweep 2.4s ease-in-out infinite;
}
@keyframes shx-sweep {
  0% { left: -30%; } 60% { left: 100%; } 100% { left: 100%; }
}

.shx-root section.about {
  padding-top: 120px; padding-bottom: 120px;
  border-top: 1px solid var(--line);
  position: relative;
}
.shx-root .section-head {
  display: grid; grid-template-columns: 220px 1fr; gap: 60px;
  margin-bottom: 80px; align-items: baseline;
}
.shx-root .section-head .num {
  font-family: var(--mono);
  font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--fg-dim);
}
.shx-root .section-head .num .dot { color: var(--accent); margin: 0 6px; }
.shx-root .section-head h2 {
  font-family: var(--serif);
  font-size: clamp(48px, 7vw, 96px);
  line-height: 1;
  letter-spacing: -0.025em;
  margin: 0;
  font-weight: 400;
}
.shx-root .section-head h2 em { color: var(--accent-bright); font-style: italic; }

.shx-root .about-grid {
  display: grid; grid-template-columns: 220px 1fr 1fr; gap: 60px;
}
.shx-root .about-grid .col-label { padding-top: 8px; }
.shx-root .about-statement {
  font-family: var(--serif);
  font-size: clamp(28px, 3.2vw, 44px);
  line-height: 1.15;
  letter-spacing: -0.015em;
  color: var(--fg);
  text-wrap: balance;
  margin: 0;
}
.shx-root .about-statement em { color: var(--accent-bright); font-style: italic; }
.shx-root .about-aside { display: flex; flex-direction: column; gap: 28px; }
.shx-root .about-aside p {
  margin: 0;
  color: var(--fg-dim);
  font-size: 15px;
  line-height: 1.7;
}

.shx-root section.projects {
  padding-top: 120px; padding-bottom: 140px;
  border-top: 1px solid var(--line);
  position: relative;
}
.shx-root .proj-list { border-top: 1px solid var(--line); position: relative; }
.shx-root .proj-row {
  display: grid;
  grid-template-columns: 80px 1.4fr 1fr 0.7fr 32px;
  gap: 32px;
  align-items: center;
  padding: 32px 8px;
  border-bottom: 1px solid var(--line);
  text-decoration: none;
  color: inherit;
  position: relative;
  cursor: pointer;
  transition: padding-left .35s ease, background .35s ease;
}
.shx-root .proj-row::before {
  content: ""; position: absolute; left: 0; top: 0; bottom: 0;
  width: 2px; background: var(--accent);
  transform: scaleY(0); transform-origin: top;
  transition: transform .4s cubic-bezier(.2,.7,.2,1);
}
.shx-root .proj-row:hover::before { transform: scaleY(1); }
.shx-root .proj-row:hover { padding-left: 24px; }
.shx-root .proj-row:hover .proj-title { color: var(--accent-bright); }
.shx-root .proj-row:hover .proj-arrow { transform: translate(6px, -6px); color: var(--accent-bright); }

.shx-root .proj-num { font-family: var(--mono); font-size: 11px; letter-spacing: 0.18em; color: var(--muted); }
.shx-root .proj-title {
  font-family: var(--serif);
  font-size: clamp(36px, 5.5vw, 72px);
  line-height: 1;
  letter-spacing: -0.025em;
  transition: color .25s ease;
  display: flex; align-items: baseline; gap: 14px;
  color: var(--fg);
  font-weight: 400;
}
.shx-root .proj-title .yr {
  font-family: var(--mono);
  font-size: 12px; letter-spacing: 0.18em;
  color: var(--muted);
  transform: translateY(-0.2em);
}
.shx-root .proj-desc {
  font-size: 14px; line-height: 1.5; color: var(--fg-dim);
  max-width: 340px;
  white-space: pre-line;
}
.shx-root .proj-stack {
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--muted);
  display: flex; flex-wrap: wrap; gap: 6px 14px;
}
.shx-root .proj-arrow {
  font-family: var(--serif); font-size: 32px; line-height: 1;
  color: var(--fg-dim);
  transition: transform .35s ease, color .25s ease;
  justify-self: end;
}

.shx-root #shx-preview {
  position: fixed; pointer-events: none; z-index: 40;
  width: 360px; height: 230px;
  overflow: hidden;
  opacity: 0; transform: translate(-50%, -50%) scale(0.92);
  transition: opacity .25s ease, transform .35s cubic-bezier(.2,.7,.2,1);
  border: 1px solid var(--line);
  background: var(--bg-2);
  box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,0,0,0.12);
}
.shx-root #shx-preview.show { opacity: 1; transform: translate(-50%, -50%) scale(1); }
.shx-root #shx-preview img {
  width: 100%; height: 100%; object-fit: cover;
  display: block;
  filter: contrast(1.05) saturate(0.9);
}
.shx-root #shx-preview::after {
  content: ""; position: absolute; inset: 0;
  background:
    linear-gradient(180deg, rgba(10,9,8,0.0) 70%, rgba(10,9,8,0.6) 100%),
    repeating-linear-gradient(0deg, transparent 0 2px, rgba(232,226,209,0.04) 2px 3px);
  mix-blend-mode: overlay;
}

.shx-root footer.foot {
  padding: 80px var(--pad) 60px;
  border-top: 1px solid var(--line);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: end;
}
.shx-root .sig {
  font-family: var(--serif);
  font-size: clamp(40px, 7vw, 96px);
  line-height: 0.95;
  letter-spacing: -0.025em;
  margin: 0;
  font-weight: 400;
}
.shx-root .sig em { color: var(--accent-bright); font-style: italic; }
.shx-root .foot-meta { display: flex; flex-direction: column; gap: 8px; text-align: right; }
.shx-root .foot-link {
  font-family: var(--sans);
  font-weight: 400;
  font-size: 13px;
  color: var(--fg);
  text-decoration: none;
  border-bottom: 1px solid var(--accent);
  padding-bottom: 2px;
  align-self: flex-end;
  transition: transform .25s ease, color .25s ease;
}
.shx-root .foot-link:hover { transform: translateX(-4px); color: var(--accent-bright); }

.shx-root .reveal { opacity: 0; transform: translateY(18px); transition: opacity .9s ease, transform .9s cubic-bezier(.2,.7,.2,1); }
.shx-root .reveal.in { opacity: 1; transform: none; }
.shx-root .reveal.d2 { transition-delay: .12s; }
.shx-root .reveal.d3 { transition-delay: .24s; }
.shx-root .reveal.d4 { transition-delay: .36s; }

.shx-root .title-anim {
  display: block;
  opacity: 0;
  transform: translateY(36px) skewX(-3deg);
  transition: opacity 1.1s ease, transform 1.2s cubic-bezier(.2,.95,.2,1);
  position: relative;
  padding-bottom: 0.34em;
}
.shx-root .title-anim.in { opacity: 1; transform: none; }
.shx-root .title-anim::after {
  content: ""; position: absolute; left: 0; bottom: 0;
  width: 0; height: 2px;
  background: var(--accent-bright);
  transition: width 1.4s cubic-bezier(.2,.85,.2,1) 0.55s;
  box-shadow: 0 0 14px rgba(181,18,27,0.5);
}
.shx-root .title-anim.in::after { width: 96px; }

.shx-ambient {
  position: fixed; pointer-events: none; z-index: 1;
  width: 60vmax; height: 60vmax;
  left: -10vmax; top: -10vmax;
  background: radial-gradient(circle at center, rgba(181,18,27,0.18), rgba(181,18,27,0) 60%);
  filter: blur(40px);
  will-change: transform;
  animation: shx-ambientDrift 22s ease-in-out infinite alternate;
  mix-blend-mode: screen;
  opacity: 0.55;
}
.shx-ambient.b {
  left: auto; right: -20vmax; top: 30vmax;
  width: 50vmax; height: 50vmax;
  background: radial-gradient(circle at center, rgba(139,0,0,0.22), rgba(139,0,0,0) 60%);
  animation: shx-ambientDrift2 30s ease-in-out infinite alternate;
}
@keyframes shx-ambientDrift {
  0%   { transform: translate(0,0)         scale(1); }
  50%  { transform: translate(8vmax,4vmax) scale(1.1); }
  100% { transform: translate(-4vmax,8vmax) scale(0.95); }
}
@keyframes shx-ambientDrift2 {
  0%   { transform: translate(0,0)            scale(1); }
  50%  { transform: translate(-6vmax,-6vmax)  scale(1.15); }
  100% { transform: translate(4vmax,-4vmax)   scale(0.9); }
}

.shx-scroll-progress {
  position: fixed; top: 0; left: 0; height: 2px;
  width: 0%; background: var(--accent-bright);
  z-index: 70;
  box-shadow: 0 0 10px rgba(181,18,27,0.55);
  transition: width .08s linear;
}

.shx-root .splitchar {
  display: inline-block;
  vertical-align: top;
  line-height: 0.95;
  position: relative;
  clip-path: inset(-0.6em -0.6em 0 -0.6em);
}
.shx-root .splitchar > span {
  display: inline-block;
  opacity: 0;
  transform-origin: 50% 100%;
  transform: translateY(120%) rotateX(-78deg) scale(0.92);
  filter: blur(10px);
  will-change: transform, opacity, filter;
  transition:
    transform 1.25s cubic-bezier(.16,.86,.28,1),
    opacity 0.6s ease,
    filter 0.7s ease;
}
.shx-root .splitchar.in > span {
  transform: translateY(0) rotateX(0) scale(1);
  opacity: 1;
  filter: blur(0);
}
.shx-root .splitchar.settled > span {
  will-change: auto;
  transform: none;
  filter: none;
  transition: none;
}
.shx-root .splitchar.ital-line > span {
  transform: translateY(130%) rotateX(-82deg) scale(0.88) skewX(-14deg);
  filter: blur(14px);
  transition:
    transform 1.45s cubic-bezier(.14,.88,.24,1),
    opacity 0.75s ease,
    filter 0.95s ease;
}
.shx-root .splitchar.ital-line.in > span {
  transform: translateY(0) rotateX(0) scale(1) skewX(0);
  filter: blur(0);
}
.shx-root .splitchar.ital-line.settled > span {
  transform: none;
  filter: none;
}
.shx-root .splitchar.ital-line::after {
  content: "";
  position: absolute;
  left: 0.04em; right: 0.18em;
  bottom: -0.04em;
  height: 3px;
  background: var(--accent-bright);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 1.05s cubic-bezier(.18,.82,.24,1);
  box-shadow: 0 0 18px rgba(181,18,27,0.55);
  pointer-events: none;
}
.shx-root .splitchar.ital-line.underline::after {
  transform: scaleX(1);
}

.shx-root .proj-row { will-change: transform; }
.shx-root .proj-view {
  position: absolute;
  right: 64px; top: 50%;
  transform: translateY(-50%) translateX(10px);
  font-family: var(--mono);
  font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase;
  color: var(--accent-bright);
  opacity: 0;
  transition: opacity .3s ease, transform .35s cubic-bezier(.2,.7,.2,1);
  pointer-events: none;
  display: flex; align-items: center; gap: 10px;
}
.shx-root .proj-view::before {
  content: ""; width: 18px; height: 1px; background: var(--accent-bright);
}
.shx-root .proj-row:hover .proj-view {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}
.shx-root .proj-title .scrambler { display: inline-block; will-change: contents; }

.shx-root .magnet { transition: transform .35s cubic-bezier(.2,.85,.2,1); }

@media (max-width: 980px) {
  .shx-root .hero-grid { grid-template-columns: 1fr; }
  .shx-root .hero-side { align-items: flex-start; text-align: left; }
  .shx-root .hero-footer { flex-direction: column; align-items: stretch; gap: 18px; }
  .shx-root .section-head { grid-template-columns: 1fr; gap: 18px; }
  .shx-root .about-grid { grid-template-columns: 1fr; gap: 32px; }
  .shx-root .proj-row { grid-template-columns: 60px 1fr 28px; gap: 16px; }
  .shx-root .proj-desc, .shx-root .proj-stack { display: none; }
  .shx-root footer.foot { grid-template-columns: 1fr; }
  .shx-root .foot-meta { text-align: left; }
  .shx-root .foot-link { align-self: flex-start; }
}
`;

export default function Home() {
  const info = getPersonalInfo();
  const socials = parseSocialLinks();
  const projects = parseProjects();
  const descriptions = parseProjectDescriptions();

  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<'hero' | 'about' | 'projects'>('hero');

  const previewRef = useRef<HTMLDivElement>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0 });
  const rafId = useRef(0);
  const cursorPrimed = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.shx-root .reveal');
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.shx-root .title-anim');
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.25 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const bar = document.getElementById('shx-scroll-progress');
    if (!bar) return;
    const update = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? (scrolled / max) * 100 : 0;
      bar.style.width = `${p}%`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    const heroName = document.getElementById('shx-hero-name');
    if (!heroName) return;
    const lines = Array.from(heroName.querySelectorAll<HTMLElement>('.splitchar'));

    const BASE = 0.15;
    const GAP = 0.18;
    const STEP_NORMAL = 0.05;
    const STEP_ITAL = 0.075;

    let t = BASE;
    const underlineTimers: ReturnType<typeof setTimeout>[] = [];
    let maxSettled = 0;

    lines.forEach((line) => {
      const isItal = line.classList.contains('ital');
      if (isItal) line.classList.add('ital-line');
      const step = isItal ? STEP_ITAL : STEP_NORMAL;
      const charSpans = Array.from(
        line.querySelectorAll<HTMLElement>(':scope > span')
      );

      charSpans.forEach((s, i) => {
        s.style.transitionDelay = `${(t + i * step).toFixed(3)}s`;
      });

      const lastStart = t + Math.max(0, charSpans.length - 1) * step;
      const settled = lastStart + 0.5;
      if (settled > maxSettled) maxSettled = settled;

      if (isItal) {
        underlineTimers.push(
          setTimeout(() => line.classList.add('underline'), (settled + 0.1) * 1000)
        );
      }

      t = lastStart + GAP;
    });

    const inTimer = setTimeout(() => {
      lines.forEach((l) => l.classList.add('in'));
    }, 16);

    const settleTimer = setTimeout(() => {
      lines.forEach((line) => {
        line.classList.add('settled');
        line
          .querySelectorAll<HTMLElement>(':scope > span')
          .forEach((s) => {
            s.style.transitionDelay = '';
          });
      });
    }, (maxSettled + 0.35) * 1000);

    const heroSideTimer = setTimeout(() => {
      document.getElementById('shx-hero-side')?.classList.add('in');
    }, (maxSettled + 1.2) * 1000);

    return () => {
      clearTimeout(inTimer);
      clearTimeout(settleTimer);
      clearTimeout(heroSideTimer);
      underlineTimers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*/?+=<>';
    const scramble = (el: HTMLElement) => {
      const target = el.dataset.text || el.textContent || '';
      const len = target.length;
      let frame = 0;
      const dur = Math.max(28, Math.min(60, len * 4));
      const tick = () => {
        let out = '';
        for (let i = 0; i < len; i++) {
          if (frame > i * 2) out += target[i];
          else out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        el.textContent = out;
        frame++;
        if (frame < dur) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      tick();
    };
    const els = document.querySelectorAll<HTMLElement>('.shx-root .scrambler');
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            scramble(e.target as HTMLElement);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.6 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const ids: ('hero' | 'about' | 'projects')[] = ['hero', 'about', 'projects'];
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id as 'hero' | 'about' | 'projects');
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const tick = () => {
      cur.current.x += (target.current.x - cur.current.x) * 0.18;
      cur.current.y += (target.current.y - cur.current.y) * 0.18;
      const el = previewRef.current;
      if (el) {
        el.style.left = `${cur.current.x}px`;
        el.style.top = `${cur.current.y}px`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onPreviewEnter = (img: string) => {
    if (previewImgRef.current) previewImgRef.current.src = img;
    previewRef.current?.classList.add('show');
  };
  const onPreviewMove = (e: React.MouseEvent) => {
    target.current.x = e.clientX;
    target.current.y = e.clientY;
    if (!cursorPrimed.current) {
      cur.current.x = e.clientX;
      cur.current.y = e.clientY;
      cursorPrimed.current = true;
    }
  };
  const onPreviewLeave = () => previewRef.current?.classList.remove('show');

  const magneticMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = (e.clientX - cx) * 0.35;
    const dy = (e.clientY - cy) * 0.35;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const magneticLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = '';
  };

  return (
    <>
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&family=Inter:wght@300;400;500&display=swap"
      />
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="shx-root">
        <div className="shx-grain" aria-hidden="true" />
        <div className="shx-ambient" aria-hidden="true" />
        <div className="shx-ambient b" aria-hidden="true" />
        <div className="shx-scroll-progress" id="shx-scroll-progress" aria-hidden="true" />

        <nav className={`top${scrolled ? ' scrolled' : ''}`}>
          <div className="nav-group">
            <button
              type="button"
              aria-label="Home"
              className={`nav-btn magnet${active === 'hero' ? ' active' : ''}`}
              onClick={() => scrollTo('hero')}
              onMouseMove={magneticMove}
              onMouseLeave={magneticLeave}
            >
              <Image src="/home.png" alt="" width={44} height={44} />
            </button>
            <button
              type="button"
              aria-label="About"
              className={`nav-btn magnet${active === 'about' ? ' active' : ''}`}
              onClick={() => scrollTo('about')}
              onMouseMove={magneticMove}
              onMouseLeave={magneticLeave}
            >
              <Image src="/about.png" alt="" width={44} height={44} />
            </button>
            <button
              type="button"
              aria-label="Projects"
              className={`nav-btn magnet${active === 'projects' ? ' active' : ''}`}
              onClick={() => scrollTo('projects')}
              onMouseMove={magneticMove}
              onMouseLeave={magneticLeave}
            >
              <Image src="/projects.png" alt="" width={44} height={44} />
            </button>
          </div>

          <div className="nav-group">
            <button
              type="button"
              aria-label="GitHub"
              className="nav-btn magnet"
              onClick={() => openExternal(socials.github)}
              onMouseMove={magneticMove}
              onMouseLeave={magneticLeave}
            >
              <Image src="/github.png" alt="" width={44} height={44} />
            </button>
            <button
              type="button"
              aria-label="LinkedIn"
              className="nav-btn magnet"
              onClick={() => openExternal(socials.linkedin)}
              onMouseMove={magneticMove}
              onMouseLeave={magneticLeave}
            >
              <Image src="/linkedin.png" alt="" width={44} height={44} />
            </button>
            <button
              type="button"
              aria-label="Twitter"
              className="nav-btn magnet"
              onClick={() => openExternal(socials.twitter)}
              onMouseMove={magneticMove}
              onMouseLeave={magneticLeave}
            >
              <Image src="/xtwitter.png" alt="" width={44} height={44} />
            </button>
            <button
              type="button"
              aria-label="Mail"
              className="nav-btn magnet"
              onClick={() => openExternal(socials.email)}
              onMouseMove={magneticMove}
              onMouseLeave={magneticLeave}
            >
              <Image src="/mail.png" alt="" width={44} height={44} />
            </button>
          </div>
        </nav>

        <section className="hero wrap" id="hero">
          <div className="hero-grid">
            <h1 className="hero-name" id="shx-hero-name">
              <span className="splitchar line">
                {[...`${info.name},`].map((ch, i) => (
                  <span key={i}>{ch === ' ' ? ' ' : ch}</span>
                ))}
              </span>
              <br />
              <span className="splitchar line">
                {[...'creates '].map((ch, i) => (
                  <span key={i}>{ch === ' ' ? ' ' : ch}</span>
                ))}
              </span>
              <span className="splitchar line ital">
                {[...'stuff'].map((ch, i) => (
                  <span key={i}>{ch}</span>
                ))}
              </span>
              <br />
              <span className="splitchar line ital">
                {[...'sometimes.'].map((ch, i) => (
                  <span key={i}>{ch}</span>
                ))}
              </span>
            </h1>
            <div className="hero-side hero-side-late" id="shx-hero-side">
              <a
                className="role role-link"
                href={
                  info.email
                    ? info.email.startsWith('mailto:')
                      ? info.email
                      : `mailto:${info.email}`
                    : '#'
                }
              >
                say hi
              </a>
            </div>
          </div>

          <div className="hero-footer">
            <div className="mono-sm" style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--fg-dim)' }}>
              <span className="scroll-line" />
            </div>
          </div>
        </section>

        <section className="about wrap" id="about">
          <div className="section-head">
            <div className="num reveal">
              <span className="dot">●</span> About
            </div>
            <h2 className="title-anim">
              A short note <em>on the maker.</em>
            </h2>
          </div>

          <div className="about-grid">
            <div className="col-label">
              <span className="tag">Statement</span>
            </div>

            <p className="about-statement reveal">{renderEm(info.aboutText)}</p>

            <div className="about-aside reveal d2">
              {info.aboutAside1 ? <p>{info.aboutAside1}</p> : null}
              {info.aboutAside2 ? <p>{info.aboutAside2}</p> : null}
            </div>
          </div>
        </section>

        <section className="projects wrap" id="projects">
          <div className="section-head">
            <div className="num reveal">
              <span className="dot">●</span> The Index
            </div>
            <h2 className="title-anim">
              Pet <em>projects.</em>
            </h2>
          </div>

          <div className="proj-list">
            {projects.map((p, i) => {
              const num = String(i + 1).padStart(2, '0');
              const meta = PROJECT_META[p.title] || { year: '', stack: [], placeholder: undefined };
              const description = descriptions[p.title] || '';
              const delayClass = i < 3 ? '' : i === 3 ? ' d2' : i === 4 ? ' d3' : ' d4';
              const thumb = meta.placeholder ?? p.thumbnail;
              return (
                <a
                  key={p.title}
                  className={`proj-row reveal${delayClass}`}
                  href={p.link}
                  onClick={(e) => {
                    e.preventDefault();
                    openExternal(p.link);
                  }}
                  onMouseEnter={() => onPreviewEnter(thumb)}
                  onMouseMove={onPreviewMove}
                  onMouseLeave={onPreviewLeave}
                >
                  <span className="proj-num">{num} /</span>
                  <span className="proj-title">
                    <span className="scrambler" data-text={p.title}>{p.title}</span>{' '}
                    {meta.year ? <span className="yr">{meta.year}</span> : null}
                  </span>
                  <span className="proj-desc">{description}</span>
                  <span className="proj-stack">
                    {meta.stack.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </span>
                  <span
                    className="proj-arrow magnet"
                    onMouseMove={magneticMove}
                    onMouseLeave={magneticLeave}
                  >
                    ↗
                  </span>
                  <span className="proj-view">View case</span>
                </a>
              );
            })}
          </div>

          <div id="shx-preview" ref={previewRef}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              ref={previewImgRef}
              onError={(e) => {
                const el = e.currentTarget;
                if (el.src !== PLACEHOLDER_THUMB) el.src = PLACEHOLDER_THUMB;
              }}
            />
          </div>
        </section>

        <footer className="foot">
          <h2 className="sig title-anim">
            Say <em>hi.</em>
          </h2>
          <div className="foot-meta reveal d2">
            <a
              className="foot-link"
              href={info.email ? (info.email.startsWith('mailto:') ? info.email : `mailto:${info.email}`) : '#'}
            >
              {info.email.replace(/^mailto:/, '')} ↗
            </a>
            <span className="mono-sm" style={{ marginTop: 18 }}>
              Crafted by {info.name}
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}