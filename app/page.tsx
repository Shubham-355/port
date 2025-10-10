'use client';

import { Github, Linkedin, Mail, Twitter, ExternalLink, Code, Edit, Folder, ChevronLeft, ChevronRight } from 'lucide-react';
import { Home as HomeIcon, User, Briefcase, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { LucideIcon } from "lucide-react"

interface SocialLink {
  title: string;
  icon: LucideIcon;
  href: string;
}

interface MainProject {
  title: string;
  description: string;
  tech: string[];
  liveUrl: string;
  githubUrl: string;
}

interface SliderProject {
  title: string;
  description: string;
  company: string;
  year: string;
  link: string;
}

interface SmallProject {
  title: string;
  description: string;
  company: string;
  year: string;
  link: string;
}

const XIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    width={size}
    height={size}
    viewBox="0,0,256,256"
    className={className}
  >
    <g fill="currentColor" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="bold" fontSize="none" textAnchor="none" style={{ mixBlendMode: 'normal' }} opacity="1">
      <g transform="scale(5.12,5.12)">
        <path d="M5.91992,6l14.66211,21.375l-14.35156,16.625h3.17969l12.57617,-14.57812l10,14.57813h12.01367l-15.31836,-22.33008l13.51758,-15.66992h-3.16992l-11.75391,13.61719l-9.3418,-13.61719zM9.7168,8h7.16406l23.32227,34h-7.16406z" strokeWidth="1.5" stroke="currentColor"></path>
      </g>
    </g>
  </svg>
);

const iconMap: Record<string, LucideIcon> = {
  Github,
  Linkedin, 
  Twitter: XIcon as LucideIcon,
  Mail,
  github: Github,
  linkedin: Linkedin,
  twitter: XIcon as LucideIcon,
  email: Mail,
  mail: Mail
};

const parseSocialLinks = (): SocialLink[] => {
  const socialLinksEnv = process.env.NEXT_PUBLIC_SOCIAL_LINKS || '';
  if (!socialLinksEnv) return [];

  return socialLinksEnv.split(',').map(link => {
    const parts = link.split(':');
    const platform = parts[0]?.trim() || '';
    // Reconstruct the URL by joining parts 1 onwards with ':'
    const url = parts.slice(1, -1).join(':').trim();
    const iconName = parts[parts.length - 1]?.trim() || '';
    const iconKey = iconName || platform;
    
    return {
      title: platform.charAt(0).toUpperCase() + platform.slice(1),
      icon: iconMap[iconKey] || iconMap[platform] || Mail,
      href: url
    };
  }).filter(link => link.href);
};

const parseMainProjects = (): MainProject[] => {
  const mainProjectsEnv = process.env.NEXT_PUBLIC_MAIN_PROJECTS || '';
  if (!mainProjectsEnv) return [];

  return mainProjectsEnv.split(',').map(project => {
    const parts = project.split(':');
    const title = parts[0] || '';
    const description = parts[1] || '';
    const techString = parts[2] || '';
    const tech = techString ? techString.split(',').map(t => t.trim()) : [];
    const liveUrl = parts[3] || '';
    const githubUrl = parts[4] || '';

    return {
      title,
      description,
      tech,
      liveUrl,
      githubUrl
    };
  }).filter(project => project.title && project.description);
};

const parseSliderProjects = (): SliderProject[] => {
  const sliderProjectsEnv = process.env.NEXT_PUBLIC_SLIDER_PROJECTS || '';
  if (!sliderProjectsEnv) return [];

  return sliderProjectsEnv.split(',').map(project => {
    const parts = project.split('|');
    const link = parts[4]?.trim() || '';
    
    return {
      title: parts[0]?.trim() || '',
      description: parts[1]?.trim() || '',
      company: parts[2]?.trim() || '',
      year: parts[3]?.trim() || '',
      link: link
    };
  }).filter(project => project.title && project.description && project.link);
};

const parseSmallProjects = (): SmallProject[] => {
  const smallProjectsEnv = process.env.NEXT_PUBLIC_SMALL_PROJECTS || '';
  if (!smallProjectsEnv) return [];

  return smallProjectsEnv.split(',').map(project => {
    const trimmedProject = project.trim();
    
    const parts = [];
    let currentPart = '';
    let colonCount = 0;
    
    for (let i = 0; i < trimmedProject.length; i++) {
      const char = trimmedProject[i];
      
      if (char === ':') {
        // Check if this colon is part of http:// or https://
        const beforeColon = trimmedProject.substring(Math.max(0, i - 5), i);
        const afterColon = trimmedProject.substring(i, i + 3);
        
        if (beforeColon.includes('http') && afterColon === '://') {
          // This is part of a protocol, include it in current part
          currentPart += char;
        } else {
          // This is a field separator
          parts.push(currentPart);
          currentPart = '';
          colonCount++;
        }
      } else {
        currentPart += char;
      }
    }
    
    // Add the last part
    if (currentPart) {
      parts.push(currentPart);
    }
    
    // If we couldn't parse properly, try simple split and reconstruct URL
    if (parts.length < 5) {
      const simpleParts = trimmedProject.split(':');
      if (simpleParts.length >= 5) {
        // Reconstruct the URL from the parts that likely contain protocol
        const title = simpleParts[0]?.trim() || '';
        const description = simpleParts[1]?.trim() || '';
        const company = simpleParts[2]?.trim() || '';
        const year = simpleParts[3]?.trim() || '';
        // Join the remaining parts to reconstruct the full URL
        const urlParts = simpleParts.slice(4);
        const link = urlParts.join(':').trim();
        
        return { title, description, company, year, link };
      }
    }
    
    return {
      title: parts[0]?.trim() || '',
      description: parts[1]?.trim() || '',
      company: parts[2]?.trim() || '',
      year: parts[3]?.trim() || '',
      link: parts[4]?.trim() || ''
    };
  }).filter(project => project.title && project.description && project.link);
};

