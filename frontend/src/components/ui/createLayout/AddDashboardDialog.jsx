import React, { useMemo, useState } from "react";
import {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useReports } from "@/contexts/ReportContext";
import { toast } from "sonner"; // <-- Add this import at the top

// Truncate utility
function truncate(str, n = 50) {
  return str && str.length > n ? str.slice(0, n - 1) + "…" : str;
}

// Always normalize report to group_id
function normalizeReport(report) {
  return {
    ...report,
    group_id: report.group_id || report.workspace_id,
  };
}

export function AddDashboardDialog({ onAdd, addedReports }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState("");

  const { reports, loading } = useReports();

  const normalizedReports = useMemo(
    () => (Array.isArray(reports) ? reports.map(normalizeReport) : []),
    [reports]
  );
  const normalizedAdded = useMemo(
    () => (Array.isArray(addedReports) ? addedReports.map(normalizeReport) : []),
    [addedReports]
  );

  const notAdded = useMemo(() => {
    const term = search.toLowerCase();
    return normalizedReports
      .filter(
        (r) =>
          !normalizedAdded.some((a) => a.report_id === r.report_id) &&
          ((r.report_name && r.report_name.toLowerCase().includes(term)) ||
            ((r.workspace_name || "").toLowerCase().includes(term)))
      )
      .sort((a, b) => a.report_name.localeCompare(b.report_name));
  }, [normalizedReports, search, normalizedAdded]);

  const alreadyAdded = useMemo(() => {
    const term = search.toLowerCase();
    return normalizedReports
      .filter(
        (r) =>
          normalizedAdded.some((a) => a.report_id === r.report_id) &&
          ((r.report_name && r.report_name.toLowerCase().includes(term)) ||
            ((r.workspace_name || "").toLowerCase().includes(term)))
      )
      .sort((a, b) => a.report_name.localeCompare(b.report_name));
  }, [normalizedReports, search, normalizedAdded]);

  React.useEffect(() => {
    if (!open) {
      setSelected(null);
      setComment("");
      setTab("all");
      setSearch("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Dashboard
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl w-full p-6" style={{ maxHeight: "80vh" }}>
        <DialogTitle>Select a Power BI Report</DialogTitle>
        <Input
          placeholder="Search by report or workspace…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="my-1"
        />
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-2">
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="added">Added to Layout</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="mb-2 text-sm text-muted-foreground">
              {notAdded.length} result{notAdded.length !== 1 ? "s" : ""} found
            </div>
            {/* Shorter scroll area, normal selectors */}
            <div className="overflow-y-auto space-y-2 max-h-[22vh]">
              {loading ? (
                <div>Loading…</div>
              ) : notAdded.length === 0 ? (
                <div className="text-gray-500">No reports found.</div>
              ) : (
                notAdded.map((report) => (
                  <label
                    key={report.report_id}
                    className={
                      "px-3 py-2 rounded flex flex-col gap-1 cursor-pointer transition border " +
                      (selected && selected.report_id === report.report_id
                        ? "border-blue-400 bg-blue-50"
                        : "border-transparent hover:bg-blue-50")
                    }
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="select-report"
                        className="accent-blue-600"
                        checked={selected && selected.report_id === report.report_id}
                        onChange={() => setSelected(report)}
                      />
                      <div className="flex flex-col">
                        <span className="truncate font-medium">{truncate(report.report_name)}</span>
                        <span className="text-xs text-gray-500 pl-1">{report.workspace_name}</span>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
            {/* Comment input */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Comment
              </label>
              <Input
                type="text"
                placeholder="Add a comment for this report…"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </div>
          </TabsContent>
          <TabsContent value="added">
            <div className="mb-2 text-sm text-muted-foreground">
              {alreadyAdded.length} result{alreadyAdded.length !== 1 ? "s" : ""} found
            </div>
            <div className="overflow-y-auto space-y-2 max-h-[22vh]">
              {loading ? (
                <div>Loading…</div>
              ) : alreadyAdded.length === 0 ? (
                <div className="text-gray-500">No reports added.</div>
              ) : (
                alreadyAdded.map((report) => (
                  <div
                    key={report.report_id}
                    className="px-3 py-2 rounded flex flex-col gap-1 bg-gray-100 cursor-not-allowed border border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        disabled
                        className="accent-blue-600"
                      />
                      <div className="flex flex-col">
                        <span className="truncate font-medium">{truncate(report.report_name)}</span>
                        <span className="text-xs text-gray-500 pl-1">{report.workspace_name}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex gap-2 mt-6">
          <Button
            disabled={!selected}
            className="flex-1"
            onClick={() => {
              onAdd({ ...normalizeReport(selected), comment });
              setOpen(false);
              toast.success("Dashboard added to layout!");
            }}
          >
            Add to Layout
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline" className="flex-1">
              Cancel
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
