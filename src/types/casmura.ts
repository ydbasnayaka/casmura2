export type PageRoute =
  | 'home'
  | 'products'
  | 'case-studies'
  | 'automation'
  | 'contact';

export type ProductTaxonomyCategory =
  | 'Indoor Curtains & Blinds'
  | 'Outdoor Curtains & Weather Blinds'
  | 'Pergolas, Tents, & Roofing Tiles'
  | 'Interior Decor Essentials';

export type OperatingSystemOption =
  | 'Manual Track'
  | 'Cord Draw'
  | 'Cordless Spring'
  | 'Hand Baton'
  | 'Motorized Drive'
  | 'Smart Remote'
  | 'Wall Switch'
  | 'Architectural Fixed';

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductItem {
  id: string;
  slug: string;
  title: string;
  category: 'Curtains' | 'Indoor Blinds' | 'Outdoor Blinds' | 'Automated Tracks' | 'Pergolas & Tents' | 'Interior Decor';
  taxonomyCategory: ProductTaxonomyCategory;
  subGroup: string;
  application: string;
  motorization: 'Manual & Motorized' | 'Motorized / BMS' | 'Manual / Chain' | 'Outdoor Motorized' | 'Architectural System';
  flameRating: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  gallery?: string[];
  featuredOnHome: boolean;
  customOptions: string[];
  operatingSystems?: OperatingSystemOption[];
  recommendedApplications?: string[];
  specs: ProductSpec[];
  compatibleSystems: string[];
}

export interface ProjectCaseStudy {
  id: string;
  slug: string;
  title: string;
  clientBrand: string;
  location: string;
  country: string;
  sector: 'Luxury Resort' | 'Overwater Villas' | 'Coastal Sanctuary' | 'Commercial Hospitality';
  systemCategory: 'CURTAIN' | 'INDOOR' | 'OUTDOOR' | 'PERGOLAS';
  year: string;
  shortDescription: string;
  challenge: string;
  solution: string;
  narrativeParagraphs?: string[];
  scopeItems: string[];
  systemsInstalled: string[];
  image: string;
  gallery: string[];
  featuredOnHome: boolean;
  featuredEditorial?: boolean;
  clientFeedback?: string;
}

export interface CustomPageItem {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  body: string;
  heroImage?: string;
  published: boolean;
  updatedAt: string;
}

export interface TechnicalDocument {
  id: string;
  title: string;
  category: 'Contract Catalogue' | 'Wiring & BMS' | 'Fabric Standards' | 'CAD & Recess';
  fileCode: string;
  version: string;
  pages: number;
  summary: string;
  downloadCount: number;
}

export interface ClientLogo {
  id: string;
  name: string;
  location: string;
  subtitle?: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  authorName: string;
  role: string;
  organization: string;
  projectTitle?: string;
  verified: boolean;
}

export interface SiteContentConfig {
  heroHeadline: string;
  heroSubheadline: string;
  introHeading: string;
  introSummary: string;
  contactAddress: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
}

export type LeadType = 'inquiry' | 'quote' | 'consultation' | 'catalogue';
export type LeadStatus = 'New' | 'In Estimation' | 'Proposal Sent' | 'Won' | 'Archived';

export interface LeadRecord {
  id: string;
  referenceCode: string;
  type: LeadType;
  status: LeadStatus;
  fullName: string;
  companyName: string;
  email: string;
  phone?: string;
  projectLocation: string;
  productInterest?: string;
  roomCount?: string;
  automationNeeded?: string;
  timeline?: string;
  consultationDate?: string;
  consultationFormat?: string;
  message: string;
  internalNotes?: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalLeads: number;
  byType: Record<LeadType, number>;
  byStatus: Record<LeadStatus, number>;
  byLocation: Array<{ location: string; count: number }>;
  totalDownloads: number;
  pageViews: Record<string, number>;
  ctaEvents: Record<string, number>;
}
