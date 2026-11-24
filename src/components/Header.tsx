import { ChevronDown, ChevronRight, Menu, Play, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type {
  PageRoute,
  ProductItem,
  ProductTaxonomyCategory,
} from '../types/casmura.ts';
import { BrandMark } from './BrandMark.tsx';

interface HeaderProps {
  currentPage: PageRoute;
  products: ProductItem[];
  onNavigate: (
    page: PageRoute,
    options?: {
      productTaxonomy?: ProductTaxonomyCategory | 'All';
      productSlug?: string | null;
    }
  ) => void;
  onOpenConsultation: () => void;
}

const PRIMARY_NAV: Array<{ label: string; page: PageRoute }> = [
  { label: 'Home', page: 'home' },
  { label: 'Products', page: 'products' },
  { label: 'Case Studies', page: 'case-studies' },
  { label: 'Automation', page: 'automation' },
  { label: 'Contact', page: 'contact' },
];

const PRODUCT_CATEGORIES: ProductTaxonomyCategory[] = [
  'Indoor Curtains & Blinds',
  'Outdoor Curtains & Weather Blinds',
  'Pergolas, Tents, & Roofing Tiles',
  'Interior Decor Essentials',
];

export function Header({
  currentPage,
  products,
  onNavigate,
  onOpenConsultation,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [activeHoverCat, setActiveHoverCat] = useState<ProductTaxonomyCategory>(
    PRODUCT_CATEGORIES[0]
  );
  const [scrolledMenuOpen, setScrolledMenuOpen] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const nextScrolled = window.scrollY > 36;
      setScrolled(nextScrolled);
      if (!nextScrolled) {
        setScrolledMenuOpen(false);
      } else {
        setMegaOpen(false);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (
    page: PageRoute,
    options?: {
      productTaxonomy?: ProductTaxonomyCategory | 'All';
      productSlug?: string | null;
    }
  ) => {
    onNavigate(page, options);
    setMobileOpen(false);
    setMegaOpen(false);
    setScrolledMenuOpen(false);
  };

  const openMegaMenu = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMegaOpen(true);
  };

  const scheduleCloseMegaMenu = () => {
    closeTimeoutRef.current = window.setTimeout(() => {
      setMegaOpen(false);
    }, 160);
  };

  const categoryProducts = products.filter(
    (p) => p.taxonomyCategory === activeHoverCat
  );

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'glass-nav-scrolled text-white' : 'glass-nav text-[#00214A]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] relative flex items-center justify-between gap-6">
        {/* Desktop Scrolled State: Centered White Brand Logo + Floating Control Ball */}
        {scrolled ? (
          <>
            <div className="hidden lg:flex w-10 shrink-0" aria-hidden="true" />
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                handleNav('home');
              }}
              className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C5A15B] rounded transition-transform duration-300"
              aria-label="Casmura Contract Home"
            >
              <BrandMark variant="dark" />
            </a>

            <div className="flex items-center gap-2.5 ml-auto shrink-0">
              {/* Floating Quick-Navigation Panel revealed by circular control ball */}
              {scrolledMenuOpen && (
                <nav
                  aria-label="Scrolled Quick Navigation"
                  className="hidden lg:flex items-center gap-1.5 glass-panel-dark px-3 py-1.5 rounded-full border border-[#C5A15B]/30 shadow-xl mr-1"
                >
                  {PRIMARY_NAV.map((item) => {
                    const active = currentPage === item.page;
                    return (
                      <button
                        key={item.page}
                        type="button"
                        onClick={() =>
                          handleNav(
                            item.page,
                            item.page === 'products'
                              ? { productTaxonomy: 'All', productSlug: null }
                              : undefined
                          )
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                          active
                            ? 'bg-[#C5A15B] text-[#00214A]'
                            : 'text-slate-200 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setScrolledMenuOpen(false);
                      onOpenConsultation();
                    }}
                    className="ml-1 inline-flex items-center gap-1.5 bg-white hover:bg-[#F3F1EC] text-[#00214A] text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>Consult</span>
                    <Play className="w-2.5 h-2.5 fill-[#C5A15B] text-[#C5A15B]" />
                  </button>
                </nav>
              )}

              {/* Circular Control Ball Trigger (Desktop) */}
              <button
                type="button"
                onClick={() => setScrolledMenuOpen((prev) => !prev)}
                aria-label={
                  scrolledMenuOpen
                    ? 'Close scrolled navigation bar'
                    : 'Open scrolled navigation bar'
                }
                aria-expanded={scrolledMenuOpen}
                className={`hidden lg:inline-flex items-center justify-center w-10 h-10 rounded-full border transition-all cursor-pointer shadow-md ${
                  scrolledMenuOpen
                    ? 'bg-white text-[#00214A] border-white'
                    : 'bg-[#00214A] hover:bg-[#00214A]/90 text-white border-[#C5A15B]/60 hover:border-[#C5A15B]'
                }`}
              >
                {scrolledMenuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4 text-[#C5A15B]" />
                )}
              </button>

              {/* Mobile Menu Trigger */}
              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-[#C5A15B]/35 text-white hover:bg-white/10 cursor-pointer"
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Unscrolled Classic 3-Zone Header: Brand Left — 5 Nav Links Center — CTA Right */}
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                handleNav('home');
              }}
              className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C5A15B] rounded shrink-0"
              aria-label="Casmura Contract Home"
            >
              <BrandMark variant="light" />
            </a>

            <nav
              aria-label="Primary Navigation"
              className="hidden lg:flex items-center gap-7"
            >
              {PRIMARY_NAV.map((item) => {
                const active = currentPage === item.page;
                if (item.page === 'products') {
                  return (
                    <div
                      key={item.page}
                      className="relative"
                      onMouseEnter={openMegaMenu}
                      onMouseLeave={scheduleCloseMegaMenu}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleNav('products', {
                            productTaxonomy: 'All',
                            productSlug: null,
                          })
                        }
                        aria-expanded={megaOpen}
                        className={`relative py-2 inline-flex items-center gap-1 text-[14px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'text-[#00214A] font-semibold'
                            : 'text-slate-600 hover:text-[#00214A]'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            megaOpen ? 'rotate-180 text-[#C5A15B]' : ''
                          }`}
                        />
                        <span
                          className={`absolute left-0 right-0 bottom-0 h-[2px] bg-[#C5A15B] transition-transform duration-200 origin-left ${
                            active ? 'scale-x-100' : 'scale-x-0'
                          }`}
                        />
                      </button>

                      {/* Products Mega Dropdown (Main Categories + Sub-Tabs) */}
                      {megaOpen && (
                        <div
                          onMouseEnter={openMegaMenu}
                          onMouseLeave={scheduleCloseMegaMenu}
                          className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[660px] z-50"
                        >
                          <div className="bg-white/95 backdrop-blur-xl rounded-xl border border-[#00214A]/15 shadow-2xl overflow-hidden grid grid-cols-12">
                            {/* Left Column: 4 Main Taxonomy Categories */}
                            <div className="col-span-5 bg-[#F3F1EC] p-3 border-r border-[#00214A]/10 space-y-1">
                              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8C6B2D]">
                                Main Collections
                              </p>
                              {PRODUCT_CATEGORIES.map((cat) => {
                                const isHovered = activeHoverCat === cat;
                                return (
                                  <button
                                    key={cat}
                                    type="button"
                                    onMouseEnter={() => setActiveHoverCat(cat)}
                                    onClick={() =>
                                      handleNav('products', {
                                        productTaxonomy: cat,
                                        productSlug: null,
                                      })
                                    }
                                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                                      isHovered
                                        ? 'bg-[#00214A] text-white shadow-sm'
                                        : 'text-[#00214A] hover:bg-white'
                                    }`}
                                  >
                                    <span>{cat}</span>
                                    <ChevronRight
                                      className={`w-3.5 h-3.5 shrink-0 ${
                                        isHovered ? 'text-[#C5A15B]' : 'text-slate-400'
                                      }`}
                                    />
                                  </button>
                                );
                              })}
                              <div className="pt-2 mt-2 border-t border-[#00214A]/10">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleNav('products', {
                                      productTaxonomy: 'All',
                                      productSlug: null,
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-lg text-left text-xs font-bold text-[#8C6B2D] hover:bg-white transition-colors cursor-pointer"
                                >
                                  View Complete 23-System Catalog →
                                </button>
                              </div>
                            </div>

                            {/* Right Column: Sub-Products under hovered category */}
                            <div className="col-span-7 p-4 flex flex-col justify-between bg-white">
                              <div>
                                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
                                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#00214A]">
                                    {activeHoverCat}
                                  </p>
                                  <span className="text-[10px] font-mono text-slate-500">
                                    {categoryProducts.length} systems
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                  {categoryProducts.map((prod) => (
                                    <button
                                      key={prod.id}
                                      type="button"
                                      onClick={() =>
                                        handleNav('products', {
                                          productTaxonomy: prod.taxonomyCategory,
                                          productSlug: prod.slug,
                                        })
                                      }
                                      className="text-left px-2.5 py-2 rounded-md text-xs text-slate-700 hover:bg-[#F3F1EC] hover:text-[#00214A] font-medium transition-colors cursor-pointer truncate"
                                    >
                                      {prod.title}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.page}
                    type="button"
                    onClick={() => handleNav(item.page)}
                    className={`relative py-2 text-[14px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'text-[#00214A] font-semibold'
                        : 'text-slate-600 hover:text-[#00214A]'
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute left-0 right-0 bottom-0 h-[2px] bg-[#C5A15B] transition-transform duration-200 origin-left ${
                        active ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onOpenConsultation}
                className="hidden sm:inline-flex items-center gap-2.5 bg-[#00214A] hover:bg-[#00214A]/90 text-white text-xs font-bold tracking-[0.06em] uppercase px-4 py-2.5 rounded-md border border-[#C5A15B]/45 hover:border-[#C5A15B] transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
              >
                <span>Request Consultation</span>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#C5A15B] text-[#00214A]">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border border-[#00214A]/15 text-[#00214A] hover:bg-[#F3F1EC] cursor-pointer"
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden glass-drawer-dark text-white px-4 py-4 space-y-1 max-h-[82vh] overflow-y-auto">
          {PRIMARY_NAV.map((item) => (
            <div key={item.page}>
              {item.page === 'products' ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        handleNav('products', {
                          productTaxonomy: 'All',
                          productSlug: null,
                        })
                      }
                      className={`flex-1 text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                        currentPage === 'products'
                          ? 'bg-white/15 text-[#C5A15B] font-semibold'
                          : 'text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      Products
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileProductsOpen((p) => !p)}
                      aria-label="Toggle product categories"
                      className="p-2.5 rounded-md text-slate-300 hover:text-white cursor-pointer"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          mobileProductsOpen ? 'rotate-180 text-[#C5A15B]' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {mobileProductsOpen && (
                    <div className="pl-4 pr-2 py-1 space-y-1 border-l border-[#C5A15B]/35 ml-3">
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() =>
                            handleNav('products', {
                              productTaxonomy: cat,
                              productSlug: null,
                            })
                          }
                          className="w-full text-left px-2.5 py-1.5 rounded text-xs text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNav(item.page)}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    currentPage === item.page
                      ? 'bg-white/15 text-[#C5A15B] font-semibold'
                      : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              )}
            </div>
          ))}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenConsultation();
              }}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#C5A15B] hover:bg-[#b5904b] text-[#00214A] text-xs font-extrabold tracking-[0.06em] uppercase px-4 py-3 rounded-md cursor-pointer"
            >
              <span>Request Consultation</span>
              <Play className="w-3 h-3 fill-current" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
