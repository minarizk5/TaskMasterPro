import { FC, ReactNode, useState } from "react";
import Sidebar from "@/components/sidebar/sidebar";
import MobileSidebar from "@/components/sidebar/mobile-sidebar";
import { useAuth } from "@/hooks/use-auth";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background bg-gradient-to-br from-background to-background/50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 shadow-sm">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="p-2 rounded-md text-foreground hover:bg-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            TaskMasterPro
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">          
          <div className="w-9 h-9 rounded-full bg-primary/10 overflow-hidden shadow-sm border border-gray-700">
            {user?.avatar ? (
              <img src={user.avatar} alt="User avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-sm font-semibold text-primary">
                {user?.name?.charAt(0) || user?.username?.charAt(0) || '?'}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Sidebar (overlay) */}
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none pt-6 md:pt-8 lg:pt-6 px-4 md:px-8 pb-20 lg:pb-8 mt-14 lg:mt-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-gray-900/90 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.2)] border-t border-gray-800 h-16 z-10 rounded-t-xl">
        <div className="grid h-full grid-cols-4 px-2">
          <a href="/" className="flex flex-col items-center justify-center text-primary relative">
            <div className="absolute -top-3 w-8 h-1 bg-primary rounded-full opacity-70 transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs mt-1 font-medium">Tasks</span>
          </a>
          <a href="/calendar" className="flex flex-col items-center justify-center text-gray-400 hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs mt-1 font-medium">Calendar</span>
          </a>
          <a href="/analytics" className="flex flex-col items-center justify-center text-gray-400 hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs mt-1 font-medium">Analytics</span>
          </a>
          <a href="/profile" className="flex flex-col items-center justify-center text-gray-400 hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1 font-medium">Profile</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
