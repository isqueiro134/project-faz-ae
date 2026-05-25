const controller = {
    projects: [
        { id: 1, title: 'Desenvolvimento Site', dev: 'Ana Silva', progress: 65, price: '3.500', status: 'ongoing', label: 'Em Andamento' },
        { id: 2, title: 'Design de Logo', dev: 'Carlos Mendes', progress: 90, price: '1.200', status: 'review', label: 'Em Revis\u00e3o' }
    ],

    init() {
        this.renderProjects();
        this.setupEventListeners();
    },

    renderProjects() {
        const list = document.getElementById('project-list');

        list.innerHTML = this.projects.map((project) => `
            <div class="project-card ${project.id === 1 ? 'active' : ''}" onclick="controller.selectProject(${project.id})">
                <div class="project-info">
                    <div>
                        <strong>${project.title}</strong>
                        <p class="project-dev">${project.dev} &#9733; 4.9</p>
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
        console.log("Projeto selecionado:", id);
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
        input.value = "";
        chatBox.scrollTop = chatBox.scrollHeight;
    },

    newProject() {
        alert("Abrir modal de novo projeto...");
    },

    setupEventListeners() {
        document.getElementById('chat-input').addEventListener('keypress', (event) => {
            if (event.key === 'Enter') this.sendMessage();
        });
    }
};

window.controller = controller;
controller.init();
