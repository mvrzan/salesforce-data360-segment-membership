import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <div className="min-h-screen bg-slate-950 flex flex-col">
    <Header />
    {children}
    <Footer />
  </div>
);

export default Layout;
