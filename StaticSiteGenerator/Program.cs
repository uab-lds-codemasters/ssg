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

// Adicionar suporte a controllers e views
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configuração do pipeline HTTP
if (app.Environment.IsDevelopment())
{
    // Em desenvolvimento: mostrar página de erros detalhada
    app.UseDeveloperExceptionPage();
}
else
{
    // Em produção: redirecionar para página de erro personalizada
    app.UseExceptionHandler("/Site/Error");
    app.UseHsts();
}

// HTTPS não está configurado para ambiente local de desenvolvimento
// Para produção, descomentar a linha abaixo e configurar certificado SSL
// app.UseHttpsRedirection();

// Ativar ficheiros estáticos da pasta wwwroot (CSS, JS, imagens)
app.UseStaticFiles();

app.UseRouting();
app.UseAuthorization();

// Caminho padrão: controller=Site, action=Index
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Site}/{action=Index}/{id?}");

app.Run();