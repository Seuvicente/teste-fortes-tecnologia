// Refactored StudentForm.tsx

import React, { useState, useEffect } from "react";
// 1. Import AlunoDto e os tipos de payload corretos
import { AlunoDto, CreateAlunoPayload } from "../../types/index"; // Ajuste o caminho
import { isValidEmail } from "../../utils/validators"; // Mantenha seus validadores

// 2. Atualize a interface de Props
interface StudentFormProps {
  initialData?: AlunoDto | null; // Usa AlunoDto
  // onSubmit espera os tipos corretos
  onSubmit: (data: CreateAlunoPayload | AlunoDto) => void;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  // 3. Renomeie os estados para corresponder a AlunoDto
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  // Armazena a data como YYYY-MM-DD para o input type="date"
  const [dataNascimento, setDataNascimento] = useState("");
  // Ajuste as chaves de erro
  const [errors, setErrors] = useState({
    nome: "",
    email: "",
    dataNascimento: "",
  });

  // 4. Atualize o useEffect
  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome);
      setEmail(initialData.email);
      // Formata a data da API (ex: ISO string) para YYYY-MM-DD para o input
      // Se initialData.dataNascimento já for YYYY-MM-DD, ajuste aqui.
      const formattedDate = initialData.dataNascimento
        ? initialData.dataNascimento.split("T")[0] // Pega só a parte da data
        : "";
      setDataNascimento(formattedDate);
      setErrors({ nome: "", email: "", dataNascimento: "" }); // Limpa erros
    } else {
      // Limpa o form para criação
      setNome("");
      setEmail("");
      setDataNascimento("");
      setErrors({ nome: "", email: "", dataNascimento: "" });
    }
  }, [initialData]);

  // 5. Atualize a validação
  const validate = (): boolean => {
    const newErrors = { nome: "", email: "", dataNascimento: "" }; // Chaves atualizadas
    let isValid = true;

    if (!nome.trim()) {
      newErrors.nome = "O nome do aluno é obrigatório"; // Chave atualizada
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "O e-mail é obrigatório";
      isValid = false;
    } else if (!isValidEmail(email)) {
      newErrors.email = "Por favor, insira um e-mail válido";
      isValid = false;
    }

    if (!dataNascimento) {
      newErrors.dataNascimento = "A data de nascimento é obrigatória"; // Chave atualizada
      isValid = false;
      // } else if (!isAdult(dataNascimento)) { // Garanta que isAdult funciona com 'YYYY-MM-DD'
      //   newErrors.dataNascimento = 'O aluno deve ter pelo menos 18 anos';
      //   isValid = false;
    }
    // Removendo validação de idade no FrontEnd pois já está no Backend
    // Mas se quiser manter, garanta que `isAdult` funcione com o formato YYYY-MM-DD

    setErrors(newErrors);
    return isValid;
  };

  // 6. Atualize o handleSubmit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      // Cria o payload com os nomes corretos de propriedades
      // A dataNascimento está como YYYY-MM-DD, o backend precisa aceitar isso
      // ou você precisaria formatar para ISO string completa aqui se necessário.
      const studentPayload: CreateAlunoPayload = {
        nome,
        email,
        dataNascimento,
      };

      if (initialData?.id) {
        // Edição: passa o DTO completo (ou UpdatePayload)
        onSubmit({
          ...studentPayload,
          id: initialData.id,
          matricula: initialData.matricula,
        }); // Inclui ID e matrícula se for editar
      } else {
        // Criação: passa o payload de criação
        onSubmit(studentPayload);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        {initialData ? "Editar Aluno" : "Adicionar Novo Aluno"}
      </h2>
      <form onSubmit={handleSubmit}>
        {/* 7. Atualize value, onChange, erros para nome */}
        <div className="mb-4">
          <label
            htmlFor="nome"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nome Completo
          </label>
          <input
            type="text"
            id="nome" // Pode manter 'name' se preferir, mas 'nome' é mais consistente
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
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

        {/* Email (sem alteração de nome de estado/prop) */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            E-mail
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        {/* 7. Atualize value, onChange, erros para dataNascimento */}
        <div className="mb-6">
          <label
            htmlFor="dataNascimento"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Data de Nascimento
          </label>
          <input
            type="date" // Mantém type="date"
            id="dataNascimento" // Pode manter 'birthDate' se preferir
            value={dataNascimento} // Usa o estado formatado YYYY-MM-DD
            onChange={(e) => setDataNascimento(e.target.value)}
            max={new Date().toISOString().split("T")[0]} // Restrição de data futura
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
              errors.dataNascimento ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={errors.dataNascimento ? "true" : "false"}
            aria-describedby={
              errors.dataNascimento ? "dataNascimento-error" : undefined
            }
          />
          {errors.dataNascimento && (
            <p id="dataNascimento-error" className="mt-1 text-sm text-red-600">
              {errors.dataNascimento}
            </p>
          )}
        </div>

        {/* Botões (sem alteração) */}
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
            {initialData ? "Atualizar Aluno" : "Criar Aluno"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
