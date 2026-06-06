export type LoginRequest = {
  email: string;
  password: string;
  remember: boolean;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type AuthSuccessResponse = {
  ok: true;
  message: string;
  user: AuthUser;
  accessToken?: string;
  accessTokenExpiresAt?: string;
};

export type AuthErrorResponse = {
  ok: false;
  message: string;
};

export type LoginResponse = AuthSuccessResponse | AuthErrorResponse;
export type RefreshResponse = AuthSuccessResponse | AuthErrorResponse;
export type LogoutResponse = {
  ok: boolean;
  message: string;
};

export type MeResponse =
  | {
      ok: true;
      user: AuthUser;
    }
  | AuthErrorResponse;
