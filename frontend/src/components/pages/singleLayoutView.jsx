import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ViewReportCard from "../ui/viewLayout/ViewReportCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function SingleLayoutView() {
  const { layoutId } = useParams();
  const navigate = useNavigate();
  const [layout, setLayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const { user } = useAuth();
  const currentUserId = user.username;
  const currentUserName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ")
    : "You";

  useEffect(() => {
    setLoading(true);
    setFetchError(null);

    fetch(`${API_URL}/dashboard-layout/${layoutId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Layout fetch failed");
        return res.json();
      })
      .then((data) => {
        setLayout(data);
      })
      .catch((err) => {
        setLayout(null);
        setFetchError("Failed to load layout.");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [layoutId]);

  if (loading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center">
        <div className="text-blue-600 text-lg font-semibold mb-2">Loading layout and Power BI reports...</div>
        <div className="h-2 w-48 bg-blue-100 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-blue-400 animate-pulse" />
        </div>
      </div>
    );
  }

  if (fetchError) {
    return <div className="p-8 text-red-600">{fetchError}</div>;
  }

  if (!layout) {
    return <div className="p-8 text-red-600">Layout not found.</div>;
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header row */}
      <div className="w-full bg-white border-b py-2 px-6">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="text-gray-500 text-lg font-medium">Viewing layout</div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="text-blue-600 hover:text-blue-800 text-sm px-2"
              onClick={() => navigate("/home")}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50 text-sm px-2"
              onClick={() => navigate(`/layouts/${layoutId}/edit`)}
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Title/desc */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full px-4 pt-10">
        <div className="flex flex-col gap-1 w-full mb-8">
          <div className="font-bold text-3xl">{layout.layout_name}</div>
          {layout.description && (
            <div className="text-gray-600 text-base">{layout.description}</div>
          )}
        </div>
      </div>

      {/* Dashboard grid */}
      <div className="flex-1 w-full px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.isArray(layout.layout_data) && layout.layout_data.length > 0 ? (
            layout.layout_data.map((report) => (
              <ViewReportCard
                key={`${report.group_id || report.workspace_id}_${report.report_id}`}
                report={{
                  ...report,
                  group_id: report.group_id || report.workspace_id,
                }}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                layoutId={layoutId}
              />
            ))
          ) : (
            <div className="col-span-3 text-gray-500 text-center">
              No reports in this layout.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
