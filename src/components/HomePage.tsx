import {
  Award,
  Building,
  CheckCircle2,
  CreditCard,
  Download,
  Headphones,
  Layers,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { REGIONS_SERVED } from '../../server/seedData.ts';
import type {
  ClientLogo,
  PageRoute,
  ProductItem,
  ProjectCaseStudy,
  SiteContentConfig,
  TechnicalDocument,
  TestimonialItem,
} from '../types/casmura.ts';
import {
  ARCHITECTURAL_EASE,
  ArchitecturalRule,
  CinematicImageReveal,
  EditorialReveal,
  StaggerGroup,
  StaggerItem,
  VIEWPORT_CONFIG,
} from './ArchitecturalMotion.tsx';
import { AutomationPartnersGrid } from './AutomationPartnersGrid.tsx';
import { ClientLogoMarquee } from './ClientLogoMarquee.tsx';
import { InteractiveCurtainSimulator } from './InteractiveCurtainSimulator.tsx';
import { SafeImage } from './SafeImage.tsx';
import { SeamlessHeroVideo } from './SeamlessHeroVideo.tsx';

interface HomePageProps {
  products: ProductItem[];
  projects: ProjectCaseStudy[];
  clients: ClientLogo[];
  documents: TechnicalDocument[];
  testimonials: TestimonialItem[];
  siteContent: SiteContentConfig;
  onNavigate: (page: PageRoute) => void;
  onSelectProduct: (product: ProductItem) => void;
  onSelectProject: (project: ProjectCaseStudy) => void;
  onOpenConsultation: (interest?: string) => void;
}

export function HomePage({
  products,
  projects,
  clients: _clients,
  documents,
  testimonials,
  siteContent,
  onNavigate,
  onSelectProduct,
  onSelectProject,
  onOpenConsultation,
}: HomePageProps) {
  const [productTab, setProductTab] = useState<
    'Featured' | 'Curtains' | 'Indoor Blinds' | 'Outdoor Blinds'
  >('Featured');
  const heroSectionRef = useRef<HTMLElement>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 767px)').matches
      : false
  );
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [heroInView, setHeroInView] = useState(true);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const syncPrefs = () => {
      setIsMobileViewport(mobileQuery.matches);
    };
    syncPrefs();
    mobileQuery.addEventListener('change', syncPrefs);
    return () => mobileQuery.removeEventListener('change', syncPrefs);
  }, []);

  useEffect(() => {
    const el = heroSectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]) setHeroInView(entries[0].isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const heroVideoSrc = isMobileViewport
    ? '/assets/video/casmura-hero-mobile.mp4'
    : '/assets/video/casmura-hero-desktop.mp4';

  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroSectionRef,
    offset: ['start start', 'end start'],
  });
  const heroMediaScale = useTransform(heroScrollProgress, [0, 1], [1, 1.04]);
  const heroMediaY = useTransform(heroScrollProgress, [0, 1], ['0%', '4%']);
  const heroContentY = useTransform(heroScrollProgress, [0, 1], ['0px', '22px']);
  const heroContentOpacity = useTransform(heroScrollProgress, [0, 0.82], [1, 0.18]);

  // Quick Home Inquiry Form state
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [projectLocation, setProjectLocation] = useState('Maldives');
  const [scopeNotes, setScopeNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccessRef, setFormSuccessRef] = useState<string | null>(null);

  const displayedProducts =
    productTab === 'Featured'
      ? products.filter((p) => p.featuredOnHome).slice(0, 3)
      : products.filter((p) => p.category === productTab).slice(0, 3);

  const productCards = displayedProducts.length ? displayedProducts : products.slice(0, 3);

  const featuredProjects = projects.filter((p) => p.featuredOnHome).slice(0, 3);
  const displayProjects = featuredProjects.length ? featuredProjects : projects.slice(0, 3);

  const verifiedTestimonials = testimonials.filter((t) => t.verified);

  const handleHomeInquiry = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'inquiry',
          fullName,
          companyName,
          email,
          projectLocation,
          message: scopeNotes || 'Technical proposal request submitted from homepage.',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Please check your input and try again.');
      } else {
        setFormSuccessRef(data.referenceCode);
        setFullName('');
        setCompanyName('');
        setEmail('');
        setScopeNotes('');
      }
    } catch {
      setFormError('Unable to reach estimation server. Please try WhatsApp or email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* BAND 1: Signature Cinematic Luxury Hospitality Video Hero */}
      <section
        ref={heroSectionRef}
        className="relative min-h-[540px] h-[72vh] sm:h-[78vh] lg:h-[84vh] max-h-[820px] w-full overflow-hidden bg-[#00214A]"
      >
        <motion.div
          style={prefersReducedMotion ? undefined : { scale: heroMediaScale, y: heroMediaY }}
          className="absolute inset-0 will-change-transform"
        >
          <SeamlessHeroVideo
            src={heroVideoSrc}
            posterSrc="/assets/video/casmura-hero-poster.jpg"
            posterAlt="Luxury oceanfront hospitality suite with floor-to-ceiling curtains, tailored sheer drapery, and serene twilight view"
            reducedMotion={prefersReducedMotion}
            inView={heroInView}
          />
        </motion.div>

        {/* Refined Official Navy (#00214A) Cinematic Overlay & Vignette */}
        <div
          className="absolute inset-0 bg-[#00214A]/32 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,33,74,0.18)_0%,rgba(0,33,74,0.58)_100%)] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#00214A]/64 via-[#00214A]/24 to-[#00214A]/82 pointer-events-none"
          aria-hidden="true"
        />

        <motion.div
          style={prefersReducedMotion ? undefined : { y: heroContentY, opacity: heroContentOpacity }}
          className="relative z-10 h-full flex flex-col items-center justify-center px-5 sm:px-6 text-center will-change-transform"
        >
          <div className="max-w-3xl space-y-4 sm:space-y-5">
            <EditorialReveal immediate delay={0.04} duration={0.62} distance={14}>
              <h1 className="font-hero-manrope text-white text-[34px] sm:text-5xl lg:text-[62px] font-extrabold tracking-[-0.02em] leading-[1.12] [text-wrap:balance] whitespace-pre-line drop-shadow-[0_4px_26px_rgba(0,12,30,0.62)]">
                {siteContent.heroHeadline}
              </h1>
            </EditorialReveal>

            {siteContent.heroSubheadline && (
              <EditorialReveal immediate delay={0.14} duration={0.58} distance={10}>
                <p className="max-w-lg mx-auto text-xs sm:text-sm md:text-[15px] text-white/85 font-medium tracking-[0.03em] leading-relaxed drop-shadow-[0_2px_12px_rgba(0,12,30,0.55)]">
                  {siteContent.heroSubheadline}
                </p>
              </EditorialReveal>
            )}
          </div>
        </motion.div>
      </section>

      {/* Seamless Infinite Client Logo Marquee (Directly After Hero Curtain Experience) */}
      <ClientLogoMarquee />

      {/* BAND 2: Deep Navy Signature Interactive Curtain & Sunlight Studio */}
      <section
        id="light-simulator-studio"
        className="glass-ambient-navy text-white py-14 lg:py-20 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Copy, KPIs & Dual Actions */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-4">
                <EditorialReveal delay={0}>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold leading-[1.18] tracking-tight [text-wrap:balance]">
                    {siteContent.introHeading}
                  </h2>
                </EditorialReveal>
                <EditorialReveal delay={0.1}>
                  <p className="text-[15px] leading-relaxed text-white/85">
                    {siteContent.introSummary}
                  </p>
                </EditorialReveal>
              </div>

              {/* 3 KPI Metrics */}
              <EditorialReveal delay={0.16}>
                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-[#C5A15B]/30">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                      16+
                    </div>
                    <div className="text-[11px] font-semibold tracking-wider uppercase text-[#C5A15B] mt-0.5">
                      Years Exp.
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                      300+
                    </div>
                    <div className="text-[11px] font-semibold tracking-wider uppercase text-[#C5A15B] mt-0.5">
                      Clients
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                      100+
                    </div>
                    <div className="text-[11px] font-semibold tracking-wider uppercase text-[#C5A15B] mt-0.5">
                      Intl. Projects
                    </div>
                  </div>
                </div>
              </EditorialReveal>

              {/* Primary + Secondary CTAs */}
              <EditorialReveal delay={0.22}>
                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenConsultation('General Contract Consultation')}
                    className="bg-white hover:bg-[#F3F1EC] text-[#00214A] text-xs font-extrabold uppercase tracking-[0.06em] px-5 py-3 rounded-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
                  >
                    Book Consultation
                  </button>
                  <a
                    href="/api/documents/doc-master-catalogue/download"
                    className="inline-flex items-center gap-2 border border-white/35 hover:border-[#C5A15B] text-white hover:text-[#C5A15B] text-xs font-bold uppercase tracking-[0.06em] px-5 py-3 rounded-md transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    <span>Explore Catalog</span>
                    <Play className="w-2.5 h-2.5 fill-current" />
                  </a>
                </div>
              </EditorialReveal>
            </div>

            {/* Right Interactive Draggable Curtain & Sunlight Studio */}
            <EditorialReveal delay={0.14} direction="left" className="lg:col-span-7">
              <InteractiveCurtainSimulator onInquireSystem={onOpenConsultation} />
            </EditorialReveal>
          </div>
        </div>
      </section>

      {/* BAND 3: Trust Cards + 11 Regions Served */}
      <section className="glass-ambient-light py-12 lg:py-14 border-b border-[#00214A]/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-5" staggerDelay={0.08}>
            <StaggerItem>
              <a
                href="#why-choose-us"
                className="glass-panel-navy glass-card-hover text-white rounded-xl py-7 px-6 text-center cursor-pointer group block h-full"
              >
                <span className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-white/80">
                  Subsidiary of
                </span>
                <span className="block font-display text-xl font-bold mt-1.5 group-hover:text-[#C5A15B] transition-colors">
                  Avarna Holdings
                </span>
              </a>
            </StaggerItem>

            <StaggerItem>
              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="glass-panel-navy glass-card-hover text-white rounded-xl py-7 px-6 text-center cursor-pointer group w-full h-full"
              >
                <span className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-white/80">
                  Guarantee
                </span>
                <span className="block font-display text-xl font-bold mt-1.5 group-hover:text-[#C5A15B] transition-colors">
                  Premium Quality Products
                </span>
              </button>
            </StaggerItem>

            <StaggerItem>
              <button
                type="button"
                onClick={() => onNavigate('case-studies')}
                className="glass-panel-navy glass-card-hover text-white rounded-xl py-7 px-6 text-center cursor-pointer group w-full h-full"
              >
                <span className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-white/80">
                  Hospitality Projects
                </span>
                <span className="block font-display text-xl font-bold mt-1.5 group-hover:text-[#C5A15B] transition-colors">
                  100+ Luxury Resorts
                </span>
              </button>
            </StaggerItem>
          </StaggerGroup>

          <EditorialReveal delay={0.14} className="text-center space-y-2.5 max-w-4xl mx-auto">
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#8C6B2D]">
              Regions Served
            </p>
            <ArchitecturalRule className="w-10 h-[1.5px] bg-[#C5A15B]/75 mx-auto" />
            <p className="text-sm sm:text-[15px] font-semibold text-[#00214A] leading-relaxed">
              {REGIONS_SERVED.join('  |  ')}
            </p>
          </EditorialReveal>
        </div>
      </section>

      {/* BAND 4: Comprehensive Interior & Shading Products with Glass Tabs */}
      <section className="glass-ambient-light py-16 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-8 mb-10 border-b border-[#00214A]/12">
            <EditorialReveal>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#00214A] tracking-tight">
                Comprehensive Interior & Shading Products
              </h2>
            </EditorialReveal>

            {/* Glass Category Navigation Tabs */}
            <EditorialReveal delay={0.1}>
              <div
                className="glass-tabs inline-flex flex-wrap items-center gap-1 p-1 rounded-lg self-start"
                role="tablist"
                aria-label="Filter featured product categories"
              >
                {(['Featured', 'Curtains', 'Indoor Blinds', 'Outdoor Blinds'] as const).map(
                  (tab) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={productTab === tab}
                      onClick={() => setProductTab(tab)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        productTab === tab
                          ? 'bg-[#00214A] text-white shadow-sm'
                          : 'text-slate-600 hover:text-[#00214A]'
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>
            </EditorialReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {productCards.map((product, idx) => (
              <motion.article
                key={product.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT_CONFIG}
                transition={{
                  duration: 0.52,
                  delay: prefersReducedMotion ? 0 : idx * 0.08,
                  ease: ARCHITECTURAL_EASE,
                }}
                className="glass-panel-light glass-card-hover rounded-xl overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <CinematicImageReveal
                    delay={idx * 0.06}
                    className="aspect-[4/3] overflow-hidden bg-slate-200 relative"
                  >
                    <SafeImage
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                    />
                  </CinematicImageReveal>
                  <div className="p-6 space-y-2.5">
                    <h3 className="font-display text-xl font-bold text-[#00214A]">
                      {product.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {product.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-[#00214A]/10 flex items-center justify-between text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => onSelectProduct(product)}
                    className="text-slate-600 hover:text-[#8C6B2D] transition-colors cursor-pointer"
                  >
                    View Specifications
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenConsultation(product.title)}
                    className="inline-flex items-center gap-1.5 text-[#00214A] hover:text-[#8C6B2D] font-bold transition-colors cursor-pointer"
                  >
                    <span>Inquire</span>
                    <Play className="w-2.5 h-2.5 fill-[#C5A15B] text-[#C5A15B]" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>

          <EditorialReveal delay={0.14} className="mt-10 text-center">
            <button
              type="button"
              onClick={() => onNavigate('products')}
              className="inline-flex items-center gap-2 bg-[#00214A] hover:bg-[#00214A]/90 text-white text-sm font-bold px-8 py-3 rounded-md border border-[#C5A15B]/45 hover:border-[#C5A15B] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shadow-sm"
            >
              <span>See All Products</span>
              <Play className="w-3 h-3 fill-[#C5A15B] text-[#C5A15B]" />
            </button>
          </EditorialReveal>
        </div>
      </section>

      {/* BAND 6: Portfolio Highlights (Deep Casmura Navy #00214A) */}
      <section className="glass-ambient-navy text-white py-16 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 mb-10 border-b border-[#C5A15B]/30">
            <div className="space-y-1.5">
              <EditorialReveal delay={0}>
                <p className="text-xs font-bold tracking-[0.14em] uppercase text-[#C5A15B]">
                  Portfolio Highlights
                </p>
              </EditorialReveal>
              <EditorialReveal delay={0.08}>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                  100+ Luxury Resort & Villa Projects
                </h2>
              </EditorialReveal>
            </div>
            <EditorialReveal delay={0.14}>
              <p className="text-sm text-white/85 max-w-md lg:text-right leading-relaxed">
                Showcasing iconic hospitality drapery and outdoor shading installations
                across Indian Ocean destination sanctuaries.
              </p>
            </EditorialReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {displayProjects.map((project, idx) => (
              <motion.article
                key={project.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT_CONFIG}
                transition={{
                  duration: 0.55,
                  delay: prefersReducedMotion ? 0 : idx * 0.09,
                  ease: ARCHITECTURAL_EASE,
                }}
                className="glass-panel-dark glass-card-hover rounded-xl overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <CinematicImageReveal
                    delay={idx * 0.06}
                    className="aspect-[4/3] overflow-hidden bg-black/40"
                  >
                    <SafeImage
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                    />
                  </CinematicImageReveal>
                  <div className="p-6 space-y-2.5">
                    <h3 className="font-display text-xl font-bold text-white">
                      {project.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/85">
                      {project.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-white/15 flex items-center justify-between">
                  <span className="text-xs text-white/75">
                    {project.location}, {project.country}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectProject(project)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#C5A15B] transition-colors cursor-pointer"
                  >
                    <span>Read More</span>
                    <Play className="w-2.5 h-2.5 fill-[#C5A15B] text-[#C5A15B]" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>

          <EditorialReveal delay={0.14} className="mt-10 text-center">
            <button
              type="button"
              onClick={() => onNavigate('case-studies')}
              className="inline-flex items-center gap-2 bg-white hover:bg-[#F3F1EC] text-[#00214A] text-sm font-bold px-8 py-3 rounded-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <span>See All Case Studies</span>
              <Play className="w-3 h-3 fill-[#C5A15B] text-[#C5A15B]" />
            </button>
          </EditorialReveal>
        </div>
      </section>

      {/* Conditional Verified Testimonials Section */}
      {verifiedTestimonials.length > 0 && (
        <section className="bg-white py-14 border-b border-[#00214A]/10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-1 mb-10">
              <EditorialReveal delay={0}>
                <p className="text-xs font-bold tracking-[0.14em] uppercase text-[#8C6B2D]">
                  Verified Client Feedback
                </p>
              </EditorialReveal>
              <EditorialReveal delay={0.08}>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#00214A]">
                  Hospitality Partner Perspectives
                </h2>
              </EditorialReveal>
            </div>

            <StaggerGroup
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              staggerDelay={0.08}
            >
              {verifiedTestimonials.map((t) => (
                <StaggerItem key={t.id}>
                  <blockquote className="glass-panel-light rounded-xl p-6 flex flex-col justify-between space-y-4 h-full">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="pt-3 border-t border-[#00214A]/10">
                      <div className="text-sm font-bold text-[#00214A]">{t.authorName}</div>
                      <div className="text-xs text-slate-500">
                        {t.role} · {t.organization}
                      </div>
                    </footer>
                  </blockquote>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* BAND 7: Smart Architectural Integration */}
      <section className="glass-ambient-light py-16 lg:py-20 border-t border-[#00214A]/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <EditorialReveal delay={0}>
              <p className="text-xs font-bold tracking-[0.14em] uppercase text-[#8C6B2D]">
                Smart Architectural Integration
              </p>
            </EditorialReveal>
            <EditorialReveal delay={0.08}>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#00214A] tracking-tight">
                Automated Drapery & Home Systems
              </h2>
            </EditorialReveal>
          </div>

          <AutomationPartnersGrid
            showExploreLink
            onExplore={() => onNavigate('automation')}
          />
        </div>
      </section>

      {/* BAND 8: Why Choose Us (Deep Casmura Navy #00214A) */}
      <section id="why-choose-us" className="glass-ambient-navy text-white py-16 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <EditorialReveal delay={0}>
              <p className="text-xs font-bold tracking-[0.14em] uppercase text-[#C5A15B]">
                Why Choose Us
              </p>
            </EditorialReveal>
            <EditorialReveal delay={0.08}>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                Hospitality & Contract Solutions
              </h2>
            </EditorialReveal>
          </div>

          <StaggerGroup
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12 text-center"
            staggerDelay={0.07}
          >
            {[
              {
                icon: Award,
                title: 'Hospitality Supply Expert',
                desc: 'Specialized supply solutions designed to meet the unique needs of the hospitality industry.',
              },
              {
                icon: Layers,
                title: 'Wide Contract Product Portfolio',
                desc: 'A comprehensive range of quality products for residential, commercial, and hospitality spaces.',
              },
              {
                icon: Building,
                title: 'Client-Centric Project Solutions',
                desc: "Personalized solutions tailored to each client's requirements and project goals.",
              },
              {
                icon: Wrench,
                title: 'Expert Installation',
                desc: 'Professional installation ensuring precision, quality, and lasting performance.',
              },
              {
                icon: Headphones,
                title: 'After-Sales Service',
                desc: 'Reliable ongoing support to ensure customer satisfaction and product durability.',
              },
              {
                icon: CreditCard,
                title: 'Tailored Payment Structure',
                desc: 'Flexible payment options designed to suit individual project budgets and requirements.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.title} className="flex flex-col items-center space-y-3 group">
                  <div className="w-14 h-14 rounded-full bg-white text-[#00214A] border border-[#C5A15B]/55 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-lg font-bold">{item.title}</h3>
                  <p className="text-sm text-white/85 max-w-xs leading-relaxed">
                    {item.desc}
                  </p>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* BAND 9: Catalogue Download Bar */}
      {documents.length > 0 && (
        <section className="glass-ambient-light py-14 border-b border-[#00214A]/10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <EditorialReveal>
              <div className="glass-panel-light glass-card-hover rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8C6B2D]">
                    Catalogue & Technical Specifications
                  </p>
                  <h2 className="font-display text-xl font-bold text-[#00214A]">
                    Download Architectural Specification Schedules
                  </h2>
                  <p className="text-sm text-slate-600">
                    Access master catalogues, BMS/KNX wiring diagrams, and flame-retardancy
                    schedules for tender documentation.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 shrink-0">
                  {documents.slice(0, 2).map((doc) => (
                    <a
                      key={doc.id}
                      href={`/api/documents/${doc.id}/download`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#00214A] hover:bg-[#00214A]/90 text-white text-xs font-bold border border-[#C5A15B]/45 hover:border-[#C5A15B] transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#C5A15B]" />
                      <span>{doc.category}</span>
                    </a>
                  ))}
                </div>
              </div>
            </EditorialReveal>
          </div>
        </section>
      )}

      {/* BAND 10: Get In Touch / Contact Us & Send a Project Inquiry */}
      <section id="home-contact" className="glass-ambient-light py-16 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-7">
              <div className="space-y-3">
                <EditorialReveal delay={0}>
                  <p className="text-xs font-bold tracking-[0.14em] uppercase text-[#8C6B2D]">
                    Get In Touch
                  </p>
                </EditorialReveal>
                <EditorialReveal delay={0.08}>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#00214A] tracking-tight">
                    Contact Us
                  </h2>
                </EditorialReveal>
                <EditorialReveal delay={0.14}>
                  <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                    Our solution experts are available for site visits, product sampling
                    presentations, and technical drawings anywhere across our served regions.
                  </p>
                </EditorialReveal>
              </div>

              <StaggerGroup className="space-y-5" staggerDelay={0.08}>
                <StaggerItem>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#00214A] text-[#C5A15B] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#00214A]">
                        Casmura Contract
                      </h3>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {siteContent.contactAddress}
                      </p>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#00214A] text-[#C5A15B] flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#00214A]">
                        Email Consultation
                      </h3>
                      <a
                        href={`mailto:${siteContent.contactEmail}`}
                        className="text-sm text-slate-600 hover:text-[#8C6B2D] mt-0.5 block"
                      >
                        {siteContent.contactEmail}
                      </a>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#00214A] text-[#C5A15B] flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#00214A]">
                        Direct Line
                      </h3>
                      <a
                        href={`tel:${siteContent.contactPhone.replace(/\s+/g, '')}`}
                        className="text-sm text-slate-600 hover:text-[#8C6B2D] mt-0.5 block tabular-nums"
                      >
                        {siteContent.contactPhone}
                      </a>
                    </div>
                  </div>
                </StaggerItem>
              </StaggerGroup>

              <EditorialReveal delay={0.2}>
                <div className="pt-2 flex flex-wrap gap-3">
                  <a
                    href={`https://wa.me/${siteContent.whatsappNumber}?text=Hello%20Casmura%20Contract%2C%20I%20would%20like%20to%20request%20a%20project%20consultation.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#00214A] hover:bg-[#00214A]/90 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-md border border-[#C5A15B]/45 hover:border-[#C5A15B] transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <MessageCircle className="w-4 h-4 text-[#C5A15B]" />
                    <span>WhatsApp Project Desk</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => onNavigate('contact')}
                    className="inline-flex items-center gap-2 border border-[#00214A]/25 hover:border-[#C5A15B] hover:text-[#8C6B2D] text-[#00214A] text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Multi-Step RFQ Wizard</span>
                  </button>
                </div>
              </EditorialReveal>
            </div>

            {/* Right Deep Navy Glass Project Inquiry Form */}
            <EditorialReveal delay={0.12} direction="left" className="lg:col-span-7 glass-panel-navy text-white rounded-xl p-7 sm:p-9">
              <div className="mb-6">
                <h3 className="font-display text-2xl font-bold">
                  Send a Project Inquiry
                </h3>
                <p className="text-xs sm:text-sm text-white/85 mt-1">
                  Fill out the form below for immediate technical response from our
                  estimation team.
                </p>
              </div>

              {formSuccessRef ? (
                <div className="bg-white/10 border border-[#C5A15B]/45 rounded-lg p-6 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[#C5A15B] mx-auto" />
                  <h4 className="font-display text-lg font-bold">
                    Technical Proposal Request Received
                  </h4>
                  <p className="text-sm text-slate-200">
                    Reference Code:{' '}
                    <span className="font-mono text-[#C5A15B] font-semibold">
                      {formSuccessRef}
                    </span>
                  </p>
                  <p className="text-xs text-white/85">
                    Our estimation engineers will respond with sampling schedules and
                    BOQ guidance.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormSuccessRef(null)}
                    className="mt-2 px-5 py-2 rounded bg-white hover:bg-[#F3F1EC] text-[#00214A] text-xs font-bold uppercase cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleHomeInquiry} className="space-y-4">
                  {formError && (
                    <div className="p-3 rounded bg-red-500/20 border border-red-400/40 text-xs text-red-100">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-white/90 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Arch. / Eng. / Mr. / Mrs."
                        className="w-full px-3.5 py-2.5 rounded-md bg-white text-[#00214A] text-sm focus:outline-2 focus:outline-[#C5A15B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-white/90 mb-1.5">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Resort, Hotel Group, or Practice"
                        className="w-full px-3.5 py-2.5 rounded-md bg-white text-[#00214A] text-sm focus:outline-2 focus:outline-[#C5A15B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-white/90 mb-1.5">
                        Corporate Mail *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full px-3.5 py-2.5 rounded-md bg-white text-[#00214A] text-sm focus:outline-2 focus:outline-[#C5A15B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-white/90 mb-1.5">
                        Project Location *
                      </label>
                      <select
                        value={projectLocation}
                        onChange={(e) => setProjectLocation(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-md bg-white text-[#00214A] text-sm focus:outline-2 focus:outline-[#C5A15B]"
                      >
                        {REGIONS_SERVED.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                        <option value="Other International">Other International</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/90 mb-1.5">
                      Project Scope & Requirements
                    </label>
                    <textarea
                      rows={4}
                      value={scopeNotes}
                      onChange={(e) => setScopeNotes(e.target.value)}
                      placeholder="Mention number of rooms, motorized integration needs, product need, timeline..."
                      className="w-full px-3.5 py-2.5 rounded-md bg-white text-[#00214A] text-sm focus:outline-2 focus:outline-[#C5A15B]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-white hover:bg-[#F3F1EC] disabled:opacity-60 text-[#00214A] text-xs font-extrabold uppercase tracking-[0.06em] py-3.5 rounded-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                  >
                    {submitting
                      ? 'Submitting Request...'
                      : 'Submit Technical Proposal Request'}
                  </button>
                </form>
              )}
            </EditorialReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
