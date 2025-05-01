// Refactored StudentList.tsx

import React, { useState, useMemo } from "react"; // Added useMemo
import { Plus, Search, Loader2, AlertCircle } from "lucide-react"; // Added Loader2, AlertCircle
import StudentCard from "./StudentCard"; // Assumes StudentCard is updated for AlunoDto
import StudentForm from "./StudentForm"; // Assumes StudentForm is updated for AlunoDto
import { useAppContext } from "../../context/AppContext";
// 1. Import AlunoDto and payload types
import { AlunoDto, CreateAlunoPayload } from "../../types/index"; // Adjust path

const StudentList: React.FC = () => {
  // 2. Get updated state and async functions from context
  const {
    alunos, // Use 'alunos' (AlunoDto[])
    addAluno, // async
    updateAluno, // async
    deleteAluno, // async
    loading,
    error,
  } = useAppContext();

  // 3. Update local state type for editingStudent
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<AlunoDto | null>(null); // Use AlunoDto
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddClick = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  // 4. Use AlunoDto in handleEditClick
  const handleEditClick = (student: AlunoDto) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  // 5. Make delete async, use number ID
  const handleDeleteClick = async (id: number) => {
    // Find name for confirmation - use 'nome'
    const studentName = alunos.find((a) => a.id === id)?.nome || `ID ${id}`;
    if (
      window.confirm(`Tem certeza que deseja excluir o aluno ${studentName}?`)
    ) {
      try {
        await deleteAluno(id); // Call async context function
        // State update happens in context
      } catch (err) {
        alert(
          `Erro ao excluir aluno: ${
            err instanceof Error ? err.message : "Erro desconhecido"
          }`
        );
      }
    }
  };

  // 6. Make submit async, use correct types/payloads
  const handleSubmit = async (studentData: CreateAlunoPayload | AlunoDto) => {
    // studentData comes correctly typed from the updated StudentForm
    try {
      if (
        "id" in studentData &&
        editingStudent &&
        studentData.id === editingStudent.id
      ) {
        // Update: Pass ID and the full AlunoDto (or specific UpdatePayload)
        await updateAluno(studentData.id, studentData);
      } else {
        // Add: Pass CreateAlunoPayload
        // We need to ensure studentData here doesn't have an ID if it's a create operation.
        // The StudentForm's onSubmit logic should handle this correctly.
        // Assuming studentData here is CreateAlunoPayload for adds:
        await addAluno(studentData as CreateAlunoPayload);
      }
      setShowForm(false);
      setEditingStudent(null);
    } catch (err) {
      alert(
        `Erro ao salvar aluno: ${
          err instanceof Error ? err.message : "Erro desconhecido"
        }`
      );
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingStudent(null); // Clear editing state on cancel
  };

  // 7. Remove getCourseCount function (calculated in StudentCard now)

  // 8. Filter based on 'alunos' and use correct properties ('nome')
  const filteredAlunos = useMemo(() => {
    // Renamed for clarity
    if (!searchTerm) return alunos;
    return alunos.filter(
      (
        aluno // Use 'aluno' and 'nome'
      ) =>
        aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [alunos, searchTerm]);

  return (
    <div>
      {/* Header (Search, Add Button) */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Alunos</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Pesquisar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading} // Disable during global load
            />
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center whitespace-nowrap"
            onClick={handleAddClick}
          >
            <Plus size={18} className="mr-1" />
            <span>Adicionar Aluno</span>
          </button>
        </div>
      </div>

      {/* Student Form (Conditional) */}
      {showForm && (
        <div className="mb-6">
          <StudentForm // Assumes StudentForm expects AlunoDto now
            initialData={editingStudent} // Pass AlunoDto | null
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={32} className="animate-spin text-blue-600" />
          <span className="ml-3 text-gray-500">Carregando alunos...</span>
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center justify-center">
          <AlertCircle size={20} className="mr-2" />
          <span>Erro: {error}</span>
        </div>
      )}

      {/* Student List or Empty Message */}
      {!loading && !error && filteredAlunos.length > 0 ? (
        // 9. Iterate over 'filteredAlunos', pass 'aluno' (AlunoDto), remove courseCount prop
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlunos.map(
            (
              aluno // Use 'aluno'
            ) => (
              <StudentCard
                key={aluno.id}
                student={aluno} // Pass AlunoDto
                // courseCount prop removed
                onEdit={() => handleEditClick(aluno)} // Pass AlunoDto
                onDelete={() => handleDeleteClick(aluno.id)} // Pass number ID
                onViewCourses={() => {
                  /* TODO: Lógica para ver cursos do aluno */ alert(
                    `Ver cursos de ${aluno.nome}`
                  );
                }}
              />
            )
          )}
        </div>
      ) : null}

      {/* Empty / No Results Messages */}
      {!loading &&
      !error &&
      filteredAlunos.length === 0 &&
      alunos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500">
            Nenhum aluno disponível. Adicione seu primeiro aluno!
          </p>
        </div>
      ) : null}

      {!loading &&
      !error &&
      filteredAlunos.length === 0 &&
      alunos.length > 0 &&
      searchTerm ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500">
            Nenhum aluno corresponde à sua pesquisa.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default StudentList;
