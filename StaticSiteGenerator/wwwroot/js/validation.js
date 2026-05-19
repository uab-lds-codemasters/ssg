/*
 * Unidade Curricular: 21179 - Laboratórios de Desenvolvimento de Software
 * Grupo: Grupo 1 - CodeMasters
 * Projeto: Static Site Generator com Json.NET
 * Ficheiro: validation.js
 * Descrição: Validações robustas do lado cliente para o formulário do editor.
 */

/**
 * Objeto com funções de validação
 */
const Validation = {
    /**
     * Valida um JSON string
     * @param {string} jsonString - String em formato JSON
     * @returns {object} { valid: boolean, error: string }
     */
    validateJSON: function(jsonString) {
        if (!jsonString || jsonString.trim() === '') {
            return { valid: false, error: 'JSON não pode estar vazio' };
        }
        try {
            JSON.parse(jsonString);
            return { valid: true, error: null };
        } catch (error) {
            return { valid: false, error: `JSON inválido: ${error.message}` };
        }
    },

    /**
     * Valida URL
     * @param {string} url - URL a validar
     * @returns {boolean}
     */
    validateURL: function(url) {
        if (!url || url.trim() === '') {
            return true; // URL opcional
        }
        // Aceita caminhos relativos (/, /sobre, etc.) e URLs absolutas
        if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
            return true;
        }
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Valida campo obrigatório
     * @param {string} value - Valor do campo
     * @param {string} fieldName - Nome do campo (para mensagem de erro)
     * @returns {object} { valid: boolean, error: string }
     */
    validateRequired: function(value, fieldName) {
        if (!value || value.trim() === '') {
            return { valid: false, error: `${fieldName} é obrigatório` };
        }
        return { valid: true, error: null };
    },

    /**
     * Valida tamanho de arquivo
     * @param {File} file - Arquivo a validar
     * @param {number} maxSizeMB - Tamanho máximo em MB
     * @returns {object} { valid: boolean, error: string }
     */
    validateFileSize: function(file, maxSizeMB) {
        if (!file) {
            return { valid: true, error: null };
        }
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return { valid: false, error: `Ficheiro muito grande (máx: ${maxSizeMB}MB)` };
        }
        return { valid: true, error: null };
    },

    /**
     * Valida tipo de ficheiro
     * @param {File} file - Ficheiro a validar
     * @param {array} allowedTypes - Tipos MIME permitidos
     * @returns {object} { valid: boolean, error: string }
     */
    validateFileType: function(file, allowedTypes) {
        if (!file) {
            return { valid: true, error: null };
        }
        if (!allowedTypes.includes(file.type)) {
            return { valid: false, error: `Tipo de ficheiro não permitido: ${file.type}` };
        }
        return { valid: true, error: null };
    },

    /**
     * Valida itens de menu
     * @param {array} items - Array com itens do menu
     * @returns {object} { valid: boolean, error: string }
     */
    validateMenuItems: function(items) {
        if (!items || items.length === 0) {
            return { valid: false, error: 'Menu deve ter pelo menos 1 item' };
        }

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.title || item.title.trim() === '') {
                return { valid: false, error: `Item ${i + 1}: título é obrigatório` };
            }

            const temFilhos = item.children && item.children.length > 0;
            if (!temFilhos) {
                if (!item.link || item.link.trim() === '') {
                    return { valid: false, error: `Item ${i + 1}: link é obrigatório (ou adiciona subitems)` };
                }
                if (!this.validateURL(item.link)) {
                    return { valid: false, error: `Item ${i + 1}: link inválido` };
                }
            }

            if (temFilhos) {
                for (let j = 0; j < item.children.length; j++) {
                    const child = item.children[j];
                    if (!child.title || child.title.trim() === '') {
                        return { valid: false, error: `Item ${i + 1} › subitem ${j + 1}: título é obrigatório` };
                    }
                    if (!child.link || child.link.trim() === '') {
                        return { valid: false, error: `Item ${i + 1} › subitem ${j + 1}: link é obrigatório` };
                    }
                    if (!this.validateURL(child.link)) {
                        return { valid: false, error: `Item ${i + 1} › subitem ${j + 1}: link inválido` };
                    }
                }
            }
        }

        return { valid: true, error: null };
    },

    /**
     * Valida página inteira
     * @param {string} title - Título
     * @param {string} subtitle - Subtítulo
     * @param {string} landingJson - JSON da página
     * @param {string} menuJson - JSON do menu
     * @returns {object} { valid: boolean, errors: array }
     */
    validateForm: function(title, subtitle, landingJson, menuJson) {
        const errors = [];

        // Validar campos obrigatórios
        const titleValidation = this.validateRequired(title, 'Título');
        if (!titleValidation.valid) {
            errors.push(titleValidation.error);
        }

        const subtitleValidation = this.validateRequired(subtitle, 'Subtítulo');
        if (!subtitleValidation.valid) {
            errors.push(subtitleValidation.error);
        }

        // Validar JSON
        const landingValidation = this.validateJSON(landingJson);
        if (!landingValidation.valid) {
            errors.push(`Configuração da página: ${landingValidation.error}`);
        }

        const menuValidation = this.validateJSON(menuJson);
        if (!menuValidation.valid) {
            errors.push(`Menu de navegação: ${menuValidation.error}`);
        }

        // Se JSON é válido, validar conteúdo
        if (landingValidation.valid && menuValidation.valid) {
            try {
                const menu = JSON.parse(menuJson);
                const menuItemsValidation = this.validateMenuItems(menu);
                if (!menuItemsValidation.valid) {
                    errors.push(menuItemsValidation.error);
                }
            } catch (e) {
                // Já foi validado acima
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Mostra mensagens de erro
     * @param {array} errors - Array com mensagens de erro
     */
    showErrors: function(errors) {
        const container = document.getElementById('errorMessages');
        if (!container) {
            console.error('Container de erros não encontrado');
            return;
        }

        container.innerHTML = '';
        container.classList.add('alert', 'alert-danger');

        if (errors && errors.length > 0) {
            errors.forEach(error => {
                const div = document.createElement('div');
                div.className = 'error-message';
                div.textContent = error;
                container.appendChild(div);
            });
            container.style.display = 'block';

            // Foco no primeiro campo inválido
            const firstField = document.getElementById('siteTitle');
            if (firstField && errors.some(e => e.includes('Título'))) {
                firstField.focus();
            }

            // Auto-dismiss após 5s
            clearTimeout(this._errorTimer);
            this._errorTimer = setTimeout(() => {
                this.clearErrors();
            }, 5000);
        } else {
            container.style.display = 'none';
        }
    },

    /**
     * Limpa mensagens de erro
     */
    clearErrors: function() {
        const container = document.getElementById('errorMessages');
        if (container) {
            container.innerHTML = '';
            container.style.display = 'none';
        }
    },

    /**
     * Mostra mensagem de sucesso
     * @param {string} message - Mensagem de sucesso
     */
    showSuccess: function(message) {
        const container = document.getElementById('successMessage');
        if (!container) {
            console.error('Container de sucesso não encontrado');
            return;
        }

        container.textContent = message;
        container.classList.add('alert', 'alert-success');
        container.style.display = 'block';

        setTimeout(() => {
            container.style.display = 'none';
        }, 3000);
    }
};

