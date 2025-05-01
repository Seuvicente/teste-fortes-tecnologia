// src/components/students/StudentCard.tsx <-- Exemplo de caminho
import React from "react";
// 1. Importe o tipo correto AlunoDto
import { AlunoDto } from "../../types/index"; // <-- Ajuste o caminho se necessário (pode ser /api)
import { Edit, Trash2, BookOpen } from "lucide-react";
import { formatDate } from "../../utils/validators"; // Verifique se esta função existe e funciona com string ISO

// 2. Atualize a interface de Props: use AlunoDto e remova courseCount
interface StudentCardProps {
  student: AlunoDto;
  onEdit: () => void;
  onDelete: () => void;
  onViewCourses: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onEdit,
  onDelete,
  onViewCourses,
}) => {
  // 3. Calcule a contagem de cursos diretamente do objeto AlunoDto
  //    Usa optional chaining (?.) e nullish coalescing (||) para segurança
  const courseCount = student.matricula?.cursos?.length || 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg border border-gray-100">
      <div className="p-5">
        {/* 4. Use as propriedades corretas: nome, dataNascimento */}
        <h3
          className="text-lg font-semibold text-gray-800 mb-2 truncate"
          title={student.nome}
        >
          {student.nome}
        </h3>
        <p
          className="text-sm text-gray-600 mb-2 truncate"
          title={student.email}
        >
          {student.email}
        </p>
        {/* Certifique-se que formatDate funciona com string ISO */}
        <p className="text-sm text-gray-500 mb-4">
          Nascimento: {formatDate(student.dataNascimento)}
        </p>

        {/* Usa o courseCount calculado internamente */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <BookOpen size={16} className="mr-1 text-blue-500 flex-shrink-0" />
          <span>
            Matriculado em {courseCount}{" "}
            {courseCount === 1 ? "curso" : "cursos"}
          </span>
        </div>

        {/* Botões (sem alteração de lógica aqui) */}
        <div className="flex justify-end space-x-2 border-t border-gray-100 pt-4 mt-4">
          <button
            onClick={onViewCourses}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Ver cursos matriculados"
          >
            <BookOpen size={18} />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
            title="Editar aluno"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Excluir aluno"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
