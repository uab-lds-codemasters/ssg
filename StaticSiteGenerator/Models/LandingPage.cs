/*
 * Unidade Curricular: 21179 - Laboratórios de Desenvolvimento de Software
 * Grupo: Grupo 1 - CodeMasters
 * Projeto: Static Site Generator com Json.NET
 * Ficheiro: LandingPage.cs
 * Descrição: Representa os dados da página inicial do site.
 */

namespace StaticSiteGenerator.Models
{
    public class LandingPage
    {
        public string Title { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public string Theme { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string ImagePath { get; set; } = string.Empty;
        public string DocumentPath { get; set; } = string.Empty;
        public string DocumentName { get; set; } = string.Empty;
        public string Footer { get; set; } = "Gerado com CodeMasters SSG";
    }
}