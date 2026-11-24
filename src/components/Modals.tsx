import { CheckCircle2, Download, MessageCircle, Play, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { REGIONS_SERVED } from '../../server/seedData.ts';
import type { LeadType, ProductItem, ProjectCaseStudy } from '../types/casmura.ts';
import { SafeImage } from './SafeImage.tsx';

interface ProductSpecModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onInquireProduct: (productTitle: string) => void;
}

export function ProductSpecModal({
  product,
  onClose,
  onInquireProduct,
}: ProductSpecModalProps) {
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div className="glass-panel-light rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[#00214A]/12 px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-[#8C6B2D]">
              {product.taxonomyCategory} · {product.motorization}
            </p>
            <h3
              id="product-modal-title"
              className="text-xl font-bold text-[#00214A]"
            >
              {product.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-[#00214A]/15 flex items-center justify-center text-slate-600 hover:bg-[#F3F1EC] cursor-pointer"
            aria-label="Close specifications"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="aspect-[16/9] rounded-lg overflow-hidden bg-slate-100">
            <SafeImage
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-500">
              Application: <span className="text-[#00214A] font-medium">{product.application}</span>
            </p>
            <p className="text-[15px] leading-relaxed text-slate-700">
              {product.fullDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <h4 className="text-sm font-bold text-[#00214A] uppercase tracking-wider mb-3">
                Custom Configuration Options
              </h4>
              <ul className="space-y-2 text-sm text-slate-700">
                {product.customOptions.map((opt) => (
                  <li key={opt} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C5A15B] shrink-0 mt-0.5" />
                    <span>{opt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#00214A] uppercase tracking-wider mb-3">
                Technical Specifications
              </h4>
              <dl className="divide-y divide-slate-200 border border-[#00214A]/12 rounded-lg">
                {product.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="px-3.5 py-2.5 flex items-center justify-between gap-4 text-xs"
                  >
                    <dt className="text-slate-500 font-medium">{spec.label}</dt>
                    <dd className="text-[#00214A] font-semibold text-right tabular-nums">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="pt-2 border-t border-[#00214A]/12 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <a
              href="/api/documents/doc-master-catalogue/download"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-[#00214A]/20 text-[#00214A] text-sm font-semibold hover:bg-[#F3F1EC] transition-colors"
            >
              <Download className="w-4 h-4 text-[#C5A15B]" />
              <span>Download Spec Catalogue</span>
            </a>

            <button
              type="button"
              onClick={() => {
                onClose();
                onInquireProduct(product.title);
              }}
              className="inline-flex items-center justify-center gap-2 bg-[#00214A] hover:bg-[#00214A]/90 text-white text-sm font-bold px-5 py-2.5 rounded-md border border-[#C5A15B]/35 transition-colors cursor-pointer"
            >
              <span>Request Product Quote</span>
              <Play className="w-3 h-3 fill-[#C5A15B] text-[#C5A15B]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProjectDetailModalProps {
  project: ProjectCaseStudy | null;
  onClose: () => void;
  onInquireSimilar: (projectTitle: string) => void;
}

export function ProjectDetailModal({
  project,
  onClose,
  onInquireSimilar,
}: ProjectDetailModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    setActiveImageIdx(0);
  }, [project?.id]);

  if (!project) return null;

  const images = project.gallery?.length ? project.gallery : [project.image];
  const currentImg = images[activeImageIdx] || project.image;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <div className="glass-panel-light rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-[#00214A] border-b border-[#C5A15B]/25 text-white px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#C5A15B]">
              {project.systemCategory} · {project.location}, {project.country} · {project.year}
            </p>
            <h3 id="project-modal-title" className="text-xl font-bold">
              {project.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/10 cursor-pointer"
            aria-label="Close case study"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="aspect-[16/9] rounded-lg overflow-hidden bg-slate-100">
              <SafeImage
                src={currentImg}
                alt={`${project.title} view ${activeImageIdx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex items-center gap-3">
                {images.map((imgUrl, i) => (
                  <button
                    key={imgUrl + i}
                    type="button"
                    onClick={() => setActiveImageIdx(i)}
                    className={`w-24 aspect-[4/3] rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                      i === activeImageIdx
                        ? 'border-[#C5A15B] opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <SafeImage
                      src={imgUrl}
                      alt={`${project.title} thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Architectural Requirement
              </h4>
              <p className="text-sm leading-relaxed text-slate-700">
                {project.challenge}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Engineered Contract Solution
              </h4>
              <p className="text-sm leading-relaxed text-slate-700">
                {project.solution}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[#00214A]/12">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#00214A] mb-2.5">
                Delivered Scope of Work
              </h4>
              <ul className="space-y-1.5 text-sm text-slate-700">
                {project.scopeItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C5A15B] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#00214A] mb-2.5">
                Systems & Hardware Deployed
              </h4>
              <div className="text-sm text-slate-700 space-y-1">
                {project.systemsInstalled.map((sys) => (
                  <div key={sys} className="py-1 border-b border-slate-100 last:border-0">
                    {sys}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {project.clientFeedback && project.clientFeedback.trim().length > 0 && (
            <div className="p-4 rounded-lg bg-[#F3F1EC] border-l-2 border-[#C5A15B] space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#00214A]">
                Client Feedback
              </p>
              <p className="text-sm italic text-slate-700 leading-relaxed">
                &ldquo;{project.clientFeedback}&rdquo;
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-[#00214A]/12 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Planning a similar hospitality or villa specification?
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onInquireSimilar(`Project reference: ${project.title}`);
              }}
              className="inline-flex items-center justify-center gap-2 bg-[#00214A] hover:bg-[#00214A]/90 text-white text-sm font-semibold px-5 py-2.5 rounded-md border border-[#C5A15B]/35 transition-colors cursor-pointer"
            >
              <span>Request Project Proposal</span>
              <Play className="w-3 h-3 fill-[#C5A15B] text-[#C5A15B]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickConsultationModalProps {
  open: boolean;
  initialInterest?: string;
  initialType?: LeadType;
  onClose: () => void;
}

export function QuickConsultationModal({
  open,
  initialInterest = '',
  initialType = 'consultation',
  onClose,
}: QuickConsultationModalProps) {
  const [leadType, setLeadType] = useState<LeadType>(initialType);
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [projectLocation, setProjectLocation] = useState('Maldives');
  const [productInterest, setProductInterest] = useState(initialInterest || 'Curtains & Drapery');
  const [consultationDate, setConsultationDate] = useState('');
  const [consultationFormat, setConsultationFormat] = useState('Virtual Technical Briefing');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setProductInterest(initialInterest || 'Curtains & Drapery');
      setLeadType(initialType);
      setError('');
      setSubmittedRef(null);
    }
  }, [open, initialInterest, initialType]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: leadType,
          fullName,
          companyName,
          email,
          phone,
          projectLocation,
          productInterest,
          consultationDate: leadType === 'consultation' ? consultationDate : undefined,
          consultationFormat: leadType === 'consultation' ? consultationFormat : undefined,
          message:
            message ||
            `Requested ${leadType} regarding ${productInterest} in ${projectLocation}.`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not submit request.');
      } else {
        setSubmittedRef(data.referenceCode);
      }
    } catch {
      setError('Network error while submitting request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consultation-modal-title"
    >
      <div className="glass-panel-navy text-white rounded-xl max-w-xl w-full max-h-[92vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#C5A15B]">
              Casmura Contract Estimation Desk
            </p>
            <h3 id="consultation-modal-title" className="text-lg font-bold mt-0.5">
              Book Consultation or Request Quote
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setSubmittedRef(null);
              onClose();
            }}
            className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/10 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {submittedRef ? (
            <div className="py-6 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#C5A15B] mx-auto" />
              <div className="space-y-1">
                <h4 className="text-xl font-bold">Request Logged Successfully</h4>
                <p className="text-sm text-slate-300">
                  Reference ID:{' '}
                  <span className="font-mono text-[#C5A15B] font-semibold">
                    {submittedRef}
                  </span>
                </p>
              </div>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Our contract estimation team in Colombo has received your specification
                brief and will respond with sampling and technical details.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/94777771775?text=${encodeURIComponent(
                    `Hello Casmura Contract, I submitted inquiry ${submittedRef} for ${projectLocation}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-white/15 hover:bg-white/25 border border-[#C5A15B]/45 text-white text-sm font-semibold"
                >
                  <MessageCircle className="w-4 h-4 text-[#C5A15B]" />
                  <span>Continue on WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedRef(null);
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-md bg-white hover:bg-[#F3F1EC] text-[#00214A] text-sm font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-1.5 p-1 glass-tabs-dark rounded-lg">
                <button
                  type="button"
                  onClick={() => setLeadType('consultation')}
                  className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    leadType === 'consultation'
                      ? 'bg-white text-[#00214A]'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  Book Consultation
                </button>
                <button
                  type="button"
                  onClick={() => setLeadType('quote')}
                  className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    leadType === 'quote'
                      ? 'bg-white text-[#00214A]'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  Request Project Quote
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-red-500/20 border border-red-400/40 text-xs text-red-100">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
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
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Company / Resort
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Hospitality group or studio"
                    className="w-full px-3.5 py-2.5 rounded-md bg-white text-[#00214A] text-sm focus:outline-2 focus:outline-[#C5A15B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Corporate Email *
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
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Primary System Interest
                  </label>
                  <input
                    type="text"
                    value={productInterest}
                    onChange={(e) => setProductInterest(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-md bg-white text-[#00214A] text-sm focus:outline-2 focus:outline-[#C5A15B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Direct Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+94 77 ..."
                    className="w-full px-3.5 py-2.5 rounded-md bg-white text-[#00214A] text-sm focus:outline-2 focus:outline-[#C5A15B]"
                  />
                </div>
              </div>

              {leadType === 'consultation' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={consultationDate}
                      onChange={(e) => setConsultationDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-md bg-white text-[#00214A] text-sm focus:outline-2 focus:outline-[#C5A15B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Consultation Format
                    </label>
                    <select
                      value={consultationFormat}
                      onChange={(e) => setConsultationFormat(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-md bg-white text-[#00214A] text-sm focus:outline-2 focus:outline-[#C5A15B]"
                    >
                      <option>Virtual Technical Briefing</option>
                      <option>Colombo Showroom Sampling</option>
                      <option>On-Site Resort Assessment</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Project Scope & Specifications
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mention number of rooms/villas, motorized integration needs (KNX/Somfy/Forest), and target schedule..."
                  className="w-full px-3.5 py-2.5 rounded-md bg-white text-[#00214A] text-sm focus:outline-2 focus:outline-[#C5A15B]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-md bg-white hover:bg-[#F3F1EC] disabled:opacity-60 text-[#00214A] text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
              >
                {submitting
                  ? 'Submitting to Estimation Desk...'
                  : leadType === 'consultation'
                  ? 'Confirm Technical Consultation'
                  : 'Submit Quote Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
