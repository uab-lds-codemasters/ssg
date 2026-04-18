/*
 * Unidade Curricular: 21179 - Laboratórios de Desenvolvimento de Software
 * Grupo: Grupo 1 - CodeMasters
 * Projeto: Static Site Generator com Json.NET
 * Ficheiro: editor.js
 * Descrição: Lógica do editor de conteúdo, modularizada e reutilizável.
 */

/**
 * Objeto com funções do editor
 */
const Editor = {
    /**
     * Inicializa o editor
     */
    init: function() {
        this.setupEventListeners();
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
     * Trata preview de imagem
     * @param {event} event - Evento de mudança
     */
    handleImageChange: function(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validar tamanho (5MB)
        const validation = Validation.validateFileSize(file, 5);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        // Validar tipo (image)
        const typeValidation = Validation.validateFileType(file, ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
        if (!typeValidation.valid) {
            alert(typeValidation.error);
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('previewImg').src = e.target.result;
            document.getElementById('imagePreview').classList.remove('d-none');
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
            alert(validation.error);
            return;
        }

        // Validar tipo
        const allowedTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/pdf', 'text/plain', 'text/csv', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
        const typeValidation = Validation.validateFileType(file, allowedTypes);
        if (!typeValidation.valid) {
            alert(typeValidation.error);
            return;
        }

        document.getElementById('docName').textContent = file.name;
        document.getElementById('docPreview').classList.remove('d-none');
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
            imagePath: document.getElementById('siteImage').value ? document.getElementById('siteImage').files[0]?.name : '',
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

