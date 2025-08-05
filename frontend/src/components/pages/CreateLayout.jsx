import React, { useState } from "react";
import { AddDashboardDialog } from "../ui/createLayout/AddDashboardDialog";
import { Save } from "lucide-react";
import EditInPlace from "../ui/createLayout/EditInPlace";
import DashboardGrid from "../ui/createLayout/dashboardGrid";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
const API_URL = import.meta.env.VITE_API_URL;

export default function CreateLayout() {
  const navigate = useNavigate();
  const [dashboardReports, setDashboardReports] = useState([]);
  const [layoutTitle, setLayoutTitle] = useState("");
  const [layoutDesc, setLayoutDesc] = useState("");
  const [expandedReportId, setExpandedReportId] = useState(null);
  const canSaveLayout = !!layoutTitle.trim() && dashboardReports.length > 0;
  const { user, sessionToken } = useAuth();
  const currentUserId = user.username;
  const currentUserName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ")
    : "You";

  function handleAddReport(report) {
    setDashboardReports(reports => {
      if (reports.some(r => r.report_id === report.report_id)) return reports;
      const comments = report.comment
        ? [{
            text: report.comment,
            author: currentUserName,
            author_id: currentUserId,
            date: new Date().toISOString(),
          }]
        : [];
      return [...reports, { ...report, comments }];
    });
  }

  function handleRemoveReport(report_id) {
    setDashboardReports(reports =>
      reports.filter(r => r.report_id !== report_id)
    );
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = dashboardReports.findIndex(r => r.report_id === active.id);
      const newIndex = dashboardReports.findIndex(r => r.report_id === over.id);
      const updated = [...dashboardReports];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);
      setDashboardReports(updated);
    }
  }

  function handleUpdateComments(report_id, comments) {
    setDashboardReports(reports =>
      reports.map(r =>
        r.report_id === report_id
          ? { ...r, comments }
          : r
      )
    );
  }

  async function handleSaveLayout() {
    if (!layoutTitle) {
      toast.error("Please enter a layout title.");
      return;
    }
    if (!dashboardReports.length) {
      toast.error("Add some dashboards first!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/dashboard-layout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          layout_name: layoutTitle,
          description: layoutDesc,
          layout_data: dashboardReports.map(r => ({
            ...r,
            group_id: r.group_id || r.workspace_id,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success("Layout saved!");
        setTimeout(() => {
          navigate(`/layout/${data.id}`);
        }, 1200); // 1.2s to let the toast show, adjust as you like!
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.detail || "Error saving layout.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    }
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header row */}
      <div className="w-full bg-white border-b py-2 px-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="text-gray-500 text-lg font-medium">
            Creating your layout
          </div>
          <div className="flex gap-3">
            <AddDashboardDialog onAdd={handleAddReport} addedReports={dashboardReports} />
            <button
              className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500"
              onClick={handleSaveLayout}
              title="Save"
              disabled={!canSaveLayout}
            >
              <Save className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      {/* Title/desc */}
      <div className="max-w-[1280px] mx-auto w-full px-8 pt-10">
        <div className="flex flex-col gap-1 w-full mb-8">
          <EditInPlace
            value={layoutTitle}
            onChange={setLayoutTitle}
            placeholder="Layout Title"
            textClass="font-bold text-3xl cursor-pointer hover:underline text-left"
            inputClass="font-bold text-3xl px-1 border-b border-gray-300 focus:outline-none focus:border-blue-400 bg-white w-full text-left"
          />
          <EditInPlace
            value={layoutDesc}
            onChange={setLayoutDesc}
            placeholder="Add a description for your layout..."
            as="textarea"
            rows={3}
          />
        </div>
      </div>
      {/* Dashboard grid */}
      <div className="flex-1 w-full px-8 py-4">
        <DashboardGrid
          dashboardReports={dashboardReports}
          expandedReportId={expandedReportId}
          onExpand={setExpandedReportId}
          onRemove={handleRemoveReport}
          onDragEnd={handleDragEnd}
          onUpdateComments={handleUpdateComments}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />
      </div>
    </div>
  );
}
