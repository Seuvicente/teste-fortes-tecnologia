export interface Course {
  id: string;
  name: string;
  description: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  birthDate: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
}

export interface CursoDto {
  id: number;
  nome: string;
  descricao: string;
  matriculas?: MatriculaDto[];
}

export interface MatriculaDto {
  id: number;
  alunoId?: number;
  cursos?: CursoDto[];
}

export interface AlunoDto {
  id: number;
  nome: string;
  email: string;
  dataNascimento: string;
  matricula?: MatriculaDto | null;
}

export type CreateCursoPayload = Omit<CursoDto, "id" | "matriculas">;

export type UpdateCursoPayload = Pick<CursoDto, "id" | "nome" | "descricao">;

export type CreateAlunoPayload = Omit<AlunoDto, "id" | "matricula">;

export type UpdateAlunoPayload = AlunoDto;

export interface CreateMatriculaPayload {
  alunoId: number;
  cursos?: { id: number }[];
}

export interface UpdateMatriculaPayload {
  id: number;
  cursos?: { id: number }[];
}
