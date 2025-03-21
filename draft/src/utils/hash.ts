import bcrypt from 'fastify-bcrypt'


export function verifyPassword(password: string, hashedPassword: string) {
  return password === hashedPassword;
}