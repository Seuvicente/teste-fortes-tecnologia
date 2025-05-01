using TesteFortesTecnologia.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// --- 1. Defina um nome para sua política CORS ---
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TesteFortesTecnologia API",
        Version = "v1",
        Description = "API para o sistema TesteFortesTecnologia"
    });
});

// Conexão com banco SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=TesteFortesTecnologia.db"));

// Registrar os controllers
builder.Services.AddControllers();

// --- 2. Adicione os Serviços CORS ---
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins, // Usa o nome definido acima
                      policy =>
                      {
                          policy.WithOrigins(
                                  "http://localhost:5173", // <-- VERIFIQUE A PORTA do seu frontend Vite! (5173 é comum)
                                  "http://127.0.0.1:5173"  // <-- Adicione esta também com a porta correta
                                                           // Adicione a URL do seu frontend em produção aqui depois:
                                                           // "https://www.seusite.com"
                                )
                                .AllowAnyHeader() // Permite cabeçalhos comuns
                                .AllowAnyMethod(); // Permite métodos comuns (GET, POST, etc.)
                      });
    // Você pode adicionar outras políticas aqui se precisar (ex: uma mais permissiva para Dev)
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TesteFortesTecnologia API v1");
        // Se quiser que o Swagger UI seja a página inicial em dev:
        // c.RoutePrefix = string.Empty;
    });
}

// Ordem recomendada para middlewares comuns:
// app.UseHttpsRedirection(); // Se for usar HTTPS (cuidado em dev sem certificado válido)

app.UseRouting(); // Roteamento identifica o endpoint

// --- 3. Use o Middleware CORS ---
// Deve vir DEPOIS de UseRouting e ANTES de UseAuthorization e MapControllers
app.UseCors(MyAllowSpecificOrigins); // Aplica a política que você definiu

app.UseAuthorization(); // Aplica regras de autorização

app.MapControllers(); // Mapeia as requisições para os seus Controllers

app.Run();