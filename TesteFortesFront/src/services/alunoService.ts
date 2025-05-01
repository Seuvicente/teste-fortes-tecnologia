// src/services/alunoService.ts
import apiClient from "./api";
import {
  AlunoDto,
  CreateAlunoPayload,
  UpdateAlunoPayload,
} from "../types/index"; // Ajuste o caminho
import { AxiosResponse } from "axios";

const getAll = (): Promise<AxiosResponse<AlunoDto[]>> => {
  return apiClient.get<AlunoDto[]>("/Aluno");
};

const getById = (id: number): Promise<AxiosResponse<AlunoDto>> => {
  return apiClient.get<AlunoDto>(`/Aluno/${id}`);
};

const create = (
  alunoData: CreateAlunoPayload
): Promise<AxiosResponse<AlunoDto>> => {
  return apiClient.post<AlunoDto>("/Aluno", alunoData);
};

const update = (
  id: number,
  alunoData: UpdateAlunoPayload
): Promise<AxiosResponse<void>> => {
  if (id !== alunoData.id) {
    console.warn("ID na URL diferente do ID no corpo para update de aluno.");
  }
  return apiClient.put<void>(`/Aluno/${id}`, alunoData);
};

const deleteAluno = (id: number): Promise<AxiosResponse<void>> => {
  return apiClient.delete<void>(`/Aluno/${id}`);
};

// --- Matrícula/Desmatrícula ---
const matricular = (
  alunoId: number,
  cursoId: number
): Promise<AxiosResponse<void>> => {
  return apiClient.post<void>(`/Aluno/${alunoId}/matricular/${cursoId}`);
};

const desmatricular = (
  alunoId: number,
  cursoId: number
): Promise<AxiosResponse<void>> => {
  return apiClient.delete<void>(`/Aluno/${alunoId}/matricula/${cursoId}`);
};

export const alunoService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteAluno,
  matricular,
  desmatricular,
};
