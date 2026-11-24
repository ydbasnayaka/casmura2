import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Download,
  Hand,
  Layers,
  Play,
  Radio,
  Search,
  SlidersHorizontal,
  ToggleRight,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import type {
  OperatingSystemOption,
  ProductItem,
  ProductTaxonomyCategory,
  TechnicalDocument,
} from '../types/casmura.ts';
import {
  ARCHITECTURAL_EASE,
  CinematicImageReveal,
  EditorialReveal,
  ParallaxMedia,
  StaggerGroup,
  StaggerItem,
  VIEWPORT_CONFIG,
} from './ArchitecturalMotion.tsx';
import heroProductsImg from '../assets/images/hero_products_craft_1795510658959.jpg';
import { PageHero } from './PageHero.tsx';
import { SafeImage } from './SafeImage.tsx';

interface ProductsPageProps {
  products: ProductItem[];
  documents: TechnicalDocument[];
  activeTaxonomy: ProductTaxonomyCategory | 'All';
  onChangeTaxonomy: (cat: ProductTaxonomyCategory | 'All') => void;
  activeProductSlug: string | null;
  onSelectProductDetail: (product: ProductItem | null) => void;
  onInquireProduct: (productTitle: string) => void;
  onBookConsultation?: (interest?: string) => void;
}

const TAXONOMY_TABS: Array<{ label: string; value: ProductTaxonomyCategory | 'All' }> = [
  { label: 'All Systems', value: 'All' },
  { label: 'Indoor Curtains & Blinds', value: 'Indoor Curtains & Blinds' },
  {
    label: 'Outdoor Curtains & Weather Blinds',
    value: 'Outdoor Curtains & Weather Blinds',
  },
  {
    label: 'Pergolas, Tents, & Roofing Tiles',
    value: 'Pergolas, Tents, & Roofing Tiles',
  },
  { label: 'Interior Decor Essentials', value: 'Interior Decor Essentials' },
];

function getOperatingIcon(option: OperatingSystemOption) {
  switch (option) {
    case 'Motorized Drive':
      return Cpu;
    case 'Smart Remote':
      return Radio;
    case 'Wall Switch':
      return ToggleRight;
    case 'Architectural Fixed':
      return Layers;
    case 'Manual Track':
    case 'Cord Draw':
    case 'Cordless Spring':
    case 'Hand Baton':
    default:
      return Hand;
  }
}

