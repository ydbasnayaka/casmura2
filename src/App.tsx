import { MessageCircle } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import {
  INITIAL_CLIENTS,
  INITIAL_DOCUMENTS,
  INITIAL_PRODUCTS,
  INITIAL_PROJECTS,
  INITIAL_SITE_CONTENT,
  INITIAL_TESTIMONIALS,
} from '../server/seedData.ts';
import { AutomationPage } from './components/AutomationPage.tsx';
import { CaseStudiesPage } from './components/CaseStudiesPage.tsx';
import { ContactPage } from './components/ContactPage.tsx';
import { Footer } from './components/Footer.tsx';
import { Header } from './components/Header.tsx';
import { HomePage } from './components/HomePage.tsx';
import {
  ProductSpecModal,
  ProjectDetailModal,
  QuickConsultationModal,
} from './components/Modals.tsx';
import { ProductsPage } from './components/ProductsPage.tsx';
import type {
  ClientLogo,
  PageRoute,
  ProductItem,
  ProductTaxonomyCategory,
  ProjectCaseStudy,
  SiteContentConfig,
  TechnicalDocument,
  TestimonialItem,
} from './types/casmura.ts';

const VALID_PAGES: PageRoute[] = [
  'home',
  'products',
  'case-studies',
  'automation',
  'contact',
];

const ROUTE_SEO: Record<PageRoute, { title: string; description: string }> = {
  home: {
    title: 'Casmura Contract — Luxury Hospitality Drapery & Architectural Shading',
    description:
      'Precision contract drapery, automated blinds, and architectural shade structures tailored for luxury villas, 5-star resorts, and premier residences across 11 countries.',
  },
  products: {
    title: 'Products & Contract Specifications | Casmura Contract',
    description:
      'Explore indoor curtains & blinds, outdoor monsoon & zip screens, bioclimatic pergolas, and hospitality decor essentials.',
  },
  'case-studies': {
    title: 'Case Studies & Completed Resort Projects | Casmura Contract',
    description:
      '100+ completed architectural drapery and shading commissions across Sri Lanka, the Maldives, UAE, Saudi Arabia, Japan, Seychelles, and Mauritius.',
  },
  automation: {
    title: 'Smart Motorized Blinds & BMS Automation | Casmura Contract',
    description:
      'Seamless guestroom and villa shading automation integrated with KNX, Crestron, Control4, Lutron, Loxone, Somfy, and Forest Shuttle.',
  },
  contact: {
    title: 'Contact & Project Consultation | Casmura Contract',
    description:
      'Request a project quote, book a technical consultation, or download architectural catalogues from our Colombo estimation desk.',
  },
};

function parseHashRoute(): { page: PageRoute; productSlug: string | null } {
  const hash = window.location.hash.replace('#', '');
  if (hash.startsWith('products/')) {
    const slug = hash.slice('products/'.length).trim();
    return { page: 'products', productSlug: slug || null };
  }
  const route = hash as PageRoute;
  return {
    page: VALID_PAGES.includes(route) ? route : 'home',
    productSlug: null,
  };
}

function trackAnalyticsEvent(kind: 'pageview' | 'cta', key: string) {
  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, key }),
  }).catch(() => {
    // Non-blocking analytics telemetry
  });
}

