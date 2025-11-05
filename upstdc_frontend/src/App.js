import React, { useEffect, useState } from 'react';
import './App.css';
import AppRouter from './AppRouter';

function App() {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="App">
      <button
        className="theme-toggle"
        onClick={()=>setTheme(theme==='light'?'dark':'light')}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
      <AppRouter />
    </div>
  );
}

export default App;
