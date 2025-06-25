import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const schema = yup.object().shape({
  email: yup.string().email("Email inválido").required("Obrigatório"),
  password: yup.string().min(6, "Mínimo 6 caracteres").required("Obrigatório"),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const res = await axios.get(`http://localhost:3001/users?email=${data.email}&password=${data.password}`);
      if (res.data.length > 0) {
        login(res.data[0]);
        toast.success("Login bem-sucedido!");
        navigate("/");
      } else {
        toast.error("Email ou senha incorretos");
      }
    } catch (err) {
      toast.error("Erro na autenticação");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input placeholder="Email" {...register("email")} />
        <p>{errors.email?.message}</p>
        <input placeholder="Senha" type="password" {...register("password")} />
        <p>{errors.password?.message}</p>
        <button type="submit">Entrar</button>
      </form>
      <ToastContainer />
    </div>
  );
}
