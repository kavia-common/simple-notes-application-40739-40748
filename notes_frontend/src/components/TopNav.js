import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Top navigation bar with app title, search box, New Note button, theme toggle, and optional warning banner.
 */
function TopNav({ theme, onToggleTheme, onCreateNew, searchQuery, onSearchChange, storageWarning }) {
  return (
    <nav className="topnav" aria-label="Top Navigation">
      <div className="topnav-inner">
        <div className="brand" aria-label="Application title">
          <span className="logo" aria-hidden="true" />
          <h1>Simple Notes</h1>
        </div>

        <div className="search-box" role="search">
          <span aria-hidden="true" style={{ color: 'var(--muted)' }}>🔎</span>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search notes by title or body"
          />
        </div>

        <div className="actions">
          <button className="btn primary" onClick={onCreateNew} aria-label="Create new note">
            + New Note
          </button>
          <button
            className="btn"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        {storageWarning && (
          <div className="banner" role="status" aria-live="polite">
            Local storage is unavailable. Your changes may not persist.
          </div>
        )}
      </div>
    </nav>
  );
}

export default TopNav;
