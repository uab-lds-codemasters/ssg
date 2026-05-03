/*
 * Unidade Curricular: 21179 - Laboratórios de Desenvolvimento de Software
 * Grupo: Grupo 1 - CodeMasters
 * Projeto: Static Site Generator com Json.NET
 * Ficheiro: preview.js
 * Descrição: Lógica de pré-visualização, modularizada e reutilizável.
 */

/**
 * Objeto com funções da pré-visualização
 */
const Preview = {
    temaAtual: '',

    /**
     * Inicializa a pré-visualização
     */
    init: function() {
        this.setupEventListeners();
        const temaElement = document.querySelector('[data-tema]');
        if (temaElement) {
            this.temaAtual = temaElement.getAttribute('data-tema');
            this.mudarTema(this.temaAtual);
        }
    },

    /**
     * Configura listeners de eventos
     */
    setupEventListeners: function() {
        document.querySelectorAll('.nav-link-menu').forEach(link => {
            link.addEventListener('click', (e) => this.handleMenuClick(e));
        });
    },

    /**
     * Muda o tema CSS
     * @param {string} tema - Nome do tema (ex: 'default.css')
     */
    mudarTema: function(tema) {
        document.getElementById('temaCSS').href = '/css/' + tema;
        this.temaAtual = tema;

        // Remover classe ativo de todos os botões
        document.querySelectorAll('.btn-tema').forEach(b => {
            b.classList.remove('ativo');
        });

        // Adicionar classe ativo ao botão selecionado
        const id = 'btn-' + tema.replace('.css', '');
        const btn = document.getElementById(id);
        if (btn) {
            btn.classList.add('ativo');
        }
    },

    /**
     * Trata clique no menu
     * @param {event} event - Evento de clique
     */
    handleMenuClick: function(event) {
        const href = event.currentTarget.getAttribute('href');
        const isExterno = href && (href.startsWith('http://') || href.startsWith('https://'));
        if (isExterno) return;
        event.preventDefault();
        this.loadIframe(href);
    },

    /**
     * Fecha a iframe
     */
    fecharIframe: function() {
        const frame = document.getElementById('conteudo-frame');
        const container = document.getElementById('frame-container');
        const aviso = document.getElementById('frame-aviso');
        container.style.display = 'none';
        frame.src = '';
        aviso.style.display = 'none';
    },

    /**
     * Carrega conteúdo no iframe
     * @param {string} href - URL a carregar
     */
    loadIframe: function(href) {
        const frame = document.getElementById('conteudo-frame');
        const container = document.getElementById('frame-container');
        const aviso = document.getElementById('frame-aviso');
        const linkNovaAba = document.getElementById('link-nova-aba');

        // "/" ou "#" ou vazio = página inicial = voltar ao topo
        if (href === '/' || href === '#' || href === '') {
            container.style.display = 'none';
            frame.src = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Outros links: carregar no iframe
        container.style.display = 'block';
        aviso.style.display = 'none';
        frame.src = href;
        linkNovaAba.href = href;

        // Detectar se foi bloqueado após carregar
        frame.onload = function() {
            try {
                const doc = frame.contentDocument || frame.contentWindow.document;
                if (!doc || doc.body === null || doc.body.innerHTML === '') {
                    aviso.style.display = 'flex';
                }
            } catch(err) {
                // Bloqueado por CORS ou outro erro
                aviso.style.display = 'flex';
            }
        };

        // Detectar erro de carregamento
        frame.onerror = function() {
            aviso.style.display = 'flex';
        };
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    Preview.init();
});

