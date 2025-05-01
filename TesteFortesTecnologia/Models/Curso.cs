namespace TesteFortesTecnologia.Models
{
    public class Curso
    {
        public int Id { get; set; }
        public string? Nome { get; set; }
        public string? Descricao { get; set; } // Nova propriedade
        public List<MatriculaCurso>? MatriculaCursos { get; set; }
    }
}