const parseTechnologies = (): string[] => {
  const technologiesEnv = process.env.NEXT_PUBLIC_TECHNOLOGIES || '';
  if (!technologiesEnv) return [];
  
  return technologiesEnv.split(',').map(tech => tech.trim());
};

const getPersonalInfo = () => ({
  name: process.env.NEXT_PUBLIC_DEVELOPER_NAME || 'Developer',
  role: process.env.NEXT_PUBLIC_DEVELOPER_DESC || 'I create stuff sometimes.',
  skills: process.env.NEXT_PUBLIC_DEVELOPER_SKILLS || 'Passionate Developer',
  email: process.env.NEXT_PUBLIC_EMAIL,
  phone: process.env.NEXT_PUBLIC_PHONE || '',
  location: process.env.NEXT_PUBLIC_LOCATION || '',
  aboutText: process.env.NEXT_PUBLIC_ABOUT_TEXT || 'Passionate developer creating amazing applications.',
  techHeaderText: process.env.NEXT_PUBLIC_TECH_HEADER_TEXT || 'Here are some technologies I have been working with:',
  additionalAboutText: process.env.NEXT_PUBLIC_ADDITIONAL_ABOUT_TEXT || '',
  resumeUrl: process.env.NEXT_PUBLIC_RESUME_URL || '#'
});

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface Tab {
  title: string;
  icon: LucideIcon;
  type?: never;
}

interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
}

type TabItem = Tab | Separator;

interface ExpandableTabsProps {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
  onChange?: (index: number | null) => void;
}

const useScrollPosition = () => {
  const [scrollY, setScrollY] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      const startScroll = 50;
      const endScroll = 350;
      const progress = Math.min(Math.max((currentScrollY - startScroll) / (endScroll - startScroll), 0), 1);
      setAnimationProgress(progress);
    };

    let ticking = false;
    const smoothHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', smoothHandleScroll, { passive: true });
    return () => window.removeEventListener('scroll', smoothHandleScroll);
  }, []);

  const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  const easeOutElastic = (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  };

  const smoothProgress = easeInOutCubic(animationProgress);
  const elasticProgress = easeOutElastic(animationProgress);

  return { 
    scrollY, 
    progress: animationProgress, 
    smoothProgress, 
    elasticProgress,
    isCollapsed: animationProgress > 0
  };
};

