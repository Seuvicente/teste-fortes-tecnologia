// Corrected AppContext.tsx

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import {
  CursoDto,
  AlunoDto,
  CreateCursoPayload,
  UpdateCursoPayload,
  CreateAlunoPayload,
  UpdateAlunoPayload,
} from "../types/index";
import { cursoService } from "../services/cursoService";
import { alunoService } from "../services/alunoService";

interface AppContextType {
  cursos: CursoDto[];
  alunos: AlunoDto[];
  loading: boolean; // Represents OVERALL initial loading state now
  error: string | null;
  fetchCursos: (showLoading?: boolean) => Promise<void>; // Keep ability to refresh manually
  addCurso: (cursoData: CreateCursoPayload) => Promise<void>;
  updateCurso: (id: number, cursoData: UpdateCursoPayload) => Promise<void>;
  deleteCurso: (id: number) => Promise<void>;
  fetchAlunos: (showLoading?: boolean) => Promise<void>; // Keep ability to refresh manually
  addAluno: (alunoData: CreateAlunoPayload) => Promise<void>;
  updateAluno: (id: number, alunoData: UpdateAlunoPayload) => Promise<void>;
  deleteAluno: (id: number) => Promise<void>;
  matricularAluno: (alunoId: number, cursoId: number) => Promise<void>;
  desmatricularAluno: (alunoId: number, cursoId: number) => Promise<void>;
  getAlunosByCurso: (cursoId: number) => Promise<AlunoDto[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cursos, setCursos] = useState<CursoDto[]>([]);
  const [alunos, setAlunos] = useState<AlunoDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Start loading true initially
  const [error, setError] = useState<string | null>(null);

  // Fetch Cursos - Removed setLoading toggle from here for initial load
  const fetchCursos = useCallback(async (showLoadingUpdate = false) => {
    if (showLoadingUpdate) setLoading(true); // Only set loading for manual refresh
    // setError(null); // Clear error only on success or initial load
    try {
      const response = await cursoService.getAll();
      setCursos(response.data);
      //setError(null); // Clear error on success
    } catch (err: any) {
      console.error("Erro ao buscar cursos:", err);
      // Don't overwrite other errors if called in parallel
      // setError(err?.response?.data?.message || err?.message || "Erro ao buscar cursos");
      throw err; // Re-throw so Promise.all knows about the error
    } finally {
      if (showLoadingUpdate) setLoading(false);
    }
  }, []); // Empty array: function reference is stable

  // Fetch Alunos - Removed setLoading toggle from here for initial load
  const fetchAlunos = useCallback(async (showLoadingUpdate = false) => {
    if (showLoadingUpdate) setLoading(true);
    // setError(null);
    try {
      const response = await alunoService.getAll();
      setAlunos(response.data);
      // setError(null); // Clear error on success
    } catch (err: any) {
      console.error("Erro ao buscar alunos:", err);
      // Don't overwrite other errors if called in parallel
      // setError(err?.response?.data?.message || err?.message || "Erro ao buscar alunos");
      throw err; // Re-throw
    } finally {
      if (showLoadingUpdate) setLoading(false);
    }
  }, []); // Empty array: function reference is stable

