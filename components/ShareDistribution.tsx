
import React, { useState, useRef, useMemo } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  QrCodeIcon, 
  ShareIcon, 
  LinkIcon, 
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ChartBarIcon,
  TicketIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  PrinterIcon,
  CodeBracketIcon,
  RectangleGroupIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  UserGroupIcon,
  MegaphoneIcon,
  // Added missing Squares2X2Icon import
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { Catalog } from '../types';
import { updateCatalog } from '../services/firebase';

interface ShareDistributionProps {
  catalog: Catalog;
  onUpdate?: (catalog: Catalog) => void;
}

type DistributionTab = 'qr-studio' | 'campaigns' | 'print' | 'embed' | 'tracking';

const ShareDistribution: React.FC<ShareDistributionProps> = ({ catalog, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<DistributionTab>('qr-studio');
  const [copied, setCopied] = useState(false);
  
  // QR State
  const [qrSize, setQrSize] = useState(512);
  const [qrColor, setQrColor] = useState(catalog.theme.primaryColor);
  const [qrBg, setQrBg] = useState('#FFFFFF');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [qrStyle, setQrStyle] = useState<'square' | 'dots' | 'rounded'>('rounded');

  // Tracking State
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const baseUrl = `${window.location.origin}/#/view/${catalog.slug}`;
  
  const finalUrl = useMemo(() => {
    const url = new URL(baseUrl);
    if (utmSource) url.searchParams.set('utm_source', utmSource);
    if (utmMedium) url.searchParams.set('utm_medium', utmMedium);
    if (referralCode) url.searchParams.set('ref', referralCode);
    return url.toString();
  }, [baseUrl, utmSource, utmMedium, referralCode]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `showcase-${catalog.slug}-qr.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#2563EB] mb-2">
            <MegaphoneIcon className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Growth Engine</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Distribution Hub</h1>
          <p className="text-slate-500 mt-1 font-medium">Everything you need to get your catalog in front of customers.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto scrollbar-hide">
          <TabBtn active={activeTab === 'qr-studio'} onClick={() => setActiveTab('qr-studio')} icon={<QrCodeIcon className="w-4 h-4" />} label="QR Studio" />
          <TabBtn active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} icon={<ChatBubbleLeftRightIcon className="w-4 h-4" />} label="Campaigns" />
          <TabBtn active={activeTab === 'print'} onClick={() => setActiveTab('print')} icon={<PrinterIcon className="w-4 h-4" />} label="Print" />
          <TabBtn active={activeTab === 'embed'} onClick={() => setActiveTab('embed')} icon={<CodeBracketIcon className="w-4 h-4" />} label="Embed" />
          <TabBtn active={activeTab === 'tracking'} onClick={() => setActiveTab('tracking')} icon={<TicketIcon className="w-4 h-4" />} label="Tracking" />
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Preview Area */}
        <div className="lg:col-span-4 sticky top-8 space-y-6">
          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl shadow-blue-900/5 flex flex-col items-center">
            <div className="w-full aspect-square bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 shadow-inner flex items-center justify-center overflow-hidden mb-6">
              <div className="relative">
                 <QRCodeCanvas
                  value={finalUrl}
                  size={qrSize}
                  fgColor={qrColor}
                  bgColor={qrBg}
                  level="H"
                  includeMargin={false}
                  imageSettings={includeLogo && catalog.logoUrl ? {
                    src: catalog.logoUrl,
                    x: undefined,
                    y: undefined,
                    height: qrSize * 0.2,
                    width: qrSize * 0.2,
                    excavate: true,
                  } : undefined}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
            
            <div className="w-full space-y-3">
              <button 
                onClick={downloadQR}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Download PNG
              </button>
              <button 
                onClick={handleCopyLink}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white border-2 border-slate-100 text-slate-700 hover:bg-slate-50'}`}
              >
                {copied ? <CheckCircleIcon className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                {copied ? 'Link Copied' : 'Copy Smart Link'}
              </button>
            </div>
            
            <div className="mt-8 w-full pt-8 border-t border-slate-100">
               <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scan Destination</span>
                  <GlobeAltIcon className="w-4 h-4 text-[#2563EB]" />
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-400 break-all">{finalUrl}</p>
               </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <ArrowTrendingUpIcon className="w-6 h-6 text-blue-400" />
              <h3 className="font-black">Live Performance</h3>
            </div>
            <div className="space-y-4">
              <StatRow label="Today's Scans" value="12" />
              <StatRow label="Peak Hours" value="12pm - 2pm" />
              <StatRow label="Top Region" value="New York, US" />
            </div>
          </div>
        </div>

        {/* Right Pane: Controls Area */}
        <div className="lg:col-span-8 space-y-8 pb-20">
          
          {activeTab === 'qr-studio' && (
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-10 animate-in slide-in-from-right duration-300">
              <SectionHeader title="Design your QR" subtitle="Create a unique look that matches your brand identity." />
              
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">QR Styling</label>
                    <div className="grid grid-cols-3 gap-3">
                      <StyleBtn active={qrStyle === 'square'} onClick={() => setQrStyle('square')} label="Classic" />
                      <StyleBtn active={qrStyle === 'dots'} onClick={() => setQrStyle('dots')} label="Modern" />
                      <StyleBtn active={qrStyle === 'rounded'} onClick={() => setQrStyle('rounded')} label="Organic" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Brand Color</label>
                    <div className="flex gap-3 items-center">
                      <input 
                        type="color" 
                        value={qrColor} 
                        onChange={(e) => setQrColor(e.target.value)} 
                        className="w-12 h-12 rounded-xl bg-transparent p-0 border-none cursor-pointer" 
                      />
                      <input 
                        type="text" 
                        value={qrColor} 
                        onChange={(e) => setQrColor(e.target.value)} 
                        className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 font-mono text-sm uppercase font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem]">
                    <div>
                      <p className="text-sm font-black text-slate-900">Include Logo</p>
                      <p className="text-xs text-slate-500 font-medium">Add brand mark to the center</p>
                    </div>
                    <Toggle active={includeLogo} onClick={() => setIncludeLogo(!includeLogo)} />
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Frame Template</label>
                    <div className="grid grid-cols-2 gap-3">
                      <FrameOption label="Scan Me" icon="📸" />
                      <FrameOption label="Order Now" icon="🛒" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
               <div className="grid md:grid-cols-2 gap-6">
                  <CampaignCard 
                    title="WhatsApp Blast" 
                    icon={<ChatBubbleLeftRightIcon className="w-8 h-8 text-green-500" />}
                    desc="Share your link directly with your customer broadcast lists."
                    actionLabel="Open WhatsApp"
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Check out our catalog: ' + finalUrl)}`, '_blank')}
                  />
                  <CampaignCard 
                    title="Email Newsletter" 
                    icon={<EnvelopeIcon className="w-8 h-8 text-blue-500" />}
                    desc="Send bulk emails to your subscriber list with the catalog link."
                    actionLabel="Draft Email"
                    onClick={() => window.open(`mailto:?subject=Our Digital Catalog&body=Check it out here: ${finalUrl}`, '_blank')}
                  />
                  <CampaignCard 
                    title="Social Post" 
                    icon={<ShareIcon className="w-8 h-8 text-purple-500" />}
                    desc="Generate high-converting captions for Instagram and Facebook."
                    actionLabel="Generate Post"
                  />
                  <CampaignCard 
                    title="SMS Campaign" 
                    icon={<DevicePhoneMobileIcon className="w-8 h-8 text-slate-700" />}
                    desc="Send direct text messages to local customers (Pro Feature)."
                    badge="Coming Soon"
                    disabled
                  />
               </div>
            </div>
          )}

          {activeTab === 'print' && (
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-10 animate-in slide-in-from-right duration-300">
              <SectionHeader title="Physical Materials" subtitle="Ready-to-print designs for your shop floor." />
              <div className="grid md:grid-cols-3 gap-6">
                <PrintTemplate title="Table Tent" icon={<RectangleGroupIcon className="w-8 h-8" />} dimensions="4x6 in" />
                <PrintTemplate title="Window Sticker" icon={<Squares2X2Icon className="w-8 h-8" />} dimensions="5x5 in" />
                <PrintTemplate title="Full Flyer" icon={<PrinterIcon className="w-8 h-8" />} dimensions="A4 / Letter" />
              </div>
              <div className="p-8 bg-blue-50 rounded-[2.5rem] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                    <ShoppingBagIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900">Order High-Quality Prints</h4>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">Powered by Printful</p>
                  </div>
                </div>
                <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm hover:shadow-md transition-all">
                  Shop Prints
                </button>
              </div>
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-10 animate-in slide-in-from-right duration-300">
              <SectionHeader title="Website Integration" subtitle="Add your Showcase directly to your existing site." />
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">iFrame Snippet</label>
                  <div className="relative group">
                    <pre className="bg-slate-900 text-blue-400 p-6 rounded-2xl text-[10px] overflow-x-auto border border-slate-800">
                      {`<iframe \n  src="${finalUrl}" \n  width="100%" \n  height="800px" \n  style="border:none; border-radius:24px;"\n></iframe>`}
                    </pre>
                    <button 
                      onClick={() => navigator.clipboard.writeText(`<iframe src="${finalUrl}" width="100%" height="800px" style="border:none; border-radius:24px;"></iframe>`)}
                      className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <EmbedOption label="WordPress Plugin" icon="🌐" />
                  <EmbedOption label="Shopify App" icon="🛍️" />
                  <EmbedOption label="Link-in-bio Tool" icon="🔗" />
                  <EmbedOption label="Custom JS SDK" icon="⚡" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-10 animate-in slide-in-from-right duration-300">
              <SectionHeader title="Analytics Tracking" subtitle="Measure which channels are bringing the most customers." />
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Campaign Source</label>
                    <input 
                      type="text" 
                      placeholder="e.g. instagram, flyer_a" 
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#2563EB] font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Campaign Medium</label>
                    <input 
                      type="text" 
                      placeholder="e.g. social, print" 
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#2563EB] font-bold text-slate-900"
                    />
                  </div>
                </div>
                <div className="bg-blue-50 p-8 rounded-[2rem] flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-slate-900 mb-2">Smart UTM Builder</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      These parameters help you identify exactly where scans are coming from in your Analytics tab.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2563EB] mt-4">
                    <ChartBarIcon className="w-4 h-4" />
                    Tracking Enabled
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* Components */

const TabBtn: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {icon}
    {label}
  </button>
);

const SectionHeader: React.FC<{ title: string, subtitle: string }> = ({ title, subtitle }) => (
  <div>
    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
    <p className="text-sm font-medium text-slate-500 mt-1">{subtitle}</p>
  </div>
);

const StyleBtn: React.FC<{ active: boolean, onClick: () => void, label: string }> = ({ active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
  >
    {label}
  </button>
);

const Toggle: React.FC<{ active: boolean, onClick: () => void }> = ({ active, onClick }) => (
  <button onClick={onClick} className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-blue-600' : 'bg-slate-300'}`}>
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-7' : 'left-1'}`} />
  </button>
);

const CampaignCard: React.FC<{ title: string, icon: React.ReactNode, desc: string, actionLabel: string, badge?: string, disabled?: boolean, onClick?: () => void }> = ({ title, icon, desc, actionLabel, badge, disabled, onClick }) => (
  <div className={`bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${disabled ? 'opacity-60 grayscale' : ''}`}>
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        {icon}
        {badge && <span className="px-2 py-0.5 bg-slate-100 text-[8px] font-black uppercase tracking-widest text-slate-500 rounded-md">{badge}</span>}
      </div>
      <div>
        <h3 className="text-xl font-black text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">{desc}</p>
      </div>
    </div>
    <button 
      onClick={onClick}
      disabled={disabled}
      className="mt-8 w-full py-3.5 bg-slate-50 text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
    >
      {actionLabel}
    </button>
  </div>
);

const PrintTemplate: React.FC<{ title: string, icon: React.ReactNode, dimensions: string }> = ({ title, icon, dimensions }) => (
  <div className="bg-slate-50 rounded-[2rem] p-6 text-center group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100">
    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#2563EB] shadow-sm group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="font-black text-slate-900 text-sm">{title}</h4>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{dimensions}</p>
    <button className="mt-4 text-[10px] font-black text-[#2563EB] uppercase tracking-widest hover:underline">Get PDF</button>
  </div>
);

const EmbedOption: React.FC<{ label: string, icon: string }> = ({ label, icon }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all cursor-pointer">
    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">{icon}</div>
    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{label}</span>
  </div>
);

const FrameOption: React.FC<{ label: string, icon: string }> = ({ label, icon }) => (
  <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-[#2563EB] hover:bg-blue-50 transition-all group">
    <span className="text-lg group-hover:scale-125 transition-transform">{icon}</span>
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
  </div>
);

const StatRow: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-white/10 pb-3">
    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{label}</span>
    <span className="text-xs font-black">{value}</span>
  </div>
);

const ShoppingBagIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

export default ShareDistribution;
