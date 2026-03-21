# Static Site Generator com Json.NET

### UAB - LEI - LDS - Equipa 1 Codemasters

## Descrição do Projeto

Este projeto consiste no desenvolvimento de um Static Site Generator, ou seja, uma aplicação capaz de gerar automaticamente 
páginas web estáticas em HTML/CSS a partir de ficheiros JSON.

A aplicação tem como objetivo ler diferentes ficheiros JSON com conteúdos do site, como posts, títulos, menus e outras secções, 
e transformar essa informação em páginas HTML organizadas. 

Para isso, é utilizada a biblioteca Json.NET, que permite fazer a leitura e desserialização dos dados de forma simples e eficiente.

## Arquitetura

Relativamente à estrutura da aplicação, foi adotado o padrão MVC segundo a abordagem de Krasner & Pope, que representa uma das formulações clássicas do padrão.

- O Model representa a estrutura dos dados lidos dos ficheiros JSON. 
- O Controller é responsável por coordenar a leitura, o tratamento da informação e o processo de geração das páginas. 
- A View está associada aos templates e à produção final do HTML.

## Objetivo

Desta forma, o projeto permite demonstrar a utilização da biblioteca Json.NET num contexto prático, 
aplicando conceitos de organização de software e geração automática de conteúdo com base em dados estruturados.
