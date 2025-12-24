import React from 'react';

const Hello: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-blue-900/5 animate-up">
      <div className="w-20 h-20 bg-blue-50 rounded-[2.5rem] flex items-center justify-center text-3xl mb-6">
        👋
      </div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center">Hello Showcase!</h1>
      <p className="text-slate-500 mt-2 text-center max-w-sm">
        This is a test component to confirm that your build environment and React orchestration are working perfectly.
      </p>
      <div className="mt-10 p-6 bg-slate-50 rounded-3xl w-full">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Environment Check</h4>
        <div className="space-y-3">
          <StatusRow label="React 19" status="Ready" />
          <StatusRow label="Tailwind CSS" status="Active" />
          <StatusRow label="Firebase Auth" status="Synced" />
        </div>
      </div>
    </div>
  );
};

const StatusRow = ({ label, status }: { label: string, status: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-xs font-bold text-slate-600">{label}</span>
    <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">{status}</span>
  </div>
);

export default Hello;