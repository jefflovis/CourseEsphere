import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/organisms/Layout";

export default function PrivateRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Envolve children no Layout que já inclui Header
  return <Layout>{children}</Layout>;
}
