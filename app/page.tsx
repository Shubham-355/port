'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

interface MainProject {
  title: string;
  thumbnail: string;
  link: string;
}

const parseSocialLinks = () => {
  const socialLinksEnv = process.env.NEXT_PUBLIC_SOCIAL_LINKS || '';
  if (!socialLinksEnv) return { github: '', linkedin: '', twitter: '', email: '' };

  const links = { github: '', linkedin: '', twitter: '', email: '' };
  
  socialLinksEnv.split(',').forEach(item => {
    // Split only on the first colon to get platform and rest
    const firstColonIndex = item.indexOf(':');
    if (firstColonIndex === -1) return;
    
    const platform = item.substring(0, firstColonIndex).trim().toLowerCase();
    const rest = item.substring(firstColonIndex + 1).trim();
    
    // For the URL part, split on the last colon to separate URL from label
    const lastColonIndex = rest.lastIndexOf(':');
    const url = lastColonIndex !== -1 ? rest.substring(0, lastColonIndex).trim() : rest;
    
    if (platform && url) {
      if (platform === 'github') links.github = url;
      if (platform === 'linkedin') links.linkedin = url;
      if (platform === 'twitter') links.twitter = url;
      if (platform === 'email') links.email = url;
    }
  });
  
  return links;
};

const getPersonalInfo = () => ({
  name: process.env.NEXT_PUBLIC_DEVELOPER_NAME || 'Developer',
  role: process.env.NEXT_PUBLIC_DEVELOPER_DESC || 'I create stuff sometimes.',
  email: process.env.NEXT_PUBLIC_EMAIL,
  aboutText: process.env.NEXT_PUBLIC_ABOUT_TEXT || 'Passionate developer creating amazing applications.',
  techHeaderText: process.env.NEXT_PUBLIC_TECH_HEADER_TEXT || 'Here are some technologies I have been working with:',
  additionalAboutText: process.env.NEXT_PUBLIC_ADDITIONAL_ABOUT_TEXT || '',
});

const parseProjectDescriptions = (): { [key: string]: string } => {
  const descriptionsEnv = process.env.NEXT_PUBLIC_PROJECT_DESCRIPTIONS || '';
  if (!descriptionsEnv) return {};
  
  const descriptions: { [key: string]: string } = {};
  descriptionsEnv.split(',').forEach(item => {
    const [title, ...descParts] = item.split(':');
    if (title && descParts.length > 0) {
      // Replace literal \n with actual newline characters
      descriptions[title.trim()] = descParts.join(':').trim().replace(/\\n/g, '\n');
    }
  });
  return descriptions;
};

const parseMainProjects = (): MainProject[] => {
  const mainProjectsEnv = process.env.NEXT_PUBLIC_PROJECTS || '';
  if (!mainProjectsEnv) return [];

  return mainProjectsEnv.split(',').map(project => {
    const parts = project.trim().split('|');
    const title = parts[0]?.trim() || '';
    const link = parts[1]?.trim() || '';
    
    // Generate thumbnail path from title (convert to lowercase and replace spaces)
    const thumbnail = `/${title.toLowerCase().replace(/\s+/g, '')}.png`;
    
    return { title, thumbnail, link };
  }).filter(project => project.title && project.link);
};

