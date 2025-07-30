import { useEffect, useRef, useState } from "react";
import { models } from "powerbi-client";
const API_URL = import.meta.env.VITE_API_URL;

export default function ViewPowerBIEmbed({ report, large }) {
  const ref = useRef();
  const [loading, setLoading] = useState(true);
  const [embedInfo, setEmbedInfo] = useState(null);

  useEffect(() => {
    setLoading(true);
    setEmbedInfo(null);
    fetch(`${API_URL}/create-embed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({
        group_id: report.group_id,
        report_id: report.report_id,
        dataset_id: report.dataset_id,
      }),
    })
      .then((res) => res.ok ? res.json() : Promise.reject("Token fetch failed"))
      .then((data) => setEmbedInfo(data))
      .catch((err) => {
        setEmbedInfo(null);
        setLoading(false);
        console.error("Failed to fetch embed info", err);
      });
  }, [report.group_id, report.report_id, report.dataset_id]);

  useEffect(() => {
    if (!embedInfo || !ref.current) return;

    setLoading(true);
    if (window.powerbi && ref.current) {
      window.powerbi.reset(ref.current);
    }

    const reportEmbed = window.powerbi.embed(ref.current, {
      type: "report",
      id: report.report_id,
      embedUrl: embedInfo.embed_url,
      accessToken: embedInfo.embed_token,
      tokenType: models.TokenType.Embed,
      settings: {
        panes: { filters: { visible: false }, pageNavigation: { visible: true } },
      },
    });

    reportEmbed.on("rendered", () => setLoading(false));
    reportEmbed.on("error", () => setLoading(false));

    return () => {
      if (window.powerbi && ref.current) {
        window.powerbi.reset(ref.current);
      }
    };
  }, [embedInfo, report.report_id]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#f3f4f6",
        }}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="text-blue-600 text-lg font-semibold">Loading Power BI...</div>
        </div>
      )}
    </div>
  );
}
