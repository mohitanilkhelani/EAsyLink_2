import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { AddDashboardDialog } from "../ui/createLayout/AddDashboardDialog";
import { Save } from "lucide-react";
import EditInPlace from "../ui/createLayout/EditInPlace";
import DashboardGrid from "../ui/createLayout/dashboardGrid";
import { toast } from "sonner";
const API_URL = import.meta.env.VITE_API_URL;

  const { layoutId } = useParams();
  const navigate = useNavigate();
  const [dashboardReports, setDashboardReports] = useState([]);
  const [layoutTitle, setLayoutTitle] = useState("");
  const [layoutDesc, setLayoutDesc] = useState("");
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { sessionToken } = useAuth();

  useEffect(() => {
    // Fetch current layout and prefill
    setLoading(true);
    fetch(`${API_URL}/dashboard-layout/${layoutId}`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch layout");
        return res.json();
      })
      .then((data) => {
        setLayoutTitle(data.layout_name || "");
        setLayoutDesc(data.description || "");
        setDashboardReports(
          (data.layout_data || []).map((r) => ({
            report_id: r.report_id,
            group_id: r.group_id || r.workspace_id,
            dataset_id: r.dataset_id,
            report_name: r.report_name,
          }))
        );
      })
      .catch(() => {
        toast.error("Failed to fetch layout");
        navigate("/home");
      })
      .finally(() => setLoading(false));
  }, [layoutId, navigate]);

  function handleAddReport(report) {
    setDashboardReports(reports => {
      if (reports.some(r => r.report_id === report.report_id)) return reports;
      return [...reports, report];
    });
  }

  function handleRemoveReport(report_id) {
    setDashboardReports(reports =>
      reports.filter(r => r.report_id !== report_id)
    );
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = dashboardReports.findIndex(r => r.report_id === active.id);
    const newIndex = dashboardReports.findIndex(r => r.report_id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const updated = [...dashboardReports];
    const [moved] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, moved);
    setDashboardReports(updated);
  }

  async function handleSaveLayout() {
    if (!layoutTitle) {
      toast.error("Please enter a layout title.");
      return;
    }
    if (!dashboardReports.length) {
      alert("Add some dashboards first!");
      return;
    }
    const res = await fetch(`${API_URL}/dashboard-layout/${layoutId}`, {
      method: "PUT", // Use PUT for update
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        layout_name: layoutTitle,
        description: layoutDesc,
        layout_data: dashboardReports.map(r => ({
          report_id: r.report_id,
          group_id: r.group_id,
          dataset_id: r.dataset_id,
          report_name: r.report_name,
        })),
      }),
    });
    if (res.ok) {
      toast.success("Layout updated!");
      navigate(`/layout/${layoutId}`); // Go back to view page after save
    } else {
      alert("Error saving layout.");
    }
  }

  if (loading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center">
        <div className="text-blue-600 text-lg font-semibold mb-2">Loading layout for edit...</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="w-full bg-white border-b py-2 px-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="text-gray-500 text-lg font-medium">
            Editing your layout
          </div>
          <div className="flex gap-3">
            <AddDashboardDialog onAdd={handleAddReport} addedReports={dashboardReports} />
            <button
              className="bg-black text-white p-2 rounded-lg hover:bg-gray-800"
              onClick={handleSaveLayout}
              title="Save"
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
        />
      </div>
    </div>
  );
}