const CodingAnimation = () => {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false); // Start as false
  const [hasAnimated, setHasAnimated] = useState(false); // Track if animation has played
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [floatingElements] = useState(() => {
    if (typeof window === 'undefined') return [];
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      initialX: Math.random() * 300,
      initialY: Math.random() * 300,
      targetX: Math.random() * 300,
      targetY: Math.random() * 300,
      symbol: ['{}', '[]', '()', '==', '=>', '&&'][i]
    }));
  });

  const [particles] = useState(() => {
    if (typeof window === 'undefined') return [];
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 320,
      delay: i * 0.3
    }));
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Intersection observer to detect when component is in view
  useEffect(() => {
    if (!isClient || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            // Start typing animation when component comes into view
            setIsTyping(true);
            setHasAnimated(true);
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of the component is visible
        rootMargin: '0px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [isClient, hasAnimated]);

  // Get personal info for dynamic code snippets
  const personalInfo = getPersonalInfo();
  const skillsArray = personalInfo.skills.split(',').map(s => s.trim()).filter(Boolean);

  const codeSnippets = [
    "const developer = {",
    "  name: '" + personalInfo.name + "',",
    "  skills: [",
    "    '" + skillsArray.slice(0, 2).join("', '") + "',",
    "  ]",
    "};",
    "",
    "const funFacts = {",
    "  hackathons: 'Always excited ⚡',",
    "  community: 'Love collaborating 🤝',",
    "  passion: 'Building cool stuff! 🚀'",
    "};",
  ];

  useEffect(() => {
    if (!isTyping) return;

    const currentLine = codeSnippets[currentLineIndex];
    
    if (currentCharIndex < currentLine.length) {
      // Type current character
      const timer = setTimeout(() => {
        setDisplayedLines(prev => {
          const newLines = [...prev];
          if (newLines[currentLineIndex] === undefined) {
            newLines[currentLineIndex] = '';
          }
          newLines[currentLineIndex] = currentLine.slice(0, currentCharIndex + 1);
          return newLines;
        });
        setCurrentCharIndex(prev => prev + 1);
      }, 50); // Typing speed

      return () => clearTimeout(timer);
    } else if (currentLineIndex < codeSnippets.length - 1) {
      // Move to next line
      const timer = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, 300); // Pause between lines

      return () => clearTimeout(timer);
    } else {
      // Animation complete - stop typing and keep the code displayed
      setIsTyping(false);
    }
  }, [currentLineIndex, currentCharIndex, isTyping, personalInfo.name, personalInfo.skills]);

  const getLineColor = (line: string) => {
    if (!line) return 'text-zinc-500';
    if (line.trim() === '') return 'text-zinc-500';
    
    // Comments
    if (line.includes('//')) return 'text-gray-500 italic';
    
    // Keywords (const, function, return)
    if (line.match(/^\s*const\s+/) || line.match(/^\s*function\s+/) || line.match(/^\s*return\s+/)) {
      return 'text-purple-400';
    }
    
    // Property names and variable assignments
    if (line.includes(':') && !line.includes('//')) {
      return 'text-emerald-400';
    }
    
    // Strings (anything with quotes but not comments)
    if ((line.includes("'") || line.includes('"')) && !line.includes('//')) {
      return 'text-amber-300';
    }
    
    // Brackets and punctuation - opening/closing braces and brackets
    if (line.match(/^\s*[\{\}\[\]]\s*$/)) {
      return 'text-blue-300';
    }
    
    return 'text-zinc-300';
  };

  if (!isClient) {
    return (
      <div ref={containerRef} className="relative w-full h-full bg-gradient-to-br from-zinc-900/90 to-black/95 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="bg-zinc-800/80 backdrop-blur-sm rounded-lg border border-zinc-700/50 p-4 max-w-sm w-full">
            <div className="flex items-center gap-2 mb-3 border-b border-zinc-700/50 pb-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <span className="text-xs text-zinc-400 ml-2 font-mono">developer.js</span>
            </div>
            
            <div className="font-mono text-xs min-h-[200px]" style={{ whiteSpace: 'pre' }}>
              {displayedLines.map((line, index) => {
                const isCurrentLine = index === currentLineIndex && isTyping;
                const lineColor = getLineColor(line);
                
                return (
                  <div key={index} className="leading-relaxed">
                    <span className={lineColor}>
                      {line || '\u00A0'}
                    </span>
                    {isCurrentLine && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="text-blue-400"
                      >
                        |
                      </motion.span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 border-2 border-blue-400/30 rounded-lg">
            <Code className="w-4 h-4 text-blue-400/60 m-1" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gradient-to-br from-zinc-900/90 to-black/95 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="bg-zinc-800/80 backdrop-blur-sm rounded-lg border border-zinc-700/50 p-4 max-w-sm w-full">
          <div className="flex items-center gap-2 mb-3 border-b border-zinc-700/50 pb-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            <span className="text-xs text-zinc-400 ml-2 font-mono">developer.js</span>
          </div>
          
          <div className="font-mono text-xs min-h-[200px]" style={{ whiteSpace: 'pre' }}>
            {displayedLines.map((line, index) => {
              const isCurrentLine = index === currentLineIndex && isTyping;
              const lineColor = getLineColor(line);
              
              return (
                <div key={index} className="leading-relaxed">
                  <span className={lineColor}>
                    {line || '\u00A0'}
                  </span>
                  {isCurrentLine && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="text-blue-400 ml-0"
                    >
                      |
                    </motion.span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

function useOnClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".5rem",
    paddingRight: isSelected ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: "spring" as const, bounce: 0, duration: 0.6 };

const leftNavVariants = {
  separate: { x: 0, scale: 1 },
  approaching: { 
    x: 50, 
    scale: 1.05,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 }
  },
  colliding: { 
    x: 100, 
    scale: 0.95,
    transition: { type: "spring" as const, stiffness: 400, damping: 20 }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.3 }
  }
};

const rightNavVariants = {
  separate: { x: 0, scale: 1 },
  approaching: { 
    x: -50, 
    scale: 1.05,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 }
  },
  colliding: { 
    x: -100, 
    scale: 0.95,
    transition: { type: "spring" as const, stiffness: 400, damping: 20 }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.3 }
  }
};

const mergedNavVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8, 
    y: -20
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      type: "spring" as const, 
      stiffness: 300, 
      damping: 25,
      delay: 0.2 
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -20,
    transition: { duration: 0.2 }
  }
};

function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-blue-400",
  onChange,
}: ExpandableTabsProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const outsideClickRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(outsideClickRef, () => {
    setSelected(null);
    onChange?.(null);
  });

  const handleSelect = (index: number) => {
    setSelected(index);
    onChange?.(index);
  };

  const Separator = () => (
    <div className="mx-1 h-[24px] w-[1.2px] bg-zinc-700" aria-hidden="true" />
  );

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-800 bg-black/20 backdrop-blur-lg p-1 shadow-sm",
        className
      )}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <Separator key={`separator-${index}`} />;
        }

        const Icon = tab.icon;
        return (
          <motion.button
            key={tab.title}
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={selected === index}
            onClick={() => handleSelect(index)}
            transition={transition}
            className={cn(
              "relative flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-300",
              selected === index
                ? cn("bg-zinc-800/50", activeColor)
                : "text-zinc-400 hover:bg-zinc-800/30 hover:text-white"
            )}
          >
            <Icon size={20} />
            <AnimatePresence initial={false}>
              {selected === index && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

function ExpandableSocialLinks({
  links,
  className,
}: {
  links: Array<{ title: string; icon: LucideIcon; href: string }>;
  className?: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const outsideClickRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(outsideClickRef, () => {
    setSelected(null);
  });

  const handleSelect = (index: number, href: string) => {
    setSelected(index);
    window.open(href, '_blank');
  };

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-800 bg-black/20 backdrop-blur-lg p-1 shadow-sm",
        className
      )}
    >
      {links.map((link, index) => {
        const Icon = link.icon;
        return (
          <motion.button
            key={link.title}
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={selected === index}
            onClick={() => handleSelect(index, link.href)}
            transition={transition}
            className={cn(
              "relative flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-300",
              selected === index
                ? "bg-zinc-800/50 text-blue-400"
                : "text-zinc-400 hover:bg-zinc-800/30 hover:text-white"
            )}
          >
            <Icon size={20} />
            <AnimatePresence initial={false}>
              {selected === index && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {link.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

function CollisionNavbar({
  tabs,
  socialLinks,
  onChange,
  className = "",
}: {
  tabs: TabItem[];
  socialLinks: Array<{ title: string; icon: LucideIcon; href: string }>;
  onChange?: (index: number | null) => void;
  className?: string;
}) {
  const { progress, smoothProgress, elasticProgress, isCollapsed } = useScrollPosition();
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [selectedSocial, setSelectedSocial] = useState<number | null>(null);
  const outsideClickRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(outsideClickRef, () => {
    setSelectedTab(null);
    setSelectedSocial(null);
    onChange?.(null);
  });

  const handleTabSelect = (index: number) => {
    setSelectedTab(index);
    setSelectedSocial(null);
    onChange?.(index);
  };

  const handleSocialSelect = (index: number, href: string) => {
    setSelectedSocial(index);
    setSelectedTab(null);
    
    if (!href || href.trim() === '') {
      console.log('No href provided for social link');
      return;
    }

    try {
      let cleanUrl = href.trim();
      
      // Handle mailto links
      if (cleanUrl.startsWith('mailto:')) {
        window.location.href = cleanUrl;
        return;
      }
      
      // Add protocol if missing for other links
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      
      console.log('Opening social URL:', cleanUrl);
      window.open(cleanUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening social URL:', error);
    }
  };

  const getLeftNavTransform = () => {
    const baseX = 0;
    const targetX = window.innerWidth / 2 - 200; // Move towards center
    const currentX = baseX + (targetX - baseX) * smoothProgress;
    
    const scale = 1 + (0.1 * elasticProgress); // Slight scaling effect
    const rotation = smoothProgress * 2; // Slight rotation during movement
    
    return {
      x: currentX,
      scale,
      rotate: rotation,
      borderRadius: `${16 - 8 * smoothProgress}px ${16 + 8 * smoothProgress}px ${16 + 8 * smoothProgress}px ${16 - 8 * smoothProgress}px`,
    };
  };

  const getRightNavTransform = () => {
    const baseX = 0;
    const targetX = -(window.innerWidth / 2 - 200); // Move towards center
    const currentX = baseX + (targetX - baseX) * smoothProgress;
    
    const scale = 1 + (0.1 * elasticProgress);
    const rotation = -smoothProgress * 2;
    
    return {
      x: currentX,
      scale,
      rotate: rotation,
      borderRadius: `${16 + 8 * smoothProgress}px ${16 - 8 * smoothProgress}px ${16 - 8 * smoothProgress}px ${16 + 8 * smoothProgress}px`,
    };
  };

  const getMergedOpacity = () => {
    // Start showing merged navbar when collision is almost complete
    return progress > 0.8 ? (progress - 0.8) / 0.2 : 0;
  };

  const getSeparateOpacity = () => {
    // Hide separate navbars when collision is almost complete
    // More aggressive hiding on mobile (smaller screens)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const hideThreshold = isMobile ? 0.6 : 0.8;
    const fadeRange = isMobile ? 0.3 : 0.2;
    
    return progress > hideThreshold ? 
      Math.max(0, 1 - ((progress - hideThreshold) / fadeRange)) : 1;
  };

  // Advanced collision physics calculations
  const getAdvancedLeftTransform = () => {
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const baseX = 0;
    const centerTarget = windowWidth / 2 - 250;
    
    // Multi-phase movement with different easing
    const phase1 = Math.min(progress * 3, 1); // Initial acceleration
    const phase2 = Math.max(0, Math.min((progress - 0.3) * 2.5, 1)); // Mid collision
    const phase3 = Math.max(0, Math.min((progress - 0.7) * 3.33, 1)); // Final merge
    
    const currentX = baseX + (centerTarget * phase1) + (50 * phase2) - (20 * phase3);
    
    // Advanced deformation effects
    const stretchX = 1 + (0.3 * phase2) - (0.2 * phase3);
    const stretchY = 1 - (0.1 * phase2) + (0.05 * phase3);
    const rotation = (phase1 * 3) - (phase2 * 2) + (phase3 * 1);
    
    // Magnetic attraction effect
    const magneticPull = Math.sin(progress * Math.PI) * 10;
    
    return {
      x: currentX + magneticPull,
      scaleX: stretchX,
      scaleY: stretchY,
      rotate: rotation,
      skewX: phase2 * 3,
    };
  };

  const getAdvancedRightTransform = () => {
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const baseX = 0;
    const centerTarget = -(windowWidth / 2 - 250);
    
    const phase1 = Math.min(progress * 3, 1);
    const phase2 = Math.max(0, Math.min((progress - 0.3) * 2.5, 1));
    const phase3 = Math.max(0, Math.min((progress - 0.7) * 3.33, 1));
    
    const currentX = baseX + (centerTarget * phase1) - (50 * phase2) + (20 * phase3);
    
    const stretchX = 1 + (0.3 * phase2) - (0.2 * phase3);
    const stretchY = 1 - (0.1 * phase2) + (0.05 * phase3);
    const rotation = -(phase1 * 3) + (phase2 * 2) - (phase3 * 1);
    
    const magneticPull = Math.sin(progress * Math.PI) * -10;
    
    return {
      x: currentX + magneticPull,
      scaleX: stretchX,
      scaleY: stretchY,
      rotate: rotation,
      skewX: -phase2 * 3,
    };
  };

  // Dynamic border radius for fluid morphing
  const getFluidBorderRadius = (isLeft: boolean) => {
    const base = 16;
    const deformation = progress * 12;
    
    if (isLeft) {
      return `${base}px ${base + deformation}px ${base + deformation}px ${base}px`;
    } else {
      return `${base + deformation}px ${base}px ${base}px ${base + deformation}px`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Left navigation - tabs */}
      <motion.div
        className="absolute top-4 sm:top-6 left-2 sm:left-6 pointer-events-auto"
        animate={getAdvancedLeftTransform()}
        transition={{ 
          type: "spring", 
          stiffness: 150, 
          damping: 25, 
          mass: 0.5,
          velocity: progress > 0.5 ? 20 : 0
        }}
        style={{ 
          opacity: getSeparateOpacity(),
          visibility: getSeparateOpacity() < 0.01 ? 'hidden' : 'visible',
          pointerEvents: getSeparateOpacity() < 0.01 ? 'none' : 'auto'
        }}
      >
        <motion.div 
          className="flex items-center gap-0.5 sm:gap-1 border border-zinc-800 bg-black/20 backdrop-blur-lg p-0.5 sm:p-1 shadow-lg overflow-hidden relative max-w-[calc(100vw-1rem)] sm:max-w-none"
          style={{ 
            borderRadius: getFluidBorderRadius(true),
            background: `rgba(0,0,0,0.2)`,
            boxShadow: `0 4px 15px rgba(0,0,0,0.3)`,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          animate={{
            filter: `blur(${progress * 0.3}px) brightness(${1 + progress * 0.2})`,
          }}
        >
          {tabs.map((tab, index) => {
            if (tab.type === "separator") {
              return (
                <motion.div 
                  key={`separator-${index}`} 
                  className="mx-0.5 sm:mx-1 h-[20px] sm:h-[24px] w-[1px] sm:w-[1.2px] bg-zinc-700 flex-shrink-0"
                  animate={{
                    scaleY: 1 - (progress * 0.3),
                    opacity: 1 - (progress * 0.4)
                  }}
                />
              );
            }

            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.title}
                onClick={() => handleTabSelect(index)}
                className={cn(
                  "relative flex items-center rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-sm font-medium transition-colors duration-300 flex-shrink-0 whitespace-nowrap",
                  selectedTab === index
                    ? "bg-zinc-800/50 text-blue-400"
                    : "text-zinc-400 hover:bg-zinc-800/30 hover:text-white"
                )}
                animate={{
                  scale: 1 - (progress * 0.1) + (index === selectedTab ? 0.05 : 0),
                  opacity: 1 - (progress * 0.2),
                  y: Math.sin(progress * Math.PI + index) * 2
                }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={16} className="sm:w-5 sm:h-5" />
                <AnimatePresence initial={false}>
                  {selectedTab === index && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="overflow-hidden whitespace-nowrap ml-1 sm:ml-2 hidden sm:inline"
                    >
                      {tab.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Right navigation - social links */}
      <motion.div
        className="absolute top-4 sm:top-6 right-2 sm:right-6 pointer-events-auto"
        animate={getAdvancedRightTransform()}
        transition={{ 
          type: "spring", 
          stiffness: 150, 
          damping: 25, 
          mass: 0.5,
          velocity: progress > 0.5 ? -20 : 0
        }}
        style={{ 
          opacity: getSeparateOpacity(),
          visibility: getSeparateOpacity() < 0.01 ? 'hidden' : 'visible',
          pointerEvents: getSeparateOpacity() < 0.01 ? 'none' : 'auto'
        }}
      >
        <motion.div 
          className="flex items-center gap-0.5 sm:gap-1 border border-zinc-800 bg-black/20 backdrop-blur-lg p-0.5 sm:p-1 shadow-lg overflow-hidden relative max-w-[calc(100vw-1rem)] sm:max-w-none"
          style={{ 
            borderRadius: getFluidBorderRadius(false),
            background: `rgba(0,0,0,0.2)`,
            boxShadow: `0 4px 15px rgba(0,0,0,0.3)`,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          animate={{
            filter: `blur(${progress * 0.3}px) brightness(${1 + progress * 0.2})`,
          }}
        >
          {socialLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <motion.button
                key={`${link.title}-${index}`}
                onClick={() => handleSocialSelect(index, link.href)}
                className={cn(
                  "relative flex items-center rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-sm font-medium transition-colors duration-300 flex-shrink-0 whitespace-nowrap",
                  selectedSocial === index
                    ? "bg-zinc-800/50 text-blue-400"
                    : "text-zinc-400 hover:bg-zinc-800/30 hover:text-white"
                )}
                animate={{
                  scale: 1 - (progress * 0.1) + (index === selectedSocial ? 0.05 : 0),
                  opacity: 1 - (progress * 0.2),
                  y: Math.sin(progress * Math.PI + index + Math.PI) * 2
                }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={16} className="sm:w-5 sm:h-5" />
                <AnimatePresence initial={false}>
                  {selectedSocial === index && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="overflow-hidden whitespace-nowrap ml-1 sm:ml-2 hidden sm:inline"
                    >
                      {link.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Merged navigation */}
      <motion.div
        className="absolute top-4 sm:top-6 left-1/2 transform -translate-x-1/2 pointer-events-auto"
        initial={{ opacity: 0, scale: 0.3, y: -40, rotateX: -90 }}
        animate={{ 
          opacity: getMergedOpacity(),
          scale: 0.3 + (0.7 * getMergedOpacity()),
          y: -40 + (40 * getMergedOpacity()),
          rotateX: -90 + (90 * getMergedOpacity())
        }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 20,
          mass: 0.8
        }}
        style={{
          visibility: getMergedOpacity() > 0.01 ? 'visible' : 'hidden',
          pointerEvents: getMergedOpacity() > 0.01 ? 'auto' : 'none'
        }}
        ref={outsideClickRef}
      >
        <motion.div 
          className="flex items-center gap-1 sm:gap-2 rounded-xl sm:rounded-2xl border border-zinc-800 bg-black/20 backdrop-blur-lg p-0.5 sm:p-1 shadow-lg relative overflow-hidden max-w-[calc(100vw-1rem)]"
          style={{
            background: `rgba(0,0,0,0.2)`,
            boxShadow: `0 8px 25px rgba(0,0,0,0.4)`,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          animate={{
            filter: `brightness(${1 + getMergedOpacity() * 0.3})`,
          }}
        >
          {/* Tabs in merged nav */}
          {tabs.map((tab, index) => {
            if (tab.type === "separator") {
              return (
                <motion.div 
                  key={`separator-${index}`} 
                  className="mx-1 sm:mx-2 h-[20px] sm:h-[24px] w-[1px] sm:w-[1.2px] bg-zinc-700 flex-shrink-0"
                  initial={{ opacity: 0, scaleY: 0, rotateZ: 180 }}
                  animate={{ 
                    opacity: getMergedOpacity(), 
                    scaleY: getMergedOpacity(),
                    rotateZ: 0
                  }}
                  transition={{ 
                    delay: index * 0.08,
                    type: "spring",
                    stiffness: 300
                  }}
                />
              );
            }

            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.title}
                onClick={() => handleTabSelect(index)}
                className={cn(
                  "relative flex items-center rounded-lg sm:rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 text-sm font-medium transition-all duration-300 flex-shrink-0 whitespace-nowrap",
                  selectedTab === index
                    ? "bg-zinc-800/50 text-blue-400"
                    : "text-zinc-400 hover:bg-zinc-800/30 hover:text-white"
                )}
                initial={{ 
                  opacity: 0, 
                  x: -30, 
                  rotateY: -90,
                  scale: 0.5
                }}
                animate={{ 
                  opacity: getMergedOpacity(), 
                  x: 0,
                  rotateY: 0,
                  scale: 1
                }}
                transition={{ 
                  delay: index * 0.08,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.95
                }}
              >
                <Icon size={16} className="sm:w-5 sm:h-5" />
                
                <AnimatePresence initial={false}>
                  {selectedTab === index && (
                    <motion.span
                      initial={{ width: 0, opacity: 0, x: -10 }}
                      animate={{ width: "auto", opacity: 1, x: 0 }}
                      exit={{ width: 0, opacity: 0, x: -10 }}
                      className="overflow-hidden whitespace-nowrap ml-1 sm:ml-2 font-medium hidden sm:inline"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      {tab.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}

          {/* Separator between tabs and social links */}
          <motion.div 
            className="mx-1.5 sm:mx-3 h-[22px] sm:h-[28px] w-[1.5px] sm:w-[2px] bg-zinc-700 rounded-full flex-shrink-0"
            initial={{ opacity: 0, scaleY: 0, rotateZ: 180 }}
            animate={{ 
              opacity: getMergedOpacity() * 0.8, 
              scaleY: getMergedOpacity(),
              rotateZ: 0
            }}
            transition={{ 
              delay: tabs.length * 0.08,
              type: "spring",
              stiffness: 300
            }}
          />

          {/* Social links in merged nav */}
          {socialLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <motion.button
                key={`${link.title}-merged-${index}`}
                onClick={() => handleSocialSelect(index, link.href)}
                className={cn(
                  "relative flex items-center rounded-lg sm:rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 text-sm font-medium transition-all duration-300 flex-shrink-0 whitespace-nowrap",
                  selectedSocial === index
                    ? "bg-zinc-800/50 text-blue-400"
                    : "text-zinc-400 hover:bg-zinc-800/30 hover:text-white"
                )}
                initial={{ 
                  opacity: 0, 
                  x: 30, 
                  rotateY: 90,
                  scale: 0.5
                }}
                animate={{ 
                  opacity: getMergedOpacity(), 
                  x: 0,
                  rotateY: 0,
                  scale: 1
                }}
                transition={{ 
                  delay: (tabs.length + index + 1) * 0.08,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.95
                }}
              >
                <Icon size={16} className="sm:w-5 sm:h-5" />
                
                <AnimatePresence initial={false}>
                  {selectedSocial === index && (
                    <motion.span
                      initial={{ width: 0, opacity: 0, x: 10 }}
                      animate={{ width: "auto", opacity: 1, x: 0 }}
                      exit={{ width: 0, opacity: 0, x: 10 }}
                      className="overflow-hidden whitespace-nowrap ml-1 sm:ml-2 font-medium hidden sm:inline"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      {link.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}

const Typist = ({ text, cursor = true }: { text: string; cursor?: boolean }) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [text]);

  useEffect(() => {
    if (!cursor) return;
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorTimer);
  }, [cursor]);

  return (
    <span>
      {displayText}
      {cursor && <span className={`${showCursor ? 'opacity-100' : 'opacity-0'}`}>|</span>}
    </span>
  );
};

const CardCanvas = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`card-canvas relative ${className}`} style={{ isolation: 'isolate' }}>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter width="3000%" x="-1000%" height="3000%" y="-1000%" id="unopaq">
          <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 3 0"></feColorMatrix>
        </filter>
      </svg>
      <div className="card-backdrop absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl"></div>
      {children}
    </div>
  );
};

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`glow-card relative group ${className}`}>
      <div className="border-element border-left absolute left-0 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-blue-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="border-element border-right absolute right-0 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-purple-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="border-element border-top absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="border-element border-bottom absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="card-content relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

const RetroGrid = ({
  className,
  angle = 65,
}: {
  className?: string;
  angle?: number;
}) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute size-full overflow-hidden opacity-50 [perspective:200px]",
        className,
      )}
      style={{ "--grid-angle": `${angle}deg` } as React.CSSProperties}
    >
      {/* Grid */}
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div
          className={cn(
            "animate-grid",
            "[background-repeat:repeat] [background-size:60px_60px] [height:300vh] [inset:0%_0px] [margin-left:-50%] [transform-origin:100%_0_0] [width:600vw]",
            // Light Styles
            "[background-image:linear-gradient(to_right,rgba(0,0,0,0.3)_1px,transparent_0),linear-gradient(to_bottom,rgba(0,0,0,0.3)_1px,transparent_0)]",
            // Dark styles
            "dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.2)_1px,transparent_0),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_0)]",
          )}
          style={{
            animation: "grid 15s linear infinite",
          }}
        />
      </div>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent to-90% dark:from-black" />
      
      <style jsx>{`
        @keyframes grid {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const ProjectCard = ({ 
  title, 
  description, 
  year, 
  company, 
  link, 
  isLarge = false 
}: { 
  title: string; 
  description: string; 
  year: string; 
  company: string; 
  link: string; 
  isLarge?: boolean;
}) => {
  const handleProjectClick = () => {
    if (!link || link.trim() === '') {
      console.log('No link provided for project:', title);
      return;
    }

    try {
      // Clean the URL
      let cleanUrl = link.trim();
      
      // Handle URLs that might have been split incorrectly due to colons
      // If the URL looks incomplete, try to reconstruct it
      if (cleanUrl && !cleanUrl.startsWith('http') && !cleanUrl.startsWith('www')) {
        // Check if this might be a partial URL that got split
        console.log('Potentially incomplete URL for', title, ':', cleanUrl);
      }
      
      // Add protocol if missing
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      
      console.log('Opening URL for', title, ':', cleanUrl);
      window.open(cleanUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening URL for', title, ':', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`group cursor-pointer ${isLarge ? 'h-80 lg:h-96' : 'h-64'}`}
      onClick={handleProjectClick}
    >
      <CardCanvas className="h-full">
        <Card className="h-full">
          <div className={`
            relative h-full p-1.5 rounded-2xl overflow-hidden
            bg-white/5 dark:bg-black/90
            bg-gradient-to-br from-black/5 to-black/[0.02] dark:from-white/5 dark:to-white/[0.02]
            backdrop-blur-xl backdrop-saturate-[180%]
            border border-black/10 dark:border-white/10
            shadow-[0_8px_16px_rgb(0_0_0_/_0.15)] dark:shadow-[0_8px_16px_rgb(0_0_0_/_0.25)]
            will-change-transform translate-z-0
            transition-all duration-300 group-hover:scale-[1.02]
          `}>
            <div className={`
              w-full h-full p-6 rounded-xl relative
              bg-gradient-to-br from-black/[0.05] to-transparent dark:from-white/[0.08] dark:to-transparent
              backdrop-blur-md backdrop-saturate-150
              border border-black/[0.05] dark:border-white/[0.08]
              text-black/90 dark:text-white
              shadow-sm
              will-change-transform translate-z-0
              before:absolute before:inset-0 before:bg-gradient-to-br before:from-black/[0.02] before:to-black/[0.01] dark:before:from-white/[0.03] dark:before:to-white/[0.01] before:opacity-0 before:transition-opacity before:pointer-events-none
              group-hover:before:opacity-100
              flex flex-col justify-between
            `}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-zinc-400 dark:text-white/60 uppercase tracking-wider font-medium">
                    {company}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-white/50 tabular-nums">
                    {year}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-black dark:text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
                  {title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <button 
                  className="text-zinc-500 dark:text-zinc-400 hover:text-blue-400 dark:hover:text-blue-400 transition-colors flex items-center gap-2 text-sm font-medium uppercase tracking-wider"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProjectClick();
                  }}
                >
                  <span>Visit</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Code className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </CardCanvas>
    </motion.div>
  );
};

const ProjectCarousel = ({ projects }: { projects: SliderProject[] }) => {
  const [currentProject, setCurrentProject] = useState(0);

  const nextProject = () => {
    if (projects.length > 0) {
      setCurrentProject((prev) => (prev + 1) % projects.length);
    }
  };

  const prevProject = () => {
    if (projects.length > 0) {
      setCurrentProject((prev) => (prev - 1 + projects.length) % projects.length);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center text-zinc-400 py-12">
        No projects available
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <motion.div
          key={currentProject}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ProjectCard {...projects[currentProject]} isLarge />
        </motion.div>
      </div>
      
      <div className="flex justify-center mt-6 gap-2">
        {projects.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentProject(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentProject === index ? 'bg-blue-400 w-8' : 'bg-zinc-600'
            }`}
          />
        ))}
      </div>
      
      <button
        onClick={prevProject}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors p-2"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextProject}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors p-2"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};

const ProjectGrid = ({ projects }: { projects: SmallProject[] }) => {
  if (projects.length === 0) {
    return (
      <div className="text-center text-zinc-400 py-12">
        No projects available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <ProjectCard key={index} {...project} />
      ))}
    </div>
  );
};

type ViewAnimationProps = {
  delay?: number;
  className?: string;
  children: React.ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export default function Home() {
  const personalInfo = getPersonalInfo();
  const socialLinks = parseSocialLinks();
  const technologies = parseTechnologies();
  const mainProjects = parseMainProjects();
  const sliderProjects = parseSliderProjects();
  const smallProjects = parseSmallProjects();
  
  const [activeSection, setActiveSection] = useState('intro');

  const navTabs: TabItem[] = [
    { title: 'intro', icon: HomeIcon },
    { title: 'about', icon: User },
    { title: 'projects', icon: Briefcase }
  ];

  const scrollToSection = (sectionId: string) => {
    const sections = ['intro', 'about', 'projects'];
    const sectionIndex = parseInt(sectionId);
    const targetSection = sections[sectionIndex] || sections[0];
    
    const element = document.getElementById(targetSection);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavChange = (index: number | null) => {
    if (index !== null && navTabs[index]) {
      scrollToSection(index.toString());
      setActiveSection(navTabs[index].title || '');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['intro', 'about', 'projects'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-900/90 to-black/95" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-purple-900/20" />
      
      <CollisionNavbar
        tabs={navTabs}
        socialLinks={socialLinks}
        onChange={handleNavChange}
      />
      <div className="relative z-10">
        <section id="intro" className="min-h-screen flex items-center justify-center px-6">
          <div className="container mx-auto max-w-6xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-6xl lg:text-8xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                    <Typist text={`Hi, I'm ${personalInfo.name}`} />
                  </span>
                </h1>
                <div className="text-xl lg:text-2xl text-zinc-400">
                  {personalInfo.role}
                </div>
              </div>
              
            </motion.div>
          </div>
        </section>

        <section id="about" className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <AnimatedContainer>
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h2 className="text-4xl lg:text-6xl font-bold">
                    <span className="text-zinc-400">about</span>
                  </h2>
                  <div className="space-y-4 text-zinc-300 leading-relaxed">
                    <p>
                      {personalInfo.aboutText}
                    </p>
                    <p>{personalInfo.techHeaderText}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {technologies.map((tech, index) => (
                        <motion.div
                          key={tech}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="flex items-center text-zinc-300"
                        >
                          <span className="text-blue-400 mr-3">▸</span>
                          {tech}
                        </motion.div>
                      ))}
                    </div>
                    <p>
                      {personalInfo.additionalAboutText}
                    </p>
                  </div>
                  <button 
                    onClick={() => window.open(`mailto:${personalInfo.email}`)}
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm uppercase tracking-wider"
                  >
                    <Mail className="w-4 h-4" />
                    Say hi!
                  </button>
                </div>
                
                <div className="flex justify-center lg:justify-end">
                  <div className="w-80 h-96 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 overflow-hidden shadow-2xl">
                    <CodingAnimation />
                  </div>
                </div>
              </div>
            </AnimatedContainer>
          </div>
        </section>

        <section id="projects" className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <AnimatedContainer>
              <div className="space-y-12">
                <h2 className="text-4xl lg:text-6xl font-bold text-center">
                  <span className="text-zinc-400">projects</span>
                </h2>
                
                <div className="max-w-2xl mx-auto">
                  <ProjectCarousel projects={sliderProjects} />
                </div>

                <div className="mt-20">
                  <ProjectGrid projects={smallProjects} />
                </div>
              </div>
            </AnimatedContainer>
          </div>
        </section>

        <footer className="relative py-2 px-6 overflow-hidden">
          <RetroGrid className="opacity-30" />
          <div className="container mx-auto max-w-6xl text-center relative z-10">
            <AnimatedContainer className="space-y-50">
              <div className="text-zinc-500 pb-50 text-sm">
                Built and designed by <span className="text-zinc-300 font-medium">{personalInfo.name}</span>
              </div>
            </AnimatedContainer>
          </div>
        </footer>
      </div>
    </div>
  );
}