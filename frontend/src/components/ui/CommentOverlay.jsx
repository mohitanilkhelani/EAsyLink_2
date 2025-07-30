import { useState } from "react";
import { X, Send, Edit3 } from "lucide-react";

// Helper: get readable date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString();
}

export default function CommentOverlay({
  open,
  onClose,
  comments,
  currentUserId,
  currentUserName,
  onUpdateComments,
  allowAdd = true,
  allowEdit = true,
  title = "Comments",
}) {
  const [newComment, setNewComment] = useState("");
  const [editingIdx, setEditingIdx] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Find the last comment by current user
  const lastMineIdx = (() => {
    if (!Array.isArray(comments)) return null;
    for (let i = comments.length - 1; i >= 0; i--) {
      if (comments[i].author_id === currentUserId) return i;
    }
    return null;
  })();

  function handleAddComment() {
    if (!newComment.trim()) return;
    const updated = [
      ...comments,
      {
        text: newComment,
        author: currentUserName,
        author_id: currentUserId,
        date: new Date().toISOString(),
      }
    ];
    onUpdateComments(updated);
    setNewComment("");
  }

  function handleStartEdit(idx, text) {
    setEditingIdx(idx);
    setEditValue(text);
  }
  function handleSaveEdit(idx) {
    const updated = comments.map((c, i) =>
      i === idx ? { ...c, text: editValue, date: new Date().toISOString() } : c
    );
    onUpdateComments(updated);
    setEditingIdx(null);
    setEditValue("");
  }
  function handleCancelEdit() {
    setEditingIdx(null);
    setEditValue("");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          onClose?.();
          setEditingIdx(null);
          setEditValue("");
        }}
      />
      <div className="z-[1000] bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6 flex flex-col items-center">
        <div className="font-bold mb-2 text-lg flex w-full justify-between items-center">
          <span>{title}</span>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400 hover:text-gray-700" />
          </button>
        </div>
        <div className="w-full flex-1 max-h-60 overflow-y-auto space-y-4">
          {comments.length === 0 ? (
            <div className="text-gray-400">No comments yet.</div>
          ) : (
            comments.map((c, i) => {
              const canEdit = allowEdit && i === lastMineIdx && c.author_id === currentUserId;
              return (
                <div key={i} className="flex flex-col border-b pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">{c.author}</span>
                    <span className="text-xs text-gray-400">{formatDate(c.date)}</span>
                    {canEdit && (
                      <button
                        className="ml-2 text-xs text-blue-600 flex items-center gap-1"
                        onClick={() => handleStartEdit(i, c.text)}
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    )}
                  </div>
                  {editingIdx === i ? (
                    <div className="flex gap-2 items-center">
                      <input
                        className="border p-1 rounded text-sm flex-1"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                      />
                      <button
                        onClick={() => handleSaveEdit(i)}
                        className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-xs px-2 py-1 rounded text-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-700 whitespace-pre-line break-words">{c.text}</div>
                  )}
                </div>
              );
            })
          )}
        </div>
        {allowAdd && (
          <div className="flex mt-4 w-full gap-2">
            <input
              className="border p-2 rounded flex-1 text-sm"
              placeholder="Add a comment…"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAddComment(); }}
            />
            <button
              className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