export default function Home() {
  const personalInfo = getPersonalInfo();
  const socialLinks = parseSocialLinks();
  const mainProjects = parseMainProjects();
  const projectDescriptions = parseProjectDescriptions();
  const [, setActiveNav] = useState<string | null>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const roleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Animate name
    if (nameRef.current) {
      const nameText = nameRef.current.textContent || '';
      nameRef.current.innerHTML = nameText
        .split('')
        .map((char, idx) => `<span class="letter-animate" data-index="${idx}">${char === ' ' ? '&nbsp;' : char}</span>`)
        .join('');

      const nameLetters = nameRef.current.querySelectorAll('.letter-animate');
      nameLetters.forEach((letter, idx) => {
        setTimeout(() => {
          letter.classList.add('letter-visible');
        }, idx * 80 + Math.random() * 150);
      });
    }

    setTimeout(() => {
      if (roleRef.current) {
        const roleText = roleRef.current.textContent || '';
        roleRef.current.innerHTML = roleText
          .split('')
          .map((char, idx) => `<span class="letter-animate" data-index="${idx}">${char === ' ' ? '&nbsp;' : char}</span>`)
          .join('');

        const roleLetters = roleRef.current.querySelectorAll('.letter-animate');
        roleLetters.forEach((letter, idx) => {
          setTimeout(() => {
            letter.classList.add('letter-visible');
          }, idx * 70 + Math.random() * 120);
        });
      }
    }, personalInfo.name.length * 100 + 500);
  }, [personalInfo.name, personalInfo.role]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleProjectClick = (link: string) => {
    if (!link || link.trim() === '') return;
    
    try {
      let cleanUrl = link.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      window.open(cleanUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const handleSocialClick = (url: string) => {
    if (!url || url.trim() === '') return;
    
    try {
      let cleanUrl = url.trim();
      
      // Handle mailto links
      if (cleanUrl.startsWith('mailto:')) {
        window.location.href = cleanUrl;
        return;
      }
      
      // Add protocol if missing
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      
      window.open(cleanUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening social URL:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden roboto-slab-regular">
      {/* Custom SVG Grain Pattern */}
      <svg style={{ position: 'fixed', width: 0, height: 0 }}>
        <defs>
          <filter id="grainFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
          </filter>
        </defs>
      </svg>

      {/* Animated Grain overlay */}
      <div className="grain-container">
        <div className="grain-animation" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Left navigation */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => {
                setActiveNav('home');
                scrollToSection('hero');
              }}
              className="w-8 h-8 md:w-10 md:h-10 relative hover:scale-110 transition-transform"
            >
              <Image src="/home.png" alt="Home" fill className="object-contain" />
            </button>
            <button
              onClick={() => {
                setActiveNav('about');
                scrollToSection('about');
              }}
              className="w-8 h-8 md:w-10 md:h-10 relative hover:scale-110 transition-transform"
            >
              <Image src="/about.png" alt="About" fill className="object-contain" />
            </button>
            <button
              onClick={() => {
                setActiveNav('projects');
                scrollToSection('projects');
              }}
              className="w-8 h-8 md:w-10 md:h-10 relative hover:scale-110 transition-transform"
            >
              <Image src="/projects.png" alt="Projects" fill className="object-contain" />
            </button>
          </div>

          {/* Right navigation - reordered: GitHub, LinkedIn, X, Email */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => handleSocialClick(socialLinks.github)}
              className="w-8 h-8 md:w-10 md:h-10 relative hover:scale-110 transition-transform"
            >
              <Image src="/github.png" alt="GitHub" fill className="object-contain" />
            </button>
            <button
              onClick={() => handleSocialClick(socialLinks.linkedin)}
              className="w-8 h-8 md:w-10 md:h-10 relative hover:scale-110 transition-transform"
            >
              <Image src="/linkedin.png" alt="LinkedIn" fill className="object-contain" />
            </button>
            <button
              onClick={() => handleSocialClick(socialLinks.twitter)}
              className="w-8 h-8 md:w-10 md:h-10 relative hover:scale-110 transition-transform"
            >
              <Image src="/xtwitter.png" alt="X/Twitter" fill className="object-contain" />
            </button>
            <button
              onClick={() => handleSocialClick(socialLinks.email)}
              className="w-8 h-8 md:w-10 md:h-10 relative hover:scale-110 transition-transform"
            >
              <Image src="/mail.png" alt="Mail" fill className="object-contain" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-black" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div>
            <h1 
              ref={nameRef}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-4 md:mb-6"
            >
              Hi, I&apos;m {personalInfo.name}
            </h1>
            <p 
              ref={roleRef}
              className="text-lg sm:text-xl md:text-2xl px-4"
            >
              {personalInfo.role}
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-black z-10" />
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen relative flex items-center justify-center py-20">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-t from-transparent to-black z-10" />
        
        <div className="absolute inset-0">
          <Image 
            src="/aboutbg.png" 
            alt="About Background" 
            fill 
            className="object-cover scale-x-[-1]"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          {/* Brutalist split layout with asymmetric boxes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left side - Title block with extreme contrast */}
            <div className="lg:col-span-5 relative">
              <div className="sticky top-24">
                {/* Tilted background block - using crimson red with opposite animation */}
                <div className="absolute -inset-4 bg-gradient-to-br from-[#8B0000] to-[#1a1a1a] opacity-90 about-bg-animate" />
                
                <div className="relative bg-black border-4 p-8 about-title-animate about-border-glitch">
                  {/* Noise texture */}
                  <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundSize: '100px 100px'
                  }} />
                  
                  <h2 className="text-6xl md:text-7xl font-bold uppercase leading-none tracking-tighter mb-4 about-text-glitch" style={{
                    WebkitTextStroke: '2px #e8e6e3',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '4px 4px 0px rgba(139, 0, 0, 0.5)'
                  }}>
                    About
                  </h2>
                  <h2 className="text-6xl md:text-7xl font-bold uppercase leading-none tracking-tighter" style={{
                    color: '#e8e6e3',
                    textShadow: '4px 4px 0px rgba(26, 26, 26, 0.7)'
                  }}>
                    Me
                  </h2>
                  
                  {/* Decorative elements - using theme colors */}
                  <div className="mt-6 flex gap-2">
                    <div className="w-12 h-1 bg-[#8B0000]" />
                    <div className="w-8 h-1 bg-[#3a3a3a]" />
                    <div className="w-4 h-1 bg-[#1a1a1a]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Content blocks with magazine cutout style */}
            <div className="lg:col-span-7 space-y-6">
              {/* Main description box */}
              <div className="relative group">
                {/* Glowing shadow effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-[#8B0000] via-[#1a1a1a] to-[#8B0000] opacity-30 blur-xl group-hover:opacity-50 transition-opacity" />
                
                {/* Offset background layer */}
                <div className="absolute inset-0 bg-[#8B0000] transform translate-x-2 translate-y-2 opacity-20" />
                
                <div className="relative bg-black border-2 border-[#8B0000] p-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" style={{
                  boxShadow: '4px 4px 0px rgba(139, 0, 0, 0.3)'
                }}>
                  {/* Corner accent marks */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-[3px] border-l-[3px] border-[#8B0000]" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[3px] border-r-[3px] border-[#8B0000]" />
                  
                  {/* Torn paper edge effect at top */}
                  <div className="absolute -top-[2px] left-8 right-8 h-[3px] bg-[#8B0000] opacity-40" style={{
                    clipPath: 'polygon(0 0, 5% 100%, 10% 0, 15% 100%, 20% 0, 25% 100%, 30% 0, 35% 100%, 40% 0, 45% 100%, 50% 0, 55% 100%, 60% 0, 65% 100%, 70% 0, 75% 100%, 80% 0, 85% 100%, 90% 0, 95% 100%, 100% 0)'
                  }} />
                  
                  {/* Halftone texture overlay */}
                  <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                    backgroundImage: 'radial-gradient(circle, #8B0000 1px, transparent 1px)',
                    backgroundSize: '8px 8px'
                  }} />
                  
                  {/* Red accent bar on left */}
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#8B0000] group-hover:w-2 transition-all duration-300" />
                  
                  <p className="text-lg leading-relaxed relative" style={{ color: '#d4d2cf' }}>
                    {personalInfo.aboutText}
                  </p>
                  
                  {/* Bottom corner stamp effect */}
                  <div className="absolute bottom-4 right-4 w-4 h-4 border-2 border-[#8B0000] transform rotate-45 opacity-50" />
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-black z-10" />
      </section>

      {/* Main Projects Section */}
      <section id="projects" className="min-h-screen relative py-20">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-t from-transparent to-black z-10" />
        
        <div className="absolute inset-0 bg-black" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div>
            <h2 className="text-5xl md:text-6xl font-bold mb-12 text-center" style={{ color: '#e5e2cf' }}>
              Pet Projects
            </h2>
            
            <div className="grid grid-cols-1 gap-6 mb-20 max-w-4xl mx-auto">
              {mainProjects.map((project) => {
                const description = projectDescriptions[project.title] || project.title;
                
                return (
                  <div
                    key={project.title}
                    onClick={() => handleProjectClick(project.link)}
                    className="group cursor-pointer relative aspect-video overflow-hidden rounded-lg hover:scale-[1.02] transition-all duration-300"
                  >
                    {/* Inset border wrapper */}
                    <div className="absolute inset-0 pointer-events-none z-10" style={{
                      boxShadow: 'inset 0 0 10px 8px rgba(0, 0, 0, 1)',
                      borderRadius: 'inherit'
                    }} />
                    
                    <Image 
                      src={project.thumbnail} 
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-start justify-end z-20 p-6">
                      {description.split('\n').map((line, idx) => (
                        <p 
                          key={idx}
                          className="text-white font-semibold text-base md:text-lg roboto-slab-regular leading-relaxed"
                          style={{
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                            animation: `fadeInUp 0.4s ease-out ${idx * 0.15}s forwards`,
                            opacity: 0
                          }}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-black z-10" />
      </section>

      {/* Footer */}
      <footer className="relative h-64 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black" />
        
        <div className="relative z-10 text-center px-6">
          <div className="inline-block relative">
            {/* Stamp/Badge effect behind text */}
            <div className="absolute -inset-8 border-4 border-[#8B0000] opacity-20 animate-pulse" style={{ 
              animationDuration: '4s',
              transform: 'rotate(-2deg)'
            }} />
            <div className="absolute -inset-6 border-2 border-[#8B0000] opacity-30" style={{ 
              transform: 'rotate(3deg)',
              animation: 'spin 20s linear infinite'
            }} />
            
            {/* Halftone dots pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle, #8B0000 1px, transparent 1px)',
              backgroundSize: '12px 12px',
              backgroundPosition: '0 0, 6px 6px'
            }} />
            
            <div className="relative">
              {/* Top text - simplified */}
              <div className="text-xl md:text-2xl roboto-slab-regular text-gray-300 mb-3">
                Built & Designed by
              </div>
              
              {/* Name with creative effects */}
              <div className="relative inline-block group">
                {/* Glowing underline that expands on hover */}
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8B0000] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />
                <div className="absolute -bottom-2 left-0 right-0 h-[2px] bg-[#8B0000] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                
                {/* Scattered accent marks */}
                <div className="absolute -top-4 -left-2 w-2 h-2 bg-[#8B0000] rotate-45 opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ animationDelay: '0.1s' }} />
                <div className="absolute -top-3 -right-3 w-3 h-3 border-2 border-[#8B0000] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ animationDelay: '0.2s' }} />
                <div className="absolute -bottom-4 right-0 w-2 h-2 bg-[#8B0000] opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ animationDelay: '0.15s' }} />
                
                <p className="text-4xl md:text-5xl font-bold roboto-slab-regular relative" style={{ 
                  color: '#e5e2cf',
                  textShadow: '0 0 20px rgba(139, 0, 0, 0.3), 4px 4px 0px rgba(0, 0, 0, 0.3)',
                  letterSpacing: '0.05em'
                }}>
                  {/* Glitch effect layers */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{
                    color: '#8B0000',
                    animation: 'glitchShift 2.5s ease-in-out infinite',
                    textShadow: 'none'
                  }}>
                    {personalInfo.name}
                  </span>
                  <span className="relative inline-block group-hover:scale-105 transition-transform duration-300">
                    {personalInfo.name.split('').map((letter, idx) => (
                      <span
                        key={idx}
                        className="inline-block hover:scale-125 hover:-translate-y-2 transition-all duration-200"
                        style={{
                          transitionDelay: `${idx * 0.03}s`
                        }}
                      >
                        {letter}
                      </span>
                    ))}
                  </span>
                </p>
              </div>
            </div>
            
            {/* Corner decorative elements */}
            <div className="absolute -top-6 -left-6 w-12 h-12 border-t-4 border-l-4 border-[#8B0000] opacity-40" />
            <div className="absolute -bottom-6 -right-6 w-12 h-12 border-b-4 border-r-4 border-[#8B0000] opacity-40" />
          </div>
        </div>
        
        {/* Animated scanline effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #8B0000 2px, #8B0000 4px)',
            animation: 'scanline 8s linear infinite'
          }} />
        </div>
      </footer>
    </div>
  );
}