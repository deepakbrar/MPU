import React from 'react';
import { Mail, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#004A98] text-white py-6 mt-auto border-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Copyright Section */}
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-blue-200" />
            <p className="text-sm text-blue-100">
              © {currentYear} All rights reserved by <span className="font-semibold text-white">Atica Global</span>
            </p>
          </div>
          
          {/* Support Section */}
          <div className="flex items-center gap-2 text-sm">
            <Mail size={18} className="text-blue-200" />
            <span className="text-blue-100">For questions, concerns, or support:</span>
            <a 
              href="mailto:deepak@aticaglobal.com"
              className="font-medium text-white hover:text-blue-200 transition-colors underline decoration-blue-300 hover:decoration-white"
            >
              deepak@aticaglobal.com
            </a>
          </div>
          
        </div>
      </div>
    </footer>
  );
};
