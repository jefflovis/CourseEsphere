import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Container,
} from "@mui/material";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const irParaNovoCurso = () => {
    navigate("/cursos/novo");
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Olá, {user.name}
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
        <Typography variant="h5">Meus Cursos</Typography>
        <Button variant="contained" color="primary" onClick={irParaNovoCurso}>
          + Criar novo curso
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : cursos.length === 0 ? (
        <Typography mt={4}>Você ainda não participa de nenhum curso.</Typography>
      ) : (
        <Grid container spacing={3} mt={2}>
          {cursos.map((curso) => {
            const ehCriador = Number(curso.creator_id) === Number(user.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={curso.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {curso.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {curso.description}
                    </Typography>
                    <Typography variant="caption" display="block" mt={1}>
                      {format(parseISO(curso.start_date),"dd/MM/yyyy")} até {format(parseISO(curso.end_date), "dd/MM/yyyy")}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate(`/cursos/${curso.id}`)}>
                      Ver detalhes
                    </Button>
                    {ehCriador && (
                      <Button
                        size="small"
                        onClick={() => navigate(`/cursos/${curso.id}/editar`)}
                        color="secondary"
                      >
                        ✏️ Editar
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}
