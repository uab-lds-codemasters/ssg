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
        this.setupCharacterCounter();
        this.setupAutosave();
        this.loadDraft();
        this._setupHistory();
        this._setupDragDrop();
        this._pushHistory();
        this.setupAutoresizeTextarea();
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

        this.setupLiveValidation();
        this.setupKeyboardShortcuts();
        this.setupModalBackdropClick();
    },

    /**
     * Fecha modais ao clicar no backdrop
     */
    setupModalBackdropClick: function() {
        document.addEventListener('click', (e) => {
            const backdrop = e.target.closest('.preview-modal-backdrop');
            if (!backdrop) return;
            const modal = backdrop.closest('.preview-modal');
            if (!modal) return;
            // Determinar qual modal e fechar
            const id = modal.id;
            if (id === 'previewModal') this.fecharPreview();
            else if (id === 'templateModal') this.fecharTemplates();
            else if (id === 'shortcutsModal') this.fecharAtalhos();
        });
    },

    /**
     * Configura atalhos de teclado
     */
    setupKeyboardShortcuts: function() {
        document.addEventListener('keydown', (e) => {
            const ctrl = e.ctrlKey || e.metaKey;
            const key = e.key.toLowerCase();
            const form = document.getElementById('editorForm');
            const inForm = form && document.activeElement && form.contains(document.activeElement);

            // Ctrl+Enter para submeter
            if (ctrl && key === 'enter' && inForm) {
                e.preventDefault();
                this.handleSubmit(e);
                return;
            }

            // Ctrl+Z para desfazer
            if (ctrl && !e.shiftKey && key === 'z') {
                e.preventDefault();
                this.undo();
                return;
            }

            // Ctrl+Shift+Z ou Ctrl+Y para refazer
            if (ctrl && ((e.shiftKey && key === 'z') || (!e.shiftKey && key === 'y'))) {
                e.preventDefault();
                this.redo();
                return;
            }

            // ? para mostrar atalhos (apenas quando não está a escrever num input)
            if (key === '?' && !inForm) {
                e.preventDefault();
                this.mostrarAtalhos();
                return;
            }
        });
    },

    /**
     * Configura validação visual em tempo real nos campos obrigatórios
     */
    setupLiveValidation: function() {
        const fields = [
            { id: 'siteTitle', name: 'Título' },
            { id: 'siteSubtitle', name: 'Subtítulo' }
        ];

        fields.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('input', () => {
                const valid = Validation.validateRequired(el.value, '');
                el.classList.toggle('is-invalid', !valid.valid);
                el.classList.toggle('is-valid', valid.valid);
            });
            el.addEventListener('blur', () => {
                if (!el.value.trim()) {
                    el.classList.remove('is-valid');
                    el.classList.add('is-invalid');
                }
            });
        });

        // Validação do campo conteúdo
        const content = document.getElementById('siteContent');
        if (content) {
            content.addEventListener('input', () => {
                if (content.value.trim()) {
                    content.classList.remove('is-invalid');
                    content.classList.add('is-valid');
                } else {
                    content.classList.remove('is-valid');
                    content.classList.add('is-invalid');
                }
            });
        }
    },

    /**
     * Auto-resize textarea para o campo de conteúdo
     */
    setupAutoresizeTextarea: function() {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(ta => {
            const resize = () => {
                ta.style.height = 'auto';
                ta.style.height = ta.scrollHeight + 'px';
            };
            ta.addEventListener('input', resize);
            setTimeout(resize, 0);
        });
    },

    /**
     * Configura contador de caracteres para o campo de conteúdo
     */
    setupCharacterCounter: function() {
        const contentTextarea = document.getElementById('siteContent');
        const charCountElement = document.getElementById('charCount');

        if (contentTextarea && charCountElement) {
            // Atualizar contador ao carregar a página (conteúdo existente)
            this.updateCharacterCount();

            // Atualizar contador em tempo real ao digitar
            contentTextarea.addEventListener('input', () => {
                this.updateCharacterCount();
            });
        }
    },

    /**
     * Atualiza o contador de caracteres
     */
    updateCharacterCount: function() {
        const contentTextarea = document.getElementById('siteContent');
        const charCountElement = document.getElementById('charCount');

        if (contentTextarea && charCountElement) {
            const currentLength = contentTextarea.value.length;
            charCountElement.textContent = currentLength;

            // Adicionar classe de aviso quando estiver próximo do limite
            if (currentLength >= 9500) {
                charCountElement.style.color = '#dc3545'; // vermelho
                charCountElement.style.fontWeight = 'bold';
            } else if (currentLength >= 8000) {
                charCountElement.style.color = '#ffc107'; // amarelo/laranja
                charCountElement.style.fontWeight = 'bold';
            } else {
                charCountElement.style.color = '';
                charCountElement.style.fontWeight = '';
            }
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
        div.draggable = true;
        div.title = 'Arrastar para reordenar';
        div.innerHTML = `
            <div class="row g-2 menu-item-row">
                <div class="col-auto d-flex align-items-center">
                    <button type="button" class="btn btn-sm btn-outline-secondary menu-collapse-btn"
                            onclick="Editor.toggleCollapseMenu(this)" title="Colapsar/Expandir" aria-label="Colapsar item">&#9660;</button>
                </div>
                <div class="col">
                    <input type="text" class="form-control menu-title" placeholder="Ex: Início" />
                </div>
                <div class="col">
                    <input type="text" class="form-control menu-link" placeholder="Ex: /" />
                </div>
                <div class="col-auto d-flex gap-1">
                    <button type="button" class="btn btn-outline-secondary"
                            onclick="Editor.adicionarSubitem(this)" title="Adicionar subitem" aria-label="Adicionar subitem">&#8853;</button>
                    <button type="button" class="btn btn-outline-danger"
                            onclick="Editor.removerItem(this)" title="Eliminar item" aria-label="Eliminar item">&#10005;</button>
                </div>
            </div>
            <div class="menu-subitems ps-4 mt-1"></div>`;
        container.appendChild(div);
        div.classList.add('menu-item-enter');
        this.saveDraft();
        this._pushHistory();
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
                            onclick="Editor.removerItem(this)" title="Eliminar subitem" aria-label="Eliminar subitem">&#10005;</button>
            </div>`;
        subitems.appendChild(div);
        div.classList.add('menu-item-enter');
        this.saveDraft();
        this._pushHistory();
    },

    /**
     * Remove item ou subitem de menu com confirmação
     * @param {element} btn - Botão clicado
     */
    removerItem: function(btn) {
        const subitem = btn.closest('.menu-subitem');
        const label = subitem
            ? subitem.querySelector('.menu-title')?.value || 'subitem'
            : btn.closest('.menu-item').querySelector('.menu-title')?.value || 'item';

        Notifications.confirm(
            `Tem a certeza que deseja eliminar "${label}"?`,
            () => {
                const target = subitem || btn.closest('.menu-item');
                target.classList.add('menu-item-exit');
                target.addEventListener('animationend', () => {
                    target.remove();
                    Notifications.success(`"${label}" eliminado com sucesso`);
                    this.saveDraft();
                    this._pushHistory();
                }, { once: true });
            }
        );
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

        // Mostrar tamanho do ficheiro
        const sizeEl = document.getElementById('imageFileSize');
        if (sizeEl) sizeEl.textContent = `(${this._formatFileSize(file.size)})`;

        // Compressão client-side para imagens > 1MB
        if (file.size > 1048576 && file.type.startsWith('image/')) {
            this._compressImage(file, (compressedBase64) => {
                const previewImg = document.getElementById('previewImg');
                const imagePreview = document.getElementById('imagePreview');
                currentImageBase64 = compressedBase64;
                if (previewImg) previewImg.src = compressedBase64;
                if (imagePreview) {
                    imagePreview.classList.remove('d-none');
                    imagePreview.offsetHeight;
                }
                const compressedSize = Math.round(compressedBase64.length * 0.75);
                const sizeEl = document.getElementById('imageFileSize');
                if (sizeEl) sizeEl.textContent = `(${this._formatFileSize(file.size)} → ${this._formatFileSize(compressedSize)})`;
                Notifications.success('Imagem comprimida e carregada com sucesso');
            });
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

        // Mostrar tamanho do ficheiro
        const sizeEl = document.getElementById('docFileSize');
        if (sizeEl) sizeEl.textContent = this._formatFileSize(file.size);

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

        // Apagar rascunho
        this.clearDraft();

        // AJAX Preview
        this._ajaxPreview(formData.landing, formData.menu, submitBtn);
    },

    /**
     * Envia dados via AJAX e mostra preview no modal
     * @param {string} landingJson
     * @param {string} menuJson
     * @param {Element} submitBtn
     * @private
     */
    _ajaxPreview: function(landingJson, menuJson, submitBtn) {
        const modal = document.getElementById('previewModal');
        const iframe = document.getElementById('previewIframe');
        const loading = document.getElementById('previewLoading');
        const openNew = document.getElementById('previewOpenNew');

        modal.classList.remove('d-none');
        loading.classList.remove('d-none');
        iframe.style.display = 'none';

        this._previewBlobUrl = null;

        fetch('/Site/Preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ landingJson, menuJson })
        })
        .then(res => res.text())
        .then(html => {
            loading.classList.add('d-none');

            // Verificar se o servidor devolveu Preview ou Index (erro)
            if (!html.includes('data-tema')) {
                Notifications.error('Erro do servidor ao gerar preview');
                iframe.style.display = 'none';
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Gerar';
                }
                return;
            }

            iframe.style.display = '';

            // Extrair conteúdo do body
            const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
            const bodyContent = bodyMatch && bodyMatch[1] ? bodyMatch[1].trim() : '';

            // Extrair estilos e links
            const styles = (html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || []).join('\n');
            const links = (html.match(/<link[^>]*\/?>/gi) || [])
                .filter(l => l.includes('temaCSS') || l.includes('bootstrap') || l.includes('editor'))
                .join('\n');

            const doc = `<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${links}
    ${styles}
</head>
<body>${bodyContent}</body>
</html>`;

            iframe.srcdoc = doc;

            // Blob URL para "Abrir em nova aba" (mais seguro que data: URI)
            if (this._previewBlobUrl) URL.revokeObjectURL(this._previewBlobUrl);
            const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
            this._previewBlobUrl = URL.createObjectURL(blob);
            openNew.href = this._previewBlobUrl;

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Gerar';
            }
        })
        .catch(err => {
            loading.classList.add('d-none');
            iframe.style.display = 'none';
            Notifications.error('Erro ao gerar preview: ' + err.message);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Gerar';
            }
        });
    },

    /**
     * Fecha o modal de preview AJAX
     */
    fecharPreview: function() {
        const modal = document.getElementById('previewModal');
        const iframe = document.getElementById('previewIframe');
        if (modal) modal.classList.add('d-none');
        if (iframe) iframe.srcdoc = '';

        // Restaurar botão submit (caso tenha sido fechado durante loading)
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Gerar';
        }

        // Limpar blob URL
        if (this._previewBlobUrl) {
            URL.revokeObjectURL(this._previewBlobUrl);
            this._previewBlobUrl = null;
        }
    },

    /**
     * Muda o tamanho do iframe no preview modal
     * @param {string} width - '100%', '768px' ou '375px'
     */
    mudarTamanhoPreview: function(width) {
        const iframe = document.getElementById('previewIframe');
        if (iframe) {
            iframe.style.maxWidth = width === '100%' ? '' : width;
            iframe.style.margin = width === '100%' ? '' : '0 auto';
        }
        document.querySelectorAll('.preview-size-btn').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`.preview-size-btn[data-width="${width}"]`);
        if (btn) btn.classList.add('active');
    },

    /**
     * Limpa todos os campos do formulário
     */
    limparFormulario: function() {
        Notifications.confirm(
            'Tem a certeza que deseja limpar todos os campos do formulário?',
            () => {
                // Limpar campos de configuração
                document.getElementById('siteTitle').value = '';
                document.getElementById('siteSubtitle').value = '';
                document.getElementById('siteTheme').value = 'default.css';
                document.getElementById('siteContent').value = '';
                document.getElementById('siteFooter').value = '';

                // Limpar preview de imagem
                const imageInput = document.getElementById('siteImage');
                if (imageInput) imageInput.value = '';
                const imagePreview = document.getElementById('imagePreview');
                if (imagePreview) imagePreview.classList.add('d-none');
                document.getElementById('imageFileSize').textContent = '';
                currentImageBase64 = '';

                // Limpar preview de documento
                const documentInput = document.getElementById('siteDocument');
                if (documentInput) documentInput.value = '';
                const docPreview = document.getElementById('docPreview');
                if (docPreview) docPreview.classList.add('d-none');
                document.getElementById('docFileSize').textContent = '';
                currentDocumentBase64 = '';
                currentDocumentName = '';

                // Limpar campos hidden
                document.getElementById('existingImagePath').value = '';
                document.getElementById('existingDocumentPath').value = '';
                document.getElementById('existingDocumentName').value = '';

                // Limpar todos os itens de menu
                const menuContainer = document.getElementById('menuItems');
                if (menuContainer) {
                    menuContainer.innerHTML = '';
                }

                // Atualizar contador de caracteres
                this.updateCharacterCount();

                // Remover classes de validação visual
                document.querySelectorAll('.is-invalid, .is-valid').forEach(el => {
                    el.classList.remove('is-invalid', 'is-valid');
                });

                // Limpar erros de validação
                Validation.clearErrors();

                this.clearDraft();
                this._pushHistory();
                Notifications.success('Formulário limpo com sucesso!');
            }
        );
    },

    /**
     * Configura autosave com debounce nos campos do formulário
     */
    setupAutosave: function() {
        ['siteTitle', 'siteSubtitle', 'siteTheme', 'siteContent', 'siteFooter'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.saveDraft());
                el.addEventListener('change', () => this.saveDraft());
            }
        });

        // Delegação de eventos para inputs de menu (reconstruídos dinamicamente)
        const menuContainer = document.getElementById('menuItems');
        if (menuContainer) {
            menuContainer.addEventListener('input', (e) => {
                if (e.target.matches('.menu-title, .menu-link')) {
                    this.saveDraft();
                }
            });
        }
    },

    /**
     * Guarda rascunho do formulário em localStorage
     */
    saveDraft: function() {
        this._updateSaveIndicator('saving');
        clearTimeout(this._autosaveTimer);
        this._autosaveTimer = setTimeout(() => {
            const title = document.getElementById('siteTitle')?.value || '';
            const subtitle = document.getElementById('siteSubtitle')?.value || '';
            const theme = document.getElementById('siteTheme')?.value || 'default.css';
            const content = document.getElementById('siteContent')?.value || '';
            const footer = document.getElementById('siteFooter')?.value || '';

            const items = [];
            document.querySelectorAll('#menuItems > .menu-item').forEach(item => {
                const row = item.querySelector('.menu-item-row');
                const itemTitle = row?.querySelector('.menu-title')?.value.trim();
                const itemLink = row?.querySelector('.menu-link')?.value.trim() || '';
                if (!itemTitle) return;

                const children = [];
                item.querySelectorAll('.menu-subitem').forEach(sub => {
                    const subTitle = sub.querySelector('.menu-title')?.value.trim();
                    const subLink = sub.querySelector('.menu-link')?.value.trim();
                    if (subTitle && subLink) children.push({ title: subTitle, link: subLink });
                });

                items.push({ title: itemTitle, link: itemLink, children });
            });

            const draft = {
                timestamp: Date.now(),
                title, subtitle, theme, content, footer,
                menu: items
            };

            localStorage.setItem(this.getAutosaveKey(), JSON.stringify(draft));
            this._updateSaveIndicator('saved');
        }, 800);
    },

    /**
     * Recupera rascunho do localStorage se existir e for recente
     */
    loadDraft: function() {
        const saved = localStorage.getItem(this.getAutosaveKey());
        if (!saved) return;

        try {
            const data = JSON.parse(saved);

            // Rascunho expirado (> 24h)
            if (Date.now() - data.timestamp > 86400000) {
                this.clearDraft();
                return;
            }

            // Só recupera se houver dados diferentes dos que vieram do servidor
            const titleEl = document.getElementById('siteTitle');
            if (titleEl && titleEl.value === '' && data.title === '') return;

            this._applyDraft(data);
            Notifications.info('Rascunho recuperado automaticamente');
        } catch {
            this.clearDraft();
        }
    },

    /**
     * Aplica dados do rascunho ao formulário
     * @param {object} data - Dados do rascunho
     * @private
     */
    _applyDraft: function(data) {
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val;
        };

        setVal('siteTitle', data.title || '');
        setVal('siteSubtitle', data.subtitle || '');
        setVal('siteTheme', data.theme || 'default.css');
        setVal('siteContent', data.content || '');
        setVal('siteFooter', data.footer || '');

        // Limpar e reconstruir menu
        const container = document.getElementById('menuItems');
        if (container) {
            container.innerHTML = '';
            (data.menu || []).forEach(item => {
                const div = document.createElement('div');
                div.className = 'menu-item mb-2';
                div.draggable = true;
                div.title = 'Arrastar para reordenar';
                div.innerHTML = `
                    <div class="row g-2 menu-item-row">
                        <div class="col-auto d-flex align-items-center">
                            <button type="button" class="btn btn-sm btn-outline-secondary menu-collapse-btn"
                                    onclick="Editor.toggleCollapseMenu(this)" title="Colapsar/Expandir" aria-label="Colapsar item">&#9660;</button>
                        </div>
                        <div class="col">
                            <input type="text" class="form-control menu-title" value="${this._escapeAttr(item.title || '')}" placeholder="Ex: Início" />
                        </div>
                        <div class="col">
                            <input type="text" class="form-control menu-link" value="${this._escapeAttr(item.link || '')}" placeholder="Ex: /" />
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

                if (item.children) {
                    const subContainer = div.querySelector('.menu-subitems');
                    item.children.forEach(child => {
                        const subDiv = document.createElement('div');
                        subDiv.className = 'row g-2 mb-1 menu-subitem';
                        subDiv.innerHTML = `
                            <div class="col-auto d-flex align-items-center text-muted" style="width:28px">&#8627;</div>
                            <div class="col">
                                <input type="text" class="form-control form-control-sm menu-title" value="${this._escapeAttr(child.title || '')}" placeholder="Ex: Google" />
                            </div>
                            <div class="col">
                                <input type="text" class="form-control form-control-sm menu-link" value="${this._escapeAttr(child.link || '')}" placeholder="Ex: https://google.com" />
                            </div>
                            <div class="col-auto">
                                <button type="button" class="btn btn-sm btn-outline-danger"
                                        onclick="Editor.removerItem(this)">&#10005;</button>
                            </div>`;
                        subContainer.appendChild(subDiv);
                    });
                }
            });
        }

        this.updateCharacterCount();
    },

    /**
     * Escapa caracteres especiais para uso em atributos HTML
     * @param {string} str
     * @returns {string}
     * @private
     */
    _escapeAttr: function(str) {
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    /**
     * Configura captura de histórico em inputs de texto
     * @private
     */
    _setupHistory: function() {
        this._history = [];
        this._historyIndex = -1;

        ['siteTitle', 'siteSubtitle', 'siteContent', 'siteFooter'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this._pushHistoryDebounced());
            }
        });

        const themeSelect = document.getElementById('siteTheme');
        if (themeSelect) {
            themeSelect.addEventListener('change', () => this._pushHistory());
        }

        // Delegação de eventos para inputs de menu (reconstruídos dinamicamente)
        const menuContainer = document.getElementById('menuItems');
        if (menuContainer) {
            menuContainer.addEventListener('input', (e) => {
                if (e.target.matches('.menu-title, .menu-link')) {
                    this._pushHistoryDebounced();
                }
            });
        }
    },

    /**
     * Guarda estado atual no histórico (com debounce)
     * @private
     */
    _pushHistoryDebounced: function() {
        clearTimeout(this._historyTimer);
        this._historyTimer = setTimeout(() => {
            this._pushHistory();
        }, 500);
    },

    /**
     * Captura estado atual do formulário
     * @returns {object}
     * @private
     */
    _captureState: function() {
        const items = [];
        document.querySelectorAll('#menuItems > .menu-item').forEach(item => {
            const row = item.querySelector('.menu-item-row');
            const itemTitle = row?.querySelector('.menu-title')?.value.trim();
            const itemLink = row?.querySelector('.menu-link')?.value.trim() || '';
            if (!itemTitle) return;

            const children = [];
            item.querySelectorAll('.menu-subitem').forEach(sub => {
                const subTitle = sub.querySelector('.menu-title')?.value.trim();
                const subLink = sub.querySelector('.menu-link')?.value.trim();
                if (subTitle && subLink) children.push({ title: subTitle, link: subLink });
            });

            items.push({ title: itemTitle, link: itemLink, children });
        });

        return {
            title: document.getElementById('siteTitle')?.value || '',
            subtitle: document.getElementById('siteSubtitle')?.value || '',
            theme: document.getElementById('siteTheme')?.value || 'default.css',
            content: document.getElementById('siteContent')?.value || '',
            footer: document.getElementById('siteFooter')?.value || '',
            menu: items
        };
    },

    /**
     * Repõe estado do formulário a partir de um snapshot
     * @param {object} state
     * @private
     */
    _restoreState: function(state) {
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val;
        };

        setVal('siteTitle', state.title || '');
        setVal('siteSubtitle', state.subtitle || '');
        setVal('siteTheme', state.theme || 'default.css');
        setVal('siteContent', state.content || '');
        setVal('siteFooter', state.footer || '');

        const container = document.getElementById('menuItems');
        if (container) {
            container.innerHTML = '';
            (state.menu || []).forEach(item => {
                const div = document.createElement('div');
                div.className = 'menu-item mb-2';
                div.draggable = true;
                div.title = 'Arrastar para reordenar';
                div.innerHTML = `
                    <div class="row g-2 menu-item-row">
                        <div class="col-auto d-flex align-items-center">
                            <button type="button" class="btn btn-sm btn-outline-secondary menu-collapse-btn"
                                    onclick="Editor.toggleCollapseMenu(this)" title="Colapsar/Expandir" aria-label="Colapsar item">&#9660;</button>
                        </div>
                        <div class="col">
                            <input type="text" class="form-control menu-title" value="${this._escapeAttr(item.title || '')}" placeholder="Ex: Início" />
                        </div>
                        <div class="col">
                            <input type="text" class="form-control menu-link" value="${this._escapeAttr(item.link || '')}" placeholder="Ex: /" />
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

                if (item.children) {
                    const subContainer = div.querySelector('.menu-subitems');
                    item.children.forEach(child => {
                        const subDiv = document.createElement('div');
                        subDiv.className = 'row g-2 mb-1 menu-subitem';
                        subDiv.innerHTML = `
                            <div class="col-auto d-flex align-items-center text-muted" style="width:28px">&#8627;</div>
                            <div class="col">
                                <input type="text" class="form-control form-control-sm menu-title" value="${this._escapeAttr(child.title || '')}" placeholder="Ex: Google" />
                            </div>
                            <div class="col">
                                <input type="text" class="form-control form-control-sm menu-link" value="${this._escapeAttr(child.link || '')}" placeholder="Ex: https://google.com" />
                            </div>
                            <div class="col-auto">
                                <button type="button" class="btn btn-sm btn-outline-danger"
                                        onclick="Editor.removerItem(this)">&#10005;</button>
                            </div>`;
                        subContainer.appendChild(subDiv);
                    });
                }
            });
        }

        this.updateCharacterCount();
        this.saveDraft();
    },

    /**
     * Guarda snapshot do estado atual no histórico
     * @private
     */
    _pushHistory: function() {
        if (this._historyIndex < this._history.length - 1) {
            this._history = this._history.slice(0, this._historyIndex + 1);
        }

        const state = this._captureState();

        if (this._history.length > 0) {
            const last = this._history[this._history.length - 1];
            if (JSON.stringify(last) === JSON.stringify(state)) return;
        }

        this._history.push(state);
        if (this._history.length > 50) {
            this._history.shift();
        }
        this._historyIndex = this._history.length - 1;
    },

    /**
     * Desfaz última ação (Ctrl+Z)
     */
    undo: function() {
        if (this._historyIndex <= 0) {
            Notifications.info('Já está no estado mais antigo');
            return;
        }
        this._historyIndex--;
        this._restoreState(this._history[this._historyIndex]);
    },

    /**
     * Refaz ação desfeita (Ctrl+Shift+Z)
     */
    redo: function() {
        if (this._historyIndex >= this._history.length - 1) {
            Notifications.info('Já está no estado mais recente');
            return;
        }
        this._historyIndex++;
        this._restoreState(this._history[this._historyIndex]);
    },

    /**
     * Apaga rascunho do localStorage
     */
    clearDraft: function() {
        localStorage.removeItem(this.getAutosaveKey());
    },

    /**
     * Chave única para localStorage baseada na URL
     * @returns {string}
     */
    getAutosaveKey: function() {
        return 'editor_draft';
    },

    // ─── DRAG & DROP ───────────────────────────────────────

    /**
     * Configura drag & drop para reordenar items do menu
     * @private
     */
    _setupDragDrop: function() {
        const container = document.getElementById('menuItems');
        if (!container) return;

        let draggedItem = null;

        container.addEventListener('dragstart', (e) => {
            const item = e.target.closest('.menu-item');
            if (!item) return;
            draggedItem = item;
            item.classList.add('menu-item-dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        container.addEventListener('dragend', (e) => {
            const item = e.target.closest('.menu-item');
            if (item) item.classList.remove('menu-item-dragging');
            container.querySelectorAll('.menu-item.drag-over').forEach(el => el.classList.remove('drag-over'));
        });

        container.addEventListener('dragover', (e) => {
            const item = e.target.closest('.menu-item');
            if (!item || item === draggedItem) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            container.querySelectorAll('.menu-item.drag-over').forEach(el => el.classList.remove('drag-over'));
            item.classList.add('drag-over');
        });

        container.addEventListener('dragleave', (e) => {
            const item = e.target.closest('.menu-item');
            if (item) item.classList.remove('drag-over');
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            const target = e.target.closest('.menu-item');
            if (!target || !draggedItem || target === draggedItem) return;

            container.querySelectorAll('.menu-item.drag-over, .menu-item-dragging').forEach(el => {
                el.classList.remove('drag-over', 'menu-item-dragging');
            });

            const rect = target.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            const insertBefore = e.clientY < midY;

            if (insertBefore) {
                container.insertBefore(draggedItem, target);
            } else {
                container.insertBefore(draggedItem, target.nextSibling);
            }

            draggedItem = null;
            this.saveDraft();
            this._pushHistory();
        });
    },

    // ─── EXPORT / IMPORT ───────────────────────────────────

    /**
     * Exporta configuração como ficheiro JSON
     */
    exportarConfig: function() {
        const data = this.collectFormData();

        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            landing: JSON.parse(data.landing),
            menu: JSON.parse(data.menu)
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ssg-config-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Notifications.success('Configuração exportada com sucesso');
    },

    /**
     * Abre o diálogo de seleção de ficheiro para importar
     */
    importarAbrir: function() {
        Notifications.info('Selecione um ficheiro JSON para importar');
        const input = document.getElementById('importInput');
        if (input) input.click();
    },

    /**
     * Importa configuração de ficheiro JSON
     * @param {HTMLInputElement} input
     */
    importarConfig: function(input) {
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.landing || !data.menu) {
                    Notifications.error('Ficheiro inválido: o JSON deve conter as propriedades "landing" e "menu". Use Exportar primeiro.');
                    return;
                }

                const landingJson = JSON.stringify(data.landing, null, 2);
                const menuJson = JSON.stringify(data.menu, null, 2);

                this._applyDraft({
                    title: data.landing.title || '',
                    subtitle: data.landing.subtitle || '',
                    theme: data.landing.theme || 'default.css',
                    content: data.landing.content || '',
                    footer: data.landing.footer || '',
                    menu: data.menu
                });

                // Restaurar caminhos de imagem/documento se existirem
                const imgPathEl = document.getElementById('existingImagePath');
                const docPathEl = document.getElementById('existingDocumentPath');
                const docNameEl = document.getElementById('existingDocumentName');
                if (imgPathEl && data.landing.imagePath) imgPathEl.value = data.landing.imagePath;
                if (docPathEl && data.landing.documentPath) docPathEl.value = data.landing.documentPath;
                if (docNameEl && data.landing.documentName) docNameEl.value = data.landing.documentName;

                this._pushHistory();
                this.saveDraft();
                Notifications.success('Configuração importada com sucesso');
            } catch (err) {
                Notifications.error('Erro ao importar: ' + err.message);
            }
        };
        reader.readAsText(file);
        input.value = '';
    },

    // ─── SAVE INDICATOR ────────────────────────────────────

    /**
     * Atualiza indicador de save
     * @param {string} state - 'saving', 'saved' ou ''
     */
    _updateSaveIndicator: function(state) {
        const el = document.getElementById('saveIndicator');
        if (!el) return;
        if (state === 'saving') {
            el.textContent = 'A guardar...';
            el.className = 'save-indicator saving';
        } else if (state === 'saved') {
            el.textContent = 'Guardado ✓';
            el.className = 'save-indicator saved';
            clearTimeout(this._saveIndicatorTimer);
            this._saveIndicatorTimer = setTimeout(() => {
                el.textContent = '';
                el.className = 'save-indicator';
            }, 3000);
        } else {
            el.textContent = '';
            el.className = 'save-indicator';
        }
    },

    // ─── COLLAPSE MENU ────────────────────────────────────

    /**
     * Colapsa/expande os campos de um item de menu
     * @param {Element} btn - Botão clicado
     */
    toggleCollapseMenu: function(btn) {
        const item = btn.closest('.menu-item');
        if (!item) return;
        item.classList.toggle('menu-item-collapsed');
        btn.innerHTML = item.classList.contains('menu-item-collapsed') ? '&#9654;' : '&#9660;';
    },

    // ─── FULLSCREEN PREVIEW ────────────────────────────────

    /**
     * Alterna ecrã inteiro no modal de preview
     */
    toggleFullscreenPreview: function() {
        const modal = document.getElementById('previewModal');
        if (!modal) return;
        modal.classList.toggle('preview-modal-fullscreen');
    },

    // ─── KEYBOARD SHORTCUTS HELP ──────────────────────────

    /**
     * Mostra modal de atalhos de teclado
     */
    mostrarAtalhos: function() {
        const modal = document.getElementById('shortcutsModal');
        if (modal) modal.classList.remove('d-none');
    },

    /**
     * Fecha modal de atalhos de teclado
     */
    fecharAtalhos: function() {
        const modal = document.getElementById('shortcutsModal');
        if (modal) modal.classList.add('d-none');
    },

    // ─── TEMPLATE GALLERY ─────────────────────────────────

    _templates: {
        blog: {
            landing: {
                title: 'Blog Tech',
                subtitle: 'Tecnologia, código e inovação',
                theme: 'dark.css',
                content: '# Bem-vindo ao Blog\n\n## Últimos Artigos\n\n### Introdução ao JavaScript Moderno\nNeste artigo vamos explorar as funcionalidades mais recentes do JavaScript...\n\n### CSS Grid vs Flexbox\nComparativo entre as duas técnicas de layout...',
                footer: '© 2026 Blog Tech. Todos os direitos reservados.'
            },
            menu: [
                { title: 'Início', link: '/', children: [] },
                { title: 'Artigos', link: '/artigos', children: [
                    { title: 'JavaScript', link: '/artigos/javascript' },
                    { title: 'CSS', link: '/artigos/css' }
                ]},
                { title: 'Sobre', link: '/sobre', children: [] },
                { title: 'Contacto', link: '/contacto', children: [] }
            ]
        },
        landing: {
            landing: {
                title: 'StartupPro',
                subtitle: 'Transformamos ideias em produtos digitais',
                theme: 'default.css',
                content: '# A sua próxima grande ideia merece o melhor parceiro.\n\nOferecemos soluções completas de desenvolvimento web, mobile e cloud.\n\n## Os nossos serviços\n\n- **Desenvolvimento Web** - Sites e aplicações modernas\n- **Mobile Apps** - Apps nativas e híbridas\n- **Cloud & DevOps** - Infraestrutura escalável',
                footer: '© 2026 StartupPro. Todos os direitos reservados.'
            },
            menu: [
                { title: 'Início', link: '/', children: [] },
                { title: 'Serviços', link: '/servicos', children: [] },
                { title: 'Portfolio', link: '/portfolio', children: [] },
                { title: 'Contacto', link: '/contacto', children: [] }
            ]
        },
        portfolio: {
            landing: {
                title: 'João Design',
                subtitle: 'Designer UX/UI & Desenvolvedor Frontend',
                theme: 'default.css',
                content: '# Portfolio\n\n## Projetos Recentes\n\n### E-commerce Platform\nPlataforma de comércio eletrónico com React e Node.js\n\n### App de Fitness\nAplicação mobile para tracking de treinos\n\n### Dashboard Analytics\nPainel de análise de dados em tempo real\n\n## Habilidades\n\n- UX/UI Design\n- Frontend (React, Vue)\n- Prototipagem (Figma)',
                footer: '© 2026 João Design. Todos os direitos reservados.'
            },
            menu: [
                { title: 'Início', link: '/', children: [] },
                { title: 'Projetos', link: '/projetos', children: [] },
                { title: 'Serviços', link: '/servicos', children: [] },
                { title: 'Contacto', link: '/contacto', children: [] }
            ]
        },
        documentation: {
            landing: {
                title: 'API Docs',
                subtitle: 'Documentação oficial da API v2.0',
                theme: 'dark.css',
                content: '# Documentação da API\n\n## Introdução\n\nBem-vindo à documentação oficial da API. Esta API permite integrar os nossos serviços na sua aplicação.\n\n## Autenticação\n\nPara autenticar, use o token Bearer no header `Authorization`.\n\n## Endpoints\n\n### GET /api/users\nLista todos os utilizadores.\n\n### POST /api/users\nCria um novo utilizador.\n\n### GET /api/users/:id\nObtém detalhes de um utilizador.',
                footer: '© 2026 API Docs. Todos os direitos reservados.'
            },
            menu: [
                { title: 'Início', link: '/', children: [] },
                { title: 'Guia', link: '/guia', children: [
                    { title: 'Introdução', link: '/guia/introducao' },
                    { title: 'Autenticação', link: '/guia/auth' }
                ]},
                { title: 'API', link: '/api', children: [
                    { title: 'Users', link: '/api/users' },
                    { title: 'Auth', link: '/api/auth' }
                ]},
                { title: 'Suporte', link: '/suporte', children: [] }
            ]
        }
    },

    /**
     * Mostra modal de templates com event delegation nos cards
     */
    mostrarTemplates: function() {
        const modal = document.getElementById('templateModal');
        if (!modal) return;
        modal.classList.remove('d-none');
        // Event delegation nos template cards (apenas se ainda não configurado)
        const grid = modal.querySelector('.template-grid');
        if (grid && !grid.dataset.templatesReady) {
            grid.dataset.templatesReady = 'true';
            grid.addEventListener('click', (e) => {
                const card = e.target.closest('.template-card');
                if (!card) return;
                const name = card.dataset.template;
                if (name) this.aplicarTemplate(name);
            });
        }
        // Fechar ao clicar no backdrop configurado em setupModalBackdropClick
    },

    /**
     * Fecha modal de templates
     */
    fecharTemplates: function() {
        const modal = document.getElementById('templateModal');
        if (modal) modal.classList.add('d-none');
    },

    /**
     * Aplica um template pré-definido ao formulário
     * @param {string} name - Nome do template ('blog', 'landing', 'portfolio', 'documentation')
     */
    aplicarTemplate: function(name) {
        const tpl = this._templates[name];
        if (!tpl) {
            Notifications.error('Template não encontrado');
            return;
        }

        this._applyDraft({
            title: tpl.landing.title,
            subtitle: tpl.landing.subtitle,
            theme: tpl.landing.theme,
            content: tpl.landing.content,
            footer: tpl.landing.footer,
            menu: tpl.menu
        });

        this._pushHistory();
        this.saveDraft();
        this.fecharTemplates();
        Notifications.success(`Template "${name}" aplicado com sucesso`);
    },

    // ─── IMAGE COMPRESSION ─────────────────────────────────

    /**
     * Comprime uma imagem para reduzir tamanho (max 1920px, qualidade 0.7)
     * @param {File} file - Ficheiro de imagem
     * @param {Function} callback - Callback com Base64 comprimido
     * @private
     */
    _compressImage: function(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                const maxDim = 1920;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round(height * maxDim / width);
                        width = maxDim;
                    } else {
                        width = Math.round(width * maxDim / height);
                        height = maxDim;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                callback(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    // ─── HELPERS ───────────────────────────────────────────

    /**
     * Formata tamanho de ficheiro para exibição
     * @param {number} bytes
     * @returns {string}
     * @private
     */
    _formatFileSize: function(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    Editor.init();
});

