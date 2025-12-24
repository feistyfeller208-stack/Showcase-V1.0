
import React from 'react';
import { Catalog } from '../types';
import { QrCodeIcon, ShareIcon, LinkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface ShareManagerProps {
  catalogs: Catalog[];
}

const ShareManager: React.FC<ShareManagerProps> = ({ catalogs }) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Share & Growth</h1>
        <p className="text-slate-500 mt-1 font-medium">Connect your customers to your digital menu instantly.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {catalogs.map(catalog => {
          const url = `${window.location.origin}/#/view/${catalog.slug}`;
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(url)}`;
          
          return (
            <div key={catalog.id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-48 space-y-4">
                <div className="aspect-square bg-slate-50 rounded-3xl p-4 flex items-center justify-center border border-slate-100 shadow-inner">
                  <img src={qrUrl} alt="QR Code" className="w-full h-full" />
                </div>
                <button 
                  onClick={() => window.open(qrUrl, '_blank')}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
                >
                  Download Print-Ready
                </button>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-xl font-black">{catalog.businessName}</h3>
                  <div className="mt-4 p-4 bg-slate-50 rounded-2xl flex items-center justify-between group">
                    <span className="text-sm font-medium text-slate-500 truncate mr-4">{url}</span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(url)}
                      className="p-2 bg-white rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50"
                    >
                      <LinkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm">
                    <ShareIcon className="w-5 h-5" />
                    Share Link
                  </button>
                  <button 
                    onClick={() => window.open(url, '_blank')}
                    className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm"
                  >
                    <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                    Test Live
                  </button>
                </div>

                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Pro Tip</p>
                  <p className="text-sm text-slate-500">Place this QR code on tables or store windows to increase engagement by up to 40%.</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShareManager;
