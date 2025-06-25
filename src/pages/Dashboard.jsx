import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Buscar cursos do usuário logado
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const res = await axios.get("http://localhost:3001/courses");
        const meusCursos = res.data.filter(
          (curso) =>
            Number(curso.creator_id) === Number(user.id) ||
            (curso.instructors || []).map(Number).includes(Number(user.id))

        );
        setCursos(meusCursos);
      } catch (err) {
        toast.error("Erro ao carregar cursos");
      } finally {
        setLoading(false);
      }
    };
    fetchCursos();
  }, [user.id]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const irParaNovoCurso = () => {
    navigate("/cursos/novo");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Olá, {user.name}</h2>
        <button onClick={handleLogout}>Sair</button>
      </div>

      <h3 style={{ marginTop: "2rem" }}>Meus Cursos</h3>
      <button onClick={irParaNovoCurso} style={{ marginBottom: "1rem" }}>
        + Criar novo curso
      </button>

      {loading ? (
        <p>Carregando...</p>
      ) : cursos.length === 0 ? (
        <p>Você ainda não participa de nenhum curso.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {cursos.map((curso) => {
            const ehCriador = Number(curso.creator_id) === Number(user.id);

            return (
              <div
                key={curso.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "1rem",
                  width: "250px",
                }}
              >
                <h4>{curso.name}</h4>
                <p>{curso.description}</p>
                <p>
                  {curso.start_date} até {curso.end_date}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <button onClick={() => navigate(`/cursos/${curso.id}`)}>
                    Ver detalhes
                  </button>

                  {ehCriador && (
                    <button
                      onClick={() => navigate(`/cursos/${curso.id}/editar`)}
                      style={{ backgroundColor: "#f0f0f0" }}
                    >
                      ✏️ Editar curso
                    </button>
                  )}
                </div>
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}
