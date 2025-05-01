import apiClient from "./api";
import {
  AlunoDto,
  CreateCursoPayload,
  CursoDto,
  UpdateCursoPayload,
} from "../types/index";
import { AxiosResponse } from "axios";

const getAll = (): Promise<AxiosResponse<CursoDto[]>> => {
  return apiClient.get<CursoDto[]>("/Curso");
};

const getById = (id: number): Promise<AxiosResponse<CursoDto>> => {
  return apiClient.get<CursoDto>(`/Curso/${id}`);
};

const create = (
  cursoData: CreateCursoPayload
): Promise<AxiosResponse<CursoDto>> => {
  return apiClient.post<CursoDto>("/Curso", cursoData);
};

const update = (
  id: number,
  cursoData: UpdateCursoPayload
): Promise<AxiosResponse<void>> => {
  if (id !== cursoData.id) {
    console.warn("ID na URL diferente do ID no corpo para update de curso.");
  }
  return apiClient.put<void>(`/Curso/${id}`, cursoData);
};

const deleteCurso = (id: number): Promise<AxiosResponse<void>> => {
  return apiClient.delete<void>(`/Curso/${id}`);
};

const getAlunos = (cursoId: number): Promise<AxiosResponse<AlunoDto[]>> => {
  return apiClient.get<AlunoDto[]>(`/Curso/${cursoId}/alunos`);
};

export const cursoService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteCurso,
  getAlunos,
};
