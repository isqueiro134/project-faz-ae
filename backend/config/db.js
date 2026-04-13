import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function registerUser(email, password, fullName, userType) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      // Estes dados dentro de 'data' são os que o seu TRIGGER no SQL
      // vai capturar para criar a linha na tabela 'public.profiles'
      data: {
        full_name: fullName,
        user_type: userType, // 'freelancer' ou 'client'
      },
    },
  });

  if (error) {
    console.error("Erro ao cadastrar:", error.message);
    return { success: false, error: error.message };
  }

  console.log("Usuário cadastrado com sucesso!", data.user);
  return { success: true, user: data.user };
}

async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error("Erro ao logar:", error.message);
    return { success: false, error: error.message };
  }

  // O 'data.session' contém o Access Token que o RLS usará para te identificar
  console.log("Login realizado! Sessão ativa:", data.session);
  return { success: true, session: data.session };
}