export default function App() {
  const initial = parseHashRoute();
  const [currentPage, setCurrentPage] = useState<PageRoute>(initial.page);
  const [selectedProductTaxonomy, setSelectedProductTaxonomy] = useState<
    ProductTaxonomyCategory | 'All'
  >('All');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(
    initial.productSlug
  );

  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [projects, setProjects] = useState<ProjectCaseStudy[]>(INITIAL_PROJECTS);
  const [clients, setClients] = useState<ClientLogo[]>(INITIAL_CLIENTS);
  const [documents, setDocuments] = useState<TechnicalDocument[]>(INITIAL_DOCUMENTS);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(INITIAL_TESTIMONIALS);
  const [siteContent, setSiteContent] = useState<SiteContentConfig>(INITIAL_SITE_CONTENT);

  const [selectedProductModal, setSelectedProductModal] = useState<ProductItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectCaseStudy | null>(null);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [consultationInterest, setConsultationInterest] = useState<string>('');

  const fetchCatalog = useCallback(async () => {
    try {
      const res = await fetch('/api/catalog');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.products)) setProducts(data.products);
      if (Array.isArray(data.projects)) setProjects(data.projects);
      if (Array.isArray(data.clients)) setClients(data.clients);
      if (Array.isArray(data.documents)) setDocuments(data.documents);
      if (Array.isArray(data.testimonials)) setTestimonials(data.testimonials);
      if (data.siteContent) setSiteContent(data.siteContent);
    } catch {
      // Fallback to initial seeded data
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseHashRoute();
      setCurrentPage(parsed.page);
      setSelectedProductSlug(parsed.productSlug);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Dynamic SPA SEO meta updates & pageview analytics
  useEffect(() => {
    const seo = ROUTE_SEO[currentPage];
    document.title = seo.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', seo.description);
    }
    trackAnalyticsEvent('pageview', currentPage);
  }, [currentPage]);

  const navigateTo = (
    page: PageRoute,
    options?: {
      productTaxonomy?: ProductTaxonomyCategory | 'All';
      productSlug?: string | null;
    }
  ) => {
    setCurrentPage(page);
    if (page === 'products') {
      if (options?.productTaxonomy !== undefined) {
        setSelectedProductTaxonomy(options.productTaxonomy);
      } else {
        setSelectedProductTaxonomy('All');
      }
      const nextSlug = options?.productSlug ?? null;
      setSelectedProductSlug(nextSlug);
      window.location.hash = nextSlug ? `products/${nextSlug}` : 'products';
    } else {
      setSelectedProductSlug(null);
      window.location.hash = page === 'home' ? '' : page;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openConsultation = (interest = '') => {
    trackAnalyticsEvent('cta', 'open_consultation');
    setConsultationInterest(interest);
    setConsultationOpen(true);
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen flex flex-col bg-white text-[#00214A]">
      <Header
        currentPage={currentPage}
        products={products}
        onNavigate={navigateTo}
        onOpenConsultation={() => openConsultation('General Project Consultation')}
      />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {currentPage === 'home' && (
              <HomePage
                products={products}
                projects={projects}
                clients={clients}
                documents={documents}
                testimonials={testimonials}
                siteContent={siteContent}
                onNavigate={navigateTo}
                onSelectProduct={(prod) =>
                  navigateTo('products', {
                    productTaxonomy: prod.taxonomyCategory,
                    productSlug: prod.slug,
                  })
                }
                onSelectProject={setSelectedProject}
                onOpenConsultation={openConsultation}
              />
            )}

            {currentPage === 'products' && (
              <ProductsPage
                products={products}
                documents={documents}
                activeTaxonomy={selectedProductTaxonomy}
                onChangeTaxonomy={(cat) => setSelectedProductTaxonomy(cat)}
                activeProductSlug={selectedProductSlug}
                onSelectProductDetail={(prod) => {
                  if (prod) {
                    setSelectedProductTaxonomy(prod.taxonomyCategory);
                    setSelectedProductSlug(prod.slug);
                    window.location.hash = `products/${prod.slug}`;
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    setSelectedProductSlug(null);
                    window.location.hash = 'products';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                onInquireProduct={openConsultation}
                onBookConsultation={openConsultation}
              />
            )}

            {currentPage === 'case-studies' && (
              <CaseStudiesPage
                projects={projects}
                onSelectProject={setSelectedProject}
                onInquireSimilar={openConsultation}
              />
            )}

            {currentPage === 'automation' && (
              <AutomationPage onOpenConsultation={openConsultation} />
            )}

            {currentPage === 'contact' && <ContactPage documents={documents} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer onNavigate={navigateTo} />

      {/* Modals */}
      <ProductSpecModal
        product={selectedProductModal}
        onClose={() => setSelectedProductModal(null)}
        onInquireProduct={openConsultation}
      />

      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onInquireSimilar={openConsultation}
      />

      <QuickConsultationModal
        open={consultationOpen}
        initialInterest={consultationInterest}
        onClose={() => setConsultationOpen(false)}
      />

      {/* Discreet Floating WhatsApp Direct Concierge */}
      <a
        href={`https://wa.me/${siteContent.whatsappNumber}?text=Hello%20Casmura%20Contract%2C%20I%20would%20like%20assistance%20with%20a%20contract%20shading%20project.`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackAnalyticsEvent('cta', 'whatsapp_click')}
        aria-label="Chat with Casmura Contract on WhatsApp"
        className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 glass-floating-pill glass-card-hover text-white px-4 py-2.5 rounded-full text-xs font-bold hover:scale-105"
      >
        <MessageCircle className="w-4 h-4 text-[#C5A15B]" />
        <span className="hidden sm:inline">WhatsApp Desk</span>
      </a>
    </div>
    </MotionConfig>
  );
}
