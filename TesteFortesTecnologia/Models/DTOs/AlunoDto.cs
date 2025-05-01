namespace TesteFortesTecnologia.Models.DTOs
{
    public class AlunoDto
    {
        public int Id { get; set; }
        public string? Nome { get; set; }
        public string? Email { get; set; }
        public DateTime DataNascimento { get; set; }
        public MatriculaDto? Matricula { get; set; } // Uma única matrícula
    }
}