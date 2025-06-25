import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function CourseDetails() {
  const { user } = useAuth();
  const { id } = useParams(); // ID do curso
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [aulas, setAulas] = useState([]);
  const [filtroTitulo, setFiltroTitulo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const aulasPorPagina = 5;
  const [carregando, setCarregando] = useState(true);

  const isCriador = Number(curso?.creator_id) === Number(user.id);
  const isInstrutor = curso?.instructors?.includes(user.id);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const cursoRes = await axios.get(`http://localhost:3001/courses/${id}`);
        const cursoData = cursoRes.data;

        // Verifica permissão de acesso
        const acessoPermitido =
          Number(cursoData.creator_id) === Number(user.id) ||
          cursoData.instructors?.includes(user.id);

        if (!acessoPermitido) {
          navigate("/acesso-negado");
          return;
        }

        setCurso(cursoData);

        const aulasRes = await axios.get("http://localhost:3001/lessons");
        const aulasDoCurso = aulasRes.data.filter(
          (aula) => aula.course_id === id
        );
        setAulas(aulasDoCurso);
      } catch (err) {
        toast.error("Erro ao carregar curso");
      } finally {
        setCarregando(false);
      }
    };

    fetchDados();
  }, [id, navigate, user.id]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroTitulo, filtroStatus]);

  const aulasFiltradas = aulas.filter((aula) => {
    return (
      aula.title.toLowerCase().includes(filtroTitulo.toLowerCase()) &&
      (filtroStatus ? aula.status === filtroStatus : true)
    );
  });

  const totalPaginas = Math.ceil(aulasFiltradas.length / aulasPorPagina);
  const aulasPaginadas = aulasFiltradas.slice(
    (paginaAtual - 1) * aulasPorPagina,
    paginaAtual * aulasPorPagina
  );

  return (
    <div style={{ padding: "2rem" }}>
      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <>
          <h2>{curso.name}</h2>
          <p>{curso.description}</p>
          <p>
            {curso.start_date} até {curso.end_date}
          </p>

          <h4>Instrutores:</h4>
          <ul>
            <li><strong>{user.name}</strong> (Você)</li>
            {curso.instructors?.map((instrutorId) => (
              <li key={instrutorId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                Instrutor #{instrutorId}
                {isCriador && (
                  <button
                    onClick={async () => {
                      const confirmar = window.confirm("Remover este instrutor?");
                      if (confirmar) {
                        try {
                          const atualizados = curso.instructors.filter((id) => id !== instrutorId);
                          await axios.put(`http://localhost:3001/courses/${curso.id}`, {
                            ...curso,
                            instructors: atualizados,
                          });
                          setCurso((prev) => ({ ...prev, instructors: atualizados }));
                          toast.success("Instrutor removido");
                        } catch (err) {
                          toast.error("Erro ao remover instrutor");
                        }
                      }
                    }}
                  >
                    Remover
                  </button>
                )}
              </li>
            ))}
          </ul>

          {isCriador && (
            <button
              style={{ marginTop: "1rem" }}
              onClick={async () => {
                try {
                  const res = await axios.get("https://randomuser.me/api/");
                  const novoInstrutor = res.data.results[0].login.uuid;

                  if (curso.instructors.includes(novoInstrutor)) {
                    toast.warn("Este instrutor já foi adicionado.");
                    return;
                  }

                  const atualizados = [...curso.instructors, novoInstrutor];
                  await axios.put(`http://localhost:3001/courses/${curso.id}`, {
                    ...curso,
                    instructors: atualizados,
                  });

                  setCurso((prev) => ({
                    ...prev,
                    instructors: atualizados,
                  }));

                  toast.success("Novo instrutor adicionado!");
                } catch (err) {
                  toast.error("Erro ao adicionar instrutor");
                }
              }}
            >
              + Adicionar Instrutor Aleatório
            </button>
          )}

          {(isCriador || isInstrutor) && (
            <button onClick={() => navigate(`/cursos/${id}/aulas/nova`)}>
              + Criar nova aula
            </button>
          )}

          <h3 style={{ marginTop: "2rem" }}>Aulas</h3>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder="Buscar por título"
              value={filtroTitulo}
              onChange={(e) => setFiltroTitulo(e.target.value)}
            />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>

          {aulasFiltradas.length === 0 ? (
            <p>Nenhuma aula encontrada.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {aulasPaginadas.map((aula) => (
                <div
                  key={aula.id}
                  style={{
                    border: "1px solid #ccc",
                    padding: "1rem",
                    borderRadius: "8px",
                  }}
                >
                  <h4>{aula.title}</h4>
                  <p>Status: {aula.status}</p>
                  <p>Publicar em: {aula.publish_date}</p>
                  <p>
                    Vídeo:{" "}
                    <a href={aula.video_url} target="_blank" rel="noreferrer">
                      Ver vídeo
                    </a>
                  </p>

                  {(Number(aula.creator_id) === Number(user.id) || isCriador) && (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() =>
                          navigate(`/cursos/${id}/aulas/${aula.id}/editar`)
                        }
                      >
                        ✏️ Editar aula
                      </button>
                      <button
                        onClick={async () => {
                          const confirmar = window.confirm("Deseja realmente excluir esta aula?");
                          if (confirmar) {
                            try {
                              await axios.delete(`http://localhost:3001/lessons/${aula.id}`);
                              setAulas((prev) =>
                                prev.filter((a) => a.id !== aula.id)
                              );
                              toast.success("Aula excluída com sucesso.");
                            } catch (err) {
                              toast.error("Erro ao excluir aula.");
                            }
                          }
                        }}
                      >
                        🗑️ Excluir aula
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {totalPaginas > 1 && (
                <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                  <button
                    disabled={paginaAtual === 1}
                    onClick={() => setPaginaAtual((p) => p - 1)}
                  >
                    Anterior
                  </button>
                  <span>
                    Página {paginaAtual} de {totalPaginas}
                  </span>
                  <button
                    disabled={paginaAtual === totalPaginas}
                    onClick={() => setPaginaAtual((p) => p + 1)}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
