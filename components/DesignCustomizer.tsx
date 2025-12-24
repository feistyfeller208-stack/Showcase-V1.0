
import React from 'react';
import { Catalog, CatalogTheme } from '../types';
import { THEMES } from '../constants';
import { SwatchIcon, PaintBrushIcon } from '@heroicons/react/24/outline';

interface DesignCustomizerProps {
  catalogs: Catalog[];
  onUpdate: (catalog: Catalog) => void;
}

const DesignCustomizer: React.FC<DesignCustomizerProps> = ({ catalogs, onUpdate }) => {
  return (
    <div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-8">Design Studio</h1>
      
      <div className="grid gap-8">
        {catalogs.map(catalog => (
          <div key={catalog.id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <SwatchIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{catalog.businessName}</h3>
                <p className="text-slate-500 text-sm">Customize visual style</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4 block">Visual Theme</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.values(CatalogTheme).map(t => (
                      <button 
                        key={t}
                        // Update the template property with the enum value
                        onClick={() => onUpdate({ ...catalog, template: t })}
                        className={`p-4 rounded-2xl border-2 transition-all capitalize font-bold ${catalog.template === t ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-50 text-slate-500'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                    <PaintBrushIcon className="w-4 h-4" />
                    Color Palette
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 shadow-sm" />
                    <div className="w-8 h-8 rounded-full bg-orange-500 shadow-sm" />
                    <div className="w-8 h-8 rounded-full bg-slate-900 shadow-sm" />
                  </div>
                  <p className="text-xs text-slate-400 italic">Advanced color customizer coming soon.</p>
                </div>
              </div>

              <div className="relative group">
                <label className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4 block">Live Preview</label>
                <div className="aspect-[9/16] bg-slate-900 rounded-[2.5rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden relative">
                   <div className="absolute inset-0 bg-white overflow-y-auto transform scale-[0.98] origin-top rounded-[2rem]">
                      {/* Look up CSS classes using the catalog template enum */}
                      <div className={`p-4 ${THEMES[catalog.template].primary} text-white`}>
                        <h4 className="font-bold text-sm">{catalog.businessName}</h4>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="w-full h-24 bg-slate-100 rounded-xl animate-pulse" />
                        <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
                        <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesignCustomizer;
