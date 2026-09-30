const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(email: string, password: string): string | null {
  if (!emailPattern.test(email.trim())) return "Ingresa un correo válido.";
  if (!password) return "Ingresa tu contraseña.";
  return null;
}

export function validateRegistration(name: string, email: string, password: string): string | null {
  if (!name.trim()) return "Ingresa tu nombre.";
  const loginError = validateLogin(email, password);
  if (loginError) return loginError;
  if (password.length < 8) return "Usa una contraseña de al menos 8 caracteres.";
  return null;
}
