/*
 * Unidade Curricular: 21179 - Laboratórios de Desenvolvimento de Software
 * Grupo: Grupo 1 - CodeMasters
 * Projeto: Static Site Generator com Json.NET
 * Ficheiro: SiteEditorViewModel.cs
 * Descrição: Representa os dados usados pela view de edição e pré-visualização.
 */

using System.Collections.Generic;

namespace StaticSiteGenerator.Models
{
    public class SiteEditorViewModel
    {
        public string LandingJson { get; set; } = string.Empty;
        public string MenuJson { get; set; } = string.Empty;
        public LandingPage LandingPage { get; set; } = new();
        public List<MenuItem> MenuItems { get; set; } = new();
    }
}