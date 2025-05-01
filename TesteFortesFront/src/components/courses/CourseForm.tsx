import React, { useState, useEffect } from "react";

import { CursoDto, CreateCursoPayload } from "../../types/index";

interface CourseFormProps {
  initialData?: CursoDto | null;
  onSubmit: (data: CreateCursoPayload | CursoDto) => void;
  onCancel: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const [errors, setErrors] = useState({ nome: "", descricao: "" });

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome);
      setDescricao(initialData.descricao);
      setErrors({ nome: "", descricao: "" });
    } else {
      // Limpa form para criação
      setNome("");
      setDescricao("");
      setErrors({ nome: "", descricao: "" });
    }
  }, [initialData]);

  // 5. Atualize a validação
  const validate = (): boolean => {
    const newErrors = { nome: "", descricao: "" };
    let isValid = true;

    if (!nome.trim()) {
      newErrors.nome = "O nome do curso é obrigatório";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      const coursePayload: CreateCursoPayload = { nome, descricao };

      if (initialData?.id) {
        onSubmit({ ...coursePayload, id: initialData.id });
      } else {
        onSubmit(coursePayload);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">
        {initialData ? "Editar Curso" : "Adicionar Novo Curso"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="nome"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nome do Curso
          </label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.nome ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={errors.nome ? "true" : "false"}
            aria-describedby={errors.nome ? "nome-error" : undefined}
          />
          {errors.nome && (
            <p id="nome-error" className="mt-1 text-sm text-red-600">
              {errors.nome}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="descricao"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Descrição
          </label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.descricao ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={errors.descricao ? "true" : "false"}
            aria-describedby={errors.descricao ? "descricao-error" : undefined}
          />
          {errors.descricao && (
            <p id="descricao-error" className="mt-1 text-sm text-red-600">
              {errors.descricao}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {initialData ? "Atualizar Curso" : "Criar Curso"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
