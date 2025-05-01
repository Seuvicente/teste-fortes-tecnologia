import React, { useState, useEffect } from "react";
import { Plus, Search, Loader2, AlertCircle } from "lucide-react";
import CourseCard from "./CourseCard";
import CourseForm from "./CourseForm";
import { useAppContext } from "../../context/AppContext";

import {
  CursoDto,
  CreateCursoPayload,
  UpdateCursoPayload,
} from "../../types/index";
import { cursoService } from "../../services/cursoService";

const CourseList: React.FC = () => {
  const { cursos, loading, error, addCurso, updateCurso, deleteCurso } =
    useAppContext();

  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CursoDto | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentCounts, setStudentCounts] = useState<Record<number, number>>(
    {}
  );
  const [loadingCounts, setLoadingCounts] = useState<boolean>(false);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!cursos || cursos.length === 0) {
        setStudentCounts({});
        return;
      }
      setLoadingCounts(true);
      const counts: Record<number, number> = {};
      try {
        await Promise.all(
          cursos.map(async (curso) => {
            try {
              const response = await cursoService.getAlunos(curso.id);
              counts[curso.id] = response.data.length;
            } catch (error) {
              console.error(
                `Erro ao buscar alunos para curso ${curso.id}:`,
                error
              );
              counts[curso.id] = 0;
            }
          })
        );
      } catch (globalError) {
        console.error("Erro no Promise.all ao buscar contagens:", globalError);
      }
      setStudentCounts(counts);
      setLoadingCounts(false);
    };

    if (!loading && !error) {
      fetchCounts();
    }
  }, [cursos, loading, error]);

  const handleAddClick = () => {
    setEditingCourse(null);
    setShowForm(true);
  };

  const handleEditClick = (course: CursoDto) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este curso?")) {
      try {
        await deleteCurso(id);
      } catch (err) {
        alert(
          `Erro ao excluir curso: ${
            err instanceof Error ? err.message : "Erro desconhecido"
          }`
        );
      }
    }
  };

  const handleSubmit = async (
    formData: Omit<CursoDto, "id" | "matriculas"> | CursoDto
  ) => {
    const isEditing =
      editingCourse !== null &&
      "id" in formData &&
      editingCourse.id === formData.id;
    try {
      if (isEditing) {
        const updatePayload: UpdateCursoPayload = {
          id: formData.id,
          nome: formData.nome,
          descricao: formData.descricao,
        };
        await updateCurso(formData.id, updatePayload);
      } else {
        const createPayload: CreateCursoPayload = {
          nome: formData.nome,
          descricao: formData.descricao,
        };
        await addCurso(createPayload);
      }
      setShowForm(false);
      setEditingCourse(null);
    } catch (err) {
      alert(
        `Erro ao salvar curso: ${
          err instanceof Error ? err.message : "Erro desconhecido"
        }`
      );
    }
  };

  const filteredCourses = cursos.filter(
    (course: CursoDto) =>
      (course.nome?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (course.descricao?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
  );

  const handleViewStudents = (courseId: number) => {
    alert(`Implementar visualização de alunos para curso ${courseId}`);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Cursos</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Pesquisar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            onClick={handleAddClick}
          >
            <Plus size={18} className="mr-1" />
            <span>Adicionar Curso</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <CourseForm
            initialData={editingCourse || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={32} className="animate-spin text-blue-600" />
          <span className="ml-2 text-gray-500">Carregando...</span>
        </div>
      )}

      {error && !loading && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center">
          <AlertCircle size={20} className="mr-2" />
          <span>Erro: {error}</span>
        </div>
      )}

      {!loading && !error && filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course: CursoDto) => (
            <CourseCard
              key={course.id}
              course={course}
              studentCount={loadingCounts ? -1 : studentCounts[course.id] ?? 0}
              onEdit={() => handleEditClick(course)}
              onDelete={() => handleDeleteClick(course.id)}
              onViewStudents={() => handleViewStudents(course.id)}
            />
          ))}
        </div>
      ) : null}

      {!loading && !error && cursos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">
            Nenhum curso disponível. Adicione seu primeiro curso!
          </p>
        </div>
      ) : null}

      {!loading &&
      !error &&
      cursos.length > 0 &&
      filteredCourses.length === 0 &&
      searchTerm ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">
            Nenhum curso corresponde à sua pesquisa.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default CourseList;
