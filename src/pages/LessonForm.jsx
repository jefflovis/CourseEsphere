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
  status: yup.string().required("Status obrigatório").oneOf(["draft", "published", "archived"]),
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

        // Verifica se o usuário é criador ou instrutor
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
  }, [aulaId, courseId]);

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
    <div style={{ padding: "2rem" }}>
      <h2>{isEdit ? "Editar Aula" : "Criar Nova Aula"}</h2>

      {carregando ? (
        <p>Carregando dados...</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label>Título</label>
            <input {...register("title")} />
            <p>{errors.title?.message}</p>
          </div>

          <div>
            <label>Status</label>
            <select {...register("status")}>
              <option value="">Selecione</option>
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
              <option value="archived">Arquivado</option>
            </select>
            <p>{errors.status?.message}</p>
          </div>

          <div>
            <label>Data de Publicação</label>
            <input type="date" {...register("publish_date")} />
            <p>{errors.publish_date?.message}</p>
          </div>

          <div>
            <label>URL do Vídeo</label>
            <input {...register("video_url")} />
            <p>{errors.video_url?.message}</p>
          </div>

          <button type="submit">
            {isEdit ? "Salvar Alterações" : "Criar Aula"}
          </button>
        </form>
      )}
    </div>
  );
}
