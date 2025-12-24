
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon, PlusIcon, TrashIcon, 
  PencilSquareIcon, ChevronUpIcon, ChevronDownIcon,
  CheckIcon, QrCodeIcon, ChatBubbleLeftRightIcon,
  PrinterIcon, EyeIcon, ArrowRightIcon,
  Cog6ToothIcon, PhotoIcon
} from '@heroicons/react/24/outline';
import { QRCodeCanvas } from 'qrcode.react';
import { Catalog, CatalogItem, CatalogTheme, CatalogThemeConfig } from '../types';
import { auth } from '../services/firebase';
import ItemEditor from './ItemEditor';

const STEPS = [
  { id: 1, name: 'Basic Info' },
  { id: 2, name: 'Add Items' },
  { id: 3, name: 'Choose Design' },
  { id: 4, name: 'Publish & Share' }
];

const slugify = (str: string) => str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const CatalogEditor: React.FC<{ catalogs?: Catalog[], onSave: (catalog: Catalog) => Promise<string> }> = ({ catalogs, onSave }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const existingCatalog = catalogs?.find(c => c.id === id);

  const [step, setStep] = useState(1);
  const [name, setName] = useState(existingCatalog?.businessName || '');
  const [description, setDescription] = useState(existingCatalog?.description || '');
  const [slug, setSlug] = useState(existingCatalog?.slug || '');
  const [template, setTemplate] = useState<CatalogTheme>(existingCatalog?.template || CatalogTheme.MODERN);
  const [theme, setTheme] = useState<CatalogThemeConfig>(existingCatalog?.theme || { primaryColor: '#2563EB', font: 'font-sans' });
  const [items, setItems] = useState<CatalogItem[]>(existingCatalog?.items || []);
  
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedCatalogId, setSavedCatalogId] = useState<string | null>(existingCatalog?.id || null);

  const existingCategories = Array.from(new Set(items.map(i => i.category))).filter(Boolean);

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
  };

  const publishCatalog = async () => {
    if (!name) return alert('Please enter a catalog name');
    setIsSaving(true);
    
    const finalSlug = slug || slugify(name);
    
    const catalogData: any = {
      ...(existingCatalog || {}),
      businessId: auth.currentUser?.uid || '',
      businessName: name,
      slug: finalSlug,
      description,
      template,
      theme,
      items,
      isActive: true,
      updatedAt: Date.now(),
      createdAt: existingCatalog?.createdAt || Date.now()
    };
    
    if (existingCatalog?.id) catalogData.id = existingCatalog.id;

    try {
      const returnedId = await onSave(catalogData);
      setSavedCatalogId(returnedId);
      setSlug(finalSlug);
      
      // Ensure state is ready before showing success step
      setTimeout(() => {
        setStep(4);
      }, 100);
      
    } catch (err: any) {
      console.error("Publishing error:", err);
      alert('Failed to publish: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-12">
      {STEPS.map((s) => (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 ${step >= s.id ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-400'}`}>
              {step > s.id ? <CheckIcon className="w-6 h-6" /> : s.id}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest mt-2 ${step >= s.id ? 'text-[#2563EB]' : 'text-slate-400'}`}>{s.name}</span>
          </div>
          {s.id < 4 && <div className={`w-12 h-1 rounded-full ${step > s.id ? 'bg-[#2563EB]' : 'bg-slate-100'}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6 md:p-12">
      <div className="max-w-3xl w-full">
        <div className="flex items-center justify-between mb-12">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase text-xs tracking-widest transition-all">
            <ArrowLeftIcon className="w-4 h-4" />
            {step === 1 ? 'Exit' : 'Back'}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">S</div>
            <span className="font-black text-slate-900 tracking-tighter">Wizard</span>
          </div>
          <div className="w-16" />
        </div>

        {renderStepIndicator()}

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tell us about your catalog</h2>
              <p className="text-slate-500 font-medium">This is the first thing customers will see.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-[3rem] space-y-6">
              <WizardInput label="Catalog Name" value={name} onChange={setName} placeholder="e.g. Summer Specials" />
              <WizardTextarea label="Short Description (Optional)" value={description} onChange={setDescription} placeholder="e.g. Handcrafted drinks for the heat..." />
            </div>
            <button 
              onClick={() => name ? setStep(2) : alert('Please name your catalog')}
              className="w-full py-5 bg-[#2563EB] text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Add your items</h2>
              <p className="text-slate-500 font-medium">Showcase what you offer with prices and photos.</p>
            </div>
            
            <button 
              onClick={() => { setEditingItemIndex(null); setShowItemModal(true); }}
              className="w-full py-10 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50/30 transition-all group"
            >
              <div className="w-16 h-16 bg-slate-50 group-hover:bg-white rounded-[2rem] flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                <PlusIcon className="w-8 h-8" />
              </div>
              <span className="text-sm font-black uppercase tracking-widest">Add Item</span>
            </button>

            {items.length > 0 && (
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={item.id} className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-50">
                      {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-900 truncate">{item.name}</h4>
                      <p className="text-xs font-black text-blue-600">${item.price}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleMove(idx, 'up')} className="p-2 text-slate-400 hover:text-slate-900"><ChevronUpIcon className="w-4 h-4" /></button>
                      <button onClick={() => handleMove(idx, 'down')} className="p-2 text-slate-400 hover:text-slate-900"><ChevronDownIcon className="w-4 h-4" /></button>
                      <button onClick={() => { setEditingItemIndex(idx); setShowItemModal(true); }} className="p-2 text-slate-400 hover:text-blue-600"><PencilSquareIcon className="w-4 h-4" /></button>
                      <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="p-2 text-slate-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={() => items.length > 0 ? setStep(3) : alert('Add at least one item')}
              className={`w-full py-5 rounded-[2rem] font-black text-lg transition-all ${items.length > 0 ? 'bg-[#2563EB] text-white shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              Continue ({items.length} items)
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Pick a visual style</h2>
              <p className="text-slate-500 font-medium">Choose how you want your items to be displayed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TemplateCard 
                active={template === CatalogTheme.MINIMALIST}
                onClick={() => setTemplate(CatalogTheme.MINIMALIST)}
                name="Minimalist"
                desc="Clean & typography focused"
                icon={<div className="space-y-1"><div className="w-full h-1 bg-slate-300 rounded" /><div className="w-2/3 h-1 bg-slate-200 rounded" /></div>}
              />
              <TemplateCard 
                active={template === CatalogTheme.GALLERY}
                onClick={() => setTemplate(CatalogTheme.GALLERY)}
                name="Gallery"
                desc="Large image focused"
                icon={<div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center"><PhotoIcon className="w-6 h-6 text-slate-300" /></div>}
              />
              <TemplateCard 
                active={template === CatalogTheme.CLASSIC}
                onClick={() => setTemplate(CatalogTheme.CLASSIC)}
                name="Classic"
                desc="Traditional menu style"
                icon={<div className="space-y-2"><div className="flex gap-2"><div className="w-4 h-4 bg-slate-200 rounded" /><div className="flex-1 h-2 bg-slate-100 rounded" /></div><div className="flex gap-2"><div className="w-4 h-4 bg-slate-200 rounded" /><div className="flex-1 h-2 bg-slate-100 rounded" /></div></div>}
              />
            </div>

            <button 
              onClick={publishCatalog}
              disabled={isSaving}
              className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center"
            >
              {isSaving ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : 'Publish Now'}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckIcon className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your catalog is live!</h2>
              <p className="text-slate-500 font-medium">Ready to connect with your customers.</p>
            </div>

            <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-2xl flex flex-col items-center">
              <div className="p-6 bg-slate-50 rounded-[3rem] border border-slate-100 shadow-inner mb-8">
                <QRCodeCanvas 
                  value={`${window.location.origin}/#/view/${slug || slugify(name)}`} 
                  size={200}
                  fgColor={theme.primaryColor}
                  level="H"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <ShareAction icon={<QrCodeIcon className="w-6 h-6" />} label="Download QR" onClick={() => {
                  const canvas = document.querySelector('canvas');
                  if (canvas) {
                    const link = document.createElement('a');
                    link.download = `${slug || slugify(name)}-qr.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                  }
                }} />
                <ShareAction icon={<PrinterIcon className="w-6 h-6" />} label="Print" onClick={() => window.print()} />
                <ShareAction icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />} label="WhatsApp" color="text-green-600 bg-green-50" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Check out our catalog: ' + window.location.origin + '/#/view/' + (slug || slugify(name)))}`, '_blank')} />
                <ShareAction icon={<EyeIcon className="w-6 h-6" />} label="Preview" onClick={() => window.open(`${window.location.origin}/#/view/${slug || slugify(name)}`, '_blank')} />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate('/')}
                className="w-full py-5 bg-[#2563EB] text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Done - View Dashboard
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setStep(1)}
                className="w-full py-5 text-slate-400 font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2"
              >
                <Cog6ToothIcon className="w-5 h-5" />
                Advanced Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {showItemModal && (
        <ItemEditor 
          item={editingItemIndex !== null ? items[editingItemIndex] : null}
          existingCategories={existingCategories}
          onSave={(item) => {
             const newItems = [...items];
             if (editingItemIndex !== null) newItems[editingItemIndex] = item;
             else newItems.push(item);
             setItems(newItems);
             setShowItemModal(false);
          }}
          onCancel={() => setShowItemModal(false)}
        />
      )}
    </div>
  );
};

const WizardInput: React.FC<{ label: string, value: string, onChange: (v: string) => void, placeholder: string }> = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      placeholder={placeholder}
      className="w-full px-8 py-5 bg-white border-2 border-transparent focus:border-blue-600 rounded-[2rem] font-black text-slate-900 shadow-sm focus:shadow-xl transition-all outline-none" 
    />
  </div>
);

const WizardTextarea: React.FC<{ label: string, value: string, onChange: (v: string) => void, placeholder: string }> = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">{label}</label>
    <textarea 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      placeholder={placeholder}
      className="w-full px-8 py-5 bg-white border-2 border-transparent focus:border-blue-600 rounded-[2.5rem] font-medium text-slate-600 shadow-sm focus:shadow-xl transition-all outline-none min-h-[120px]" 
    />
  </div>
);

const TemplateCard: React.FC<{ active: boolean, onClick: () => void, name: string, desc: string, icon: React.ReactNode }> = ({ active, onClick, name, desc, icon }) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-[2.5rem] border-4 text-left transition-all ${active ? 'border-[#2563EB] bg-blue-50/50 shadow-xl' : 'border-slate-50 bg-slate-50/50 opacity-60 hover:opacity-100 hover:bg-slate-50'}`}
  >
    <div className="w-full aspect-[4/3] mb-4 bg-white rounded-2xl p-4 shadow-sm">
      {icon}
    </div>
    <h4 className="font-black text-slate-900 text-sm tracking-tight">{name}</h4>
    <p className="text-[10px] text-slate-500 font-medium leading-tight mt-1">{desc}</p>
  </button>
);

const ShareAction: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, color?: string }> = ({ icon, label, onClick, color = "text-slate-900 bg-slate-50" }) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 transition-all active:scale-95 shadow-sm border border-black/5 hover:shadow-md ${color}`}
  >
    {icon}
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default CatalogEditor;
