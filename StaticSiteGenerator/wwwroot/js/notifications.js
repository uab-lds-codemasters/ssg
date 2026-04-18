/*
 * Unidade Curricular: 21179 - Laboratórios de Desenvolvimento de Software
 * Grupo: Grupo 1 - CodeMasters
 * Projeto: Static Site Generator com Json.NET
 * Ficheiro: notifications.js
 * Descrição: Sistema de notificações Toast para feedback visual elegante
 */

/**
 * Objeto com funções de notificações tipo Toast
 */
const Notifications = {
    /**
     * Mostra notificação de sucesso
     * @param {string} message - Mensagem a mostrar
     * @param {number} duration - Duração em ms (default: 3000)
     */
    success: function(message, duration = 3000) {
        this.showToast(message, 'success', duration);
    },

    /**
     * Mostra notificação de erro
     * @param {string} message - Mensagem a mostrar
     * @param {number} duration - Duração em ms (default: 5000)
     */
    error: function(message, duration = 5000) {
        this.showToast(message, 'error', duration);
    },

    /**
     * Mostra notificação de aviso
     * @param {string} message - Mensagem a mostrar
     * @param {number} duration - Duração em ms (default: 4000)
     */
    warning: function(message, duration = 4000) {
        this.showToast(message, 'warning', duration);
    },

    /**
     * Mostra notificação de informação
     * @param {string} message - Mensagem a mostrar
     * @param {number} duration - Duração em ms (default: 3000)
     */
    info: function(message, duration = 3000) {
        this.showToast(message, 'info', duration);
    },

    /**
     * Função interna para mostrar toast
     * @param {string} message - Mensagem
     * @param {string} type - Tipo: success, error, warning, info
     * @param {number} duration - Duração em ms
     * @private
     */
    showToast: function(message, type, duration) {
        // Criar container se não existir
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Criar elemento do toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        // Conteúdo do toast
        const icon = this.getIcon(type);
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icon}</span>
                <span class="toast-message">${this.escapeHtml(message)}</span>
                <button class="toast-close" aria-label="Fechar notificação">&times;</button>
            </div>
        `;

        // Adicionar ao container
        container.appendChild(toast);

        // Event listener para fechar manualmente
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });

        // Auto-remover após duração
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    },

    /**
     * Remove toast com animação
     * @param {Element} toast - Elemento do toast
     * @private
     */
    removeToast: function(toast) {
        toast.classList.add('toast-fade-out');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    },

    /**
     * Retorna ícone baseado no tipo
     * @param {string} type - Tipo de notificação
     * @returns {string} HTML do ícone
     * @private
     */
    getIcon: function(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || '•';
    },

    /**
     * Escapa caracteres HTML para segurança (XSS prevention)
     * @param {string} text - Texto a escapar
     * @returns {string} Texto escapado
     * @private
     */
    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Confirma ação com modal
     * @param {string} message - Mensagem de confirmação
     * @param {Function} onConfirm - Callback se confirmar
     * @param {Function} onCancel - Callback se cancelar (opcional)
     */
    confirm: function(message, onConfirm, onCancel = null) {
        const modal = document.createElement('div');
        modal.className = 'confirmation-modal';
        modal.innerHTML = `
            <div class="confirmation-modal-content">
                <p class="confirmation-message">${this.escapeHtml(message)}</p>
                <div class="confirmation-buttons">
                    <button class="btn btn-secondary btn-cancel">Cancelar</button>
                    <button class="btn btn-danger btn-confirm">Eliminar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Mostrar com animação
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        // Event listeners dos botões
        const confirmBtn = modal.querySelector('.btn-confirm');
        const cancelBtn = modal.querySelector('.btn-cancel');

        const close = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        };

        confirmBtn.addEventListener('click', () => {
            close();
            onConfirm();
        });

        cancelBtn.addEventListener('click', () => {
            close();
            if (onCancel) onCancel();
        });

        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                close();
                if (onCancel) onCancel();
            }
        });

        // Fechar com ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', handleEsc);
                close();
                if (onCancel) onCancel();
            }
        };
        document.addEventListener('keydown', handleEsc);
    }
};

