import { CheckCircle2, Cpu, Download, Play } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import heroAutomationImg from '../assets/images/hero_automation_smart_1795510660088.jpg';
import {
  ARCHITECTURAL_EASE,
  EditorialReveal,
  VIEWPORT_CONFIG,
} from './ArchitecturalMotion.tsx';
import { AutomationPartnersGrid } from './AutomationPartnersGrid.tsx';
import { PageHero } from './PageHero.tsx';

interface AutomationPageProps {
  onOpenConsultation: (interest?: string) => void;
}

const PROTOCOL_MATRIX = [
  {
    platform: 'KNX / EIB BMS',
    topology: 'Twisted-pair bus or IP gateway',
    motors: 'Forest Shuttle, Somfy Glydea Ultra',
    capability: 'Scene recall, solar tracking, status feedback',
  },
  {
    platform: 'Crestron & Control4',
    topology: 'RS485 / IP native driver',
    motors: 'Somfy SDN, Forest, Lutron',
    capability: 'Bidirectional position percentage & group sync',
  },
  {
    platform: 'Lutron HomeWorks / Athena',
    topology: 'QS link or dry-contact interface',
    motors: 'Forest, Somfy, Lutron',
    capability: 'Keypad integration & circadian lighting lock',
  },
  {
    platform: 'Loxone & Gira',
    topology: 'Tree / KNX / Relay',
    motors: 'Forest, Somfy, Motionblinds',
    capability: 'Automated weather & twilight shading scenes',
  },
  {
    platform: 'Matter / Apple Home / Google / Alexa',
    topology: 'Thread / Zigbee / IP Bridge',
    motors: 'Motionblinds, Aqara, Somfy TaHoma',
    capability: 'Guest voice scenes & mobile app control',
  },
];

export function AutomationPage({ onOpenConsultation }: AutomationPageProps) {
  const [rooms, setRooms] = useState(40);
  const [tracksPerRoom, setTracksPerRoom] = useState(2);
  const [protocol, setProtocol] = useState('KNX / GRMS');
  const [includeOutdoor, setIncludeOutdoor] = useState(true);
  const prefersReduced = Boolean(useReducedMotion());

  const estimatedMotors = rooms * tracksPerRoom + (includeOutdoor ? Math.round(rooms * 0.5) : 0);

  return (
    <div className="bg-white">
      {/* Hero */}
      <PageHero
        kicker="Smart Architectural Integration"
        title="Automated Drapery, Motorization & GRMS Integration"
        description="Pre-engineered motorization packages compatible with Forest, Somfy, Motionblinds, Aqara, Dooya, KNX, Crestron, Control4, Lutron, and Loxone."
        imageSrc={heroAutomationImg}
        imageAlt="Luxury smart hospitality suite with concealed motorized sheer and blackout drapery tracks and wall control keypad"
        actions={
          <a
            href="/api/documents/doc-bms-wiring/download"
            className="inline-flex items-center gap-2 bg-white hover:bg-[#F3F1EC] text-[#00214A] text-xs font-extrabold uppercase tracking-wider px-5 py-3 rounded-md transition-all duration-200 hover:-translate-y-0.5 shadow-sm whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-[#C5A15B]" />
            <span>Download BMS Wiring Guide</span>
          </a>
        }
      />

      {/* Partner Ecosystem */}
      <section className="glass-ambient-light py-14 border-b border-[#00214A]/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AutomationPartnersGrid />
        </div>
      </section>

      {/* Protocol Compatibility Matrix & Interactive Room Estimator */}
      <section className="py-14 lg:py-16 glass-ambient-light overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Technical Matrix */}
          <EditorialReveal className="lg:col-span-7 glass-panel-light rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#00214A]/10 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#00214A]">
                Control Protocol & MEP Wiring Matrix
              </h2>
              <Cpu className="w-5 h-5 text-[#C5A15B]" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3F1EC] border-b border-[#00214A]/10 text-slate-600 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-bold">Platform</th>
                    <th className="px-4 py-3 font-bold">Wiring / Bus</th>
                    <th className="px-4 py-3 font-bold">Recommended Drives</th>
                    <th className="px-4 py-3 font-bold">Functionality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PROTOCOL_MATRIX.map((row, idx) => (
                    <motion.tr
                      key={row.platform}
                      initial={prefersReduced ? false : { opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={VIEWPORT_CONFIG}
                      transition={{
                        duration: 0.4,
                        delay: prefersReduced ? 0 : idx * 0.06,
                        ease: ARCHITECTURAL_EASE,
                      }}
                      className="hover:bg-[#F3F1EC]/55 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-bold text-[#00214A]">{row.platform}</td>
                      <td className="px-4 py-3.5 text-slate-600">{row.topology}</td>
                      <td className="px-4 py-3.5 text-slate-700">{row.motors}</td>
                      <td className="px-4 py-3.5 text-slate-600">{row.capability}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </EditorialReveal>

          {/* Interactive Automation Scope Estimator */}
          <EditorialReveal delay={0.12} direction="left" className="lg:col-span-5 glass-panel-navy text-white rounded-xl p-6 sm:p-7 space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#C5A15B]">
                Engineering Scope Estimator
              </p>
              <h2 className="font-display text-xl font-bold mt-1">
                Configure Suite Motorization Package
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-white/85">Number of Guest Rooms / Villas</span>
                  <span className="font-mono font-bold text-[#C5A15B] tabular-nums">
                    {rooms} units
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={250}
                  step={5}
                  value={rooms}
                  onChange={(e) => setRooms(Number(e.target.value))}
                  className="w-full casmura-slider"
                />
              </div>

              <div>
                <label className="block text-xs text-white/85 mb-1.5">
                  Motorized Tracks per Suite (e.g., Sheer + Blackout)
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 glass-tabs-dark rounded-lg">
                  {[1, 2, 3].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setTracksPerRoom(count)}
                      className={`py-2 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                        tracksPerRoom === count
                          ? 'bg-white text-[#00214A]'
                          : 'text-slate-200 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {count} {count === 1 ? 'Track' : 'Tracks'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/85 mb-1.5">
                  Control Backbone
                </label>
                <select
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  className="w-full px-3 py-2.5 rounded bg-white text-[#00214A] text-xs font-semibold"
                >
                  <option>KNX / GRMS</option>
                  <option>Crestron / Control4</option>
                  <option>Lutron QS / Dry Contact</option>
                  <option>Standalone RF / Wall Switch</option>
                  <option>Apple Home / Google / Matter</option>
                </select>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeOutdoor}
                  onChange={(e) => setIncludeOutdoor(e.target.checked)}
                  className="accent-[#C5A15B] w-4 h-4"
                />
                <span>Include Terrace / Balcony Motorized Outdoor Blinds</span>
              </label>
            </div>

            <div className="glass-panel-dark rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/75">Estimated Motor Drives</span>
                <span className="font-mono text-lg font-bold text-[#C5A15B] tabular-nums">
                  {estimatedMotors} drives
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/85">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A15B] shrink-0" />
                <span>Includes {protocol} commissioning & power-drop schedule</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onOpenConsultation(
                  `Automation Package: ${rooms} rooms, ${tracksPerRoom} tracks/room (${estimatedMotors} motors), ${protocol}`
                )
              }
              className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F3F1EC] text-[#00214A] text-xs font-extrabold uppercase tracking-wider py-3 rounded-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Request MEP Wiring & BOQ Estimate</span>
              <Play className="w-3 h-3 fill-[#C5A15B] text-[#C5A15B]" />
            </button>
          </EditorialReveal>
        </div>
      </section>
    </div>
  );
}
