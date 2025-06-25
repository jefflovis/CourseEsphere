import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  name: yup.string().required("Nome obrigatório").min(3),
  description: yup.string().max(500, "Máximo 500 caracteres"),
  start_date: yup.date().required("Data de início obrigatória"),
  end_date: yup
    .date()
    .required("Data de término obrigatória")
    .when("start_date", (start_date, schema) =>
      start_date
        ? schema.min(start_date, "Data final deve ser posterior à inicial")
        : schema
    ),
});

export default function CourseForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [carregando, setCarregando] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (isEdit) {
      setCarregando(true);
      axios.get(`http://localhost:3001/courses/${id}`).then((res) => {
        const curso = res.data;
        if (Number(curso.creator_id) !== Number(user.id)) {
          toast.error("Acesso negado");
          navigate("/");
        } else {
          setValue("name", curso.name);
          setValue("description", curso.description);
          setValue("start_date", curso.start_date);
          setValue("end_date", curso.end_date);
        }
        setCarregando(false);
      });
    }
  }, [id, setValue, navigate, user.id]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await axios.put(`http://localhost:3001/courses/${id}`, {
          ...data,
          creator_id: user.id,
        });
        toast.success("Curso atualizado");
      } else {
        await axios.post("http://localhost:3001/courses", {
          ...data,
          creator_id: user.id,
          instructors: [],
        });
        toast.success("Curso criado com sucesso");
      }
      navigate("/");
    } catch (err) {
      toast.error("Erro ao salvar curso");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 5 }}>
        <Typography variant="h5" gutterBottom>
          {isEdit ? "Editar Curso" : "Criar Novo Curso"}
        </Typography>

        {carregando ? (
          <Typography>Carregando dados...</Typography>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box mb={2}>
              <TextField
                label="Nome"
                fullWidth
                {...register("name")}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Box>

            <Box mb={2}>
              <TextField
                label="Descrição"
                fullWidth
                multiline
                rows={4}
                {...register("description")}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </Box>

            <Box mb={2}>
              <TextField
                label="Data de Início"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register("start_date")}
                error={!!errors.start_date}
                helperText={errors.start_date?.message}
              />
            </Box>

            <Box mb={2}>
              <TextField
                label="Data de Término"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register("end_date")}
                error={!!errors.end_date}
                helperText={errors.end_date?.message}
              />
            </Box>

            <Button variant="contained" color="primary" type="submit" fullWidth>
              {isEdit ? "Salvar Alterações" : "Criar Curso"}
            </Button>
          </form>
        )}
      </Paper>
    </Container>
  );
}
