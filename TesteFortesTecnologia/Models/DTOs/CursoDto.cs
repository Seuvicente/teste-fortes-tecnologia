namespace TesteFortesTecnologia.Models.DTOs
{
    public class CursoDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty; // Nova propriedade
        public List<MatriculaDto> Matriculas { get; set; } = new List<MatriculaDto>();
    }
}