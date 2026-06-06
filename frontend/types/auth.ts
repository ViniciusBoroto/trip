export type LoginRequest = {
  email: string;
  password: string;
  remember: boolean;
};

export type LoginResponse = {
  ok?: boolean;
  message?: string;
  received?: {
    email?: string | null;
    hasPassword?: boolean;
    remember?: boolean | null;
  };
};
