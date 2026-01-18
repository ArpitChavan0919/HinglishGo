
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-8 px-6 text-center">
      <div className="inline-flex items-center justify-center bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold mb-4 tracking-wide uppercase">
        Beta Version
      </div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-3">
        Hinglish<span className="text-blue-600">Go</span>
      </h1>
      <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
        Translate English or Hindi into natural, conversational Hinglish instantly.
      </p>
    </header>
  );
};

export default Header;
