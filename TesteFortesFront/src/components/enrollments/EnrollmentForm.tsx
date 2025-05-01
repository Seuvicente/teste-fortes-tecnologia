import React, { useState, useMemo } from "react";
import { useAppContext } from "../../context/AppContext";

import { Loader2 } from "lucide-react";

interface EnrollmentFormProps {
  onClose: () => void;
}

const EnrollmentForm: React.FC<EnrollmentFormProps> = ({ onClose }) => {
  const {
    alunos,
    cursos,
    matricularAluno,
    loading: contextLoading,
  } = useAppContext();

  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedStudentData = useMemo(() => {
    if (!selectedStudentId) return null;
    const idAsNumber = parseInt(selectedStudentId, 10);
    return alunos.find((s) => s.id === idAsNumber) || null;
  }, [selectedStudentId, alunos]);

  const enrolledCourseIds = useMemo(() => {
    const cursosMatriculados = selectedStudentData?.matricula?.cursos;
    if (!cursosMatriculados) {
      return new Set<number>();
    }
    return new Set(cursosMatriculados.map((c) => c.id));
  }, [selectedStudentData]);

  const availableCourses = useMemo(() => {
    if (!selectedStudentId) {
      return cursos;
    }
    return cursos.filter((course) => !enrolledCourseIds.has(course.id));
  }, [cursos, selectedStudentId, enrolledCourseIds]);

  const studentsEnrolledInCourse = useMemo(() => {
    if (!selectedCourseId) {
      return new Set<number>();
    }
    const courseIdAsNumber = parseInt(selectedCourseId, 10);
    const studentIds = new Set<number>();
    alunos.forEach((student) => {
      if (student.matricula?.cursos?.some((c) => c.id === courseIdAsNumber)) {
        studentIds.add(student.id);
      }
    });
    return studentIds;
  }, [selectedCourseId, alunos]);

  const availableStudents = useMemo(() => {
    if (!selectedCourseId) {
      return alunos;
    }
    return alunos.filter(
      (student) => !studentsEnrolledInCourse.has(student.id)
    );
  }, [alunos, selectedCourseId, studentsEnrolledInCourse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedStudentId || !selectedCourseId) {
      setError("Selecione um aluno e um curso");
      return;
    }

    const studentIdNum = parseInt(selectedStudentId, 10);
    const courseIdNum = parseInt(selectedCourseId, 10);

    if (isNaN(studentIdNum) || isNaN(courseIdNum)) {
      setError("Seleção de aluno ou curso inválida.");
      return;
    }

    setIsSubmitting(true);

    try {
      await matricularAluno(studentIdNum, courseIdNum);
      setSuccess("Aluno matriculado com sucesso!");
      setSelectedStudentId("");
      setSelectedCourseId("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Erro ao matricular:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Falha ao matricular aluno."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = contextLoading || isSubmitting;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Matricular Aluno em Curso
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          aria-label="Fechar"
        >
          &times;
        </button>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-md text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="student-select"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Selecione Aluno
          </label>
          <select
            id="student-select"
            value={selectedStudentId}
            onChange={(e) => {
              setSelectedStudentId(e.target.value);
              setError("");
              setSuccess("");
            }}
            disabled={contextLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">-- Selecione --</option>

            {availableStudents.map((aluno) => (
              <option key={aluno.id} value={aluno.id}>
                {aluno.nome} ({aluno.email})
              </option>
            ))}
          </select>
          {selectedStudentId && availableCourses.length === 0 && !isLoading && (
            <p className="mt-1 text-sm text-gray-500">
              Este aluno já está matriculado em todos os cursos disponíveis.
            </p>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="course-select"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Selecione Curso
          </label>
          <select
            id="course-select"
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              setError("");
              setSuccess("");
            }}
            disabled={contextLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">-- Selecione --</option>

            {availableCourses.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.nome}
              </option>
            ))}
          </select>
          {selectedCourseId && availableStudents.length === 0 && !isLoading && (
            <p className="mt-1 text-sm text-gray-500">
              Todos os alunos já estão matriculados neste curso.
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!selectedStudentId || !selectedCourseId || isLoading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white flex items-center justify-center ${
              !selectedStudentId || !selectedCourseId || isLoading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting && (
              <Loader2 size={16} className="animate-spin mr-2" />
            )}
            Matricular Aluno
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnrollmentForm;
