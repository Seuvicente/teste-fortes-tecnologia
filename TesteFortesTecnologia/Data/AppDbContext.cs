using System.Collections.Generic;
using System.Reflection.Emit;
using Microsoft.EntityFrameworkCore;
using TesteFortesTecnologia.Models;

namespace TesteFortesTecnologia.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Aluno> Alunos => Set<Aluno>();
        public DbSet<Curso> Cursos => Set<Curso>();
        public DbSet<Matricula> Matriculas => Set<Matricula>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            
            modelBuilder.Entity<Aluno>()
                .HasOne(a => a.Matricula)
                .WithOne(m => m.Aluno)
                .HasForeignKey<Matricula>(m => m.AlunoId);

            modelBuilder.Entity<Matricula>()
                .HasIndex(m => m.AlunoId)
                .IsUnique();

            modelBuilder.Entity<MatriculaCurso>()
                .HasKey(mc => new { mc.MatriculaId, mc.CursoId });

            modelBuilder.Entity<MatriculaCurso>()
                .HasOne(mc => mc.Matricula)
                .WithMany(m => m.MatriculaCursos)
                .HasForeignKey(mc => mc.MatriculaId);

            modelBuilder.Entity<MatriculaCurso>()
                .HasOne(mc => mc.Curso)
                .WithMany(c => c.MatriculaCursos)
                .HasForeignKey(mc => mc.CursoId);
        }
    }
}
