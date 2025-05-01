namespace TesteFortesTecnologia.Models.DTOs
{
    public class MatriculaDto
    {
        public int Id { get; set; }
        public int AlunoId { get; set; }
        public List<CursoDto>? Cursos { get; set; } = new List<CursoDto>(); // Lista de cursos associados à matrícula
    }
}