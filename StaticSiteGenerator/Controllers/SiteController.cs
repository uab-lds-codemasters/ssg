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
using System.IO;

namespace StaticSiteGenerator.Controllers
{
    public class SiteController : Controller
    {
        private bool DadosValidos(string landingJson, string menuJson)
        {
            return !string.IsNullOrWhiteSpace(landingJson) && !string.IsNullOrWhiteSpace(menuJson);
        }
        private bool DadosDesserializados (string landingJson, string menuJson, 
            out LandingPage? landingPage, out List<MenuItem>? menuItems)
        {
            landingPage = null;
            menuItems = null;

            try
            {
                landingPage = JsonConvert.DeserializeObject<LandingPage>(landingJson);
                menuItems = JsonConvert.DeserializeObject<List<MenuItem>>(menuJson);

                return landingPage != null && menuItems != null;
            }
            catch (JsonException)
            {
                return false;
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
            ModelState.AddModelError("", _mensagemErro);
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
            if(!DadosValidos(landingJson, menuJson))
            {
                RetornarErro("Os dados não podem ser vazios", landingJson, menuJson);
            }

            if(!DadosDesserializados(landingJson, menuJson, out LandingPage? landingPage, out List<MenuItem>? menuItems))
            {
                RetornarErro("Ficheiros Json inválido", landingJson, menuJson);
            }

            SalvarDados(landingJson, menuJson);


            SiteEditorViewModel viewModel = new SiteEditorViewModel
            {
                LandingJson = landingJson,
                MenuJson = menuJson,
                LandingPage = landingPage ?? new LandingPage(),
                MenuItems = menuItems ?? new List<MenuItem>()
            };

            return View(viewModel);
        }
    }
}