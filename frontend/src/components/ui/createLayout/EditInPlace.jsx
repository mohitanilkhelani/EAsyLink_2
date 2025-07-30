import { useState } from "react";

/**
 * EditInPlace
 * - For `as="textarea"`: displays a soft, modern, large edit area.
 * - Shows subtle tip: "Press Ctrl+Enter to save" when editing.
 * - Click the area to edit.
 */
export default function EditInPlace({
  value,
  onChange,
  placeholder,
  textClass = "",
  inputClass = "",
  as = "input", // or "textarea"
  rows = 3,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function startEdit(e) {
    e.stopPropagation();
    setDraft(value);
    setEditing(true);
  }
  function saveEdit() {
    onChange(draft.trim());
    setEditing(false);
  }
  function handleKeyDown(e) {
    if (
      (as === "textarea" && e.key === "Enter" && (e.ctrlKey || e.metaKey)) ||
      (as !== "textarea" && e.key === "Enter")
    ) {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === "Escape") setEditing(false);
  }

  // Editing state
  if (editing) {
    if (as === "textarea") {
      return (
        <div className="relative w-full group">
          <textarea
            className={
              inputClass ||
              "block w-full text-gray-700 text-base pl-2 py-3 border-gray-300 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition shadow-sm resize-none"
            }
            value={draft}
            autoFocus
            rows={rows}
            onChange={e => setDraft(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={400}
            style={{ minHeight: 80, fontSize: "1.06rem" }}
          />
          <span className="absolute bottom-2 right-4 text-xs text-gray-400 select-none pointer-events-none">
            Press <b>Ctrl+Enter</b> to save
          </span>
        </div>
      );
    }
    // Input mode
    return (
      <input
        className={
          inputClass ||
          "font-bold text-3xl px-1 border-b border-gray-300 focus:outline-none  focus:border-blue-400 bg-white w-full text-left"
        }
        value={draft}
        autoFocus
        onChange={e => setDraft(e.target.value)}
        onBlur={saveEdit}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={100}
      />
    );
  }

  // Display state
  return (
    <span
      className={
        textClass ||
        (as === "textarea"
          ? "block w-full text-gray-600 text-base cursor-pointer hover:bg-gray-100 rounded-xl pl-1 py-3 transition text-left"
          : "font-bold text-3xl cursor-pointer hover:underline text-left")
      }
      onClick={startEdit}
      title="Click to edit"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && startEdit(e)}
      role="button"
      style={as === "textarea" ? { whiteSpace: "pre-line", minHeight: 56 } : undefined}
    >
      {value ? (
        value
      ) : (
        <span className="text-gray-400 italic">{placeholder}</span>
      )}
    </span>
  );
}
