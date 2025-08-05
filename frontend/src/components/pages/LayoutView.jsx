import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Container from "@/components/standardUI/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star , ChevronRight, Calendar, UserCircle, Search, ChevronLeft, ChevronRight as ArrowRight, Trash } from "lucide-react";
import LoadingPage from "@/components/standardUI/LoadingPage";
import { toast } from "sonner"; 
const API_URL = import.meta.env.VITE_API_URL;


const PAGE_SIZE = 8;

  const [layouts, setLayouts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const { sessionToken } = useAuth();

  async function deleteLayout(layoutId) {
    if (!window.confirm("Delete this layout? This cannot be undone.")) return;
    const res = await fetch(`${API_URL}/dashboard-layout/${layoutId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    if (res.ok) {
      toast.success("Layout deleted.");
      fetchLayouts();
    } else {
      toast.error("Failed to delete layout.");
    }
  }

  async function fetchLayouts() {
    setLoading(true);
    const res = await fetch(`${API_URL}/dashboard-layouts`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    if (res.ok) {
      const data = await res.json();
      setLayouts(data);
      setFiltered(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchLayouts();
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFiltered(layouts);
    } else {
      setFiltered(
        layouts.filter(
          l =>
            l.layout_name?.toLowerCase().includes(q) ||
            l.description?.toLowerCase().includes(q)
        )
      );
    }
    setPage(1);
  }, [search, layouts]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const startIdx = (page - 1) * PAGE_SIZE;
  const paginated = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  // --- TOGGLE FAVORITE ---
  async function toggleFavorite(layout, nextFav) {
    await fetch(`${API_URL}/${layout.id}/favorite?favorite=${nextFav}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    // Re-fetch layouts for up-to-date sort
    fetchLayouts();
  }

  return (
    <Container>
      <div className="flex flex-col w-full">
        {/* Header on top */}
        <h1 className="text-xl font-semibold mb-2 mt-6">My Dashboard Layouts</h1>
        {/* Search bar */}
        <div className="w-full flex justify-start mb-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              className="w-full rounded-md border border-gray-200 bg-white py-1.5 pl-10 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Search layouts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading && <LoadingPage message="Loading layouts..." />}
        {!loading && filtered.length === 0 && (
          <div className="text-center text-gray-400 py-12">No layouts found.</div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="relative w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 w-full">
              {paginated.map(layout => (
                <Card
                  key={layout.id}
                  className="group transition shadow hover:shadow-lg cursor-pointer rounded-xl"
                  onClick={() => navigate(`/layout/${layout.id}`)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarFallback>
                            {layout.layout_name?.[0]?.toUpperCase() || "L"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-semibold text-base truncate max-w-[110px]">
                          {layout.layout_name || "Layout"}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className={"rounded-full " + (layout.is_favorite ? "text-yellow-400" : "text-gray-400")}
                          onClick={e => {
                            e.stopPropagation();
                            toggleFavorite(layout, !layout.is_favorite);
                          }}
                          aria-label="Favorite"
                          tabIndex={-1}
                        >
                          {layout.is_favorite
                            ? <Star fill="currentColor" className="w-5 h-5" />
                            : <Star className="w-5 h-5" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full text-gray-400 hover:text-red-500"
                          onClick={e => {
                            e.stopPropagation();
                            deleteLayout(layout.id);
                          }}
                          aria-label="Delete"
                          tabIndex={-1}
                        >
                          <Trash className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                    {/* Description */}
                    <div className="mb-2 text-sm text-gray-700 line-clamp-2 min-h-[32px]">
                      {layout.description || "No description added for this layout."}
                    </div>
                    {/* Meta: Created date/by */}
                    <div className="flex flex-col gap-1 text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Created: {layout.created_at ? new Date(layout.created_at).toLocaleDateString() : "-"}
                      </div>
                      <div className="flex items-center gap-1">
                        <UserCircle className="w-4 h-4" />
                        Created By: {layout.created_by || "-"}
                      </div>
                    </div>
                    {/* Expand / Go to details */}
                    <div className="flex justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full hover:bg-gray-200"
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/layout/${layout.id}`);
                        }}
                        aria-label="Open"
                        tabIndex={-1}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Pagination bottom right */}
            <div className="absolute right-0 -bottom-10 flex gap-2 items-center">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                aria-label="Next"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
