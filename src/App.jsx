import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import CourseForm from "./pages/CourseForm";
import CourseDetails from "./pages/CourseDetails";
import LessonForm from "./pages/LessonForm";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/cursos/novo"
            element={
              <PrivateRoute>
                <CourseForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/cursos/:id/editar"
            element={
              <PrivateRoute>
                <CourseForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/cursos/:id"
            element={
              <PrivateRoute>
                <CourseDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/cursos/:id/aulas/nova"
            element={
              <PrivateRoute>
                <LessonForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/cursos/:id/aulas/:aulaId/editar"
            element={
              <PrivateRoute>
                <LessonForm />
              </PrivateRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
