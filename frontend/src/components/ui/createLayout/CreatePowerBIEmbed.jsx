import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { models } from "powerbi-client";
const API_URL = import.meta.env.VITE_API_URL;

export function PowerBIEmbed({ report }) {
  const [embedToken, setEmbedToken] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");    // <--- ADD THIS LINE
  const [loading, setLoading] = useState(true);
  const ref = useRef();

  const { sessionToken } = useAuth();
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setEmbedToken("");

    fetch(`${API_URL}/create-embed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        group_id: report.group_id || report.workspace_id,
        report_id: report.report_id,
        dataset_id: report.dataset_id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setEmbedToken(data.embed_token);
          setEmbedUrl(data.embed_url);
        }
      })
      .catch(() => setLoading(false));

    return () => {
      isMounted = false;
      if (window.powerbi && ref.current) {
        window.powerbi.reset(ref.current);
      }
    };
  }, [report, sessionToken]);

  useEffect(() => {
    if (!embedToken || !embedUrl || !ref.current) return;   // <--- Add embedUrl check!
    if (window.powerbi) window.powerbi.reset(ref.current);

    const reportEmbed = window.powerbi.embed(ref.current, {
      type: "report",
      id: report.report_id,
      embedUrl: embedUrl,
      accessToken: embedToken,
      tokenType: models.TokenType.Embed,
      settings: {
        panes: { filters: { visible: false }, pageNavigation: { visible: true } },
      },
    });

    reportEmbed.on("rendered", function () {
      setLoading(false);
    });
    reportEmbed.on("error", function () {
      setLoading(false);
    });

    return () => {
      reportEmbed.off("rendered");
      reportEmbed.off("error");
    };
  }, [embedToken, embedUrl, report]); // <--- Add embedUrl here!

   return (
    <div className="w-full h-full flex flex-col relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="text-blue-600 text-lg font-semibold">Loading Power BI...</div>
        </div>
      )}
      <div
        ref={ref}
        className="w-full h-full flex-1 rounded"
        style={{ background: "#f8fafc" }}
      />
    </div>
  );
}