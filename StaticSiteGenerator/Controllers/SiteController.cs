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
using System.Collections.Generic;
using System.Data;
using System.IO;

namespace StaticSiteGenerator.Controllers
{
    public class ConfiguracaoInvalidaException : Exception, IErroConfiguracao
    {
        public string Mensagem => Message;
        public string Sugestao { get; }
        public ConfiguracaoInvalidaException(string mensagem, string sugestao) : base(mensagem)
        {
            Sugestao = sugestao;
        }
    }

    public class ErroFicheiroNaoEncontrado : Exception, IErroConfiguracao
    {
        public string Mensagem => Message;
        public string Sugestao { get; }
        public string CaminhoFicheiro { get; }

        public ErroFicheiroNaoEncontrado(string caminhoFicheiro)
            : base($"Ficheiro não encontrado: {caminhoFicheiro}")
        {
            CaminhoFicheiro = caminhoFicheiro;
            Sugestao = $"Verifique se o ficheiro existe em: {caminhoFicheiro}";
        }
    }
    public class SiteController : Controller
    {
        
        private void ValidarDadosEntrada(string? landingJson, string? menuJson)
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
        private static string JsonValidoOuPadrao(string? json, string padrao)
        {
            if (string.IsNullOrWhiteSpace(json)) return padrao;
            try { JsonConvert.DeserializeObject(json); return json; }
            catch (JsonException) { return padrao; }
        }

        private SiteEditorViewModel CriarModelViewParaErro(string? landingJson, string? menuJson)
        {
            return new SiteEditorViewModel
            {
                LandingJson = JsonValidoOuPadrao(landingJson,
                    "{\n  \"title\": \"\",\n  \"subtitle\": \"\",\n  \"theme\": \"default.css\"\n}"),
                MenuJson = JsonValidoOuPadrao(menuJson, "[]")
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
       
        private IActionResult RetornarErro (string mensagem, string? landingPage, string? menuJson)
        {
            AoOcorrerErro?.Invoke(mensagem);
            ModelState.AddModelError("", _mensagemErro ?? mensagem);
            return View("Index", CriarModelViewParaErro(landingPage, menuJson));
        }

        private IActionResult RetornarErro(IErroConfiguracao erro, string? landingPage, string? menuJson)
        {
            return RetornarErro(
                $"{erro.Mensagem} Sugestão: {erro.Sugestao}",
                landingPage, menuJson);
        }

        private string LerFicheiro(string caminho, string conteudoPadrao)
        {
            if (!System.IO.File.Exists(caminho))
                throw new ErroFicheiroNaoEncontrado(caminho);
            return System.IO.File.ReadAllText(caminho);
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

            string landingJson = "{\n  \"title\": \"CodeMasters Static Site\",\n  \"subtitle\": \"Exemplo de página inicial\",\n  \"theme\": \"default.css\"\n}";
            string menuJson = "[\n  {\n    \"title\": \"Início\",\n    \"link\": \"/\"\n  }\n]";

            try
            {
                landingJson = LerFicheiro(landingPath, landingJson);
                menuJson    = LerFicheiro(menuPath, menuJson);
            }
            catch (Exception ex) when (ex is IErroConfiguracao)
            {
                // Mantém os valores padrão definidos acima
            }

            SiteEditorViewModel viewModel = new SiteEditorViewModel
            {
                LandingJson = landingJson,
                MenuJson = menuJson
            };

            return View(viewModel);
        }

        [HttpPost]
        public IActionResult Preview(string? landingJson, string? menuJson)
        {
            try
            {
                ValidarDadosEntrada(landingJson, menuJson);
                DesserializarDados(landingJson!, menuJson!,
                    out LandingPage landingPage, out List<MenuItem> menuItems);

                SalvarDados(landingJson!, menuJson!);

                SiteEditorViewModel viewModel = new SiteEditorViewModel
                {
                    LandingJson = landingJson!,
                    MenuJson = menuJson!,
                    LandingPage = landingPage,
                    MenuItems = menuItems
                };

                return View(viewModel);
            }
            catch (Exception ex) when (ex is IErroConfiguracao erro)
            {
                return RetornarErro(erro, landingJson, menuJson);
            }
        }
    }
}