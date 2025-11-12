import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import TopNav from './components/TopNav';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import { safeLoadNotes, safeSaveNotes, storageAvailable } from './utils/storage';

// Note schema: { id, title, body, createdAt, updatedAt }

const STORAGE_KEY = 'notes_app_v1';

// PUBLIC_INTERFACE
function App() {
  /** App-level UI theme (light/dark) retained from template */
  const [theme, setTheme] = useState('light');

  /** Core app state */
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('updated_desc'); // 'updated_desc' | 'title_asc'
  const [storageWarning, setStorageWarning] = useState(false);
  const mountedRef = useRef(false);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initial load from localStorage
  useEffect(() => {
    const available = storageAvailable('localStorage');
    setStorageWarning(!available);

    const loaded = safeLoadNotes(STORAGE_KEY);
    if (Array.isArray(loaded)) {
      setNotes(loaded);
      if (loaded.length > 0) {
        setSelectedNoteId(loaded[0].id);
      }
    }
    mountedRef.current = true;
  }, []);

  // Persist notes to localStorage whenever notes change (post-mount)
  useEffect(() => {
    if (!mountedRef.current) return;
    safeSaveNotes(STORAGE_KEY, notes);
  }, [notes]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  /** Derived data: filtered and sorted notes */
  const filteredSortedNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? notes.filter(n => (n.title || '').toLowerCase().includes(q) || (n.body || '').toLowerCase().includes(q))
      : notes.slice();

    if (sortOption === 'title_asc') {
      filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else {
      filtered.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }
    return filtered;
  }, [notes, searchQuery, sortOption]);

  const selectedNote = useMemo(
    () => notes.find(n => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  // PUBLIC_INTERFACE
  const handleCreateNew = () => {
    const id = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const now = Date.now();
    const newNote = {
      id,
      title: 'Untitled',
      body: '',
      createdAt: now,
      updatedAt: now,
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(id);
  };

  // PUBLIC_INTERFACE
  const handleDelete = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    setSelectedNoteId(prevId => {
      if (prevId === id) {
        // pick a safe next selection
        const remaining = notes.filter(n => n.id !== id);
        return remaining.length ? remaining[0].id : null;
      }
      return prevId;
    });
  };

  // PUBLIC_INTERFACE
  const handleDuplicate = (id) => {
    const src = notes.find(n => n.id === id);
    if (!src) return;
    const now = Date.now();
    const newId = `${now}_${Math.floor(Math.random() * 100000)}`;
    const copy = {
      ...src,
      id: newId,
      title: `${src.title || 'Untitled'} Copy`,
      createdAt: now,
      updatedAt: now,
    };
    setNotes(prev => [copy, ...prev]);
    setSelectedNoteId(newId);
  };

  // PUBLIC_INTERFACE
  const handleExplicitSave = (updated) => {
    setNotes(prev =>
      prev.map(n => (n.id === updated.id ? { ...updated, updatedAt: Date.now() } : n))
    );
  };

  // PUBLIC_INTERFACE
  const handleAutosave = (partial) => {
    // partial contains id and changed fields (title/body)
    setNotes(prev =>
      prev.map(n => {
        if (n.id !== partial.id) return n;
        const updated = { ...n, ...partial, updatedAt: Date.now() };
        return updated;
      })
    );
  };

  const onSelectNote = (id) => setSelectedNoteId(id);

  return (
    <div className="app-root">
      <TopNav
        theme={theme}
        onToggleTheme={toggleTheme}
        onCreateNew={handleCreateNew}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        storageWarning={storageWarning}
      />
      <div className="app-content">
        <aside className="sidebar">
          <NotesList
            notes={filteredSortedNotes}
            selectedId={selectedNoteId}
            onSelect={onSelectNote}
            onDelete={(id) => {
              const confirmDelete = window.confirm('Delete this note? This cannot be undone.');
              if (confirmDelete) handleDelete(id);
            }}
            sortOption={sortOption}
            onChangeSort={setSortOption}
          />
        </aside>
        <main className="editor-area">
          {selectedNote ? (
            <NoteEditor
              note={selectedNote}
              onAutosave={handleAutosave}
              onSave={handleExplicitSave}
              onDelete={() => {
                const confirmDelete = window.confirm('Delete this note? This cannot be undone.');
                if (confirmDelete) handleDelete(selectedNote.id);
              }}
              onDuplicate={() => handleDuplicate(selectedNote.id)}
            />
          ) : (
            <div className="empty-state">
              <h2>No note selected</h2>
              <p>Create a new note to get started.</p>
              <button className="btn primary" onClick={handleCreateNew}>+ New Note</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
