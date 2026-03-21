/*
 * Unidade Curricular: 21179 - Laboratórios de Desenvolvimento de Software
 * Grupo: Grupo 1 - CodeMasters
 * Projeto: Static Site Generator com Json.NET
 * Ficheiro: Program.cs
 * Descrição: Configura os serviços, o pipeline HTTP e a rota principal da aplicação ASP.NET MVC.
 */

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = Directory.GetCurrentDirectory(),
    WebRootPath = "wwwroot"
});

// Adiciona suporte a controllers e views
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configuração do pipeline HTTP
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Site/Error");
    app.UseHsts();
}

// Não temos HTTPS configurado localmente, fica comentado
// app.UseHttpsRedirection();

// Ativa os ficheiros estáticos da pasta wwwroot
app.UseStaticFiles();

app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Site}/{action=Index}/{id?}");

app.Run();