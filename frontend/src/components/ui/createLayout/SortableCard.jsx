import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical, X, Maximize2, Trash2, MessageCircle
} from "lucide-react";
import { PowerBIEmbed } from "./CreatePowerBIEmbed";
import CommentOverlay from "@/components/ui/CommentOverlay"; // adjust path as needed

export default function SortableCard({
  report,
  expanded,
  onExpand,
  onClose,
  onRemove,
  onUpdateComments,
  currentUserId,
  currentUserName
}) {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
    listeners,
    attributes,
  } = useSortable({ id: report.report_id });

  const [showComment, setShowComment] = useState(false);

  // All comments for this report
  const comments = Array.isArray(report.comments) ? report.comments : [];

  return (
    <>
      {expanded && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={onClose}
        />
      )}

      {/* Reusable CommentOverlay */}
      <CommentOverlay
        open={showComment}
        onClose={() => setShowComment(false)}
        comments={comments}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        onUpdateComments={updatedComments =>
          onUpdateComments(report.report_id, updatedComments)
        }
        allowAdd={true}
        allowEdit={true}
        title="Comments"
      />

      <div
        ref={setNodeRef}
        style={{
          transform: expanded
            ? undefined
            : CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.5 : 1,
          cursor: isDragging ? "grabbing" : "default",
          zIndex: expanded ? 100 : 1,
        }}
        className={
          "bg-white rounded-xl shadow border flex flex-col overflow-hidden group min-h-[400px] transition-all " +
          (expanded
            ? "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] h-[95vh] z-[100]"
            : "relative")
        }
      >
        <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b">
          <div className="flex items-center gap-2 min-w-0">
            {!expanded && (
              <div
                className="cursor-grab opacity-40 z-10"
                {...listeners}
                {...attributes}
                title="Drag to reorder"
                onClick={e => e.stopPropagation()}
              >
                <GripVertical className="w-4 h-4" />
              </div>
            )}
            <span className="font-medium text-sm truncate">{report.report_name}</span>
          </div>
          <div className="flex gap-2">
            {/* Comment display button */}
            <button
              onClick={() => setShowComment(true)}
              className="text-gray-500 p-1 rounded hover:bg-gray-100"
              title="View/Add comments"
              tabIndex={0}
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            {!expanded ? (
              <>
                <button
                  onClick={() => onExpand(report.report_id)}
                  className="text-blue-600 p-1 rounded hover:bg-blue-100"
                  title="Expand"
                  tabIndex={0}
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onRemove(report.report_id);
                  }}
                  className="text-red-500 rounded-full p-1 hover:bg-red-100"
                  title="Remove"
                  tabIndex={0}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="text-gray-700 p-1 rounded hover:bg-gray-200"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 min-h-0 flex flex-col h-full">
          <PowerBIEmbed report={report} large={expanded} />
        </div>
      </div>
    </>
  );
}
