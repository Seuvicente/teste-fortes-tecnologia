using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TesteFortesTecnologia.Controllers;
using TesteFortesTecnologia.Data;
using TesteFortesTecnologia.Models;
using TesteFortesTecnologia.Models.DTOs;


namespace TesteFortesTecnologia.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlunoController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AlunoController> _logger;
        public AlunoController(AppDbContext context , ILogger<AlunoController> logger)
        {
            _context = context;
            _logger = logger;
            
        }

        // Método auxiliar para mapear Curso para CursoDto
        private CursoDto MapToCursoDto(Curso? curso)
        {
            if (curso == null)
            {
                return new CursoDto
                {
                    Id = 0,
                    Nome = string.Empty,
                    Descricao = string.Empty,
                    Matriculas = new List<MatriculaDto>()
                };
            }

            return new CursoDto
            {
                Id = curso.Id,
                Nome = curso.Nome ?? string.Empty,
                Descricao = curso.Descricao ?? string.Empty,
                Matriculas = new List<MatriculaDto>()
            };
        }

        // Método auxiliar para mapear Matricula para MatriculaDto
        private MatriculaDto MapToMatriculaDto(Matricula matricula)
        {
            if (matricula == null)
            {
                return new MatriculaDto
                {
                    Id = 0,
                    Cursos = new List<CursoDto>()
                };
            }

            return new MatriculaDto
            {
                Id = matricula.Id,
                Cursos = matricula.MatriculaCursos?
                    .Select(mc => MapToCursoDto(mc.Curso))
                    .ToList() ?? new List<CursoDto>()
            };
        }

        // Método auxiliar para mapear Aluno para AlunoDto
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
                        AlunoId = aluno.Id,  
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

       

        private Task<ActionResult<AlunoDto>> ValidateAge(DateTime dataNascimento)
        {
            _logger.LogInformation("---- Iniciando ValidateAge ----");
            _logger.LogInformation("DataNascimento recebida: {DataNascimento}", dataNascimento);
            var today = DateTime.Today;
            _logger.LogInformation("DateTime.Today (Servidor): {Today}", today);

            var age = today.Year - dataNascimento.Year;
            _logger.LogInformation("Cálculo inicial de idade: {Age}", age);

            if (dataNascimento.Date > today.AddYears(-age))
            {
                _logger.LogInformation("Ajustando idade (aniversário ainda não ocorreu este ano).");
                age--;
            }
            _logger.LogInformation("Idade final calculada: {Age}", age);

            if (age < 18)
            {
                _logger.LogWarning("VALIDAÇÃO FALHOU: Idade {Age} < 18.", age);
                return Task.FromResult<ActionResult<AlunoDto>>(
                    BadRequest("O aluno deve ter pelo menos 18 anos de idade.")
                );
            }

            _logger.LogInformation("VALIDAÇÃO OK: Idade {Age} >= 18.", age);
            return Task.FromResult<ActionResult<AlunoDto>>(Ok());
        }


        // GET: api/Aluno
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AlunoDto>>> GetAlunos()
        {
            var alunos = await _context.Alunos
                .Include(a => a.Matricula)
                .ThenInclude(m => m.MatriculaCursos)
                .ThenInclude(mc => mc.Curso)
                .ToListAsync();

            var alunosDto = alunos.Select(a => MapToAlunoDto(a)).ToList();
            return Ok(alunosDto);
        }


        // GET: api/Aluno/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AlunoDto>> GetAluno(int id)
        {
            var aluno = await _context.Alunos
                 .Include(a => a.Matricula)
                    .ThenInclude(m => m.MatriculaCursos)
                        .ThenInclude(mc => mc.Curso)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (aluno == null)
            {
                return NotFound();
            }

            var alunoDto = MapToAlunoDto(aluno);
            return Ok(alunoDto);
        }

      

        // POST: api/Aluno
        [HttpPost]
        public async Task<ActionResult<AlunoDto>> CreateAluno(AlunoDto alunoDto)
        {
            var ageValidationResult = await ValidateAge(alunoDto.DataNascimento);

        
            if (ageValidationResult.Result is ObjectResult result && result.StatusCode == StatusCodes.Status400BadRequest)
            
            {
                
                object? errorValue = (ageValidationResult.Result as BadRequestObjectResult)?.Value;
                return BadRequest(errorValue ?? "O aluno deve ter pelo menos 18 anos de idade.");
            }



            var aluno = new Aluno
            {
                Nome = alunoDto.Nome,
                Email = alunoDto.Email,
                DataNascimento = alunoDto.DataNascimento,
                Matricula = new Matricula
                {
                    MatriculaCursos = new List<MatriculaCurso>()
                }
            };

            _context.Alunos.Add(aluno);
            await _context.SaveChangesAsync();

            var createdAlunoDto = MapToAlunoDto(aluno);
            return CreatedAtAction(nameof(GetAluno), new { id = aluno.Id }, createdAlunoDto);
        }

        // PUT: api/Aluno/5
        [HttpPut("{id}")]
        public async Task<ActionResult<AlunoDto>> UpdateAluno(int id, [FromBody] AlunoDto alunoDto)
        {
            if (alunoDto == null)
            {
                return BadRequest("O objeto alunoDto é obrigatório.");
            }

            if (id != alunoDto.Id)
            {
                return BadRequest("O ID na URL não corresponde ao ID no corpo da requisição.");
            }

            var ageValidationResult = await ValidateAge(alunoDto.DataNascimento);
            if (ageValidationResult.Result is ObjectResult result && result.StatusCode == StatusCodes.Status400BadRequest)

            {

                object? errorValue = (ageValidationResult.Result as BadRequestObjectResult)?.Value;
                return BadRequest(errorValue ?? "O aluno deve ter pelo menos 18 anos de idade.");
            }

            var aluno = await _context.Alunos
                .Include(a => a.Matricula)
                .ThenInclude(m => m.MatriculaCursos)
                .ThenInclude(mc => mc.Curso)
                .FirstOrDefaultAsync(a => a.Id == id);
            if (aluno == null)
            {
                return NotFound();
            }

            aluno.Nome = alunoDto.Nome;
            aluno.Email = alunoDto.Email;
            aluno.DataNascimento = alunoDto.DataNascimento;

            if (alunoDto.Matricula != null && alunoDto.Matricula.Cursos != null)
            {
                aluno.Matricula.MatriculaCursos!.Clear();

                foreach (var cursoDto in alunoDto.Matricula.Cursos)
                {
                    var curso = await _context.Cursos.FindAsync(cursoDto.Id);
                    if (curso == null)
                    {
                        return BadRequest($"Curso com ID {cursoDto.Id} não encontrado.");
                    }

                    aluno.Matricula.MatriculaCursos!.Add(new MatriculaCurso
                    {
                        MatriculaId = aluno.Matricula.Id,
                        CursoId = curso.Id
                    });
                }
            }
            else
            {
                aluno.Matricula.MatriculaCursos!.Clear();
            }

            _context.Entry(aluno).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Aluno/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAluno(int id)
        {
            var aluno = await _context.Alunos
                .Include(a => a.Matricula)
                .ThenInclude(m => m.MatriculaCursos)
                .FirstOrDefaultAsync(a => a.Id == id);
            if (aluno == null)
            {
                return NotFound();
            }

            _context.Alunos.Remove(aluno);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Aluno/{alunoId}/matricular/{cursoId}
        [HttpPost("{alunoId}/matricular/{cursoId}")]
        public async Task<IActionResult> MatricularAlunoEmCurso(int alunoId, int cursoId)
        {
            // Verificar se o aluno existe
            var aluno = await _context.Alunos
            .Include(a => a.Matricula)
            .ThenInclude(m => m.MatriculaCursos)
            .FirstOrDefaultAsync(a => a.Id == alunoId);

            if (aluno == null)
            {
                return NotFound("Aluno não encontrado.");
            }
            if (aluno?.Matricula?.MatriculaCursos == null)
            {
                return BadRequest("O aluno não possui matrícula ou a matrícula não está corretamente associada.");
            }

            // Verificar se o curso existe
            var curso = await _context.Cursos.FindAsync(cursoId);
            if (curso == null)
            {
                return NotFound("Curso não encontrado.");
            }

            // Verificar se o aluno já está matriculado no curso
            if (aluno.Matricula.MatriculaCursos.Any(mc => mc.CursoId == cursoId))
            {
                return BadRequest("O aluno já está matriculado neste curso.");
            }

            // Criar a associação na tabela MatriculaCurso
            var matriculaCurso = new MatriculaCurso
            {
                MatriculaId = aluno.Matricula.Id,
                CursoId = cursoId
            };

            aluno.Matricula.MatriculaCursos.Add(matriculaCurso);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Aluno/{alunoId}/matricula/{cursoId}
        [HttpDelete("{alunoId}/matricula/{cursoId}")]
        public async Task<IActionResult> DesmatricularAlunoDeCurso(int alunoId, int cursoId)
        {
            // 1. Encontrar o aluno e incluir sua matrícula e os vínculos MatriculaCurso
            var aluno = await _context.Alunos
                .Include(a => a.Matricula)
                .ThenInclude(m => m.MatriculaCursos)
                .FirstOrDefaultAsync(a => a.Id == alunoId);

            if (aluno == null)
            {
                return NotFound("Aluno não encontrado.");
            }

            if (aluno.Matricula == null)
            {
                // Considerar se um aluno pode existir sem matrícula. Se não, isso seria um estado inesperado.
                return NotFound("Matrícula do aluno não encontrada.");
            }

            // 2. Encontrar o vínculo específico (MatriculaCurso) para este aluno e este curso
            var matriculaCursoParaRemover = aluno.Matricula.MatriculaCursos?
                                                 .FirstOrDefault(mc => mc.CursoId == cursoId);

            // 3. Verificar se o vínculo existe
            if (matriculaCursoParaRemover == null)
            {
                // O aluno existe, a matrícula existe, mas ele não está matriculado neste curso específico.
                return NotFound("Aluno não está matriculado neste curso.");
            }

            // 4. Remover o vínculo (a entrada na tabela MatriculaCursos)
            _context.Remove(matriculaCursoParaRemover);
            // 5. Salvar as alterações no banco de dados
            await _context.SaveChangesAsync();

            // 6. Retornar sucesso sem conteúdo
            return NoContent();
        }
    }
}