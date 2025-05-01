import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  GraduationCap,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const Dashboard: React.FC = () => {
  const { alunos, cursos, loading, error } = useAppContext();
  const navigate = useNavigate();

  // --- 2. Recalculate Stats using useMemo and correct data ---

  const totalCursos = useMemo(() => cursos.length, [cursos]);
  const totalAlunos = useMemo(() => alunos.length, [alunos]);

  // Calculate total enrollments by summing enrollments per student
  const totalMatriculas = useMemo(() => {
    return alunos.reduce((sum, aluno) => {
      return sum + (aluno.matricula?.cursos?.length || 0);
    }, 0);
  }, [alunos]);

  // Calculate enrollment count per course
  const courseCounts = useMemo(() => {
    const counts = new Map<number, number>();
    alunos.forEach((aluno) => {
      aluno.matricula?.cursos?.forEach((curso) => {
        counts.set(curso.id, (counts.get(curso.id) || 0) + 1);
      });
    });

    return cursos.map((curso) => ({
      id: curso.id,
      nome: curso.nome,
      count: counts.get(curso.id) || 0,
    }));
  }, [cursos, alunos]);

  // Find most popular course
  const mostPopularCourse = useMemo(() => {
    if (courseCounts.length === 0) return null;
    return courseCounts.reduce((prev, current) =>
      prev.count > current.count ? prev : current
    );
  }, [courseCounts]);

  // Calculate course count per student
  const studentCounts = useMemo(() => {
    return alunos.map((aluno) => ({
      id: aluno.id,
      nome: aluno.nome,
      count: aluno.matricula?.cursos?.length || 0,
    }));
  }, [alunos]);

  // Find most active student
  const mostActiveStudent = useMemo(() => {
    if (studentCounts.length === 0) return null;
    return studentCounts.reduce((prev, current) =>
      prev.count > current.count ? prev : current
    );
  }, [studentCounts]);

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 size={32} className="animate-spin text-blue-600" />
        <span className="ml-3 text-gray-500">Carregando Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center justify-center">
        <AlertCircle size={20} className="mr-2" />
        <span>Erro ao carregar dados: {error}</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* --- Stat Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Courses Stat */}
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/courses")}
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
              <BookOpen size={24} />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Total Cursos</h2>
              {/* Use recalculated total */}
              <p className="text-3xl font-bold mt-1">{totalCursos}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-blue-100">
            Clique para gerenciar cursos
          </p>
        </div>

        {/* Students Stat */}
        <div
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/students")}
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-400 bg-opacity-30 rounded-full">
              <Users size={24} />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Total Alunos</h2>
              {/* Use recalculated total */}
              <p className="text-3xl font-bold mt-1">{totalAlunos}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-green-100">
            Clique para gerenciar alunos
          </p>
        </div>

        {/* Enrollments Stat */}
        <div
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/enrollments")}
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-400 bg-opacity-30 rounded-full">
              <GraduationCap size={24} />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Total Matrículas</h2>
              {/* Use recalculated total */}
              <p className="text-3xl font-bold mt-1">{totalMatriculas}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-purple-100">
            Clique para gerenciar matrículas
          </p>
        </div>
      </div>

      {/* --- Detail Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Popular Courses */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Cursos Populares
          </h2>
          {/* Use recalculated courseCounts */}
          {courseCounts.length > 0 ? (
            <div className="space-y-3">
              {courseCounts
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map(
                  (
                    curso // Use 'curso'
                  ) => (
                    <div
                      key={curso.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center">
                        <BookOpen
                          size={16}
                          className="text-blue-500 mr-2 flex-shrink-0"
                        />
                        {/* Use curso.nome */}
                        <span
                          className="text-gray-800 truncate"
                          title={curso.nome}
                        >
                          {curso.nome}
                        </span>
                      </div>
                      <div className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs font-medium">
                        {curso.count} {curso.count === 1 ? "aluno" : "alunos"}
                      </div>
                    </div>
                  )
                )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              Nenhum curso encontrado.
            </div>
          )}
          {/* Use recalculated mostPopularCourse */}
          {mostPopularCourse && mostPopularCourse.count > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Mais popular: {/* Use mostPopularCourse.nome */}
                <span className="font-medium text-gray-700">
                  {mostPopularCourse.nome}
                </span>{" "}
                ({mostPopularCourse.count} matrículas)
              </p>
            </div>
          )}
        </div>

        {/* Active Students */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Alunos Mais Ativos
          </h2>
          {/* Use recalculated studentCounts */}
          {studentCounts.length > 0 ? (
            <div className="space-y-3">
              {studentCounts
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((aluno) => (
                  <div
                    key={aluno.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center">
                      <Users
                        size={16}
                        className="text-green-500 mr-2 flex-shrink-0"
                      />
                      {/* Use aluno.nome */}
                      <span
                        className="text-gray-800 truncate"
                        title={aluno.nome}
                      >
                        {aluno.nome}
                      </span>
                    </div>
                    <div className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-xs font-medium">
                      {aluno.count} {aluno.count === 1 ? "curso" : "cursos"}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              Nenhum aluno encontrado.
            </div>
          )}
          {/* Use recalculated mostActiveStudent */}
          {mostActiveStudent && mostActiveStudent.count > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Mais ativo: {/* Use mostActiveStudent.nome */}
                <span className="font-medium text-gray-700">
                  {mostActiveStudent.nome}
                </span>{" "}
                ({mostActiveStudent.count} matrículas)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
