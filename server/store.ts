import fs from 'fs';
import path from 'path';
import type {
  AnalyticsSummary,
  ClientLogo,
  CustomPageItem,
  LeadRecord,
  LeadStatus,
  LeadType,
  ProductItem,
  ProjectCaseStudy,
  SiteContentConfig,
  TechnicalDocument,
  TestimonialItem,
} from '../src/types/casmura.ts';
import {
  INITIAL_CLIENTS,
  INITIAL_CUSTOM_PAGES,
  INITIAL_DOCUMENTS,
  INITIAL_LEADS,
  INITIAL_PRODUCTS,
  INITIAL_PROJECTS,
  INITIAL_SITE_CONTENT,
  INITIAL_TESTIMONIALS,
} from './seedData.ts';

interface DatabaseSchema {
  products: ProductItem[];
  projects: ProjectCaseStudy[];
  clients: ClientLogo[];
  documents: TechnicalDocument[];
  leads: LeadRecord[];
  testimonials: TestimonialItem[];
  siteContent: SiteContentConfig;
  customPages: CustomPageItem[];
  pageViews: Record<string, number>;
  ctaEvents: Record<string, number>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'casmura-db.json');

function ensureDbFile(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      projects: INITIAL_PROJECTS,
      clients: INITIAL_CLIENTS,
      documents: INITIAL_DOCUMENTS,
      leads: INITIAL_LEADS,
      testimonials: INITIAL_TESTIMONIALS,
      siteContent: INITIAL_SITE_CONTENT,
      customPages: INITIAL_CUSTOM_PAGES,
      pageViews: { home: 1 },
      ctaEvents: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
  const productsValid =
    Array.isArray(parsed.products) &&
    parsed.products.length >= INITIAL_PRODUCTS.length &&
    parsed.products.every((p) => Boolean(p.taxonomyCategory));
  const projectsValid =
    Array.isArray(parsed.projects) &&
    parsed.projects.length >= INITIAL_PROJECTS.length &&
    parsed.projects.every((p) => Boolean(p.systemCategory));

  const legacyHeadlines = new Set([
    'Elevating Spaces Through\nArchitectural Excellence.',
    'Elevating Spaces Through Architectural Excellence.',
  ]);
  const storedSiteContent = parsed.siteContent ?? INITIAL_SITE_CONTENT;
  const migratedSiteContent: SiteContentConfig =
    legacyHeadlines.has(storedSiteContent.heroHeadline)
      ? {
          ...storedSiteContent,
          heroHeadline: INITIAL_SITE_CONTENT.heroHeadline,
          heroSubheadline: INITIAL_SITE_CONTENT.heroSubheadline,
        }
      : storedSiteContent;

  const hydrated: DatabaseSchema = {
    products: productsValid ? parsed.products! : INITIAL_PRODUCTS,
    projects: projectsValid ? parsed.projects! : INITIAL_PROJECTS,
    clients: parsed.clients ?? INITIAL_CLIENTS,
    documents: parsed.documents ?? INITIAL_DOCUMENTS,
    leads: parsed.leads ?? INITIAL_LEADS,
    testimonials: parsed.testimonials ?? INITIAL_TESTIMONIALS,
    siteContent: migratedSiteContent,
    customPages: parsed.customPages ?? INITIAL_CUSTOM_PAGES,
    pageViews: parsed.pageViews ?? { home: 1 },
    ctaEvents: parsed.ctaEvents ?? {},
  };

  if (migratedSiteContent !== storedSiteContent) {
    saveDb(hydrated);
  }

  return hydrated;
}

