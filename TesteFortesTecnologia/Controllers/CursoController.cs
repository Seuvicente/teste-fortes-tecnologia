using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TesteFortesTecnologia.Data;
using TesteFortesTecnologia.Models;
using TesteFortesTecnologia.Models.DTOs;

namespace TesteFortesTecnologia.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CursoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CursoController(AppDbContext context)
        {
            _context = context;
        }

        private CursoDto MapToCursoDto(Curso curso)
        {
            return new CursoDto
            {
                Id = curso.Id,
                Nome = curso.Nome ?? string.Empty,
                Descricao = curso.Descricao ?? string.Empty,
                Matriculas = curso.MatriculaCursos?
                    .Select(mc => new MatriculaDto
                    {
                        Id = mc.Matricula.Id,
                        Cursos = mc.Matricula.MatriculaCursos
                            .Where(mc2 => mc2.Curso != null)
                            .Select(mc2 => new CursoDto
                            {
                                Id = mc2.Curso.Id,
                                Nome = mc2.Curso.Nome ?? string.Empty,
                                Descricao = mc2.Curso.Descricao ?? string.Empty,
                                Matriculas = new List<MatriculaDto>()
                            })
                            .ToList()
                    })
                    .ToList() ?? new List<MatriculaDto>()
            };
        }

        private AlunoDto MapToAlunoDto(Aluno aluno)
        {
            if (aluno == null)
                return null;

            return new AlunoDto
            {
                Id = aluno.Id,
                Nome = aluno.Nome ?? string.Empty,
                Email = aluno.Email ?? string.Empty,
                DataNascimento = aluno.DataNascimento,
                Matricula = aluno.Matricula != null
                    ? new MatriculaDto
                    {
                        Id = aluno.Matricula.Id,
                        AlunoId = aluno.Id,  // Define explicitamente o ID do aluno aqui
                        Cursos = aluno.Matricula.MatriculaCursos?
                            .Where(mc => mc.Curso != null)
                            .Select(mc =>
                            {
                                var curso = mc.Curso;
                                return new CursoDto
                                {
                                    Id = curso.Id,
                                    Nome = curso.Nome ?? string.Empty,
                                    Descricao = curso.Descricao ?? string.Empty,
                                    Matriculas = new List<MatriculaDto>()
                                };
                            })
                            .ToList() ?? new List<CursoDto>()
                    }
                    : null
            };
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CursoDto>>> GetCursos()
        {
            var cursos = await _context.Cursos
                .Include(c => c.MatriculaCursos)
                .ThenInclude(mc => mc.Matricula)
                .ThenInclude(m => m.MatriculaCursos)
                .ThenInclude(mc => mc.Curso)
                .ToListAsync();

            var cursosDto = cursos.Select(c => MapToCursoDto(c)).ToList();
            return Ok(cursosDto);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CursoDto>> GetCurso(int id)
        {
            var curso = await _context.Cursos
                .Include(c => c.MatriculaCursos)
                .ThenInclude(mc => mc.Matricula)
                .ThenInclude(m => m.MatriculaCursos)
                .ThenInclude(mc => mc.Curso)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (curso == null)
            {
                return NotFound();
            }

            var cursoDto = MapToCursoDto(curso);
            return Ok(cursoDto);
        }

        [HttpGet("{id}/alunos")]
        public async Task<ActionResult<IEnumerable<AlunoDto>>> GetAlunosPorCurso(int id)
        {
            var curso = await _context.Cursos
                .Include(c => c.MatriculaCursos)
                .ThenInclude(mc => mc.Matricula)
                .ThenInclude(m => m.Aluno)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (curso == null)
            {
                return NotFound("Curso não encontrado.");
            }

            var alunos = (curso.MatriculaCursos ?? new List<MatriculaCurso>())
                .Select(mc => mc.Matricula.Aluno)
                .ToList();

            var alunosDto = alunos.Select(a => MapToAlunoDto(a)).ToList();
            return Ok(alunosDto);
        }

        [HttpPost]
        public async Task<ActionResult<CursoDto>> CreateCurso(CursoDto cursoDto)
        {
            if (cursoDto == null)
            {
                return BadRequest("O objeto cursoDto é obrigatório.");
            }

            if (string.IsNullOrWhiteSpace(cursoDto.Nome))
            {
                return BadRequest("O nome do curso é obrigatório.");
            }

            var curso = new Curso
            {
                Nome = cursoDto.Nome,
                Descricao = cursoDto.Descricao,
                MatriculaCursos = new List<MatriculaCurso>()
            };

            _context.Cursos.Add(curso);
            await _context.SaveChangesAsync();

            var createdCursoDto = MapToCursoDto(curso);
            return CreatedAtAction(nameof(GetCurso), new { id = curso.Id }, createdCursoDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCurso(int id, [FromBody] CursoDto cursoDto)
        {
            if (cursoDto == null)
            {
                return BadRequest("O objeto cursoDto é obrigatório.");
            }

            if (id != cursoDto.Id)
            {
                return BadRequest("O ID na URL não corresponde ao ID no corpo da requisição.");
            }

            if (string.IsNullOrWhiteSpace(cursoDto.Nome))
            {
                return BadRequest("O nome do curso é obrigatório.");
            }

            var curso = await _context.Cursos.FindAsync(id);
            if (curso == null)
            {
                return NotFound("Curso não encontrado.");
            }

            curso.Nome = cursoDto.Nome;
            curso.Descricao = cursoDto.Descricao;

            _context.Entry(curso).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCurso(int id)
        {
            var curso = await _context.Cursos
                .Include(c => c.MatriculaCursos)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (curso == null)
            {
                return NotFound("Curso não encontrado.");
            }

            _context.Cursos.Remove(curso);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{cursoId}/alunos/{alunoId}")]
        public async Task<IActionResult> AdicionarAlunoAoCurso(int cursoId, int alunoId)
        {
            var curso = await _context.Cursos
                .Include(c => c.MatriculaCursos)
                .FirstOrDefaultAsync(c => c.Id == cursoId);

            if (curso == null)
            {
                return NotFound("Curso não encontrado.");
            }

            var aluno = await _context.Alunos
                .Include(a => a.Matricula)
                .ThenInclude(m => m.MatriculaCursos)
                .FirstOrDefaultAsync(a => a.Id == alunoId);

            if (aluno == null)
            {
                return NotFound("Aluno não encontrado.");
            }

            // Verificar se o aluno já possui uma matrícula
            if (aluno.Matricula == null)
            {
                // Criar uma nova matrícula para o aluno
                aluno.Matricula = new Matricula
                {
                    AlunoId = aluno.Id,
                    MatriculaCursos = new List<MatriculaCurso>()
                };

                _context.Matriculas.Add(aluno.Matricula);
                await _context.SaveChangesAsync();
            }

            // Verificar se o aluno já está matriculado no curso
            if (aluno.Matricula.MatriculaCursos != null &&
                aluno.Matricula.MatriculaCursos.Any(mc => mc.CursoId == cursoId))
            {
                return BadRequest("O aluno já está matriculado neste curso.");
            }

            var matriculaCurso = new MatriculaCurso
            {
                MatriculaId = aluno.Matricula.Id,
                CursoId = cursoId
            };

            if (curso.MatriculaCursos == null)
            {
                curso.MatriculaCursos = new List<MatriculaCurso>();
            }

            curso.MatriculaCursos.Add(matriculaCurso);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
    }