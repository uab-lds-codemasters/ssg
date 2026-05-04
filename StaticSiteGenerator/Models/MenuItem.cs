/*
 * Unidade Curricular: 21179 - Laboratórios de Desenvolvimento de Software
 * Grupo: Grupo 1 - CodeMasters
 * Projeto: Static Site Generator com Json.NET
 * Ficheiro: MenuItem.cs
 * Descrição: Representa um item de menu do site.
 */

namespace StaticSiteGenerator.Models
{
    public class MenuItem
    {
        public string Title { get; set; } = string.Empty;
        public string Link { get; set; } = string.Empty;
        public List<MenuItem> Children { get; set; } = new();
    }
}