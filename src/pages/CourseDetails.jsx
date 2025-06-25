import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Select,
  Card,
  CardContent,
  CardActions,
  Divider,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

export default function CourseDetails() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [aulas, setAulas] = useState([]);
  const [filtroTitulo, setFiltroTitulo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const aulasPorPagina = 5;

  const isCriador = Number(curso?.creator_id) === Number(user.id);
  const isInstrutor = curso?.instructors?.includes(user.id);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const cursoRes = await axios.get(`http://localhost:3001/courses/${id}`);
        const cursoData = cursoRes.data;

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {carregando ? (
        <Typography>Carregando...</Typography>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            {curso.name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {curso.description}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {curso.start_date} até {curso.end_date}
          </Typography>

          <Box my={3}>
            <Typography variant="h6">Instrutores</Typography>
            <ul>
              <li>
                <strong>{user.name}</strong> (Você)
              </li>
              {curso.instructors?.map((instrutorId) => (
                <li key={instrutorId}>
                  Instrutor #{instrutorId}
                  {isCriador && (
                    <Button
                      color="error"
                      size="small"
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
                          } catch {
                            toast.error("Erro ao remover instrutor");
                          }
                        }
                      }}
                    >
                      Remover
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </Box>

          {isCriador && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ mb: 2 }}
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
                } catch {
                  toast.error("Erro ao adicionar instrutor");
                }
              }}
            >
              Adicionar Instrutor Aleatório
            </Button>
          )}

          {(isCriador || isInstrutor) && (
            <Button
              variant="contained"
              sx={{ mb: 3 }}
              onClick={() => navigate(`/cursos/${id}/aulas/nova`)}
            >
              Criar Nova Aula
            </Button>
          )}

          <Typography variant="h5" gutterBottom>
            Aulas
          </Typography>

          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Buscar por título"
                fullWidth
                value={filtroTitulo}
                onChange={(e) => setFiltroTitulo(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                fullWidth
                displayEmpty
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <MenuItem value="">Todos os status</MenuItem>
                <MenuItem value="draft">Rascunho</MenuItem>
                <MenuItem value="published">Publicado</MenuItem>
                <MenuItem value="archived">Arquivado</MenuItem>
              </Select>
            </Grid>
          </Grid>

          {aulasFiltradas.length === 0 ? (
            <Typography>Nenhuma aula encontrada.</Typography>
          ) : (
            <Grid container spacing={2}>
              {aulasPaginadas.map((aula) => (
                <Grid item xs={12} md={6} key={aula.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{aula.title}</Typography>
                      <Typography>Status: {aula.status}</Typography>
                      <Typography>Publicar em: {format(parseISO(aula.publish_date), "dd/MM/yyyy")}</Typography>

                      {/* Miniatura do vídeo */}
                      <Box
                        sx={{
                          mt: 2,
                          position: "relative",
                          paddingTop: "56.25%", // proporção 16:9 para iframe responsivo
                          overflow: "hidden",
                          borderRadius: 1,
                        }}
                      >
                        <iframe
                          src={aula.video_url.replace("watch?v=", "embed/")}
                          title={aula.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                          }}
                        />
                      </Box>

                      <Typography sx={{ mt: 1 }}>
                        <a href={aula.video_url} target="_blank" rel="noreferrer">
                          Ver vídeo completo
                        </a>
                      </Typography>
                    </CardContent>

                    <CardActions>
                      {(Number(aula.creator_id) === Number(user.id) || isCriador) && (
                        <>
                          <IconButton
                            onClick={() =>
                              navigate(`/cursos/${id}/aulas/${aula.id}/editar`)
                            }
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={async () => {
                              const confirmar = window.confirm("Deseja excluir esta aula?");
                              if (confirmar) {
                                try {
                                  await axios.delete(`http://localhost:3001/lessons/${aula.id}`);
                                  setAulas((prev) => prev.filter((a) => a.id !== aula.id));
                                  toast.success("Aula excluída");
                                } catch {
                                  toast.error("Erro ao excluir aula");
                                }
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {totalPaginas > 1 && (
            <Box display="flex" justifyContent="center" mt={4} gap={2}>
              <Button
                variant="outlined"
                disabled={paginaAtual === 1}
                onClick={() => setPaginaAtual((p) => p - 1)}
              >
                Anterior
              </Button>
              <Typography>
                Página {paginaAtual} de {totalPaginas}
              </Typography>
              <Button
                variant="outlined"
                disabled={paginaAtual === totalPaginas}
                onClick={() => setPaginaAtual((p) => p + 1)}
              >
                Próxima
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
