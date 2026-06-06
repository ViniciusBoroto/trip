export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password.')
    this.name = 'InvalidCredentialsError'
  }
}

export class InvalidAuthInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidAuthInputError'
  }
}

export class EmailAlreadyTakenError extends Error {
  constructor() {
    super('An account with this email already exists.')
    this.name = 'EmailAlreadyTakenError'
  }
}

export class InactiveUserError extends Error {
  constructor() {
    super('User account is inactive.')
    this.name = 'InactiveUserError'
  }
}

export class InvalidRefreshTokenError extends Error {
  constructor() {
    super('Refresh token is invalid or expired.')
    this.name = 'InvalidRefreshTokenError'
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required.') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class AuthConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthConfigurationError'
  }
}
