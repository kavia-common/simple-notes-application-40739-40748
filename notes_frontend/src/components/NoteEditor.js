import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * Editor for a single note with debounced autosave and explicit Save, Duplicate, Delete actions.
 */
function NoteEditor({ note, onAutosave, onSave, onDelete, onDuplicate }) {
  const [title, setTitle] = useState(note.title || '');
  const [body, setBody] = useState(note.body || '');
  const [savedIndicator, setSavedIndicator] = useState('');
  const textareaRef = useRef(null);
  const debounceTimer = useRef(null);

  // Keep local state in sync if parent changes selected note
  useEffect(() => {
    setTitle(note.title || '');
    setBody(note.body || '');
    // reset indicator when switching
    setSavedIndicator('');
    autoResize();
  }, [note.id]); // only when switching to a different note

  // Auto-resize textarea based on content
  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 180)}px`;
  };

  useEffect(() => {
    autoResize();
  }, [body]);

  // Debounce autosave ~500ms
  useEffect(() => {
    if (!note?.id) return;
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onAutosave({ id: note.id, title, body });
      setSavedIndicator('Saved');
      setTimeout(() => setSavedIndicator(''), 900);
    }, 500);
    return () => clearTimeout(debounceTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body, note.id]);

  const handleSaveClick = () => {
    onSave({ ...note, title, body });
    setSavedIndicator('Saved');
    setTimeout(() => setSavedIndicator(''), 1200);
  };

  const updatedAt = useMemo(() => {
    return note.updatedAt ? new Date(note.updatedAt).toLocaleString() : '';
  }, [note.updatedAt]);

  return (
    <div className="note-editor" aria-label="Note editor">
      <div className="editor-toolbar">
        <div className="toolbar-left" style={{ flex: 1 }}>
          <input
            className="title-input"
            type="text"
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Note title"
          />
        </div>
        <div className="toolbar-right">
          <span className="status" aria-live="polite">
            {savedIndicator || (updatedAt ? `Updated ${updatedAt}` : '')}
          </span>
          <button className="btn secondary" onClick={onDuplicate} aria-label="Duplicate note">
            Duplicate
          </button>
          <button className="btn danger" onClick={onDelete} aria-label="Delete note">
            Delete
          </button>
          <button className="btn primary" onClick={handleSaveClick} aria-label="Save note">
            Save
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        className="textarea"
        placeholder="Start typing your note..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onInput={autoResize}
        aria-label="Note body"
      />
    </div>
  );
}

export default NoteEditor;