  // --- CORREÇÃO: Carregamento Inicial Otimizado ---
  useEffect(() => {
    let isMounted = true; // Flag para evitar updates após desmontar
    const loadInitialData = async () => {
      setLoading(true); // Liga loading GERAL
      setError(null); // Limpa erros anteriores
      try {
        // Roda ambos em paralelo
        await Promise.all([
          fetchCursos(false), // Chama sem ligar loading individual
          fetchAlunos(false), // Chama sem ligar loading individual
        ]);
        // Se chegou aqui, ambos tiveram sucesso (ou não lançaram erro que parou Promise.all)
        if (isMounted) {
          setError(null); // Garante que está limpo se ambos bem sucedidos
        }
      } catch (err: any) {
        // Pega erro de QUALQUER uma das promises que falhou
        console.error("Erro no carregamento inicial:", err);
        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Erro ao carregar dados iniciais"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false); // Desliga loading GERAL no final
        }
      }
    };

    loadInitialData();

    return () => {
      // Função de limpeza
      isMounted = false;
    };
    // Adiciona as funções memoizadas como dependências corretas
  }, [fetchAlunos, fetchCursos]);

  // --- Funções CRUD Curso (sem alterações da versão anterior - tratam loading/erro individualmente se necessário) ---
  const addCurso = async (cursoData: CreateCursoPayload) => {
    setError(null);
    // const wasLoading = loading; setLoading(true); // Exemplo loading específico
    try {
      const response = await cursoService.create(cursoData);
      setCursos((prev) => [...prev, response.data]);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Erro ao adicionar curso";
      setError(message);
      throw new Error(message);
    } finally {
      /* setLoading(wasLoading); */
    }
  };
  const updateCurso = async (id: number, cursoData: UpdateCursoPayload) => {
    setError(null); // setLoading(true);
    try {
      await cursoService.update(id, cursoData);
      const updatedCurso = {
        ...(cursos.find((c) => c.id === id) || {}),
        ...cursoData,
      };
      setCursos((prev) =>
        prev.map((c) => (c.id === id ? (updatedCurso as CursoDto) : c))
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Erro ao atualizar curso";
      setError(message);
      throw new Error(message);
    } finally {
      /* setLoading(false); */
    }
  };
  const deleteCurso = async (id: number) => {
    setError(null); // setLoading(true);
    try {
      await cursoService.delete(id);
      setCursos((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Erro ao deletar curso";
      setError(message);
      throw new Error(message);
    } finally {
      /* setLoading(false); */
    }
  };

  // --- Funções CRUD Aluno ---
  const addAluno = async (alunoData: CreateAlunoPayload) => {
    setError(null); // setLoading(true);
    try {
      const response = await alunoService.create(alunoData);
      setAlunos((prev) => [...prev, response.data]);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Erro ao adicionar aluno";
      setError(message);
      throw new Error(message);
    } finally {
      /* setLoading(false); */
    }
  };

  const updateAluno = async (id: number, alunoData: UpdateAlunoPayload) => {
    setError(null); // setLoading(true);
    try {
      await alunoService.update(id, alunoData);
      // CORREÇÃO: Recarrega alunos para garantir consistência da matrícula
      await fetchAlunos(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Erro ao atualizar aluno";
      setError(message);
      throw new Error(message);
    } finally {
      /* setLoading(false); */
    }
  };

  const deleteAluno = async (id: number) => {
    setError(null); // setLoading(true);
    try {
      await alunoService.delete(id);
      setAlunos((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Erro ao deletar aluno";
      setError(message);
      throw new Error(message);
    } finally {
      /* setLoading(false); */
    }
  };

  // --- Funções de Matrícula ---
  const matricularAluno = async (alunoId: number, cursoId: number) => {
    setError(null); // setLoading(true); // Pode usar loading específico
    try {
      await alunoService.matricular(alunoId, cursoId);
      // CORREÇÃO: Atualiza o estado de alunos
      await fetchAlunos(false); // Recarrega sem mostrar loading global
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Erro ao matricular aluno";
      setError(message);
      throw new Error(message);
    } finally {
      /* setLoading(false); */
    }
  };

  const desmatricularAluno = async (alunoId: number, cursoId: number) => {
    setError(null); // setLoading(true);
    try {
      await alunoService.desmatricular(alunoId, cursoId);
      // CORREÇÃO: Atualiza o estado de alunos
      await fetchAlunos(false); // Recarrega sem mostrar loading global
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Erro ao desmatricular aluno";
      setError(message);
      throw new Error(message);
    } finally {
      /* setLoading(false); */
    }
  };

  // --- Função de Consulta (Não altera estado global de loading/error) ---
  const getAlunosByCurso = async (cursoId: number): Promise<AlunoDto[]> => {
    try {
      const response = await cursoService.getAlunos(cursoId);
      return response.data;
    } catch (err: any) {
      console.error(`Erro ao buscar alunos do curso ${cursoId}:`, err);
      throw err; // Re-throw para o componente tratar
    }
  };

  // Valor final do contexto
  const contextValue: AppContextType = {
    cursos,
    alunos,
    loading,
    error,
    fetchCursos,
    addCurso,
    updateCurso,
    deleteCurso,
    fetchAlunos,
    addAluno,
    updateAluno,
    deleteAluno,
    matricularAluno,
    desmatricularAluno,
    getAlunosByCurso,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
