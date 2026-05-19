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
using System;
using System.Collections.Generic;
using System.IO;

namespace StaticSiteGenerator.Controllers
{
    public class ConfiguracaoInvalidaException : Exception, IErroConfiguracao
    {
        public string Mensagem => Message;
        public string Sugestao { get; }

        public ConfiguracaoInvalidaException(string mensagem, string sugestao)
            : base(mensagem)
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
        private string LerFicheiro(string caminho, string conteudoPadrao)
        {
            if (!System.IO.File.Exists(caminho))
                throw new ErroFicheiroNaoEncontrado(caminho);
            return System.IO.File.ReadAllText(caminho);
        }

        private IActionResult RetornarErro(string mensagem, string? landingJson, string? menuJson)
        {
            SiteEditorViewModel viewModel = new SiteEditorViewModel
            {
                LandingJson = landingJson ?? string.Empty,
                MenuJson = menuJson ?? string.Empty,
                ErroMensagem = mensagem
            };
            return View("Index", viewModel);
        }

        private IActionResult RetornarErro(IErroConfiguracao erro, string? landingJson, string? menuJson)
        {
            return RetornarErro(
                $"{erro.Mensagem} Sugestão: {erro.Sugestao}",
                landingJson, menuJson);
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
        public IActionResult Preview(string landingJson, string menuJson)
        {
            try
            {
                LandingPage? landingPage = JsonConvert.DeserializeObject<LandingPage>(landingJson);
                List<MenuItem>? menuItems = JsonConvert.DeserializeObject<List<MenuItem>>(menuJson);

                string dataFolder = Path.Combine(Directory.GetCurrentDirectory(), "Data");
                Directory.CreateDirectory(dataFolder);

                System.IO.File.WriteAllText(Path.Combine(dataFolder, "landingPage.json"), landingJson);
                System.IO.File.WriteAllText(Path.Combine(dataFolder, "menu.json"), menuJson);

                SiteEditorViewModel viewModel = new SiteEditorViewModel
                {
                    LandingJson = landingJson,
                    MenuJson = menuJson,
                    LandingPage = landingPage ?? new LandingPage(),
                    MenuItems = menuItems ?? new List<MenuItem>()
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