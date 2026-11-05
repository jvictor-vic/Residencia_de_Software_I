import type { PerfilAutenticado } from './services/auth';

declare global {
  namespace App {
    interface Locals {
      authenticatedUser?: PerfilAutenticado;
    }
  }
}

export {};
