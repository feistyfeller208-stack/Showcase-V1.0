
import React, { useState, useEffect, useRef } from 'react';
import { 
  XMarkIcon, PhotoIcon, CloudArrowUpIcon, 
  ArrowPathIcon, PlusIcon 
} from '@heroicons/react/24/outline';
import { CatalogItem } from '../types';
import { auth } from '../services/firebase';
import { uploadImageToImgBB, compressImage } from '../services/imgbb.service';

interface ItemEditorProps {
  item?: CatalogItem | null;
  existingCategories: string[];
  onSave: (item: CatalogItem) => void;
  onCancel: () => void;
}

const ItemEditor: React.FC<ItemEditorProps> = ({ item, existingCategories, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CatalogItem>({
    id: item?.id || Math.random().toString(36).substr(2, 9),
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    category: item?.category || '',
    imageUrl: item?.imageUrl || '',
    isAvailable: item?.isAvailable ?? true
  });

  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation: Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onCancel]);

  // Trap focus (simplified)
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    if (!auth.currentUser) return;

    setUploading(true);
    setError('');
    try {
      const compressedFile = await compressImage(file, 800);
      const url = await uploadImageToImgBB(compressedFile);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (err: any) {
      setError(err.message || 'Image upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Item name is required.');
      return;
    }
    
    const finalCategory = isAddingNewCategory ? newCategory.trim() : formData.category;
    if (!finalCategory && (isAddingNewCategory || existingCategories.length > 0)) {
      setError('Please select or enter a category.');
      return;
    }

    onSave({
      ...formData,
      category: finalCategory
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between shrink-0">
          <h3 id="modal-title" className="text-2xl font-black text-slate-900">
            {item ? 'Edit Item' : 'Add New Item'}
          </h3>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Image Upload */}
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Item Image</label>
              <div 
                className={`relative aspect-square rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden group
                  ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}
                  ${formData.imageUrl ? 'border-solid' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {formData.imageUrl ? (
                  <>
                    <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 bg-white rounded-2xl text-slate-900 shadow-xl hover:scale-110 transition-transform"
                      >
                        <CloudArrowUpIcon className="w-6 h-6" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, imageUrl: ''}))}
                        className="p-3 bg-white rounded-2xl text-red-500 shadow-xl hover:scale-110 transition-transform"
                      >
                        <XMarkIcon className="w-6 h-6" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 pointer-events-none">
                    {uploading ? (
                      <ArrowPathIcon className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    ) : (
                      <PhotoIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    )}
                    <p className="text-sm font-bold text-slate-500">
                      {uploading ? 'Processing...' : 'Drag image here or click to upload'}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">Recommended: 800x800px JPG/PNG</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*"
                  disabled={uploading}
                />
              </div>
            </div>

            {/* Right: Details */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Item Name *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="e.g. Cappuccino"
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2563EB] font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Price</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.price}
                    onChange={e => setFormData(prev => ({...prev, price: e.target.value.replace(/[^0-9.]/g, '')}))}
                    placeholder="0.00"
                    className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2563EB] font-black text-[#2563EB]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Category</label>
                {!isAddingNewCategory ? (
                  <div className="flex gap-2">
                    <select
                      value={formData.category}
                      onChange={e => {
                        if (e.target.value === 'ADD_NEW') setIsAddingNewCategory(true);
                        else setFormData(prev => ({...prev, category: e.target.value}));
                      }}
                      className="flex-1 px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2563EB] font-bold text-slate-700 appearance-none"
                    >
                      <option value="">Select Category</option>
                      {existingCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="ADD_NEW" className="text-blue-600 font-black">+ Create New</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-2 animate-in slide-in-from-right-2">
                    <input
                      autoFocus
                      type="text"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      placeholder="New Category Name"
                      className="flex-1 px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2563EB] font-bold"
                    />
                    <button 
                      type="button"
                      onClick={() => setIsAddingNewCategory(false)}
                      className="px-4 bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-600"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({...prev, description: e.target.value}))}
              placeholder="Tell customers more about this item..."
              className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2563EB] font-medium text-slate-600 h-28"
            />
          </div>

          <div className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem]">
            <div>
              <p className="text-sm font-black text-slate-900">Available to Order</p>
              <p className="text-xs text-slate-500 font-medium">Toggle off to hide from catalog temporarily.</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({...prev, isAvailable: !prev.isAvailable}))}
              className={`w-14 h-8 rounded-full transition-all relative ${formData.isAvailable ? 'bg-green-500' : 'bg-slate-300'}`}
              aria-pressed={formData.isAvailable}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.isAvailable ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={uploading}
            className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-100 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {uploading ? 'Processing...' : (item ? 'Update Item' : 'Add to Catalog')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemEditor;
