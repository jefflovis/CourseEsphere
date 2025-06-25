import {
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const schema = yup.object().shape({
  title: yup.string().required("Título obrigatório").min(3),
  status: yup
    .string()
    .required("Status obrigatório")
    .oneOf(["draft", "published", "archived"]),
  publish_date: yup
    .date()
    .required("Data obrigatória")
    .min(new Date(), "A data deve ser no futuro"),
  video_url: yup.string().url("URL inválida").required("URL do vídeo obrigatória"),
});

export default function LessonForm() {
  const { user } = useAuth();
  const { id: courseId, aulaId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(aulaId);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [carregando, setCarregando] = useState(true);
  const [curso, setCurso] = useState(null);

  useEffect(() => {
    const fetchCurso = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/courses/${courseId}`);
        setCurso(res.data);

        const isCriador = Number(res.data.creator_id) === Number(user.id);
        const isInstrutor = (res.data.instructors || []).map(Number).includes(Number(user.id));

        if (!isCriador && !isInstrutor) {
          toast.error("Você não tem permissão para acessar esta página.");
          navigate("/");
        }

        if (isEdit) {
          const resAula = await axios.get(`http://localhost:3001/lessons/${aulaId}`);
          const aula = resAula.data;

          if (Number(aula.creator_id) !== Number(user.id) && !isCriador) {
            toast.error("Você não tem permissão para editar esta aula.");
            navigate(`/cursos/${courseId}`);
          } else {
            setValue("title", aula.title);
            setValue("status", aula.status);
            setValue("publish_date", aula.publish_date);
            setValue("video_url", aula.video_url);
          }
        }
      } catch (err) {
        toast.error("Erro ao carregar dados");
        navigate("/");
      } finally {
        setCarregando(false);
      }
    };

    fetchCurso();
  }, [aulaId, courseId, isEdit, navigate, setValue, user.id]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await axios.put(`http://localhost:3001/lessons/${aulaId}`, {
          ...data,
          course_id: courseId,
          creator_id: user.id,
        });
        toast.success("Aula atualizada");
      } else {
        await axios.post("http://localhost:3001/lessons", {
          ...data,
          course_id: courseId,
          creator_id: user.id,
        });
        toast.success("Aula criada");
      }
      navigate(`/cursos/${courseId}`);
    } catch (err) {
      toast.error("Erro ao salvar aula");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 5 }}>
        <Typography variant="h5" gutterBottom>
          {isEdit ? "Editar Aula" : "Criar Nova Aula"}
        </Typography>

        {carregando ? (
          <Typography>Carregando dados...</Typography>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Box mb={2}>
              <TextField
                label="Título"
                fullWidth
                {...register("title")}
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            </Box>

            <Box mb={2}>
              <TextField
                label="Status"
                fullWidth
                select
                defaultValue=""
                {...register("status")}
                error={!!errors.status}
                helperText={errors.status?.message}
              >
                <MenuItem value="draft">Rascunho</MenuItem>
                <MenuItem value="published">Publicado</MenuItem>
                <MenuItem value="archived">Arquivado</MenuItem>
              </TextField>
            </Box>

            <Box mb={2}>
              <TextField
                label="Data de Publicação"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register("publish_date")}
                error={!!errors.publish_date}
                helperText={errors.publish_date?.message}
              />
            </Box>

            <Box mb={2}>
              <TextField
                label="URL do Vídeo"
                fullWidth
                {...register("video_url")}
                error={!!errors.video_url}
                helperText={errors.video_url?.message}
              />
            </Box>

            <Button variant="contained" color="primary" type="submit" fullWidth>
              {isEdit ? "Salvar Alterações" : "Criar Aula"}
            </Button>
          </form>
        )}
      </Paper>
    </Container>
  );
}
