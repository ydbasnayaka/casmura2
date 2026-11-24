import { Download, MapPin, Play } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useMemo, useState } from 'react';
import type { ProjectCaseStudy } from '../types/casmura.ts';
import {
  ARCHITECTURAL_EASE,
  CinematicImageReveal,
  EditorialReveal,
  ParallaxMedia,
  VIEWPORT_CONFIG,
} from './ArchitecturalMotion.tsx';
import heroCaseStudiesImg from '../assets/images/hero_casestudies_sanctuary_1795510658906.jpg';
import { PageHero } from './PageHero.tsx';
import { SafeImage } from './SafeImage.tsx';

interface CaseStudiesPageProps {
  projects: ProjectCaseStudy[];
  onSelectProject: (project: ProjectCaseStudy) => void;
  onInquireSimilar: (title: string) => void;
}

const SYSTEM_CATEGORIES: Array<'All' | 'CURTAIN' | 'INDOOR' | 'OUTDOOR' | 'PERGOLAS'> = [
  'All',
  'CURTAIN',
  'INDOOR',
  'OUTDOOR',
  'PERGOLAS',
];

export function CaseStudiesPage({
  projects,
  onSelectProject,
  onInquireSimilar,
}: CaseStudiesPageProps) {
  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [systemFilter, setSystemFilter] = useState<string>('All');
  const prefersReduced = Boolean(useReducedMotion());

  const countries = useMemo(
    () => ['All', ...Array.from(new Set(projects.map((p) => p.country)))],
    [projects]
  );

  const featuredEditorial = useMemo(
    () =>
      projects.filter((p) => {
        if (!p.featuredEditorial) return false;
        const cOk = countryFilter === 'All' || p.country === countryFilter;
        const sOk = systemFilter === 'All' || p.systemCategory === systemFilter;
        return cOk && sOk;
      }),
    [projects, countryFilter, systemFilter]
  );

  const gridProjects = useMemo(() => {
    return projects.filter((p) => {
      const cOk = countryFilter === 'All' || p.country === countryFilter;
      const sOk = systemFilter === 'All' || p.systemCategory === systemFilter;
      return !p.featuredEditorial && cOk && sOk;
    });
  }, [projects, countryFilter, systemFilter]);

  return (
    <div className="bg-white">
      {/* Case Studies Hero */}
      <PageHero
        kicker="Hospitality Project Portfolio"
        title="Real Spaces. Lasting Impressions."
        description="Discover how CASMURA transforms spaces with timeless design and exceptional craftsmanship across Sri Lanka, the Maldives, Seychelles, and premier hospitality destinations."
        imageSrc={heroCaseStudiesImg}
        imageAlt="Completed luxury oceanfront hospitality pavilion with floor-to-ceiling architectural drapery"
        actions={
          <>
            <button
              type="button"
              onClick={() => onInquireSimilar('Hospitality Project Quotation')}
              className="bg-white hover:bg-[#F3F1EC] text-[#00214A] text-xs font-extrabold uppercase tracking-wider px-5 py-3 rounded-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shadow-sm whitespace-nowrap"
            >
              Request a Quote
            </button>
            <a
              href="/api/documents/doc-master-catalogue/download"
              className="inline-flex items-center gap-2 border border-white/40 hover:border-[#C5A15B] bg-[#00214A]/45 text-white hover:text-[#C5A15B] text-xs font-bold uppercase tracking-wider px-4 py-3 rounded-md transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Catalogue</span>
            </a>
          </>
        }
      />

      {/* Filter Bar (System Category Tabs + Country Selector) */}
      <section className="glass-ambient-light border-b border-[#00214A]/10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="glass-tabs inline-flex flex-wrap items-center gap-1 p-1 rounded-lg">
            {SYSTEM_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSystemFilter(cat)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  systemFilter === cat
                    ? 'bg-[#00214A] text-white shadow-sm'
                    : 'text-slate-700 hover:text-[#00214A]'
                }`}
              >
                {cat === 'All' ? 'All Systems' : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="country-select" className="text-xs font-semibold text-slate-500">
              Destination:
            </label>
            <select
              id="country-select"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs font-semibold text-[#00214A] cursor-pointer"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Regions' : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Featured Alternating Editorial Case Studies (PDF 3: Hotel Jordan, AGRA Hotel) */}
      {featuredEditorial.length > 0 && (
        <section className="glass-ambient-light pt-12 pb-6 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {featuredEditorial.map((project, idx) => {
              const reversed = idx % 2 === 1;
              return (
                <motion.article
                  key={project.id}
                  initial={prefersReduced ? false : { opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT_CONFIG}
                  transition={{ duration: 0.6, ease: ARCHITECTURAL_EASE }}
                  className="glass-panel-light rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-sm border border-[#00214A]/12 group"
                >
                  <div
                    className={`lg:col-span-6 aspect-[16/10] lg:aspect-auto min-h-[280px] bg-slate-200 overflow-hidden ${
                      reversed ? 'lg:order-2' : ''
                    }`}
                  >
                    <CinematicImageReveal
                      direction={reversed ? 'left' : 'right'}
                      className="w-full h-full"
                    >
                      <ParallaxMedia offsetY={12} className="w-full h-full">
                        <SafeImage
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                        />
                      </ParallaxMedia>
                    </CinematicImageReveal>
                  </div>

                  <div
                    className={`lg:col-span-6 p-7 sm:p-10 flex flex-col justify-between space-y-6 ${
                      reversed ? 'lg:order-1' : ''
                    }`}
                  >
                    <EditorialReveal
                      delay={0.08}
                      direction={reversed ? 'right' : 'left'}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C6B2D]">
                        <span>{project.systemCategory}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {project.location}, {project.country}
                        </span>
                      </div>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#00214A] leading-tight">
                        {project.title}
                      </h2>
                      <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                        {(project.narrativeParagraphs?.length
                          ? project.narrativeParagraphs
                          : [project.shortDescription, project.solution]
                        ).map((para, pIdx) => (
                          <p key={pIdx}>{para}</p>
                        ))}
                      </div>
                    </EditorialReveal>

                    <div className="pt-4 border-t border-[#00214A]/10 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-medium text-slate-500">
                        {project.systemsInstalled.join(' · ')}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectProject(project)}
                        className="inline-flex items-center gap-2 bg-[#00214A] hover:bg-[#00214A]/90 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-md border border-[#C5A15B]/45 hover:border-[#C5A15B] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                      >
                        <span>Inspect Project Brief</span>
                        <Play className="w-2.5 h-2.5 fill-[#C5A15B] text-[#C5A15B]" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>
      )}

      {/* More Case Studies Grid */}
      <section className="glass-ambient-light py-12 lg:py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-[#00214A]/12">
            <div>
              <EditorialReveal delay={0}>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8C6B2D]">
                  Regional Showcase
                </p>
              </EditorialReveal>
              <EditorialReveal delay={0.08}>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#00214A] mt-1">
                  More Case Studies
                </h2>
              </EditorialReveal>
            </div>
            <EditorialReveal delay={0.12}>
              <p className="text-xs text-slate-600">
                Showing {gridProjects.length + featuredEditorial.length} hospitality & contract installations
              </p>
            </EditorialReveal>
          </div>

          {gridProjects.length === 0 && featuredEditorial.length === 0 ? (
            <div className="glass-panel-light rounded-xl p-12 text-center space-y-3">
              <p className="font-display text-lg font-bold text-[#00214A]">
                No case studies match this combination
              </p>
              <button
                type="button"
                onClick={() => {
                  setSystemFilter('All');
                  setCountryFilter('All');
                }}
                className="px-4 py-2 rounded-md bg-[#00214A] text-white text-xs font-semibold cursor-pointer"
              >
                Show All Case Studies
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {gridProjects.map((project, idx) => (
                <motion.article
                  key={project.id}
                  initial={prefersReduced ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT_CONFIG}
                  transition={{
                    duration: 0.52,
                    delay: prefersReduced ? 0 : (idx % 3) * 0.08,
                    ease: ARCHITECTURAL_EASE,
                  }}
                  className="glass-panel-navy glass-card-hover text-white rounded-xl overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    <CinematicImageReveal
                      delay={(idx % 3) * 0.06}
                      className="aspect-[4/3] overflow-hidden bg-black/40"
                    >
                      <SafeImage
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                      />
                    </CinematicImageReveal>
                    <div className="p-6 space-y-3">
                      <div className="text-xs text-[#C5A15B] flex items-center gap-2 font-medium">
                        <span>{project.systemCategory}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{project.year}</span>
                      </div>
                      <h3 className="font-display text-xl font-bold">{project.title}</h3>
                      <p className="text-sm text-white/85 leading-relaxed">
                        {project.shortDescription}
                      </p>
                      <div className="pt-2 text-xs text-white/75 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C5A15B]" />
                        <span>
                          {project.location}, {project.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-[#00214A] border-t border-white/15 flex items-center justify-between">
                    <span className="text-[11px] text-white/75 truncate max-w-[170px]">
                      {project.systemsInstalled.join(' · ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectProject(project)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#C5A15B] transition-colors cursor-pointer shrink-0"
                    >
                      <span>Read More</span>
                      <Play className="w-2.5 h-2.5 fill-[#C5A15B] text-[#C5A15B]" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
