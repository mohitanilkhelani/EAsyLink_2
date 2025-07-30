import { useDashboardLayouts } from "@/contexts/DashboardLayoutContext"; // adjust the path

export default function LayoutListPage() {
  const { layouts, loading } = useDashboardLayouts();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">My Dashboard Layouts</h1>
      {loading && <div>Loading layouts...</div>}
      {!loading && layouts.length === 0 && (
        <div className="text-gray-600">No layouts saved yet.</div>
      )}
      {!loading && layouts.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {layouts.map((layout) => (
            <button
              key={layout.id}
              onClick={() => navigate(`/layout/${layout.id}`)}
              className="w-full text-left border rounded p-4 hover:bg-blue-50 transition"
            >
              <div className="font-semibold text-lg">{layout.layout_name}</div>
              <div className="text-xs text-gray-400">Created: {new Date(layout.created_at).toLocaleString()}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
