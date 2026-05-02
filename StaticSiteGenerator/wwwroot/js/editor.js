/*
 * Unidade Curricular: 21179 - Laboratórios de Desenvolvimento de Software
 * Grupo: Grupo 1 - CodeMasters
 * Projeto: Static Site Generator com Json.NET
 * Ficheiro: editor.js
 * Descrição: Lógica do editor de conteúdo, modularizada e reutilizável.
 */

/**
 * Variável global para armazenar Base64 da imagem
 */
let currentImageBase64 = '';

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

        // Contador de caracteres para conteúdo
        const contentTextarea = document.getElementById('siteContent');
        const contentCounter = document.getElementById('contentCounter');
        if (contentTextarea && contentCounter) {
            // Atualizar ao carregar
            this.updateContentCounter(contentTextarea, contentCounter);

            // Atualizar ao digitar
            contentTextarea.addEventListener('input', () => {
                this.updateContentCounter(contentTextarea, contentCounter);
            });
        }
    },

    /**
     * Atualiza contador de caracteres do conteúdo
     * @param {element} textarea - Elemento textarea
     * @param {element} counter - Elemento do contador
     */
    updateContentCounter: function(textarea, counter) {
        const length = textarea.value.length;
        const maxLength = 50000;
        counter.textContent = `${length.toLocaleString('pt-PT')} / ${maxLength.toLocaleString('pt-PT')} caracteres`;

        // Mudar cor se estiver perto do limite
        if (length > maxLength * 0.9) {
            counter.classList.add('text-danger');
            counter.classList.remove('text-warning', 'text-muted');
        } else if (length > maxLength * 0.75) {
            counter.classList.add('text-warning');
            counter.classList.remove('text-danger', 'text-muted');
        } else {
            counter.classList.add('text-muted');
            counter.classList.remove('text-danger', 'text-warning');
        }
    },

    /**
     * Adiciona novo item de menu
     */
    adicionarItem: function() {
        const container = document.getElementById('menuItems');
        if (!container) return;

        const div = document.createElement('div');
        div.className = 'row g-2 mb-2 menu-item';
        div.innerHTML = `
            <div class="col">
                <input type="text" class="form-control menu-title" placeholder="Ex: Início" />
            </div>
            <div class="col">
                <input type="text" class="form-control menu-link" placeholder="Ex: /" />
            </div>
            <div class="col-auto">
                <button type="button" class="btn btn-outline-danger" onclick="Editor.removerItem(this)">&#10005;</button>
            </div>`;
        container.appendChild(div);
    },

    /**
     * Remove item de menu
     * @param {element} btn - Botão clicado
     */
    removerItem: function(btn) {
        btn.closest('.menu-item').remove();
    },

    /**
     * Limpa todos os campos do formulário
     */
    limparSelecao: function() {
        // Confirmar ação
        if (!confirm('Tem a certeza que deseja limpar todos os campos? Esta ação não pode ser desfeita.')) {
            return;
        }

        // Limpar campos da configuração
        document.getElementById('siteTitle').value = '';
        document.getElementById('siteSubtitle').value = '';
        document.getElementById('siteTheme').selectedIndex = 0;
        document.getElementById('siteContent').value = '';
        document.getElementById('siteFooter').value = '';

        // Limpar imagem
        const imageInput = document.getElementById('siteImage');
        if (imageInput) {
            imageInput.value = '';
        }
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.classList.add('d-none');
        }
        // Esconder imagem atual carregada do servidor
        const currentImageDisplay = document.getElementById('currentImageDisplay');
        if (currentImageDisplay) {
            currentImageDisplay.style.display = 'none';
        }
        currentImageBase64 = '';

        // Limpar documento
        const documentInput = document.getElementById('siteDocument');
        if (documentInput) {
            documentInput.value = '';
        }
        const docPreview = document.getElementById('docPreview');
        if (docPreview) {
            docPreview.classList.add('d-none');
        }
        // Esconder documento atual carregado do servidor
        const currentDocDisplay = document.getElementById('currentDocDisplay');
        if (currentDocDisplay) {
            currentDocDisplay.style.display = 'none';
        }

        // Limpar todos os itens de menu
        const menuContainer = document.getElementById('menuItems');
        if (menuContainer) {
            menuContainer.innerHTML = '';
        }

        // Limpar mensagens de erro
        Validation.clearErrors();

        Notifications.success('Formulário limpo com sucesso');
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

        if (docName) {
            docName.textContent = file.name;
        }

        if (docPreview) {
            docPreview.classList.remove('d-none');
            // Força reflow
            docPreview.offsetHeight;
        }

        Notifications.success('Documento carregado com sucesso');
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

        // Usar Base64 da imagem se existir, senão usar string vazia
        const landing = {
            title: title,
            subtitle: subtitle,
            theme: theme,
            content: content,
            imagePath: currentImageBase64 ? currentImageBase64 : '',
            documentPath: document.getElementById('siteDocument').value ? document.getElementById('siteDocument').files[0]?.name : '',
            documentName: document.getElementById('docName').textContent || '',
            footer: footer
        };

        const items = [];
        document.querySelectorAll('.menu-item').forEach(row => {
            const title = row.querySelector('.menu-title').value.trim();
            const link = row.querySelector('.menu-link').value.trim();
            if (title && link) {
                items.push({ title, link });
            }
        });

        const landingJson = JSON.stringify(landing, null, 2);
        const menuJson = JSON.stringify(items, null, 2);

        // Validar (incluindo conteúdo)
        const validation = Validation.validateForm(title, subtitle, content, landingJson, menuJson);

        return {
            landing: landingJson,
            menu: menuJson,
            valid: validation.valid,
            errors: validation.errors,
            warnings: validation.warnings
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

