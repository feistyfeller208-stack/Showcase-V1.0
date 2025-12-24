
import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  EyeIcon, 
  QrCodeIcon, 
  CursorArrowRaysIcon, 
  ClockIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  MapPinIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Catalog } from '../types';

interface AnalyticsProps {
  catalogs: Catalog[];
}

// Mock data for time-series charts - in a real app, this would be fetched from /analytics collection
const VIEWS_DATA = [
  { date: 'Oct 01', views: 120, scans: 45 },
  { date: 'Oct 02', views: 190, scans: 72 },
  { date: 'Oct 03', views: 320, scans: 110 },
  { date: 'Oct 04', views: 210, scans: 85 },
  { date: 'Oct 05', views: 280, scans: 102 },
  { date: 'Oct 06', views: 450, scans: 180 },
  { date: 'Oct 07', views: 512, scans: 210 },
];

const HOUR_DATA = [
  { hour: '8am', scans: 12 },
  { hour: '10am', scans: 45 },
  { hour: '12pm', scans: 88 },
  { hour: '2pm', scans: 65 },
  { hour: '4pm', scans: 42 },
  { hour: '6pm', scans: 95 },
  { hour: '8pm', scans: 110 },
  { hour: '10pm', scans: 34 },
];

const SOURCE_DATA = [
  { name: 'Direct Scan', value: 65, color: '#2563EB' },
  { name: 'WhatsApp', value: 20, color: '#10B981' },
  { name: 'Instagram', value: 10, color: '#F97316' },
  { name: 'Other', value: 5, color: '#94A3B8' },
];