function saveDb(db: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

export const dbStore = {
  getAll(): DatabaseSchema {
    return ensureDbFile();
  },

  addLead(
    payload: Omit<LeadRecord, 'id' | 'referenceCode' | 'status' | 'createdAt'>
  ): LeadRecord {
    const db = ensureDbFile();
    const seq = 1040 + db.leads.length + 1;
    const newLead: LeadRecord = {
      ...payload,
      id: `lead-${Date.now()}`,
      referenceCode: `CAS-2026-${seq}`,
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    db.leads.unshift(newLead);
    saveDb(db);
    return newLead;
  },

  updateLead(
    id: string,
    updates: Partial<Pick<LeadRecord, 'status' | 'internalNotes'>>
  ): LeadRecord | null {
    const db = ensureDbFile();
    const idx = db.leads.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    db.leads[idx] = { ...db.leads[idx], ...updates };
    saveDb(db);
    return db.leads[idx];
  },

  upsertProduct(product: ProductItem): ProductItem {
    const db = ensureDbFile();
    const idx = db.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      db.products[idx] = product;
    } else {
      db.products.push(product);
    }
    saveDb(db);
    return product;
  },

  deleteProduct(id: string): boolean {
    const db = ensureDbFile();
    const before = db.products.length;
    db.products = db.products.filter((p) => p.id !== id);
    if (db.products.length !== before) {
      saveDb(db);
      return true;
    }
    return false;
  },

  upsertProject(project: ProjectCaseStudy): ProjectCaseStudy {
    const db = ensureDbFile();
    const idx = db.projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      db.projects[idx] = project;
    } else {
      db.projects.unshift(project);
    }
    saveDb(db);
    return project;
  },

  deleteProject(id: string): boolean {
    const db = ensureDbFile();
    const before = db.projects.length;
    db.projects = db.projects.filter((p) => p.id !== id);
    if (db.projects.length !== before) {
      saveDb(db);
      return true;
    }
    return false;
  },

  upsertDocument(doc: TechnicalDocument): TechnicalDocument {
    const db = ensureDbFile();
    const idx = db.documents.findIndex((d) => d.id === doc.id);
    if (idx >= 0) {
      db.documents[idx] = doc;
    } else {
      db.documents.push(doc);
    }
    saveDb(db);
    return doc;
  },

  deleteDocument(id: string): boolean {
    const db = ensureDbFile();
    const before = db.documents.length;
    db.documents = db.documents.filter((d) => d.id !== id);
    if (db.documents.length !== before) {
      saveDb(db);
      return true;
    }
    return false;
  },

  upsertTestimonial(item: TestimonialItem): TestimonialItem {
    const db = ensureDbFile();
    const idx = db.testimonials.findIndex((t) => t.id === item.id);
    if (idx >= 0) {
      db.testimonials[idx] = item;
    } else {
      db.testimonials.unshift(item);
    }
    saveDb(db);
    return item;
  },

  deleteTestimonial(id: string): boolean {
    const db = ensureDbFile();
    const before = db.testimonials.length;
    db.testimonials = db.testimonials.filter((t) => t.id !== id);
    if (db.testimonials.length !== before) {
      saveDb(db);
      return true;
    }
    return false;
  },

  upsertCustomPage(page: CustomPageItem): CustomPageItem {
    const db = ensureDbFile();
    const idx = db.customPages.findIndex((p) => p.id === page.id);
    if (idx >= 0) {
      db.customPages[idx] = page;
    } else {
      db.customPages.push(page);
    }
    saveDb(db);
    return page;
  },

  deleteCustomPage(id: string): boolean {
    const db = ensureDbFile();
    const before = db.customPages.length;
    db.customPages = db.customPages.filter((p) => p.id !== id);
    if (db.customPages.length !== before) {
      saveDb(db);
      return true;
    }
    return false;
  },

  updateSiteContent(updates: Partial<SiteContentConfig>): SiteContentConfig {
    const db = ensureDbFile();
    db.siteContent = { ...db.siteContent, ...updates };
    saveDb(db);
    return db.siteContent;
  },

  recordEvent(kind: 'pageview' | 'cta', key: string): void {
    const db = ensureDbFile();
    const safeKey = key.slice(0, 64);
    if (kind === 'pageview') {
      db.pageViews[safeKey] = (db.pageViews[safeKey] ?? 0) + 1;
    } else {
      db.ctaEvents[safeKey] = (db.ctaEvents[safeKey] ?? 0) + 1;
    }
    saveDb(db);
  },

  incrementDocumentDownload(docId: string): TechnicalDocument | null {
    const db = ensureDbFile();
    const doc = db.documents.find((d) => d.id === docId);
    if (!doc) return null;
    doc.downloadCount += 1;
    saveDb(db);
    return doc;
  },

  getAnalytics(): AnalyticsSummary {
    const db = ensureDbFile();
    const byType: Record<LeadType, number> = {
      inquiry: 0,
      quote: 0,
      consultation: 0,
      catalogue: 0,
    };
    const byStatus: Record<LeadStatus, number> = {
      New: 0,
      'In Estimation': 0,
      'Proposal Sent': 0,
      Won: 0,
      Archived: 0,
    };
    const locationMap = new Map<string, number>();

    for (const lead of db.leads) {
      byType[lead.type] = (byType[lead.type] ?? 0) + 1;
      byStatus[lead.status] = (byStatus[lead.status] ?? 0) + 1;
      const loc = lead.projectLocation || 'Unspecified';
      locationMap.set(loc, (locationMap.get(loc) ?? 0) + 1);
    }

    const byLocation = Array.from(locationMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);

    const totalDownloads = db.documents.reduce((sum, d) => sum + d.downloadCount, 0);

    return {
      totalLeads: db.leads.length,
      byType,
      byStatus,
      byLocation,
      totalDownloads,
      pageViews: db.pageViews,
      ctaEvents: db.ctaEvents,
    };
  },
};