export function ProductsPage({
  products,
  documents,
  activeTaxonomy,
  onChangeTaxonomy,
  activeProductSlug,
  onSelectProductDetail,
  onInquireProduct,
  onBookConsultation,
}: ProductsPageProps) {
  const [motorFilter, setMotorFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [driveCompare, setDriveCompare] = useState<'motorized' | 'manual'>('motorized');
  const [galleryIndex, setGalleryIndex] = useState(0);
  const prefersReduced = Boolean(useReducedMotion());

  const selectedDetailProduct = useMemo(
    () =>
      activeProductSlug
        ? products.find((p) => p.slug === activeProductSlug) ?? null
        : null,
    [products, activeProductSlug]
  );

  useEffect(() => {
    setGalleryIndex(0);
  }, [selectedDetailProduct?.id]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCat =
        activeTaxonomy === 'All' || item.taxonomyCategory === activeTaxonomy;
      const matchMotor =
        motorFilter === 'All' ||
        (motorFilter === 'Motorized' &&
          item.motorization.toLowerCase().includes('motorized')) ||
        (motorFilter === 'Outdoor' &&
          item.taxonomyCategory === 'Outdoor Curtains & Weather Blinds');
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.application.toLowerCase().includes(q) ||
        item.shortDescription.toLowerCase().includes(q) ||
        item.flameRating.toLowerCase().includes(q) ||
        item.subGroup.toLowerCase().includes(q);
      return matchCat && matchMotor && matchSearch;
    });
  }, [products, activeTaxonomy, motorFilter, searchQuery]);

  // Product-Wise Detail View (PDF 5)
  if (selectedDetailProduct) {
    const gallery = selectedDetailProduct.gallery?.length
      ? selectedDetailProduct.gallery
      : [selectedDetailProduct.image];
    const currentImage = gallery[galleryIndex] || selectedDetailProduct.image;

    const categoryPeers = products.filter(
      (p) => p.taxonomyCategory === selectedDetailProduct.taxonomyCategory
    );
    const peerList = categoryPeers.length > 1 ? categoryPeers : products;
    const currentIdx = peerList.findIndex((p) => p.id === selectedDetailProduct.id);
    const prevProduct =
      peerList[(currentIdx - 1 + peerList.length) % peerList.length];
    const nextProduct = peerList[(currentIdx + 1) % peerList.length];

    const operatingSystems = selectedDetailProduct.operatingSystems?.length
      ? selectedDetailProduct.operatingSystems
      : (['Manual Track', 'Motorized Drive'] as OperatingSystemOption[]);

    const recommendedApps = selectedDetailProduct.recommendedApplications?.length
      ? selectedDetailProduct.recommendedApplications
      : [selectedDetailProduct.application];

    return (
      <div className="bg-white">
        {/* Product Detail Header & Breadcrumb */}
        <section className="relative bg-[#00214A] text-white py-10 lg:py-12 overflow-hidden">
          <ParallaxMedia offsetY={12} className="absolute inset-0 pointer-events-none">
            <div
              className="w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(197,161,91,0.18),transparent_55%)]"
              aria-hidden="true"
            />
          </ParallaxMedia>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <EditorialReveal immediate delay={0}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => onSelectProductDetail(null)}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A15B] hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to All Products</span>
                </button>
                <span className="text-xs text-white/85">
                  Products · {selectedDetailProduct.taxonomyCategory} ·{' '}
                  <strong className="text-white">{selectedDetailProduct.title}</strong>
                </span>
              </div>
            </EditorialReveal>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <EditorialReveal immediate delay={0.06}>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#C5A15B]">
                    {selectedDetailProduct.taxonomyCategory}
                  </p>
                </EditorialReveal>
                <EditorialReveal immediate delay={0.12}>
                  <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                    {selectedDetailProduct.title}
                  </h1>
                </EditorialReveal>
              </div>

              <EditorialReveal immediate delay={0.18} className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href="/api/documents/doc-master-catalogue/download"
                  className="inline-flex items-center gap-2 border border-white/35 hover:border-[#C5A15B] text-white hover:text-[#C5A15B] text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Spec Catalogue</span>
                </a>
                <button
                  type="button"
                  onClick={() => onInquireProduct(selectedDetailProduct.title)}
                  className="inline-flex items-center gap-2 bg-white hover:bg-[#F3F1EC] text-[#00214A] text-xs font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Request Quote</span>
                  <Play className="w-2.5 h-2.5 fill-[#C5A15B] text-[#C5A15B]" />
                </button>
              </EditorialReveal>
            </div>
          </div>
        </section>

        {/* Main Product-Wise 2-Column Showcase */}
        <section className="glass-ambient-light py-12 lg:py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left: Gallery & Thumbnails */}
              <div className="lg:col-span-6 space-y-4">
                <CinematicImageReveal className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 border border-[#00214A]/12 shadow-lg">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImage}
                      initial={prefersReduced ? false : { opacity: 0.35, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={prefersReduced ? undefined : { opacity: 0.35 }}
                      transition={{ duration: 0.35, ease: ARCHITECTURAL_EASE }}
                      className="w-full h-full"
                    >
                      <SafeImage
                        src={currentImage}
                        alt={selectedDetailProduct.title}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                  {gallery.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setGalleryIndex(
                            (prev) => (prev - 1 + gallery.length) % gallery.length
                          )
                        }
                        aria-label="Previous product image"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/75 text-white hover:bg-[#00214A] border border-[#C5A15B]/55 flex items-center justify-center transition-colors cursor-pointer shadow-md"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setGalleryIndex((prev) => (prev + 1) % gallery.length)
                        }
                        aria-label="Next product image"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/75 text-white hover:bg-[#00214A] border border-[#C5A15B]/55 flex items-center justify-center transition-colors cursor-pointer shadow-md"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </CinematicImageReveal>

                {gallery.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {gallery.map((imgUrl, idx) => (
                      <button
                        key={imgUrl + idx}
                        type="button"
                        onClick={() => setGalleryIndex(idx)}
                        className={`w-24 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                          idx === galleryIndex
                            ? 'border-[#C5A15B] opacity-100 shadow-sm'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <SafeImage
                          src={imgUrl}
                          alt={`${selectedDetailProduct.title} preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Technical Specification Matrix Card */}
                <EditorialReveal delay={0.1}>
                  <div className="glass-panel-light rounded-xl p-6 space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#8C6B2D]">
                      Technical Specifications & Compliance
                    </h2>
                    <dl className="divide-y divide-slate-200 border border-[#00214A]/12 rounded-lg bg-white">
                      {selectedDetailProduct.specs.map((spec) => (
                        <div
                          key={spec.label}
                          className="px-4 py-3 flex items-center justify-between gap-4 text-xs"
                        >
                          <dt className="text-slate-500 font-medium">{spec.label}</dt>
                          <dd className="text-[#00214A] font-semibold text-right tabular-nums">
                            {spec.value}
                          </dd>
                        </div>
                      ))}
                      <div className="px-4 py-3 flex items-center justify-between gap-4 text-xs">
                        <dt className="text-slate-500 font-medium">Flame Rating</dt>
                        <dd className="text-[#00214A] font-semibold text-right">
                          {selectedDetailProduct.flameRating}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </EditorialReveal>
              </div>

              {/* Right: Overview, Options, Operating Systems & Recommended Applications */}
              <EditorialReveal delay={0.12} direction="left" className="lg:col-span-6 space-y-6">
                <div className="glass-panel-light rounded-xl p-6 sm:p-8 space-y-6">
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8C6B2D]">
                      Overview
                    </p>
                    <p className="text-base leading-relaxed text-slate-700">
                      {selectedDetailProduct.fullDescription}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="pt-4 border-t border-[#00214A]/10 space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#00214A]">
                      Options
                    </h2>
                    <ul className="space-y-2.5 text-sm text-slate-700">
                      {selectedDetailProduct.customOptions.map((opt) => (
                        <li key={opt} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#C5A15B] shrink-0 mt-0.5" />
                          <span>{opt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Operating System Icon Grid */}
                  <div className="pt-4 border-t border-[#00214A]/10 space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#00214A]">
                      Operating System
                    </h2>
                    <StaggerGroup className="grid grid-cols-2 sm:grid-cols-3 gap-3" staggerDelay={0.05}>
                      {operatingSystems.map((op) => {
                        const OpIcon = getOperatingIcon(op);
                        return (
                          <StaggerItem key={op}>
                            <div className="flex flex-col items-center justify-center text-center gap-2 p-3.5 rounded-lg border border-[#00214A]/12 bg-white hover:border-[#C5A15B]/65 transition-colors h-full">
                              <div className="w-9 h-9 rounded-full bg-[#F3F1EC] text-[#00214A] border border-[#C5A15B]/35 flex items-center justify-center">
                                <OpIcon className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-semibold text-[#00214A]">
                                {op}
                              </span>
                            </div>
                          </StaggerItem>
                        );
                      })}
                    </StaggerGroup>
                  </div>

                  {/* Recommended Applications */}
                  <div className="pt-4 border-t border-[#00214A]/10 space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#00214A]">
                      Recommended Applications
                    </h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                      {recommendedApps.map((appItem) => (
                        <li key={appItem} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A15B] mt-2 shrink-0" />
                          <span>{appItem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Compatible Ecosystems */}
                  {selectedDetailProduct.compatibleSystems.length > 0 && (
                    <div className="pt-4 border-t border-[#00214A]/10 space-y-2">
                      <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#00214A]">
                        Compatible Ecosystems
                      </h2>
                      <p className="text-xs font-medium text-slate-600">
                        {selectedDetailProduct.compatibleSystems.join('  ·  ')}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#00214A]/10 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => onInquireProduct(selectedDetailProduct.title)}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-[#00214A] hover:bg-[#00214A]/90 text-white text-xs font-extrabold uppercase tracking-wider px-5 py-3.5 rounded-md border border-[#C5A15B]/45 hover:border-[#C5A15B] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                    >
                      <span>Request Project Quotation</span>
                      <Play className="w-3 h-3 fill-[#C5A15B] text-[#C5A15B]" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        (onBookConsultation ?? onInquireProduct)(
                          `Sample Box Request: ${selectedDetailProduct.title}`
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 border border-[#00214A]/25 hover:border-[#C5A15B] text-[#00214A] hover:text-[#8C6B2D] text-xs font-bold uppercase tracking-wider px-5 py-3.5 rounded-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                    >
                      <span>Request Fabric Sample</span>
                    </button>
                  </div>
                </div>
              </EditorialReveal>
            </div>

            {/* Bottom Previous / Next Product Bar (PDF 5) */}
            <EditorialReveal delay={0.1}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#00214A]/12">
                <button
                  type="button"
                  onClick={() => onSelectProductDetail(prevProduct)}
                  className="glass-panel-light glass-card-hover rounded-xl p-5 flex items-center gap-4 text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#F3F1EC] text-[#00214A] border border-[#C5A15B]/35 group-hover:bg-[#00214A] group-hover:text-[#C5A15B] flex items-center justify-center transition-colors shrink-0">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Previous Product
                    </p>
                    <p className="font-display text-base font-bold text-[#00214A] truncate group-hover:text-[#8C6B2D]">
                      {prevProduct.title}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectProductDetail(nextProduct)}
                  className="glass-panel-light glass-card-hover rounded-xl p-5 flex items-center justify-end gap-4 text-right cursor-pointer group"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Next Product
                    </p>
                    <p className="font-display text-base font-bold text-[#00214A] truncate group-hover:text-[#8C6B2D]">
                      {nextProduct.title}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#F3F1EC] text-[#00214A] border border-[#C5A15B]/35 group-hover:bg-[#00214A] group-hover:text-[#C5A15B] flex items-center justify-center transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </EditorialReveal>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Page Hero */}
      <PageHero
        kicker="Architectural Shading & Interior Systems"
        title="Contract Product Specifications & Catalog"
        description="Engineered for 5-star guest suites, oceanfront villas, bioclimatic pergolas, and bespoke hospitality interiors across tropical and coastal climates."
        imageSrc={heroProductsImg}
        imageAlt="Bespoke Belgian linen sheer and acoustic blackout drapery flanking coastal floor-to-ceiling windows"
        actions={
          <>
            <a
              href="/api/documents/doc-master-catalogue/download"
              className="inline-flex items-center gap-2.5 bg-white hover:bg-[#F3F1EC] text-[#00214A] text-xs font-extrabold uppercase tracking-wider px-5 py-3 rounded-md transition-all duration-200 hover:-translate-y-0.5 shadow-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-[#C5A15B]" />
              <span>Download Full Contract Catalogue</span>
            </a>
            <button
              type="button"
              onClick={() =>
                (onBookConsultation ?? onInquireProduct)('Product Specification Consultation')
              }
              className="inline-flex items-center gap-2 border border-white/40 hover:border-[#C5A15B] bg-[#00214A]/45 text-white hover:text-[#C5A15B] text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              <span>Book a Consultation</span>
              <Play className="w-2.5 h-2.5 fill-current" />
            </button>
          </>
        }
      />

      {/* Main Collection Taxonomy Filter Bar (4 Main Categories from PDF 2) */}
      <section className="border-b border-[#00214A]/10 glass-ambient-light py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="glass-tabs inline-flex flex-wrap items-center gap-1 p-1 rounded-lg">
              {TAXONOMY_TABS.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => onChangeTaxonomy(cat.value)}
                  className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activeTaxonomy === cat.value
                      ? 'bg-[#00214A] text-white shadow-sm'
                      : 'text-slate-700 hover:text-[#00214A]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search & Motorization Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pergola, sheer, NFPA 701..."
                  className="pl-9 pr-3.5 py-2 rounded-md border border-slate-300 bg-white text-sm text-[#00214A] w-full sm:w-64 focus:outline-2 focus:outline-[#C5A15B]"
                />
              </div>

              <div className="inline-flex items-center gap-2 bg-white border border-slate-300 rounded-md px-3 py-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={motorFilter}
                  onChange={(e) => setMotorFilter(e.target.value)}
                  aria-label="Filter by operation type"
                  className="text-xs font-semibold text-[#00214A] bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="All">All Operations</option>
                  <option value="Motorized">Motorized / BMS Ready</option>
                  <option value="Outdoor">Coastal Exterior Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="glass-ambient-light py-12 lg:py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProducts.length === 0 ? (
            <div className="glass-panel-light rounded-xl p-12 text-center space-y-3">
              <p className="font-display text-lg font-bold text-[#00214A]">
                No systems match your current filter
              </p>
              <p className="text-sm text-slate-600">
                Reset filters or contact our estimation desk for custom hospitality fabrication.
              </p>
              <button
                type="button"
                onClick={() => {
                  onChangeTaxonomy('All');
                  setMotorFilter('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-md bg-[#00214A] text-white text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredProducts.map((product, idx) => (
                <motion.article
                  key={product.id}
                  initial={prefersReduced ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT_CONFIG}
                  transition={{
                    duration: 0.5,
                    delay: prefersReduced ? 0 : (idx % 3) * 0.07,
                    ease: ARCHITECTURAL_EASE,
                  }}
                  className="glass-panel-light glass-card-hover rounded-xl overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => onSelectProductDetail(product)}
                      className="w-full block aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer"
                    >
                      <CinematicImageReveal delay={(idx % 3) * 0.05} className="w-full h-full">
                        <SafeImage
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                        />
                      </CinematicImageReveal>
                    </button>

                    <div className="p-6 space-y-3">
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="font-semibold text-[#8C6B2D]">{product.subGroup}</span>
                        <span aria-hidden="true">·</span>
                        <span>{product.motorization}</span>
                      </div>

                      <h2 className="font-display text-xl font-bold text-[#00214A]">
                        <button
                          type="button"
                          onClick={() => onSelectProductDetail(product)}
                          className="text-left hover:text-[#8C6B2D] transition-colors cursor-pointer"
                        >
                          {product.title}
                        </button>
                      </h2>

                      <p className="text-sm text-slate-600 leading-relaxed">
                        {product.shortDescription}
                      </p>

                      <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500">Application</span>
                          <span className="text-[#00214A] font-medium text-right truncate max-w-[190px]">
                            {product.application}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500">Compliance</span>
                          <span className="text-[#00214A] font-medium text-right">
                            {product.flameRating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-[#F3F1EC] border-t border-[#00214A]/10 flex items-center justify-between text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => onSelectProductDetail(product)}
                      className="text-[#00214A] hover:text-[#8C6B2D] transition-colors cursor-pointer"
                    >
                      View Technical Specs
                    </button>
                    <button
                      type="button"
                      onClick={() => onInquireProduct(product.title)}
                      className="inline-flex items-center gap-1.5 bg-[#00214A] hover:bg-[#00214A]/90 text-white px-3.5 py-2 rounded border border-[#C5A15B]/40 hover:border-[#C5A15B] transition-colors cursor-pointer"
                    >
                      <span>Inquire</span>
                      <Play className="w-2.5 h-2.5 fill-[#C5A15B] text-[#C5A15B]" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Motorized vs Manual System Comparison */}
      <section className="glass-ambient-navy text-white py-14 border-t border-[#C5A15B]/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <EditorialReveal delay={0}>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#C5A15B]">
                Drive Architecture Comparison
              </p>
            </EditorialReveal>
            <EditorialReveal delay={0.08}>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                Motorized BMS vs. Manual Contract Operation
              </h2>
            </EditorialReveal>
            <EditorialReveal delay={0.14}>
              <p className="text-sm text-white/85 leading-relaxed">
                Select the operating drive architecture suited to your guestroom key
                classification, ceiling pocket wiring, and housekeeping maintenance model.
              </p>
            </EditorialReveal>
            <EditorialReveal delay={0.2}>
              <div className="flex flex-wrap items-center gap-3">
                <div className="glass-tabs-dark inline-flex p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setDriveCompare('motorized')}
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                      driveCompare === 'motorized'
                        ? 'bg-white text-[#00214A]'
                        : 'text-slate-200 hover:text-white'
                    }`}
                  >
                    Motorized / GRMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setDriveCompare('manual')}
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                      driveCompare === 'manual'
                        ? 'bg-white text-[#00214A]'
                        : 'text-slate-200 hover:text-white'
                    }`}
                  >
                    Manual Contract Track
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onInquireProduct(
                      driveCompare === 'motorized'
                        ? 'Motorized / BMS Drapery System Quote'
                        : 'Manual Contract Track System Quote'
                    )
                  }
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#C5A15B] hover:text-white transition-colors cursor-pointer"
                >
                  <span>Request a Quote</span>
                  <Play className="w-2.5 h-2.5 fill-current" />
                </button>
              </div>
            </EditorialReveal>
          </div>

          <EditorialReveal delay={0.14} direction="left" className="lg:col-span-7 glass-panel-dark rounded-xl p-6 sm:p-7">
            <AnimatePresence mode="wait">
              {driveCompare === 'motorized' ? (
                <motion.div
                  key="motorized"
                  initial={prefersReduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReduced ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: ARCHITECTURAL_EASE }}
                  className="space-y-4"
                >
                  <h3 className="font-display text-lg font-bold text-[#C5A15B]">
                    Motorized Architectural Drives (Forest / Somfy / Motionblinds)
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-100">
                    {[
                      'Bedside keypad, KNX, Crestron & Lutron scene recall',
                      'Touch-motion start & manual power-failure override',
                      'Synchronized dual-track sheer & blackout sequencing',
                      'Reduces fabric wear from uneven manual pulling',
                      'Solar & twilight automated glare scheduling',
                      'Requires concealed 230V AC or 24V DC ceiling spur',
                    ].map((pt) => (
                      <li key={pt} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#C5A15B] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ) : (
                <motion.div
                  key="manual"
                  initial={prefersReduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReduced ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: ARCHITECTURAL_EASE }}
                  className="space-y-4"
                >
                  <h3 className="font-display text-lg font-bold text-[#C5A15B]">
                    Manual Architectural Wave-Fold & Cord-Drawn Tracks
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-100">
                    {[
                      'Zero electrical conduit or BMS commissioning required',
                      'Low-friction wheeled carriers for effortless hand draw',
                      'Baton / wand draw eliminates fabric edge soiling',
                      'Custom bent curved tracks for bay & corner glazing',
                      'Ideal for back-of-house, spa suites & eco-villas',
                      'Lower upfront capex with simple mechanical upkeep',
                    ].map((pt) => (
                      <li key={pt} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#C5A15B] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </EditorialReveal>
        </div>
      </section>

      {/* Technical Documentation Centre Strip */}
      <section className="glass-ambient-light py-14 border-t border-[#00214A]/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <EditorialReveal delay={0}>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8C6B2D]">
                  MEP & Architect Resources
                </p>
              </EditorialReveal>
              <EditorialReveal delay={0.08}>
                <h2 className="font-display text-2xl font-bold text-[#00214A] mt-1">
                  Technical Document Download Centre
                </h2>
              </EditorialReveal>
            </div>
            <EditorialReveal delay={0.14}>
              <p className="text-xs text-slate-600">
                Instant specification schedules for tender documentation and ceiling recess planning.
              </p>
            </EditorialReveal>
          </div>

          <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" staggerDelay={0.07}>
            {documents.map((doc) => (
              <StaggerItem key={doc.id}>
                <div className="glass-panel-light glass-card-hover rounded-lg p-5 flex flex-col justify-between space-y-4 h-full">
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-mono text-slate-500">
                      {doc.fileCode} · {doc.pages} pp.
                    </div>
                    <h3 className="font-display text-sm font-bold text-[#00214A]">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {doc.summary}
                    </p>
                  </div>

                  <a
                    href={`/api/documents/${doc.id}/download`}
                    className="inline-flex items-center justify-center gap-2 w-full py-2 rounded border border-[#00214A]/20 hover:border-[#C5A15B] text-[#00214A] hover:text-[#8C6B2D] text-xs font-bold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#C5A15B]" />
                    <span>Download Spec Sheet</span>
                  </a>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>
    </div>
  );
}
