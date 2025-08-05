// /src/components/hooks/useAuth.js
const useAuth = () => {
  return !!localStorage.getItem("access_token");
};
export default useAuth;
