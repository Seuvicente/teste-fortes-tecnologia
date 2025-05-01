using TesteFortesTecnologia.Models;

namespace TesteFortesTecnologia.Models
{
    public class Matricula
    {
        public int Id { get; set; }
        public int AlunoId { get; set; }
        public Aluno? Aluno { get; set; }
        public List<MatriculaCurso> MatriculaCursos { get; set; } = new List<MatriculaCurso>(); // Inicializar como lista vazia
    }
}



