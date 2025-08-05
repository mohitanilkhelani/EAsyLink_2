// src/components/standardUI/LoadingPage.jsx
import { Loader2 } from "lucide-react";

export default function LoadingPage({ message = "Loading..." }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-gray-500 mb-4" />
      <span className="text-lg text-gray-700">{message}</span>
    </div>
  );
}
