import { Link } from "react-router";
import { Database } from "lucide-react";

const Header = () => (
  <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur border-b border-slate-700/50">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
      <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600">
          <Database size={18} className="text-white" />
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">Data360 Segments</span>
      </Link>
    </div>
  </header>
);

export default Header;
