import salesforceLogo from "../assets/vite.svg";

const Footer = () => (
  <footer className="bg-slate-900 border-t border-slate-700/50 mt-auto">
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white font-semibold">Data360 Segments</p>
          <p className="text-slate-400 text-sm mt-1">Explore Salesforce Data Cloud segments and their members.</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="text-slate-500 text-xs uppercase tracking-widest">Powered by</span>
          <div className="flex items-center gap-6">
            <a
              href="https://www.salesforce.com/data/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <img src={salesforceLogo} alt="Salesforce" className="h-7" />
              <span className="text-slate-500 text-xs">Salesforce</span>
            </a>
          </div>
        </div>
      </div>
    </div>
    <div className="border-t border-slate-700/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <span className="text-slate-500 text-sm">© {new Date().getFullYear()} Data360 Segments</span>
        <a
          href="https://github.com/mvrzan"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 text-sm hover:text-white transition-colors"
        >
          @mvrzan
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
