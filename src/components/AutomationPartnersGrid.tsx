import { EditorialReveal, StaggerGroup, StaggerItem } from './ArchitecturalMotion.tsx';

interface PartnerLogoItem {
  id: string;
  name: string;
  src: string;
  heightClass: string;
}

const MOTOR_PARTNERS_ROW_1: PartnerLogoItem[] = [
  {
    id: 'forest',
    name: 'Forest Drapery Hardware',
    src: '/assets/partners/forest.png',
    heightClass: 'h-6 sm:h-7',
  },
  {
    id: 'motionblinds',
    name: 'Motionblinds',
    src: '/assets/partners/motionblinds.png',
    heightClass: 'h-5 sm:h-6',
  },
];

const MOTOR_PARTNERS_ROW_2: PartnerLogoItem[] = [
  {
    id: 'somfy',
    name: 'Somfy',
    src: '/assets/partners/somfy.png',
    heightClass: 'h-6 sm:h-7',
  },
  {
    id: 'aqara-motor',
    name: 'Aqara',
    src: '/assets/partners/aqara.png',
    heightClass: 'h-6 sm:h-7',
  },
];

const MOTOR_PARTNERS_ROW_3: PartnerLogoItem[] = [
  {
    id: 'dooya',
    name: 'Dooya',
    src: '/assets/partners/dooya.png',
    heightClass: 'h-4 sm:h-[18px]',
  },
];

const HOME_AUTO_ROW_1: PartnerLogoItem[] = [
  {
    id: 'zwave-plus',
    name: 'Z-Wave Plus',
    src: '/assets/partners/zwave-plus.png',
    heightClass: 'h-9 sm:h-10',
  },
  {
    id: 'aqara-home',
    name: 'Aqara',
    src: '/assets/partners/aqara.png',
    heightClass: 'h-6 sm:h-7',
  },
  {
    id: 'gira',
    name: 'Gira',
    src: '/assets/partners/gira.png',
    heightClass: 'h-5 sm:h-6',
  },
];

const HOME_AUTO_ROW_2: PartnerLogoItem[] = [
  {
    id: 'crestron',
    name: 'Crestron',
    src: '/assets/partners/crestron.png',
    heightClass: 'h-[18px] sm:h-5',
  },
  {
    id: 'control4',
    name: 'Control4',
    src: '/assets/partners/control4.png',
    heightClass: 'h-5 sm:h-6',
  },
];

const HOME_AUTO_ROW_3: PartnerLogoItem[] = [
  {
    id: 'loxone',
    name: 'Loxone',
    src: '/assets/partners/loxone.png',
    heightClass: 'h-[18px] sm:h-5',
  },
  {
    id: 'knx',
    name: 'KNX',
    src: '/assets/partners/knx.png',
    heightClass: 'h-6 sm:h-7',
  },
];

const HOME_AUTO_ROW_4: PartnerLogoItem[] = [
  {
    id: 'busch-jaeger',
    name: 'Busch-Jaeger free@home',
    src: '/assets/partners/busch-jaeger.png',
    heightClass: 'h-8 sm:h-9',
  },
];

const VOICE_PARTNERS_ROW_1: PartnerLogoItem[] = [
  {
    id: 'google-home',
    name: 'Google Home',
    src: '/assets/partners/google-home.png',
    heightClass: 'h-11 sm:h-12',
  },
  {
    id: 'alexa',
    name: 'Amazon Alexa',
    src: '/assets/partners/alexa.png',
    heightClass: 'h-11 sm:h-12',
  },
];

const VOICE_PARTNERS_ROW_2: PartnerLogoItem[] = [
  {
    id: 'apple-home',
    name: 'Works with Apple Home',
    src: '/assets/partners/apple-home.png',
    heightClass: 'h-10 sm:h-12',
  },
];

function LogoItem({ logo }: { logo: PartnerLogoItem }) {
  return (
    <div className="flex items-center justify-center px-1.5 py-1 transition-transform duration-200 hover:scale-[1.04]">
      <img
        src={logo.src}
        alt={logo.name}
        title={logo.name}
        decoding="async"
        draggable={false}
        className={`${logo.heightClass} w-auto max-w-full object-contain select-none`}
      />
    </div>
  );
}

interface AutomationPartnersGridProps {
  showExploreLink?: boolean;
  onExplore?: () => void;
}

export function AutomationPartnersGrid({
  showExploreLink = false,
  onExplore,
}: AutomationPartnersGridProps) {
  return (
    <div className="space-y-8">
      <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch" staggerDelay={0.09}>
        {/* Card 1: Motor System Partners */}
        <StaggerItem className="flex">
          <div className="glass-panel-light glass-card-hover rounded-xl px-6 py-7 flex flex-col w-full">
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.08em] text-[#00214A] text-center mb-7">
              Motor System
              <br />
              Partners
            </h3>
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
                {MOTOR_PARTNERS_ROW_1.map((logo) => (
                  <LogoItem key={logo.id} logo={logo} />
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
                {MOTOR_PARTNERS_ROW_2.map((logo) => (
                  <LogoItem key={logo.id} logo={logo} />
                ))}
              </div>
              <div className="flex items-center justify-center">
                {MOTOR_PARTNERS_ROW_3.map((logo) => (
                  <LogoItem key={logo.id} logo={logo} />
                ))}
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Card 2: Compatible With Home Automation */}
        <StaggerItem className="flex">
          <div className="glass-panel-light glass-card-hover rounded-xl px-6 py-7 flex flex-col w-full">
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.08em] text-[#00214A] text-center mb-6">
              Compatible With
              <br />
              Home Automation
            </h3>
            <div className="flex-1 flex flex-col items-center justify-center gap-5">
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
                {HOME_AUTO_ROW_1.map((logo) => (
                  <LogoItem key={logo.id} logo={logo} />
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
                {HOME_AUTO_ROW_2.map((logo) => (
                  <LogoItem key={logo.id} logo={logo} />
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                {HOME_AUTO_ROW_3.map((logo) => (
                  <LogoItem key={logo.id} logo={logo} />
                ))}
              </div>
              <div className="flex items-center justify-center">
                {HOME_AUTO_ROW_4.map((logo) => (
                  <LogoItem key={logo.id} logo={logo} />
                ))}
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Card 3: Voice Automation Partners */}
        <StaggerItem className="flex">
          <div className="glass-panel-light glass-card-hover rounded-xl px-6 py-7 flex flex-col w-full">
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.08em] text-[#00214A] text-center mb-7">
              Voice Automation
              <br />
              Partners
            </h3>
            <div className="flex-1 flex flex-col items-center justify-center gap-7">
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                {VOICE_PARTNERS_ROW_1.map((logo) => (
                  <LogoItem key={logo.id} logo={logo} />
                ))}
              </div>
              <div className="flex items-center justify-center">
                {VOICE_PARTNERS_ROW_2.map((logo) => (
                  <LogoItem key={logo.id} logo={logo} />
                ))}
              </div>
            </div>
          </div>
        </StaggerItem>
      </StaggerGroup>

      {showExploreLink && onExplore && (
        <EditorialReveal delay={0.18} className="text-center">
          <button
            type="button"
            onClick={onExplore}
            className="glass-tabs inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-[#00214A] hover:text-[#8C6B2D] hover:border-[#C5A15B]/60 transition-all cursor-pointer"
          >
            <span>Explore BMS & Wiring Compatibility Matrix →</span>
          </button>
        </EditorialReveal>
      )}
    </div>
  );
}
