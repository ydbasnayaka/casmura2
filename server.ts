import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbStore } from './server/store.ts';
import type {
  CustomPageItem,
  LeadStatus,
  LeadType,
  ProductItem,
  ProjectCaseStudy,
  SiteContentConfig,
  TechnicalDocument,
  TestimonialItem,
} from './src/types/casmura.ts';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'casmura-contract-platform' });
  });

  app.get('/api/catalog', (_req, res) => {
    const db = dbStore.getAll();
    res.json({
      products: db.products,
      projects: db.projects,
      clients: db.clients,
      documents: db.documents,
      testimonials: db.testimonials,
      siteContent: db.siteContent,
      customPages: db.customPages,
    });
  });

  app.get('/api/products', (_req, res) => {
    const db = dbStore.getAll();
    res.json(db.products);
  });

  app.get('/api/projects', (_req, res) => {
    const db = dbStore.getAll();
    res.json(db.projects);
  });

  app.get('/api/leads', (_req, res) => {
    const db = dbStore.getAll();
    res.json(db.leads);
  });

  app.post('/api/leads', (req, res) => {
    const {
      type = 'inquiry',
      fullName,
      companyName,
      email,
      phone,
      projectLocation,
      productInterest,
      roomCount,
      automationNeeded,
      timeline,
      consultationDate,
      consultationFormat,
      message,
    } = req.body ?? {};

    if (!fullName || !email || !projectLocation) {
      res.status(400).json({
        error: 'Full Name, Corporate Email, and Project Location are required.',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      res.status(400).json({ error: 'Please provide a valid corporate email address.' });
      return;
    }

    const validTypes: LeadType[] = ['inquiry', 'quote', 'consultation', 'catalogue'];
    const safeType: LeadType = validTypes.includes(type) ? type : 'inquiry';

    const created = dbStore.addLead({
      type: safeType,
      fullName: String(fullName).trim(),
      companyName: String(companyName || 'Independent / Private').trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : undefined,
      projectLocation: String(projectLocation).trim(),
      productInterest: productInterest ? String(productInterest).trim() : undefined,
      roomCount: roomCount ? String(roomCount).trim() : undefined,
      automationNeeded: automationNeeded ? String(automationNeeded).trim() : undefined,
      timeline: timeline ? String(timeline).trim() : undefined,
      consultationDate: consultationDate ? String(consultationDate).trim() : undefined,
      consultationFormat: consultationFormat ? String(consultationFormat).trim() : undefined,
      message: String(message || 'No additional scope notes provided.').trim(),
    });

    res.status(201).json(created);
  });

  app.patch('/api/leads/:id', (req, res) => {
    const { id } = req.params;
    const { status, internalNotes } = req.body ?? {};
    const validStatuses: LeadStatus[] = ['New', 'In Estimation', 'Proposal Sent', 'Won', 'Archived'];
    const updates: { status?: LeadStatus; internalNotes?: string } = {};
    if (status && validStatuses.includes(status)) {
      updates.status = status;
    }
    if (typeof internalNotes === 'string') {
      updates.internalNotes = internalNotes;
    }
    const updated = dbStore.updateLead(id, updates);
    if (!updated) {
      res.status(404).json({ error: 'Lead record not found.' });
      return;
    }
    res.json(updated);
  });

  app.get('/api/analytics', (_req, res) => {
    res.json(dbStore.getAnalytics());
  });

  app.post('/api/analytics/event', (req, res) => {
    const { kind, key } = req.body ?? {};
    if ((kind === 'pageview' || kind === 'cta') && typeof key === 'string' && key.trim()) {
      dbStore.recordEvent(kind, key.trim());
    }
    res.json({ ok: true });
  });

  // CMS Product CRUD (Create + Edit via upsert)
  app.post('/api/cms/products', (req, res) => {
    const body = req.body as Partial<ProductItem>;
    if (!body.title || !body.category || !body.shortDescription) {
      res.status(400).json({ error: 'Title, category, and short description are required.' });
      return;
    }
    const existing = body.id
      ? dbStore.getAll().products.find((p) => p.id === body.id)
      : undefined;

    const image = body.image || existing?.image || '/src/assets/images/product_hotel_curtains_1795071937203.jpg';
    const defaultTaxonomy =
      body.category === 'Outdoor Blinds'
        ? 'Outdoor Curtains & Weather Blinds'
        : body.category === 'Pergolas & Tents'
        ? 'Pergolas, Tents, & Roofing Tiles'
        : body.category === 'Interior Decor'
        ? 'Interior Decor Essentials'
        : 'Indoor Curtains & Blinds';

    const item: ProductItem = {
      id: body.id || `prod-${Date.now()}`,
      slug:
        body.slug ||
        existing?.slug ||
        body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      title: body.title.trim(),
      category: body.category,
      taxonomyCategory: body.taxonomyCategory || existing?.taxonomyCategory || defaultTaxonomy,
      subGroup: body.subGroup || existing?.subGroup || body.category,
      application: body.application || existing?.application || 'Hospitality & Commercial Interiors',
      motorization: body.motorization || existing?.motorization || 'Manual & Motorized',
      flameRating: body.flameRating || existing?.flameRating || 'NFPA 701 / BS 5867',
      shortDescription: body.shortDescription.trim(),
      fullDescription: body.fullDescription || existing?.fullDescription || body.shortDescription.trim(),
      image,
      gallery: body.gallery?.length ? body.gallery : existing?.gallery || [image],
      featuredOnHome: body.featuredOnHome ?? existing?.featuredOnHome ?? false,
      customOptions: body.customOptions?.length
        ? body.customOptions
        : existing?.customOptions || ['Custom Sizing', 'Hospitality Grade Finish'],
      operatingSystems: body.operatingSystems?.length
        ? body.operatingSystems
        : existing?.operatingSystems || ['Manual Track', 'Motorized Drive'],
      recommendedApplications: body.recommendedApplications?.length
        ? body.recommendedApplications
        : existing?.recommendedApplications || ['Hospitality Suites', 'Private Villas'],
      specs: body.specs?.length
        ? body.specs
        : existing?.specs || [{ label: 'Grade', value: '5-Star Contract Specification' }],
      compatibleSystems: body.compatibleSystems?.length
        ? body.compatibleSystems
        : existing?.compatibleSystems || ['Forest', 'Somfy', 'KNX'],
    };
    res.status(201).json(dbStore.upsertProduct(item));
  });

  app.delete('/api/cms/products/:id', (req, res) => {
    const deleted = dbStore.deleteProduct(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    res.json({ ok: true });
  });

  // CMS Project Case Study CRUD (Create + Edit via upsert)
  app.post('/api/cms/projects', (req, res) => {
    const body = req.body as Partial<ProjectCaseStudy>;
    if (!body.title || !body.country || !body.shortDescription) {
      res.status(400).json({ error: 'Project title, country, and description are required.' });
      return;
    }
    const existing = body.id
      ? dbStore.getAll().projects.find((p) => p.id === body.id)
      : undefined;

    const image = body.image || existing?.image || '/src/assets/images/project_taj_bentota_1795071937604.jpg';

    const item: ProjectCaseStudy = {
      id: body.id || `proj-${Date.now()}`,
      slug:
        body.slug ||
        existing?.slug ||
        body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      title: body.title.trim(),
      clientBrand: body.clientBrand || existing?.clientBrand || body.title.trim(),
      location: body.location || existing?.location || body.country,
      country: body.country.trim(),
      sector: body.sector || existing?.sector || 'Luxury Resort',
      systemCategory: body.systemCategory || existing?.systemCategory || 'CURTAIN',
      year: body.year || existing?.year || '2026',
      shortDescription: body.shortDescription.trim(),
      challenge:
        body.challenge ||
        existing?.challenge ||
        'Bespoke light control and humidity-resilient architectural shading tailored to resort specifications.',
      solution:
        body.solution ||
        existing?.solution ||
        'Engineered contract drapery and shading systems fabricated to exact opening schedules and installed on site.',
      narrativeParagraphs: body.narrativeParagraphs ?? existing?.narrativeParagraphs,
      scopeItems: body.scopeItems?.length
        ? body.scopeItems
        : existing?.scopeItems || ['Site Measurement', 'Custom Fabrication', 'Installation'],
      systemsInstalled: body.systemsInstalled?.length
        ? body.systemsInstalled
        : existing?.systemsInstalled || ['Contract Drapery Systems'],
      image,
      gallery: body.gallery?.length
        ? body.gallery
        : existing?.gallery?.length
        ? existing.gallery
        : [image],
      featuredOnHome: body.featuredOnHome ?? existing?.featuredOnHome ?? false,
      featuredEditorial: body.featuredEditorial ?? existing?.featuredEditorial ?? false,
      clientFeedback: body.clientFeedback ?? existing?.clientFeedback,
    };
    res.status(201).json(dbStore.upsertProject(item));
  });

  app.delete('/api/cms/projects/:id', (req, res) => {
    const deleted = dbStore.deleteProject(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    res.json({ ok: true });
  });

  // CMS Dynamic Pages CRUD
  app.post('/api/cms/pages', (req, res) => {
    const body = req.body as Partial<CustomPageItem>;
    if (!body.title || !body.summary || !body.body) {
      res.status(400).json({ error: 'Page title, summary, and body are required.' });
      return;
    }
    const slug = (
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    ).trim();

    const item: CustomPageItem = {
      id: body.id || `page-${Date.now()}`,
      slug,
      title: body.title.trim(),
      eyebrow: body.eyebrow?.trim() || 'Casmura Resource',
      summary: body.summary.trim(),
      body: body.body.trim(),
      heroImage: body.heroImage?.trim() || undefined,
      published: body.published ?? true,
      updatedAt: new Date().toISOString(),
    };
    res.status(201).json(dbStore.upsertCustomPage(item));
  });

  app.delete('/api/cms/pages/:id', (req, res) => {
    const deleted = dbStore.deleteCustomPage(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Page not found.' });
      return;
    }
    res.json({ ok: true });
  });

  // CMS Technical Document CRUD
  app.post('/api/cms/documents', (req, res) => {
    const body = req.body as Partial<TechnicalDocument>;
    if (!body.title || !body.fileCode || !body.summary) {
      res.status(400).json({ error: 'Document title, file code, and summary are required.' });
      return;
    }
    const doc: TechnicalDocument = {
      id: body.id || `doc-${Date.now()}`,
      title: body.title.trim(),
      category: body.category || 'Contract Catalogue',
      fileCode: body.fileCode.trim(),
      version: body.version || '2026 Edition',
      pages: Number(body.pages) || 12,
      summary: body.summary.trim(),
      downloadCount: Number(body.downloadCount) || 0,
    };
    res.status(201).json(dbStore.upsertDocument(doc));
  });

  app.delete('/api/cms/documents/:id', (req, res) => {
    const deleted = dbStore.deleteDocument(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Document not found.' });
      return;
    }
    res.json({ ok: true });
  });

  // CMS Verified Testimonials CRUD
  app.post('/api/cms/testimonials', (req, res) => {
    const body = req.body as Partial<TestimonialItem>;
    if (!body.quote || !body.authorName || !body.organization) {
      res.status(400).json({ error: 'Quote, author name, and organization are required.' });
      return;
    }
    const item: TestimonialItem = {
      id: body.id || `test-${Date.now()}`,
      quote: body.quote.trim(),
      authorName: body.authorName.trim(),
      role: body.role?.trim() || 'Hospitality Partner',
      organization: body.organization.trim(),
      projectTitle: body.projectTitle?.trim(),
      verified: body.verified ?? true,
    };
    res.status(201).json(dbStore.upsertTestimonial(item));
  });

  app.delete('/api/cms/testimonials/:id', (req, res) => {
    const deleted = dbStore.deleteTestimonial(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Testimonial not found.' });
      return;
    }
    res.json({ ok: true });
  });

  // CMS Site Content Update
  app.put('/api/cms/site-content', (req, res) => {
    const body = req.body as Partial<SiteContentConfig>;
    const updated = dbStore.updateSiteContent(body);
    res.json(updated);
  });

  // Real Technical Document / Catalogue Download
  app.get('/api/documents/:id/download', (req, res) => {
    const doc = dbStore.incrementDocumentDownload(req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Technical document not found.' });
      return;
    }

    const db = dbStore.getAll();
    const content = [
      '====================================================================',
      'CASMURA CONTRACT — ARCHITECTURAL & HOSPITALITY SPECIFICATION SHEET',
      'Subsidiary of Avarna Holdings',
      '====================================================================',
      `Document Title : ${doc.title}`,
      `Reference Code : ${doc.fileCode}`,
      `Version        : ${doc.version}`,
      `Category       : ${doc.category}`,
      `Generated Date : ${new Date().toISOString().split('T')[0]}`,
      '',
      '1. OVERVIEW',
      doc.summary,
      '',
      '2. HEADQUARTERS & TECHNICAL ESTIMATION DESK',
      `Address  : ${db.siteContent.contactAddress}`,
      `Email    : ${db.siteContent.contactEmail}`,
      `Direct   : ${db.siteContent.contactPhone}`,
      'Regions  : Sri Lanka | Maldives | Saudi Arabia | UAE | Japan |',
      '           Seychelles | Mauritius | Indonesia | Philippines | Singapore | Tanzania',
      '',
      '3. CONTRACT PRODUCT SYSTEMS SUMMARY',
      ...db.products.flatMap((p) => [
        `--- ${p.title} (${p.category}) ---`,
        `Application   : ${p.application}`,
        `Flame Rating  : ${p.flameRating}`,
        `Motorization  : ${p.motorization}`,
        ...p.specs.map((s) => `  • ${s.label}: ${s.value}`),
        '',
      ]),
      '====================================================================',
      '© 2026 Casmura Contract. For CAD/DWG drawings contact our technical desk.',
    ].join('\n');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${doc.fileCode}.txt"`
    );
    res.send(content);
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Casmura Contract platform listening on http://localhost:${PORT}`);
  });
}

startServer();
