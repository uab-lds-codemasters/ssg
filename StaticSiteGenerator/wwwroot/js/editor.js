/*
 * Unidade Curricular: 21179 - Laboratórios de Desenvolvimento de Software
 * Grupo: Grupo 1 - CodeMasters
 * Projeto: Static Site Generator com Json.NET
 * Ficheiro: editor.js
 * Descrição: Lógica do editor de conteúdo, modularizada e reutilizável.
 */

/**
 * Variáveis globais para armazenar Base64 dos ficheiros
 */
let currentImageBase64 = '';
let currentDocumentBase64 = '';
let currentDocumentName = '';

/**
 * Objeto com funções do editor
 */
const Editor = {
    /**
     * Inicializa o editor
     */
    init: function() {
        this.setupEventListeners();
        this.setupThemeToggle();
        this.loadThemePreference();
        this.loadImagemGuardada();
    },

    /**
     * Re-hidrata Base64 de imagem e documento a partir dos hidden inputs
     */
    loadImagemGuardada: function() {
        const existingImage = document.getElementById('existingImagePath')?.value;
        if (existingImage && existingImage.startsWith('data:')) {
            currentImageBase64 = existingImage;
        }

        const existingDoc = document.getElementById('existingDocumentPath')?.value;
        const existingDocName = document.getElementById('existingDocumentName')?.value;
        if (existingDoc && existingDocName) {
            currentDocumentBase64 = existingDoc;
            currentDocumentName = existingDocName;
        }
    },

    /**
     * Configura toggle de tema
     */
    setupThemeToggle: function() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', (e) => this.handleThemeToggle(e));
        }
    },

    /**
     * Trata mudança de tema
     * @param {event} event - Evento de mudança
     */
    handleThemeToggle: function(event) {
        const isDark = event.target.checked;
        if (isDark) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
            Notifications.info('Tema escuro ativado');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
            Notifications.info('Tema claro ativado');
        }
    },

    /**
     * Carrega preferência de tema
     */
    loadThemePreference: function() {
        const theme = localStorage.getItem('theme') || 'light';
        const isDark = theme === 'dark';

        if (isDark) {
            document.body.classList.add('dark-theme');
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.checked = true;
            }
        }
    },

    /**
     * Configura listeners de eventos
     */
    setupEventListeners: function() {
        const form = document.getElementById('editorForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        const imageInput = document.getElementById('siteImage');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.handleImageChange(e));
        }

        const documentInput = document.getElementById('siteDocument');
        if (documentInput) {
            documentInput.addEventListener('change', (e) => this.handleDocumentChange(e));
        }
    },

    /**
     * Adiciona novo item de menu
     */
    adicionarItem: function() {
        const container = document.getElementById('menuItems');
        if (!container) return;

        const div = document.createElement('div');
        div.className = 'menu-item mb-2';
        div.innerHTML = `
            <div class="row g-2 menu-item-row">
                <div class="col">
                    <input type="text" class="form-control menu-title" placeholder="Ex: Início" />
                </div>
                <div class="col">
                    <input type="text" class="form-control menu-link" placeholder="Ex: /" />
                </div>
                <div class="col-auto d-flex gap-1">
                    <button type="button" class="btn btn-outline-secondary"
                            onclick="Editor.adicionarSubitem(this)" title="Adicionar subitem">&#8853;</button>
                    <button type="button" class="btn btn-outline-danger"
                            onclick="Editor.removerItem(this)">&#10005;</button>
                </div>
            </div>
            <div class="menu-subitems ps-4 mt-1"></div>`;
        container.appendChild(div);
    },

    /**
     * Adiciona subitem a um item de menu
     * @param {element} btn - Botão ⊕ clicado
     */
    adicionarSubitem: function(btn) {
        const subitems = btn.closest('.menu-item').querySelector('.menu-subitems');
        if (!subitems) return;

        const div = document.createElement('div');
        div.className = 'row g-2 mb-1 menu-subitem';
        div.innerHTML = `
            <div class="col-auto d-flex align-items-center text-muted" style="width:28px">&#8627;</div>
            <div class="col">
                <input type="text" class="form-control form-control-sm menu-title" placeholder="Ex: Google" />
            </div>
            <div class="col">
                <input type="text" class="form-control form-control-sm menu-link" placeholder="Ex: https://google.com" />
            </div>
            <div class="col-auto">
                <button type="button" class="btn btn-sm btn-outline-danger"
                        onclick="Editor.removerItem(this)">&#10005;</button>
            </div>`;
        subitems.appendChild(div);
    },

    /**
     * Remove item ou subitem de menu
     * @param {element} btn - Botão clicado
     */
    removerItem: function(btn) {
        const subitem = btn.closest('.menu-subitem');
        if (subitem) {
            subitem.remove();
        } else {
            btn.closest('.menu-item').remove();
        }
    },

    /**
     * Trata preview de imagem
     * @param {event} event - Evento de mudança
     */
    handleImageChange: function(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validar tamanho (5MB)
        const validation = Validation.validateFileSize(file, 5);
        if (!validation.valid) {
            Notifications.error(validation.error);
            return;
        }

        // Validar tipo (image)
        const typeValidation = Validation.validateFileType(file, ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
        if (!typeValidation.valid) {
            Notifications.error(typeValidation.error);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImg = document.getElementById('previewImg');
            const imagePreview = document.getElementById('imagePreview');

            // Armazenar Base64 na variável global para ser incluído no JSON
            currentImageBase64 = e.target.result;

            if (previewImg) {
                previewImg.src = e.target.result;
            }

            if (imagePreview) {
                imagePreview.classList.remove('d-none');
                // Força reflow para garantir que o CSS é aplicado
                imagePreview.offsetHeight;
            }

            Notifications.success('Imagem carregada com sucesso (Base64 armazenada)');
        };
        reader.readAsDataURL(file);
    },

    /**
     * Trata preview de documento
     * @param {event} event - Evento de mudança
     */
    handleDocumentChange: function(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validar tamanho (20MB)
        const validation = Validation.validateFileSize(file, 20);
        if (!validation.valid) {
            Notifications.error(validation.error);
            return;
        }

        // Validar tipo
        const allowedTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/pdf', 'text/plain', 'text/csv', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
        const typeValidation = Validation.validateFileType(file, allowedTypes);
        if (!typeValidation.valid) {
            Notifications.error(typeValidation.error);
            return;
        }

        const docName = document.getElementById('docName');
        const docPreview = document.getElementById('docPreview');

        if (docName) docName.textContent = file.name;
        if (docPreview) {
            docPreview.classList.remove('d-none');
            docPreview.offsetHeight;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            currentDocumentBase64 = e.target.result;
            currentDocumentName = file.name;
            Notifications.success('Documento carregado com sucesso');
        };
        reader.readAsDataURL(file);
    },

    /**
     * Coleta dados do formulário e serializa
     * @returns {object} { landing, menu, valid: boolean }
     */
    collectFormData: function() {
        const title = document.getElementById('siteTitle').value;
        const subtitle = document.getElementById('siteSubtitle').value;
        const theme = document.getElementById('siteTheme').value;
        const content = document.getElementById('siteContent').value;
        const footer = document.getElementById('siteFooter').value;

        const landing = {
            title: title,
            subtitle: subtitle,
            theme: theme,
            content: content,
            imagePath: currentImageBase64 || document.getElementById('existingImagePath')?.value || '',
            documentPath: currentDocumentBase64 || document.getElementById('existingDocumentPath')?.value || '',
            documentName: currentDocumentName || document.getElementById('existingDocumentName')?.value || '',
            footer: footer
        };

        const items = [];
        document.querySelectorAll('#menuItems > .menu-item').forEach(item => {
            const row = item.querySelector('.menu-item-row');
            const title = row?.querySelector('.menu-title')?.value.trim();
            const link = row?.querySelector('.menu-link')?.value.trim() || '';
            if (!title) return;

            const children = [];
            item.querySelectorAll('.menu-subitem').forEach(sub => {
                const subTitle = sub.querySelector('.menu-title')?.value.trim();
                const subLink = sub.querySelector('.menu-link')?.value.trim();
                if (subTitle && subLink) children.push({ title: subTitle, link: subLink, children: [] });
            });

            items.push({ title, link, children });
        });

        const landingJson = JSON.stringify(landing, null, 2);
        const menuJson = JSON.stringify(items, null, 2);

        // Validar
        const validation = Validation.validateForm(title, subtitle, landingJson, menuJson);

        return {
            landing: landingJson,
            menu: menuJson,
            valid: validation.valid,
            errors: validation.errors
        };
    },

    /**
     * Trata submit do formulário
     * @param {event} event - Evento de submit
     */
    handleSubmit: function(event) {
        event.preventDefault();

        // Limpar erros anteriores
        Validation.clearErrors();

        // Coletar e validar dados
        const formData = this.collectFormData();

        if (!formData.valid) {
            Validation.showErrors(formData.errors);
            return;
        }

        // Popular campos hidden
        document.getElementById('landingJsonHidden').value = formData.landing;
        document.getElementById('menuJsonHidden').value = formData.menu;

        // Mostrar loading
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processando...';
        }

        // Submeter formulário após 500ms para efeito visual
        setTimeout(() => {
            document.getElementById('editorForm').submit();
        }, 500);
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    Editor.init();
});

