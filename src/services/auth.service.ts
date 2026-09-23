import { apiFetch, ApiError, clearTokens, setTokens } from './http';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  registeredAt: string;
  role: string;
}

export type AuthError = 'invalid_credentials' | 'email_taken';

export interface AuthResult {
  user: User | null;
  error: AuthError | null;
}

interface UserDTO {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  date_joined: string;
}

interface LoginResponseDTO {
  access: string;
  refresh: string;
  user: UserDTO;
}

function adaptUser(dto: UserDTO): User {
  return {
    id: dto.id,
    name: `${dto.first_name} ${dto.last_name}`.trim() || dto.email,
    email: dto.email,
    phone: dto.phone,
    city: '',
    registeredAt: dto.date_joined.slice(0, 10),
    role: dto.role,
  };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    const data = await apiFetch<LoginResponseDTO>('/auth/login/', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password }),
    });
    setTokens(data.access, data.refresh);
    return { user: adaptUser(data.user), error: null };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 400)) {
      return { user: null, error: 'invalid_credentials' };
    }
    throw error;
  }
}

export async function register(name: string, email: string, password: string, phone: string, _city: string): Promise<AuthResult> {
  const [firstName, ...rest] = name.trim().split(' ');
  const lastName = rest.join(' ') || firstName;

  try {
    await apiFetch<UserDTO>('/auth/register/', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName, phone }),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 400 && error.hasFieldError('email')) {
      return { user: null, error: 'email_taken' };
    }
    throw error;
  }

  return login(email, password);
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const dto = await apiFetch<UserDTO>('/auth/me/');
    return adaptUser(dto);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export function logout(): void {
  clearTokens();
}
