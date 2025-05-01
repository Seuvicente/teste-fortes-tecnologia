import React from "react";
import { Edit, Trash2, Users } from "lucide-react";

import { CursoDto } from "../../types/index";

interface CourseCardProps {
  course: CursoDto;
  studentCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onViewStudents: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  studentCount,
  onEdit,
  onDelete,
  onViewStudents,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {course.nome}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{course.descricao}</p>

        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Users size={16} className="mr-1" />
          {/* Lógica de exibição da contagem (ajustada para -1 indicar loading, opcional) */}
          <span>
            {studentCount === -1
              ? "Carregando..."
              : `${studentCount} ${
                  studentCount === 1 ? "aluno" : "alunos"
                } matriculado(s)`}
          </span>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onViewStudents}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Ver alunos matriculados"
          >
            <Users size={18} />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
            title="Editar curso"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Excluir curso"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
