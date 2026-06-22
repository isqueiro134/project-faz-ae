import Auth from '../services/auth.js';

const auth = new Auth();
const context = await auth.context();

if (!context) {
    window.location.href = '/login';
    throw new Error('Nao autenticado.');
}

if (context?.profile_type !== 'freelancer') {
    window.location.href = context?.redirect_to || '/onboarding';
    throw new Error('Ambiente incompativel.');
}

const controller = {
    projects: [
        { id: 1, title: 'Nenhuma proposta enviada', dev: context?.user?.full_name || 'Freelancer', progress: 0, price: '0', status: 'review', label: 'Rascunho' },
    ],

    init() {
        document.getElementById('dashboard-subtitle').textContent = `Perfil de ${context.user.full_name}.`;
        document.getElementById('profile-strength').textContent = `${context.profile?.profile_strength || 0}%`;
        this.toggleCompleteProfileAction();
        this.renderProjects();
        this.setupEventListeners();
    },

    isProfileComplete() {
        return context.profile?.status === 'published' || Number(context.profile?.profile_strength || 0) >= 100;
    },

    toggleCompleteProfileAction() {
        document.getElementById('complete-profile-action')?.classList.toggle('hidden', this.isProfileComplete());
    },

    renderProjects() {
        const list = document.getElementById('project-list');

        list.innerHTML = this.projects.map((project) => `
            <div class="project-card ${project.id === 1 ? 'active' : ''}" onclick="controller.selectProject(${project.id})">
                <div class="project-info">
                    <div>
                        <strong>${project.title}</strong>
                        <p class="project-dev">${project.dev}</p>
                    </div>
                    <span class="status-badge ${project.status}">${project.label}</span>
                </div>
                <div class="progress-container">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>
                <div class="project-meta">
                    <span>R$ ${project.price}</span>
                    <span>Progresso: ${project.progress}%</span>
                </div>
            </div>
        `).join('');
    },

    selectProject(id) {
        console.log('Proposta selecionada:', id);
    },

    sendMessage() {
        const input = document.getElementById('chat-input');
        const chatBox = document.getElementById('chat-messages');
        const value = input.value.trim();

        if (!value) return;

        const message = document.createElement('div');
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        message.className = 'bubble sent';
        message.innerHTML = `${value} <br><small>${time}</small>`;
        chatBox.appendChild(message);
        input.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;
    },

    setupEventListeners() {
        document.getElementById('chat-input').addEventListener('keypress', (event) => {
            if (event.key === 'Enter') this.sendMessage();
        });
    },
};

window.controller = controller;
controller.init();
