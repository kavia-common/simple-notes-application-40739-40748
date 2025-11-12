import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Sidebar list of notes with sort options, selection, and delete action.
 */
function NotesList({ notes, selectedId, onSelect, onDelete, sortOption, onChangeSort }) {
  return (
    <div className="notes-list" aria-label="Notes list">
      <div className="list-toolbar">
        <strong style={{ fontSize: '0.95rem' }}>Notes ({notes.length})</strong>
        <label>
          <span className="sr-only">Sort by</span>
          <select
            className="sort-select"
            value={sortOption}
            onChange={(e) => onChangeSort(e.target.value)}
            aria-label="Sort notes"
          >
            <option value="updated_desc">Updated (newest)</option>
            <option value="title_asc">Title (A–Z)</option>
          </select>
        </label>
      </div>
      <ul className="notes" role="list">
        {notes.map((n) => (
          <li
            key={n.id}
            className={`note-item ${selectedId === n.id ? 'selected' : ''}`}
            onClick={() => onSelect(n.id)}
            role="listitem"
            aria-current={selectedId === n.id ? 'true' : 'false'}
          >
            <div>
              <h3 className="note-title" title={n.title || 'Untitled'}>
                {n.title || 'Untitled'}
              </h3>
              <p className="note-preview">
                {(n.body || '').trim() ? n.body : 'No content yet...'}
              </p>
              <div className="note-meta">
                {n.updatedAt ? new Date(n.updatedAt).toLocaleString() : ''}
              </div>
            </div>
            <div className="note-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className="icon-btn"
                onClick={() => onDelete(n.id)}
                aria-label={`Delete note ${n.title || 'Untitled'}`}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
        {notes.length === 0 && (
          <li className="note-item" role="listitem" style={{ cursor: 'default' }}>
            <div>
              <h3 className="note-title">No notes</h3>
              <p className="note-preview">Click “New Note” to create your first note.</p>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}

export default NotesList;
