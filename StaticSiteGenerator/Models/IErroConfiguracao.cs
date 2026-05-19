/*
 * Unidade Curricular: 21179 - Laboratórios de Desenvolvimento de Software
 * Grupo: Grupo 1 - CodeMasters
 * Projeto: Static Site Generator com Json.NET
 * Ficheiro: IErroConfiguracao.cs
 * Descrição: Interface comum para todos os erros de configuração da aplicação.
 */

namespace StaticSiteGenerator.Models
{
    public interface IErroConfiguracao
    {
        string Mensagem { get; }
        string Sugestao { get; }
    }
}
