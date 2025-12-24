
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShareIcon, QrCodeIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

interface PublishSuccessProps {
  catalogSlug: string;
  businessName: string;
  onClose: () => void;
}

const PublishSuccess: React.FC<PublishSuccessProps> = ({ catalogSlug, businessName, onClose }) => {
  const navigate = useNavigate();
  const url = `${window.location.origin}/#/view/${catalogSlug}`;

  const handleShare = async () => {
    try {
      await navigator.share({
        title: businessName,
        text: `Check out our new digital catalog!`,
        url: url,
      });
    } catch (err) {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-8">
        <span className="text-4xl">🚀</span>
      </div>
      
      <h2 className="text-3xl font-black text-slate-900 mb-2">Ready for Business</h2>
      <p className="text-slate-500 mb-8 max-w-xs">
        Your catalog for <span className="font-bold text-slate-900">{businessName}</span> is now accessible to the world.
      </p>

      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          <ShareIcon className="w-5 h-5" />
          Share Link
        </button>
        
        <button
          onClick={() => {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
            window.open(qrUrl, '_blank');
          }}
          className="w-full flex items-center justify-center gap-3 py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition-all"
        >
          <QrCodeIcon className="w-5 h-5" />
          Get QR Code
        </button>

        <button
          onClick={onClose}
          className="w-full py-4 text-slate-400 font-bold hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
        >
          Back to Dashboard
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PublishSuccess;
