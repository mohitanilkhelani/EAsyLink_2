import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardLayouts } from "@/contexts/DashboardLayoutContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
const API_URL = import.meta.env.VITE_API_URL;

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("login");
  const { login, isAuthenticated } = useAuth();
  const { fetchLayouts } = useDashboardLayouts();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Registration handler
  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.username.value,
        password: form.password.value,
        first_name: form.first_name.value,
        last_name: form.last_name.value,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      toast.success("Registration successful! Please log in.");
      setTab("login");
      form.reset();
    } else {
      toast.error(data.detail || "Registration failed");
    }
  }

  // Login handler
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    const params = new URLSearchParams();
    params.append("username", form.username.value);
    params.append("password", form.password.value);

    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      login(data.access_token, data.user);
      await fetchLayouts();
      toast.success("Login successful!");
      navigate("/home");
    } else {
      toast.error(data.detail || "Login failed");
    }
  }

  return (
    <div className="flex items-center justify-center">
      <Card className="mt-50 w-[400px] md:w-[480px] shadow-2xl rounded-2xl">
        <CardContent className="p-8">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <form className="space-y-6" onSubmit={handleLogin} autoComplete="on">
                <Input
                  name="username"
                  placeholder="Username"
                  autoComplete="username"
                  required
                  className="h-12 text-lg"
                />
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  className="h-12 text-lg"
                />
                <Button
                  type="submit"
                  className="w-full h-12 text-lg"
                  disabled={loading}
                >
                  {loading && tab === "login" ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>

            {/* Registration Form */}
            <TabsContent value="register">
              <form className="space-y-6" onSubmit={handleRegister} autoComplete="on">
                <div className="flex gap-4">
                  <Input
                    name="first_name"
                    placeholder="First Name"
                    required
                    className="h-12 text-lg w-1/2"
                  />
                  <Input
                    name="last_name"
                    placeholder="Last Name"
                    required
                    className="h-12 text-lg w-1/2"
                  />
                </div>
                <Input
                  name="username"
                  placeholder="Username"
                  required
                  autoComplete="username"
                  className="h-12 text-lg"
                />
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  autoComplete="new-password"
                  className="h-12 text-lg"
                />
                <Button
                  type="submit"
                  className="w-full h-12 text-lg"
                  disabled={loading}
                >
                  {loading && tab === "register" ? "Registering..." : "Register"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
