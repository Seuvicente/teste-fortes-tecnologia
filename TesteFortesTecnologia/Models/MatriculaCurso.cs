namespace TesteFortesTecnologia.Models
{
    public class MatriculaCurso
    {
        public int MatriculaId { get; set; }
        public Matricula Matricula { get; set; }
        public int CursoId { get; set; }
        public Curso? Curso { get; set; }
    }
}