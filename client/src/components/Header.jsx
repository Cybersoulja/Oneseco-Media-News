import React from 'react';

const Header = ({ setView }) => {
  return (
    <header className="header">
      <div className="header-logo">
        <span className="logo-box">Y</span>
        <span className="title" onClick={() => setView('list')} style={{cursor: 'pointer'}}>Hacker News</span>
      </div>
      <nav className="header-nav">
        <a href="#" onClick={(e) => { e.preventDefault(); setView('list'); }}>new</a> |
        <a href="#" onClick={(e) => { e.preventDefault(); setView('submit'); }}>submit</a>
      </nav>
    </header>
  );
};

export default Header;
