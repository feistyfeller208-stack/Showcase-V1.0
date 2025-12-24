
import React, { useState, useEffect } from 'react';
import { ChromePicker } from 'react-color';
import { 
  SwatchIcon, 
  TypeIcon, 
  Squares2X2Icon, 
  PhotoIcon, 
  ArrowPathIcon,
  CheckIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { Catalog, CatalogTheme, CatalogThemeConfig } from '../types';
// Fix: Removed non-existent 'uploadImage' from imports
import { auth, updateCatalog } from '../services/firebase';

interface ThemeCustomizerProps {
  catalog: Catalog;
  onUpdate: (catalog: Catalog) => void;
}

const DEFAULT_CONFIG: CatalogThemeConfig = {
  primaryColor: '#2563EB',
  accentColor: '#F97316',
  backgroundColor: '#FFFFFF',
  textColor: '#0F172A',
  font: 'font-sans',
  fontSizeHeading: 'text-3xl',
  fontSizeBody: 'text-base',
  cardStyle: 'rounded',
  spacing: 'comfortable',
  logoStyle: 'circle'
};

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ catalog, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout' | 'branding'>('colors');
  const [config, setConfig] = useState<CatalogThemeConfig>({
    ...DEFAULT_CONFIG,
    ...catalog.theme
  });
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isSaving, setIsSaving] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const updateConfig = (updates: Partial<CatalogThemeConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onUpdate({ ...catalog, theme: newConfig });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCatalog(catalog.id, { theme: config });
      alert('Theme saved successfully!');
    } catch (error) {
      console.error('Failed to save theme', error);
      alert('Error saving theme');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all theme settings to defaults?')) {
      updateConfig(DEFAULT_CONFIG);
    }
  };

  const exportCSS = () => {
    const css = `
:root {
  --primary-color: ${config.primaryColor};
  --accent-color: ${config.accentColor || '#F97316'};
  --bg-color: ${config.backgroundColor || '#FFFFFF'};
  --text-color: ${config.textColor || '#0F172A'};
  --font-family: ${config.font === 'font-sans' ? 'Inter' : config.font === 'font-serif' ? 'Playfair Display' : 'JetBrains Mono'};
}
    `.trim();
    navigator.clipboard.writeText(css);
    alert('CSS variables copied to clipboard!');
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] -m-6 md:-m-12 bg-white overflow-hidden">
      {/* Sidebar Controls */}
      <div className="w-full lg:w-[450px] flex flex-col border-r bg-slate-50/50 overflow-hidden shrink-0">
        <div className="p-6 border-b bg-white">
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Theme Studio</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Design the soul of your digital catalog</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-white shrink-0">
          <TabButton active={activeTab === 'colors'} onClick={() => setActiveTab('colors')} icon={<SwatchIcon className="w-4 h-4" />} label="Colors" />
          <TabButton active={activeTab === 'typography'} onClick={() => setActiveTab('typography')} icon={<TypeIcon className="w-4 h-4" />} label="Type" />
          <TabButton active={activeTab === 'layout'} onClick={() => setActiveTab('layout')} icon={<Squares2X2Icon className="w-4 h-4" />} label="Layout" />
          <TabButton active={activeTab === 'branding'} onClick={() => setActiveTab('branding')} icon={<PhotoIcon className="w-4 h-4" />} label="Brand" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {activeTab === 'colors' && (
            <div className="space-y-6 animate-in slide-in-from-left duration-300">
              <ColorSetting label="Primary Color" value={config.primaryColor} onChange={(c) => updateConfig({ primaryColor: c })} pickerId="primary" currentOpen={showColorPicker} setOpen={setShowColorPicker} />
              <ColorSetting label="Accent Color" value={config.accentColor || '#F97316'} onChange={(c) => updateConfig({ accentColor: c })} pickerId="accent" currentOpen={showColorPicker} setOpen={setShowColorPicker} />
              <ColorSetting label="Background" value={config.backgroundColor || '#FFFFFF'} onChange={(c) => updateConfig({ backgroundColor: c })} pickerId="bg" currentOpen={showColorPicker} setOpen={setShowColorPicker} />
              <ColorSetting label="Text Color" value={config.textColor || '#0F172A'} onChange={(c) => updateConfig({ textColor: c })} pickerId="text" currentOpen={showColorPicker} setOpen={setShowColorPicker} />
              
              <div className="pt-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Presets</p>
                <div className="flex gap-2">
                  {['#2563EB', '#F97316', '#10B981', '#EF4444', '#8B5CF6'].map(c => (
                    <button key={c} onClick={() => updateConfig({ primaryColor: c })} className="w-8 h-8 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="space-y-8 animate-in slide-in-from-left duration-300">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Font Family</label>
                <div className="grid gap-2">
                  <FontOption active={config.font === 'font-sans'} onClick={() => updateConfig({ font: 'font-sans' })} name="Inter" className="font-sans" />
                  <FontOption active={config.font === 'font-serif'} onClick={() => updateConfig({ font: 'font-serif' })} name="Playfair Display" className="font-serif" />
                  <FontOption active={config.font === 'font-mono'} onClick={() => updateConfig({ font: 'font-mono' })} name="JetBrains Mono" className="font-mono" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Font Sizes</label>
                <div className="space-y-4 p-4 bg-white rounded-2xl border border-slate-100">
                  <SizeSlider label="Heading" value={config.fontSizeHeading || 'text-3xl'} options={['text-2xl', 'text-3xl', 'text-4xl']} onChange={(v) => updateConfig({ fontSizeHeading: v as any })} />
                  <SizeSlider label="Body" value={config.fontSizeBody || 'text-base'} options={['text-sm', 'text-base', 'text-lg']} onChange={(v) => updateConfig({ fontSizeBody: v as any })} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-8 animate-in slide-in-from-left duration-300">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Template Base</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(CatalogTheme).map(t => (
                    <button key={t} onClick={() => onUpdate({ ...catalog, template: t })} className={`p-4 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all ${catalog.template === t ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-white bg-white text-slate-400'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Card Style</label>
                <div className="flex gap-2">
                  {['rounded', 'shadow', 'border', 'flat'].map(s => (
                    <button key={s} onClick={() => updateConfig({ cardStyle: s as any })} className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-tighter transition-all ${config.cardStyle === s ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-white bg-white text-slate-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Spacing</label>
                <div className="flex gap-2">
                  {['compact', 'comfortable', 'spacious'].map(s => (
                    <button key={s} onClick={() => updateConfig({ spacing: s as any })} className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-tighter transition-all ${config.spacing === s ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-white bg-white text-slate-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-8 animate-in slide-in-from-left duration-300">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Logo Shape</label>
                <div className="flex gap-3">
                  {['circle', 'square', 'hidden'].map(s => (
                    <button key={s} onClick={() => updateConfig({ logoStyle: s as any })} className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-tighter transition-all ${config.logoStyle === s ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-white bg-white text-slate-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-blue-600 rounded-[2rem] text-white shadow-xl shadow-blue-100">
                <h4 className="font-black mb-2">Favicon Generator</h4>
                <p className="text-xs text-blue-100 mb-4">We've automatically generated high-res favicons based on your brand colors and logo.</p>
                <button className="flex items-center gap-2 text-xs font-black bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-all">
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Download Assets
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-white border-t flex items-center justify-between gap-3 shrink-0">
          <button onClick={handleReset} className="p-3 text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowPathIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={exportCSS} className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 rounded-xl">
              Export CSS
            </button>
            <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 bg-[#2563EB] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center gap-2">
              {isSaving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CloudArrowUpIcon className="w-4 h-4" />}
              Save Theme
            </button>
          </div>
        </div>
      </div>

      {/* Preview Pane */}
      <div className="flex-1 bg-slate-100 flex flex-col items-center justify-center p-8 lg:p-12 overflow-hidden relative">
        <div className="flex items-center gap-3 mb-8 bg-white p-2 rounded-2xl shadow-sm z-10">
          <button onClick={() => setPreviewMode('mobile')} className={`p-3 rounded-xl transition-all ${previewMode === 'mobile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}>
            <DevicePhoneMobileIcon className="w-6 h-6" />
          </button>
          <button onClick={() => setPreviewMode('desktop')} className={`p-3 rounded-xl transition-all ${previewMode === 'desktop' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}>
            <ComputerDesktopIcon className="w-6 h-6" />
          </button>
        </div>

        <div className={`transition-all duration-500 ease-in-out bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden rounded-[3rem] ${previewMode === 'mobile' ? 'w-[375px] h-[750px] border-[12px] border-slate-900' : 'w-full max-w-5xl h-full'}`}>
          <ThemePreview catalog={catalog} config={config} />
        </div>
      </div>
    </div>
  );
};

const ThemePreview: React.FC<{ catalog: Catalog, config: CatalogThemeConfig }> = ({ catalog, config }) => {
  const categories = Array.from(new Set(catalog.items.map(i => i.category))).filter(Boolean);
  const cardClasses = {
    rounded: 'rounded-2xl',
    shadow: 'rounded-2xl shadow-lg border-transparent',
    border: 'rounded-2xl border-2 border-slate-100',
    flat: 'rounded-none border-b border-slate-50'
  }[config.cardStyle || 'rounded'];

  const spacingClasses = {
    compact: 'gap-2',
    comfortable: 'gap-4',
    spacious: 'gap-8'
  }[config.spacing || 'comfortable'];

  return (
    <div className={`h-full overflow-y-auto ${config.font} custom-scrollbar relative`} style={{ backgroundColor: config.backgroundColor, color: config.textColor }}>
      <header className={`p-8 relative overflow-hidden`} style={{ background: `linear-gradient(135deg, ${config.primaryColor}11 0%, ${config.primaryColor}22 100%)` }}>
        <div className="relative z-10 flex flex-col items-center text-center">
          {config.logoStyle !== 'hidden' && catalog.logoUrl && (
            <img src={catalog.logoUrl} className={`w-20 h-20 mb-4 object-cover shadow-2xl ${config.logoStyle === 'circle' ? 'rounded-full' : 'rounded-2xl'}`} />
          )}
          <h1 className={`font-black tracking-tighter ${config.fontSizeHeading}`}>{catalog.businessName}</h1>
          <p className={`mt-2 opacity-70 font-medium ${config.fontSizeBody}`}>{catalog.description}</p>
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 blur-[80px] opacity-20 rounded-full" style={{ backgroundColor: config.primaryColor }} />
      </header>

      <div className="p-6 space-y-10">
        {categories.length > 0 ? categories.map(cat => (
          <section key={cat}>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 mb-6">{cat}</h2>
            <div className={`grid ${spacingClasses}`}>
              {catalog.items.filter(i => i.category === cat).map(item => (
                <div key={item.id} className={`p-4 bg-white transition-all overflow-hidden ${cardClasses} flex gap-4`} style={{ color: config.textColor }}>
                  <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden shrink-0">
                    {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold leading-tight">{item.name}</h4>
                      <span className="font-black text-sm" style={{ color: config.primaryColor }}>${item.price}</span>
                    </div>
                    <p className="text-[10px] opacity-60 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )) : (
          <div className="py-20 text-center opacity-20">No items available</div>
        )}
      </div>

      {/* Floating Action CTA */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-xs">
         <button className="w-full py-4 text-white rounded-2xl font-black text-sm shadow-2xl shadow-blue-900/10 transition-transform active:scale-95" style={{ backgroundColor: config.primaryColor }}>
            Order via WhatsApp
         </button>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${active ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
    {icon}
    {label}
  </button>
);

const ColorSetting: React.FC<{ label: string, value: string, onChange: (c: string) => void, pickerId: string, currentOpen: string | null, setOpen: (id: string | null) => void }> = ({ label, value, onChange, pickerId, currentOpen, setOpen }) => (
  <div className="space-y-2 relative">
    <div className="flex items-center justify-between">
      <label className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</label>
      <span className="text-[10px] font-mono text-slate-400 uppercase">{value}</span>
    </div>
    <button onClick={() => setOpen(currentOpen === pickerId ? null : pickerId)} className="w-full h-12 rounded-xl border-2 border-white shadow-sm ring-1 ring-slate-200 flex items-center p-1 bg-white">
      <div className="w-full h-full rounded-lg" style={{ backgroundColor: value }} />
    </button>
    {currentOpen === pickerId && (
      <div className="absolute z-50 mt-2 top-full left-0 right-0 lg:left-auto lg:right-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="fixed inset-0 lg:hidden" onClick={() => setOpen(null)} />
        <ChromePicker color={value} onChange={(c) => onChange(c.hex)} disableAlpha />
      </div>
    )}
  </div>
);

const FontOption: React.FC<{ active: boolean, onClick: () => void, name: string, className: string }> = ({ active, onClick, name, className }) => (
  <button onClick={onClick} className={`p-4 rounded-xl border-2 text-left transition-all ${active ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-white bg-white text-slate-600 hover:border-slate-200'}`}>
    <span className={`${className} font-bold text-sm`}>{name}</span>
    <p className="text-[10px] opacity-60 mt-1">The quick brown fox jumps over the lazy dog.</p>
  </button>
);

const SizeSlider: React.FC<{ label: string, value: string, options: string[], onChange: (v: string) => void }> = ({ label, value, options, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs font-bold text-slate-600">{label}</span>
    <div className="flex gap-1 bg-slate-50 p-1 rounded-lg">
      {options.map((opt, idx) => (
        <button key={opt} onClick={() => onChange(opt)} className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${value === opt ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
          {idx === 0 ? 'S' : idx === 1 ? 'M' : 'L'}
        </button>
      ))}
    </div>
  </div>
);

const TypeIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export default ThemeCustomizer;
