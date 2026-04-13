import { Response } from "express";

export class CustomResponse {
  response: Response;
  constructor(response: Response) {
    this.response = response;
  }

  errorHandler(error: any) {
    if (error.name === "ZodError") {
      const { issues } = error;
      return getErrorMessage(issues);
    }

    if (typeof error === "string") {
      return error;
    }

    function getErrorMessage(error: any[]) {
      const errorMessage: string[] = [];
      for (const erro of error) {
        errorMessage.push(erro.message);
      }
      return errorMessage.join(" | ");
    }
  }

  internalServerError(message?: string) {
    this.response
      .status(500)
      .json({ message: message || "Ocorreu um erro inesperado" });
  }

  forbidden(message?: string) {
    this.response.status(403).json({ message: message || "Acesso negado." });
  }

  unauthorized(message: string, action: string) {
    this.response.status(401).json({ message, action });
  }

  badRequest(error: any) {
    const errorMessage = this.errorHandler(error);
    this.response.status(400).json({ message: errorMessage });
  }

  success(message: string, data?: any) {
    this.response.status(200).json({ message: message || undefined, data });
  }

  created(message: string, data?: any) {
    this.response.status(201).json({ message, data });
  }

  noContet(message?: string) {
    this.response.status(204).json({ message: message || "Nada para exibir." });
  }
}
