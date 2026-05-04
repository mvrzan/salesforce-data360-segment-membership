import salesforceLogo from "../assets/salesforce_logo.svg";
import data360Logo from "../assets/data_cloud_logo.png";
import herokuLogo from "../assets/heroku.webp";

const Footer = () => (
  <footer className="bg-slate-900 border-t border-slate-700/50 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
        <div className="text-center md:text-left">
          <p className="text-white font-semibold text-lg">Data 360 Segments</p>
          <p className="text-slate-400 text-sm mt-1">Explore Salesforce Data 360 segments and their members.</p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <span className="text-slate-500 text-xs uppercase tracking-widest">Powered by</span>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-4 sm:gap-x-6">
            <a
              href="https://www.salesforce.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <img src={salesforceLogo} alt="Salesforce" className="h-7" />
              <span className="text-slate-500 text-xs">Salesforce</span>
            </a>

            <div className="w-px h-10 bg-slate-700/60 hidden sm:block" />

            <a
              href="https://www.salesforce.com/products/data/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <img src={data360Logo} alt="Data Cloud" className="h-7" />
              <span className="text-slate-500 text-xs">Data 360</span>
            </a>

            <div className="w-px h-10 bg-slate-700/60 hidden sm:block" />

            <a
              href="https://www.heroku.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <img src={herokuLogo} alt="Heroku" className="h-7" />
              <span className="text-slate-500 text-xs">Heroku</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div className="border-t border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-center sm:text-left">
        <span className="text-slate-500 text-sm">© {new Date().getFullYear()} Data 360 Segments</span>
        <a
          href="https://github.com/mvrzan"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center sm:justify-start gap-2 text-slate-400 text-sm hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Matija Vrzan
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
