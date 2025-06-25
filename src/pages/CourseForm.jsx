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
  const { id } = useParams(); // usado para edição
  const isEdit = Boolean(id);
  const [carregando, setCarregando] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
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
  }, [id]);

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
    <div style={{ padding: "2rem" }}>
      <h2>{isEdit ? "Editar Curso" : "Criar Novo Curso"}</h2>

      {carregando ? (
        <p>Carregando dados...</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label>Nome</label>
            <input {...register("name")} />
            <p>{errors.name?.message}</p>
          </div>
          <div>
            <label>Descrição</label>
            <textarea {...register("description")} />
            <p>{errors.description?.message}</p>
          </div>
          <div>
            <label>Data de Início</label>
            <input type="date" {...register("start_date")} />
            <p>{errors.start_date?.message}</p>
          </div>
          <div>
            <label>Data de Término</label>
            <input type="date" {...register("end_date")} />
            <p>{errors.end_date?.message}</p>
          </div>
          <button type="submit">
            {isEdit ? "Salvar Alterações" : "Criar Curso"}
          </button>
        </form>
      )}
    </div>
  );
}
