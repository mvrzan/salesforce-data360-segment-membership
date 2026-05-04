import { Link } from "react-router";
import { Sparkles } from "lucide-react";
import dataCloudLogo from "../assets/data_cloud_logo.png";

const Header = () => (
  <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl">
    <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-blue-500/40 to-transparent" />
    <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-blue-500/5 via-transparent to-cyan-500/5" />
    <div className="relative max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <Link to="/" className="group flex items-center gap-3 hover:opacity-90 transition-opacity">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-blue-500/30 blur-lg group-hover:bg-blue-400/40 transition-colors" />
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900/70 ring-1 ring-slate-700/60 p-1.5">
            <img src={dataCloudLogo} alt="Data Cloud" className="h-full w-full object-contain" />
          </div>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-white font-semibold text-[15px] tracking-tight">Data 360 Segments</span>
          <span className="text-[11px] text-slate-500 tracking-wide">Salesforce Data Cloud explorer</span>
        </div>
      </Link>

      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700/50 bg-slate-800/40 text-xs text-slate-400">
        <Sparkles size={12} className="text-blue-400" />
        <span>Live from Data Cloud</span>
      </div>
    </div>
  </header>
);

export default Header;
