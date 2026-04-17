import { Response } from "express";

export class CustomResponse {
  response: Response;
  constructor(response: Response) {
    this.response = response;
  }

  errorHandler(error: any) {
    if (error.name === "ZodError") {
      const { issues } = error;
      return setErrorMessage(issues);
    }

    if (typeof error === "string") {
      return error;
    }

    function setErrorMessage(error: any[]) {
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

  unauthorized(action?: string, message?: string) {
    this.response.status(401).json({
      message: message || "Não autorizado.",
      action: action || "Faça o login novamente.",
    });
  }

  badRequest(error: any) {
    const errorMessage = this.errorHandler(error);
    this.response.status(400).json({ error: errorMessage });
  }

  success(data: object) {
    this.response.status(200).json(data);
  }

  created(data?: object) {
    this.response.status(201).json(data);
  }

  noContent() {
    this.response.status(204).json();
  }
}
