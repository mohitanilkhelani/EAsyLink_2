import { useState } from "react";
import { Maximize2, X, MessageCircle } from "lucide-react";
import ViewPowerBIEmbed from "./ViewPowerBIEmbed";
import CommentOverlay from "@/components/ui/CommentOverlay";
const API_URL = import.meta.env.VITE_API_URL;

export default function ViewReportCard({
  report,
  currentUserId,
  currentUserName,
  layoutId,
}) {
  const [expanded, setExpanded] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [comments, setComments] = useState(
    Array.isArray(report.comments) ? report.comments : []
  );

  // Update local state & backend
  async function handleUpdateComments(updatedComments) {
    setComments(updatedComments);
    if (layoutId) {
      await fetch(
        `${API_URL}/dashboard-layout/${layoutId}/report-comments`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            report_id: report.report_id,
            comments: updatedComments,
          }),
        }
      );
    }
  }

  return (
    <>
      {/* Dim background when expanded */}
      {expanded && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Comment overlay */}
      <CommentOverlay
        open={showComment}
        onClose={() => setShowComment(false)}
        comments={comments}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        onUpdateComments={handleUpdateComments}
        allowAdd={true}
        allowEdit={true}
        title="Comments"
      />

      <div
        className={
          "bg-white rounded-xl shadow border flex flex-col overflow-hidden min-h-[400px] " +
          (expanded
            ? "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] h-[95vh] z-[100]"
            : "relative")
        }
        style={
          expanded
            ? {
                minWidth: 320,
                minHeight: 400,
                maxWidth: 1920,
                maxHeight: "98vh",
              }
            : { minHeight: 400 }
        }
      >
        {/* Header row */}
        <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b">
          <span className="font-medium text-sm truncate">{report.report_name}</span>
          <div className="flex gap-2">
            {/* Comment button */}
            <button
              onClick={() => setShowComment(true)}
              className="text-gray-500 p-1 rounded hover:bg-gray-100"
              title="View/Add comments"
              tabIndex={0}
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            {/* Expand/shrink button */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 p-1 rounded hover:bg-blue-100"
              title={expanded ? "Shrink" : "Expand"}
              tabIndex={0}
            >
              {expanded ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Power BI embed fills card */}
        <div className="flex-1 min-h-0 flex flex-col">
          <ViewPowerBIEmbed report={report} large={expanded} />
        </div>
      </div>
    </>
  );
}
