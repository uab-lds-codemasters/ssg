/*
 * Unidade Curricular: 21179 - Laboratórios de Desenvolvimento de Software
 * Grupo: Grupo 1 - CodeMasters
 * Projeto: Static Site Generator com Json.NET
 * Ficheiro: SiteController.cs
 * Descrição: Controlador principal da aplicação.
 */

using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using StaticSiteGenerator.Models;

namespace StaticSiteGenerator.Controllers
{
    public class ConfiguracaoInvalidaException : Exception
    {
        public string Sugestao { get; }
        public ConfiguracaoInvalidaException(string mensagem, string sugestao) : base(mensagem)
        {
            Sugestao = sugestao;
        }
    }
    public class SiteController : Controller
    {
        
        private void ValidarDadosEntrada(string landingJson, string menuJson)
        {
            if (string.IsNullOrWhiteSpace(landingJson))
                throw new ConfiguracaoInvalidaException ("Os dados Json não podem ser vazios.", 
                    "Preencha o ficheiro Json da landingPage.");

            if(string.IsNullOrWhiteSpace(menuJson))
                throw new ConfiguracaoInvalidaException("Os dados Json não podem ser vazios.",
                    "Preencha o ficheiro Json do menu.");
        }
        private void DesserializarDados (string landingJson, string menuJson, 
            out LandingPage landingPage, out List<MenuItem> menuItems)
        {
            try
            {
                landingPage = JsonConvert.DeserializeObject<LandingPage>(landingJson)
                    ?? throw new ConfiguracaoInvalidaException("O Json da landing page é inválido.",
                    "Verifique a estrutura do ficheiro Json.");
                menuItems = JsonConvert.DeserializeObject<List<MenuItem>>(menuJson)
                    ?? throw new ConfiguracaoInvalidaException("O Json do menu é inválido.",
                    "Verifique a lista de itens do menu.");
            } 
            catch (JsonException)
            {
                throw new ConfiguracaoInvalidaException("O formato dos ficheiros Json são inválidos.",
                    "Verifique os ficheiros Json.");
            }
        }
        private SiteEditorViewModel CriarModelViewParaErro(string landingJson, string menuJson)
        {
            return new SiteEditorViewModel
            {
                LandingJson = landingJson,
                MenuJson = menuJson
            };
        }
        public delegate void MostrarMensagemErro(string mensagem);
        public event MostrarMensagemErro? AoOcorrerErro;
        private string? _mensagemErro;
        public SiteController()
        {
            AoOcorrerErro += GuardarMensagemErro;
        }

        private void GuardarMensagemErro (String mensagem)
        {
            _mensagemErro = mensagem ;
        }
       
        private IActionResult RetornarErro (string mensagem, string landingPage, string menuJson)
        {
            AoOcorrerErro?.Invoke(mensagem);
            ModelState.AddModelError("", _mensagemErro ?? mensagem);
            return View("Index", CriarModelViewParaErro(landingPage, menuJson));

        }
        public void SalvarDados(string landingJson, string menuJson)
        {
            string dataFolder = Path.Combine(Directory.GetCurrentDirectory(), "Data");
            Directory.CreateDirectory(dataFolder);

            System.IO.File.WriteAllText(Path.Combine(dataFolder, "landingPage.json"), landingJson);
            System.IO.File.WriteAllText(Path.Combine(dataFolder, "menu.json"), menuJson);
        }
        public IActionResult Index()
        {
            string landingPath = Path.Combine(Directory.GetCurrentDirectory(), "Data", "landingPage.json");
            string menuPath = Path.Combine(Directory.GetCurrentDirectory(), "Data", "menu.json");

            string landingJson = System.IO.File.Exists(landingPath)
                ? System.IO.File.ReadAllText(landingPath)
                : "{\n  \"title\": \"CodeMasters Static Site\",\n  \"subtitle\": \"Exemplo de página inicial\",\n  \"theme\": \"default.css\"\n}";

            string menuJson = System.IO.File.Exists(menuPath)
                ? System.IO.File.ReadAllText(menuPath)
                : "[\n  {\n    \"title\": \"Início\",\n    \"link\": \"/\"\n  }\n]";

            SiteEditorViewModel viewModel = new SiteEditorViewModel
            {
                LandingJson = landingJson,
                MenuJson = menuJson
            };

            return View(viewModel);
        }

        [HttpPost]
        public IActionResult Preview(string landingJson, string menuJson)
        {
            try
            {
                ValidarDadosEntrada(landingJson, menuJson);
                DesserializarDados(landingJson, menuJson,
                    out LandingPage landingPage, out List<MenuItem> menuItems);

                SalvarDados(landingJson, menuJson);

                SiteEditorViewModel viewModel = new SiteEditorViewModel
                {
                    LandingJson = landingJson,
                    MenuJson = menuJson,
                    LandingPage = landingPage,
                    MenuItems = menuItems
                };

                return View(viewModel);
            }
            catch (ConfiguracaoInvalidaException erro)
            {
                return RetornarErro($"{erro.Message} Sugestão: {erro.Sugestao}", landingJson, menuJson);
            }
        }
    }
}