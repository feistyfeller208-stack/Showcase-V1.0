
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, PencilSquareIcon, ShareIcon, 
  TrashIcon, ChartBarIcon, SwatchIcon,
  EllipsisVerticalIcon, EyeIcon, RocketLaunchIcon,
  ClockIcon, FireIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';
import { 
  collection, query, where, onSnapshot, doc 
} from 'firebase/firestore';
import { auth, db, deleteCatalogData, signOut } from '../services/firebase';
import { Catalog } from '../types';

interface DashboardProps {
  catalogs?: Catalog[];
  deleteCatalog?: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = () => {
  const navigate = useNavigate();
  const [businessData, setBusinessData] = useState<any>(null);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    const unsubBusiness = onSnapshot(doc(db, "businesses", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setBusinessData(docSnap.data());
      }
    });

    const q = query(collection(db, "catalogs"), where("userId", "==", user.uid));
    const unsubCatalogs = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ 
        id: d.id, 
        ...d.data() 
      } as Catalog));
      setCatalogs(list);
      setLoading(false);
    });

    return () => {
      unsubBusiness();
      unsubCatalogs();
    };
  }, [navigate]);

  const handleShare = (catalog: Catalog) => {
    const url = `${window.location.origin}/#/view/${catalog.slug}`;
    if (navigator.share) {
      navigator.share({
        title: catalog.businessName,
        url: url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
    setOpenMenuId(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this showcase forever?')) {
      await deleteCatalogData(id);
    }
    setOpenMenuId(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Syncing...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Welcome Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Hi, {businessData?.businessName || 'Merchant'}
          </h1>
          <p className="text-slate-400 font-medium text-sm mt-1">Here is what's happening today.</p>
        </div>
        <button 
          onClick={() => signOut().then(() => navigate('/login'))}
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
        >
          Sign Out
        </button>
      </header>

      {/* 1. Quick Actions */}
      <section>
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard 
            label="Create New Catalog" 
            onClick={() => navigate('/create')}
            icon={<PlusIcon className="w-6 h-6" />}
            primary
          />
          <ActionCard 
            label="Customize Design" 
            onClick={() => navigate('/design')}
            icon={<SwatchIcon className="w-6 h-6" />}
          />
          <ActionCard 
            label="View Analytics" 
            onClick={() => navigate('/analytics')}
            icon={<ChartBarIcon className="w-6 h-6" />}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* 2. Your Catalogs (Left) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Your Catalogs</h2>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{catalogs.length} Total</span>
          </div>

          {catalogs.length > 0 ? (
            <div className="space-y-4">
              {catalogs.map((catalog) => (
                <div key={catalog.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-slate-100">
                      {catalog.logoUrl ? <img src={catalog.logoUrl} className="w-full h-full object-cover rounded-2xl" /> : '📁'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900 truncate max-w-[180px]">{catalog.businessName}</h3>
                        <span className={`w-2 h-2 rounded-full ${catalog.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          {catalog.isActive ? 'Active' : 'Draft'}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                          <EyeIcon className="w-3 h-3" />
                          {catalog.engagementStats?.views || 0} Views
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === catalog.id ? null : catalog.id)}
                      className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors"
                    >
                      <EllipsisVerticalIcon className="w-6 h-6" />
                    </button>
                    
                    {openMenuId === catalog.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-20 animate-in fade-in zoom-in-95 duration-150">
                          <MenuOption icon={<PencilSquareIcon className="w-4 h-4" />} label="Edit" onClick={() => navigate(`/edit/${catalog.id}`)} />
                          <MenuOption icon={<ShareIcon className="w-4 h-4" />} label="Share" onClick={() => handleShare(catalog)} />
                          <MenuOption icon={<TrashIcon className="w-4 h-4" />} label="Delete" onClick={() => handleDelete(catalog.id)} danger />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
              <RocketLaunchIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-900">No catalogs yet</h3>
              <p className="text-sm text-slate-400 font-medium mt-1 mb-8">Launch your first showcase in minutes.</p>
              <button 
                onClick={() => navigate('/create')}
                className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* 3. Recent Activity (Right) */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Activity Feed</h2>
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
            <ActivityLine icon={<CheckCircleIcon className="w-5 h-5 text-emerald-500" />} label="Today" detail="15 scans across all catalogs" />
            <ActivityLine icon={<ClockIcon className="w-5 h-5 text-slate-400" />} label="Yesterday" detail="8 scans recorded" />
            <ActivityLine icon={<FireIcon className="w-5 h-5 text-orange-500" />} label="Most Viewed" detail="Margherita Pizza" />
            
            <button 
              onClick={() => navigate('/analytics')}
              className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all mt-4"
            >
              Deep Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Internal Components */

const ActionCard: React.FC<{ label: string, onClick: () => void, icon: React.ReactNode, primary?: boolean }> = ({ label, onClick, icon, primary }) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 transition-all active:scale-[0.97] border-2 ${
      primary 
      ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100 hover:bg-blue-700' 
      : 'bg-white border-slate-100 text-slate-900 hover:border-blue-100 shadow-sm'
    }`}
  >
    <div className={`p-4 rounded-2xl ${primary ? 'bg-white/20' : 'bg-slate-50 text-blue-600'}`}>
      {icon}
    </div>
    <span className="text-xs font-black uppercase tracking-widest">{label}</span>
  </button>
);

const MenuOption: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, danger?: boolean }> = ({ icon, label, onClick, danger }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${danger ? 'text-red-500 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'}`}
  >
    {icon}
    <span className="text-xs font-black uppercase tracking-widest">{label}</span>
  </button>
);

const ActivityLine: React.FC<{ icon: React.ReactNode, label: string, detail: string }> = ({ icon, label, detail }) => (
  <div className="flex gap-4">
    <div className="shrink-0 mt-1">{icon}</div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-900 mt-0.5">{detail}</p>
    </div>
  </div>
);

export default Dashboard;
