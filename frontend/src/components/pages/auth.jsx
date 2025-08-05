const API_URL = import.meta.env.VITE_API_URL;

export default function Auth() {
  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="mt-50 w-[400px] md:w-[480px] shadow-2xl rounded-2xl">
        <CardContent className="p-8 flex flex-col items-center">
          <Button
            onClick={login}
            className="w-full h-12 text-lg"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in with Microsoft"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
