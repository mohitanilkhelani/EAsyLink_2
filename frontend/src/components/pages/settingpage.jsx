import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Pencil, Save, X } from "lucide-react";
import ViewTabs from "../standardUI/ViewTabs";
const API_URL = import.meta.env.VITE_API_URL;

export default function SettingsPage() {
  const [form, setForm] = useState({
    client_id: "",
    tenant_id: "",
    secret: ""
  });
  const [original, setOriginal] = useState({});
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    async function fetchCreds() {
      setLoading(true);
      const res = await fetch(`${API_URL}/credentials`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setForm({
          client_id: data.client_id || "",
          tenant_id: data.tenant_id || "",
          secret: data.secret || "",
        });
        setOriginal({
          client_id: data.client_id || "",
          tenant_id: data.tenant_id || "",
          secret: data.secret || "",
        });
        setEditing(false);
      }
      setLoading(false);
    }
    fetchCreds();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`${API_URL}//credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`
      },
      body: JSON.stringify(form)
    });
    setLoading(false);
    if (res.ok) {
      alert("Credentials updated!");
      setOriginal({ ...form }); // Save latest as original
      setEditing(false);
    } else {
      alert("Failed to update credentials.");
    }
  }

  function handleCancel() {
    setForm({ ...original });
    setEditing(false);
  }

  return (
    <div>
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">Power BI Settings</h2>
        {loading && <p>Loading...</p>}
        {!loading && (
          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <label className="block mb-1">Client ID</label>
              <Input
                name="client_id"
                placeholder="Client ID"
                value={form.client_id}
                onChange={handleChange}
                disabled={!editing}
                required
              />
            </div>
            <div>
              <label className="block mb-1">Tenant ID</label>
              <Input
                name="tenant_id"
                placeholder="Tenant ID"
                value={form.tenant_id}
                onChange={handleChange}
                disabled={!editing}
                required
              />
            </div>
            <div>
              <label className="block mb-1">Client Secret</label>
              <div className="relative flex items-center">
                <Input
                  name="secret"
                  type={showSecret ? "text" : "password"}
                  placeholder="Client Secret"
                  value={form.secret}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
           <div className="flex gap-3 mt-8">
            {editing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-1 w-1/2"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <X className="w-4 h-4" /> Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex items-center gap-1 w-1/2"
                  disabled={loading}
                >
                  <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                className="flex items-center gap-1 w-full"
                onClick={() => setEditing(true)}
              >
                <Pencil className="w-4 h-4" /> Edit
              </Button>
            )}
          </div>
          </form>
        )}
      </div>
    </div>
  );
}
