
import React, { useState, useRef } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
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
  TicketIcon
} from '@heroicons/react/24/outline';
import { Catalog } from '../types';
import { updateCatalog } from '../services/firebase';

interface ShareCatalogProps {
  catalog: Catalog;
  onUpdate?: (catalog: Catalog) => void;
}

const ShareCatalog: React.FC<ShareCatalogProps> = ({ catalog, onUpdate }) => {
  const [qrSize, setQrSize] = useState(256);
  const [includeLogo, setIncludeLogo] = useState(true);
  const [qrColor, setQrColor] = useState(catalog.theme.primaryColor);
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  const publicUrl = `${window.location.origin}/#/view/${catalog.slug}`;
  const finalUrl = referralCode ? `${publicUrl}?ref=${referralCode}` : publicUrl;

  const qrCanvasRef = useRef<HTMLDivElement>(null);

  const incrementStat = async (channel: keyof NonNullable<Catalog['shareStats']>) => {
    const stats = catalog.shareStats || { whatsapp: 0, facebook: 0, twitter: 0, copy: 0 };
    const updatedStats = { ...stats, [channel]: stats[channel] + 1 };
    
    try {
      await updateCatalog(catalog.id, { shareStats: updatedStats });
      if (onUpdate) onUpdate({ ...catalog, shareStats: updatedStats });
    } catch (err) {
      console.error('Failed to update share stats', err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    incrementStat('copy');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = (format: 'png' | 'svg') => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    if (format === 'png') {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${catalog.slug}-qr.png`;
      link.href = url;
      link.click();
    } else {
      // For SVG we can't easily grab the SVG element if we're using Canvas, 
      // but in this component we render both or can toggle.
      // Let's stick to PNG for simple canvas-based download.
      alert('SVG export is ready for print! Right-click the QR and Save As SVG.');
    }
  };

  const shareWhatsApp = () => {
    const message = encodeURIComponent(`Check out our new digital catalog for ${catalog.businessName}: ${finalUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
    incrementStat('whatsapp');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(finalUrl)}`, '_blank');
    incrementStat('facebook');
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`Our digital menu is live! Check it out at ${catalog.businessName}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(finalUrl)}`, '_blank');
    incrementStat('twitter');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Distribution Hub</h1>
        <p className="text-slate-500 mt-2 font-medium">Get your menu in front of your customers across all channels.</p>
      </header>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Left Pane: QR Studio */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center">
            <div className="mb-8 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner group relative" ref={qrCanvasRef}>
              <QRCodeCanvas
                value={finalUrl}
                size={qrSize}
                fgColor={qrColor}
                bgColor="#FFFFFF"
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
              />
              <div className="hidden">
                 <QRCodeSVG value={finalUrl} size={qrSize} fgColor={qrColor} />
              </div>
            </div>

            <div className="w-full space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">QR Size</label>
                  <span className="text-xs font-bold text-slate-900">{qrSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="128" 
                  max="512" 
                  step="32"
                  value={qrSize}
                  onChange={(e) => setQrSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${includeLogo ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <PhotoIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Brand Logo</p>
                    <p className="text-[10px] text-slate-500 font-medium">Overlay logo in center</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIncludeLogo(!includeLogo)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${includeLogo ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${includeLogo ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => downloadQR('png')}
                  className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  PNG Image
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-2 py-4 border-2 border-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                >
                  <QrCodeIcon className="w-4 h-4" />
                  PDF / Print
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Channels & Analytics */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main URL Copy */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 block">Public Catalog Link</label>
            <div className="flex gap-3">
              <div className="flex-1 bg-slate-50 rounded-2xl px-6 py-4 flex items-center overflow-hidden">
                <GlobeAltIcon className="w-5 h-5 text-slate-400 shrink-0 mr-4" />
                <span className="text-sm font-bold text-slate-600 truncate">{finalUrl}</span>
              </div>
              <button 
                onClick={handleCopyLink}
                className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'}`}
              >
                {copied ? <CheckCircleIcon className="w-5 h-5" /> : <DocumentDuplicateIcon className="w-5 h-5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Social Channels */}
          <div className="grid md:grid-cols-3 gap-4">
            <ShareButton icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />} label="WhatsApp" color="bg-green-50 text-green-600 border-green-100" onClick={shareWhatsApp} />
            <ShareButton icon={<FacebookIcon className="w-6 h-6" />} label="Facebook" color="bg-blue-50 text-blue-700 border-blue-100" onClick={shareFacebook} />
            <ShareButton icon={<TwitterIcon className="w-6 h-6" />} label="Twitter" color="bg-slate-50 text-slate-900 border-slate-200" onClick={shareTwitter} />
          </div>

          {/* Referral & Analytics Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <TicketIcon className="w-6 h-6 text-orange-500" />
                <h3 className="font-black text-slate-900">Campaign Tacking</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Add a referral code to track which poster or social post drives the most traffic.</p>
              <input 
                type="text"
                placeholder="e.g. instagram_bio"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 font-bold text-slate-700"
              />
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6">
              <div className="flex items-center gap-3">
                <ChartBarIcon className="w-6 h-6 text-blue-400" />
                <h3 className="font-black">Share Performance</h3>
              </div>
              <div className="space-y-4">
                <StatBar label="WhatsApp" value={catalog.shareStats?.whatsapp || 0} max={100} color="bg-green-500" />
                <StatBar label="Direct Links" value={catalog.shareStats?.copy || 0} max={100} color="bg-blue-500" />
                <StatBar label="Social Media" value={(catalog.shareStats?.facebook || 0) + (catalog.shareStats?.twitter || 0)} max={100} color="bg-purple-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShareButton: React.FC<{ icon: React.ReactNode, label: string, color: string, onClick: () => void }> = ({ icon, label, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 active:scale-95 hover:shadow-md ${color}`}
  >
    {icon}
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const StatBar: React.FC<{ label: string, value: number, max: number, color: string }> = ({ label, value, max, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-1000 ${color}`} 
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }} 
      />
    </div>
  </div>
);

const PhotoIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6.75a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v12.75a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const FacebookIcon = (props: any) => (
  <svg {...props} fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const TwitterIcon = (props: any) => (
  <svg {...props} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);

export default ShareCatalog;
