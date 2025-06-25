import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// MUI
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const schema = yup.object().shape({
  email: yup.string().email("Email inválido").required("Obrigatório"),
  password: yup.string().min(6, "Mínimo 6 caracteres").required("Obrigatório"),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const res = await axios.get(
        `http://localhost:3001/users?email=${data.email}&password=${data.password}`
      );
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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        backgroundColor: "#f5f5f5", // opcional para fundo claro
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 400,
          padding: isSmallScreen ? 3 : 5,
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Login
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            label="Senha"
            type="password"
            fullWidth
            margin="normal"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2 }}
          >
            Entrar
          </Button>
        </form>
      </Paper>
      <ToastContainer />
    </Box>
  );
}
