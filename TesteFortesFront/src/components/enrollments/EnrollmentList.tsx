import React, { useState, useEffect, useMemo } from "react";
import { Search, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import EnrollmentForm from "./EnrollmentForm";
import { AlunoDto, CursoDto } from "../../types/index";

const EnrollmentList: React.FC = () => {
  const {
    alunos,
    cursos,
    desmatricularAluno,
    getAlunosByCurso,
    loading: contextLoading,
    error: contextError,
  } = useAppContext();

  const [showForm, setShowForm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const [studentsInCourse, setStudentsInCourse] = useState<AlunoDto[]>([]);
  const [loadingStudentsInCourse, setLoadingStudentsInCourse] =
    useState<boolean>(false);
  const [errorStudentsInCourse, setErrorStudentsInCourse] = useState<
    string | null
  >(null);
  const [coursesForStudent, setCoursesForStudent] = useState<CursoDto[]>([]);

  useEffect(() => {
    if (selectedCourseId) {
      const courseIdNum = parseInt(selectedCourseId, 10);
      if (isNaN(courseIdNum)) {
        setErrorStudentsInCourse("ID de curso inválido.");
        setStudentsInCourse([]);
        setLoadingStudentsInCourse(false);
        return;
      }

      const fetchStudents = async () => {
        setLoadingStudentsInCourse(true);
        setErrorStudentsInCourse(null);
        setStudentsInCourse([]);

        try {
          const fetchedStudents = await getAlunosByCurso(courseIdNum);

          setStudentsInCourse(fetchedStudents);
        } catch (err: any) {
          console.error("Erro ao buscar alunos do curso:", err);
          setErrorStudentsInCourse(
            err?.response?.data?.message ||
              err?.message ||
              "Erro ao buscar alunos"
          );
        } finally {
          setLoadingStudentsInCourse(false);
        }
      };
      fetchStudents();
    } else {
      setStudentsInCourse([]);
      setErrorStudentsInCourse(null);
      setLoadingStudentsInCourse(false);
    }
  }, [selectedCourseId, getAlunosByCurso]);

  useEffect(() => {
    // Limpa a lista se nenhum aluno estiver selecionado
    if (!selectedStudentId) {
      setCoursesForStudent([]);
      return;
    }

    const studentIdNum = parseInt(selectedStudentId, 10);
    if (isNaN(studentIdNum)) {
      setCoursesForStudent([]);
      return;
    }

    // Encontra o aluno na lista principal
    const studentData = alunos.find((a) => a.id === studentIdNum);
    // Pega os cursos da matrícula (se houver) ou um array vazio
    setCoursesForStudent(studentData?.matricula?.cursos || []);
  }, [selectedStudentId, alunos]);

  const handleAddClick = () => setShowForm(true);
  const handleFormClose = () => setShowForm(false);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourseId(e.target.value);
    setSelectedStudentId("");
    setErrorStudentsInCourse(null);
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStudentId(e.target.value);
    setSelectedCourseId("");
  };

  const handleUnenroll = async (studentIdStr: string, courseIdStr: string) => {
    const studentIdNum = parseInt(studentIdStr, 10);
    const courseIdNum = parseInt(courseIdStr, 10);

    if (isNaN(studentIdNum) || isNaN(courseIdNum)) {
      alert("IDs inválidos.");
      return;
    }

    const studentName =
      alunos.find((a) => a.id === studentIdNum)?.nome ||
      `Aluno ${studentIdNum}`;
    const courseName =
      cursos.find((c) => c.id === courseIdNum)?.nome || `Curso ${courseIdNum}`;

    if (
      window.confirm(
        `Remover matrícula de ${studentName} do curso ${courseName}?`
      )
    ) {
      try {
        await desmatricularAluno(studentIdNum, courseIdNum);

        if (
          selectedCourseId &&
          parseInt(selectedCourseId, 10) === courseIdNum
        ) {
          setStudentsInCourse((prev) =>
            prev.filter((s) => s.id !== studentIdNum)
          );
        }

        if (
          selectedStudentId &&
          parseInt(selectedStudentId, 10) === studentIdNum
        ) {
          setCoursesForStudent((prev) =>
            prev.filter((c) => c.id !== courseIdNum)
          );
        }

        alert("Matrícula removida.");
      } catch (err: any) {
        console.error("Erro ao remover matrícula:", err);
        alert(
          `Falha ao remover matrícula: ${
            err?.response?.data?.message || err?.message || "Erro desconhecido"
          }`
        );
      } finally {
      }
    }
  };

  const searchableCourses = useMemo(() => {
    return cursos.filter((c) =>
      c.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cursos, searchTerm]);

  const searchableStudents = useMemo(() => {
    return alunos.filter(
      (a) =>
        a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [alunos, searchTerm]);

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Gerenciar Matrículas
        </h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Pesquisar alunos/cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={contextLoading}
            />
          </div>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center whitespace-nowrap"
            onClick={handleAddClick}
          >
            <Plus size={18} className="mr-1" />
            <span>Nova Matrícula</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <EnrollmentForm onClose={handleFormClose} />
        </div>
      )}

      {contextLoading && (
        <div className="flex justify-center items-center py-6">
          <Loader2 size={24} className="animate-spin text-blue-500" />
          <span className="ml-2">Carregando dados...</span>
        </div>
      )}
      {contextError && !contextLoading && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded-md">
          Erro ao carregar dados: {contextError}
        </div>
      )}

      {!contextLoading && !contextError && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="courseFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filtrar: Ver Alunos Por Curso
            </label>
            <select
              id="courseFilter"
              value={selectedCourseId}
              onChange={handleCourseChange}
              disabled={!!selectedStudentId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">-- Selecione um Curso --</option>

              {searchableCourses.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="studentFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filtrar: Ver Cursos Por Aluno
            </label>
            <select
              id="studentFilter"
              value={selectedStudentId}
              onChange={handleStudentChange}
              disabled={!!selectedCourseId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">-- Selecione um Aluno --</option>

              {searchableStudents.map((aluno) => (
                <option key={aluno.id} value={aluno.id}>
                  {aluno.nome} ({aluno.email})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {selectedCourseId && !contextLoading && !contextError && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">
            Alunos em{" "}
            {cursos.find((c) => c.id === parseInt(selectedCourseId, 10))
              ?.nome || ""}
          </h2>
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 min-h-[100px]">
            {" "}
            {loadingStudentsInCourse && (
              <div className="p-4 text-center text-gray-500 flex items-center justify-center h-full">
                <Loader2 size={20} className="animate-spin mr-2" /> Carregando
                alunos...
              </div>
            )}
            {!loadingStudentsInCourse && errorStudentsInCourse && (
              <div className="p-4 text-center text-red-600 flex items-center justify-center h-full">
                <AlertCircle size={20} className="mr-2" />{" "}
                {errorStudentsInCourse}
              </div>
            )}
            {!loadingStudentsInCourse &&
              !errorStudentsInCourse &&
              studentsInCourse.length === 0 && (
                <div className="text-center py-6 text-gray-500 flex items-center justify-center h-full">
                  Nenhum aluno encontrado neste curso.
                </div>
              )}
            {!loadingStudentsInCourse &&
            !errorStudentsInCourse &&
            studentsInCourse.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  {/* ... thead ... */}
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="th">Nome Aluno</th>
                      <th className="th">Email</th>
                      <th className="th-actions">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentsInCourse.map((aluno) => (
                      <tr key={aluno.id} className="hover:bg-gray-50">
                        <td className="td">{aluno.nome}</td>
                        <td className="td">{aluno.email}</td>
                        <td className="td-actions">
                          <button
                            onClick={() =>
                              handleUnenroll(String(aluno.id), selectedCourseId)
                            }
                            className="btn-delete-link"
                          >
                            <Trash2 size={16} className="mr-1" /> Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* --- Seção: Cursos do Aluno Selecionado --- */}
      {selectedStudentId && !contextLoading && !contextError && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">
            Cursos para{" "}
            {alunos.find((a) => a.id === parseInt(selectedStudentId, 10))
              ?.nome || ""}
          </h2>
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
            {/* Não há loading específico aqui, pois os dados vêm de 'alunos' já carregado */}
            {coursesForStudent.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                Este aluno não está matriculado em cursos.
              </div>
            )}
            {coursesForStudent.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="th">Curso</th>
                      <th className="th">Descrição</th>
                      <th className="th-actions">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {coursesForStudent.map((curso) => (
                      <tr key={curso.id} className="hover:bg-gray-50">
                        <td className="td">{curso.nome}</td>
                        <td className="td">
                          <div className="line-clamp-2">{curso.descricao}</div>
                        </td>
                        <td className="td-actions">
                          <button
                            onClick={() =>
                              handleUnenroll(
                                selectedStudentId,
                                String(curso.id)
                              )
                            }
                            className="btn-delete-link"
                          >
                            <Trash2 size={16} className="mr-1" /> Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Mensagem Padrão se nada selecionado/encontrado */}
      {!selectedCourseId &&
        !selectedStudentId &&
        !contextLoading &&
        !contextError &&
        alunos.length === 0 &&
        cursos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Não há alunos ou cursos cadastrados. Use os botões acima para
            adicionar.
          </div>
        )}
      {!selectedCourseId &&
        !selectedStudentId &&
        !contextLoading &&
        !contextError &&
        (alunos.length > 0 || cursos.length > 0) && (
          <div className="text-center py-8 text-gray-500">
            Selecione um curso ou aluno acima para ver as matrículas.
          </div>
        )}
    </div>
  );
};

// Adicione algumas classes CSS reutilizáveis (opcional, pode ir para um arquivo CSS)
/*
.th { @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider; }
.td { @apply px-6 py-4 whitespace-nowrap text-sm text-gray-700; }
.th-actions { @apply px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider; }
.td-actions { @apply px-6 py-4 whitespace-nowrap text-right text-sm font-medium; }
.btn-delete-link { @apply text-red-600 hover:text-red-800 inline-flex items-center text-xs; }
*/

export default EnrollmentList;
