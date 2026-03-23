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

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Reset()
        {
            string defaultLanding = "{\n  \"title\": \"CodeMasters Static Site\",\n  \"subtitle\": \"Exemplo de página inicial\",\n  \"theme\": \"default.css\"\n}";
            string defaultMenu = "[\n  {\n    \"title\": \"Início\",\n    \"link\": \"/\"\n  }\n]";

            string dataFolder = Path.Combine(Directory.GetCurrentDirectory(), "Data");
            Directory.CreateDirectory(dataFolder);
            System.IO.File.WriteAllText(Path.Combine(dataFolder, "landingPage.json"), defaultLanding);
            System.IO.File.WriteAllText(Path.Combine(dataFolder, "menu.json"), defaultMenu);

            TempData["Message"] = "Ficheiros restaurados para os valores por defeito.";
            return RedirectToAction("Index");
        }
    }
}