const Analytics: React.FC<AnalyticsProps> = ({ catalogs }) => {
  const [period, setPeriod] = useState<'today' | '7d' | '30d'>('7d');
  const [selectedCatalog, setSelectedCatalog] = useState<string>('all');

  const stats = useMemo(() => {
    const targetCatalogs = selectedCatalog === 'all' 
      ? catalogs 
      : catalogs.filter(c => c.id === selectedCatalog);

    const totalViews = targetCatalogs.reduce((acc, c) => acc + (c.engagementStats?.views || 0), 0);
    const totalScans = targetCatalogs.reduce((acc, c) => acc + (c.engagementStats?.itemClicks || 0), 0); // Placeholder for scan stats
    const totalCta = targetCatalogs.reduce((acc, c) => 
      acc + (c.engagementStats?.whatsappClicks || 0) + (c.engagementStats?.callClicks || 0), 0
    );
    
    const conversionRate = totalViews > 0 ? ((totalCta / totalViews) * 100).toFixed(1) : '0';

    return {
      totalViews,
      totalScans,
      conversionRate,
      avgTime: "2m 14s"
    };
  }, [catalogs, selectedCatalog]);

  return (
    <div className="space-y-10 pb-20">
      {/* Header & Controls */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <ArrowTrendingUpIcon className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Business Intelligence</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Performance Insights</h1>
          <p className="text-slate-500 mt-1 font-medium">Tracking engagement across your digital ecosystem.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            <PeriodBtn active={period === 'today'} onClick={() => setPeriod('today')}>Today</PeriodBtn>
            <PeriodBtn active={period === '7d'} onClick={() => setPeriod('7d')}>7 Days</PeriodBtn>
            <PeriodBtn active={period === '30d'} onClick={() => setPeriod('30d')}>30 Days</PeriodBtn>
          </div>
          <button className="p-3 bg-white text-slate-400 hover:text-slate-900 rounded-2xl border border-slate-100 shadow-sm transition-all">
            <ArrowDownTrayIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Hero Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Total Views" 
          value={stats.totalViews.toLocaleString()} 
          trend="+14.2%" 
          trendUp={true}
          icon={<EyeIcon className="w-6 h-6" />}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <MetricCard 
          label="Unique Scans" 
          value="1,284" 
          trend="+8.1%" 
          trendUp={true}
          icon={<QrCodeIcon className="w-6 h-6" />}
          color="text-orange-600"
          bg="bg-orange-50"
        />
        <MetricCard 
          label="Conversion" 
          value={`${stats.conversionRate}%`} 
          trend="-0.4%" 
          trendUp={false}
          icon={<CursorArrowRaysIcon className="w-6 h-6" />}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <MetricCard 
          label="Avg. Duration" 
          value={stats.avgTime} 
          trend="+22s" 
          trendUp={true}
          icon={<ClockIcon className="w-6 h-6" />}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
      </section>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Engagement Trend */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Engagement Trend</h3>
              <p className="text-sm font-medium text-slate-400">Daily views vs Physical QR scans</p>
            </div>
            <select 
              className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-blue-100"
              value={selectedCatalog}
              onChange={(e) => setSelectedCatalog(e.target.value)}
            >
              <option value="all">All Catalogs</option>
              {catalogs.map(c => (
                <option key={c.id} value={c.id}>{c.businessName}</option>
              ))}
            </select>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VIEWS_DATA}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                  labelStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px', color: '#94a3b8' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#2563EB" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                  animationDuration={1500}
                />
                <Area 
                  type="monotone" 
                  dataKey="scans" 
                  stroke="#F97316" 
                  strokeWidth={4} 
                  fill="transparent" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Source Pie */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Traffic Source</h3>
          <p className="text-sm font-medium text-slate-400 mb-6">How customers find you</p>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SOURCE_DATA}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {SOURCE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={10} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3 mt-6">
              {SOURCE_DATA.map((source) => (
                <div key={source.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: source.color }} />
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{source.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{source.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scans by Hour */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Peak Hours</h3>
          <p className="text-sm font-medium text-slate-400 mb-8">When your QR is busiest</p>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOUR_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="hour" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 8, fontWeight: 800, fill: '#94a3b8', textTransform: 'uppercase'}} 
                />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc', radius: 10}} />
                <Bar dataKey="scans" fill="#2563EB" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Content Table */}
        <div className="lg:col-span-5 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Popular Items</h3>
          <p className="text-sm font-medium text-slate-400 mb-8">Items with highest interaction</p>
          
          <div className="space-y-6">
            <TopItem name="Iced Matcha Latte" views={1242} conversion={12.4} color="bg-emerald-500" />
            <TopItem name="Signature Espresso" views={982} conversion={8.2} color="bg-orange-500" />
            <TopItem name="Avocado Smash Toast" views={842} conversion={15.1} color="bg-blue-500" />
            <TopItem name="Cold Brew Pitcher" views={621} conversion={4.2} color="bg-indigo-500" />
            <TopItem name="Blueberry Muffin" views={432} conversion={2.8} color="bg-pink-500" />
          </div>
        </div>

        {/* Real-time Pulse */}
        <div className="lg:col-span-3 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 blur-[80px] opacity-20"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="relative">
                <UsersIcon className="w-6 h-6 text-indigo-400" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping"></span>
              </div>
              <h3 className="font-black text-lg">Live Pulse</h3>
            </div>
            
            <div className="mb-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Active Now</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tighter">18</span>
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Visitors</span>
              </div>
            </div>

            <div className="space-y-6">
              <LiveEvent location="Brooklyn, NY" action="Viewed Menu" time="Just now" />
              <LiveEvent location="New York, NY" action="Scanned Table 4" time="2m ago" />
              <LiveEvent location="Hoboken, NJ" action="WhatsApp Tap" time="5m ago" />
            </div>

            <button className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">
              Detailed Live Feed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Internal Components */

const MetricCard: React.FC<{ label: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode, color: string, bg: string }> = ({ label, value, trend, trendUp, icon, color, bg }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:shadow-md transition-all">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${bg} ${color}`}>
      {icon}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-baseline justify-between gap-2">
      <h4 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h4>
      <div className={`flex items-center gap-0.5 text-[10px] font-black ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
        {trendUp ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
        {trend}
      </div>
    </div>
  </div>
);

const PeriodBtn: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {children}
  </button>
);

const TopItem: React.FC<{ name: string, views: number, conversion: number, color: string }> = ({ name, views, conversion, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <div className="flex flex-col">
        <span className="text-xs font-black text-slate-900 uppercase tracking-widest truncate max-w-[150px]">{name}</span>
        <span className="text-[10px] font-bold text-slate-400">{views.toLocaleString()} Views</span>
      </div>
      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{conversion}% CTR</span>
    </div>
    <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-1000 ${color}`} 
        style={{ width: `${Math.min((views / 1500) * 100, 100)}%` }}
      />
    </div>
  </div>
);

const LiveEvent: React.FC<{ location: string, action: string, time: string }> = ({ location, action, time }) => (
  <div className="flex gap-4 items-start opacity-80 hover:opacity-100 transition-opacity">
    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-baseline gap-2">
        <p className="text-[10px] font-black uppercase tracking-widest truncate">{location}</p>
        <span className="text-[8px] font-bold text-slate-500 shrink-0">{time}</span>
      </div>
      <p className="text-[10px] text-slate-400 font-medium">{action}</p>
    </div>
  </div>
);

export default Analytics;
