namespace TesteFortesTecnologia.Models
{
    public class Aluno
    {
        public int Id { get; set; }
        public string? Nome { get; set; }
        public string? Email { get; set; }
        public DateTime DataNascimento { get; set; }
        public int? MatriculaId { get; set; }
        public Matricula Matricula { get; set; }
    }
}