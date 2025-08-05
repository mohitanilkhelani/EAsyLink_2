import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableCard from "./SortableCard";

export default function DashboardGrid({
  dashboardReports,
  expandedReportId,
  onExpand,
  onRemove,
  onDragEnd,
  onUpdateComments,
  currentUserId,
  currentUserName
}) {
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext
        items={dashboardReports.map(r => r.report_id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 transition-all">
          {dashboardReports.length === 0 ? (
            <div className="col-span-3 text-gray-400 text-lg text-center py-24 bg-white">
              No dashboards added yet.
            </div>
          ) : (
            dashboardReports.map(report => (
            <SortableCard
              key={report.report_id}
              report={report}
              expanded={expandedReportId === report.report_id}
              onExpand={onExpand}
              onClose={() => onExpand(null)}
              onRemove={onRemove}
              onUpdateComments={onUpdateComments}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
            />
          ))
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
