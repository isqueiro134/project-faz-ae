import autenticacao from "./token";

if (!autenticacao) {
    window.location.href = "/home";
}

try {
    const response = await fetch('/dados-dashboard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })

    if (response.ok) {
        const result = await response.json();
    } else {
        console.error("Erro no servidor", response.status);
    }
} catch (error) {
    console.error("Erro na requisicao", erro);
}


/**
        * CONTROLLER - Lógica da Aplicação
        */
const controller = {
    // Dados fictícios (Simulando uma API)
    projects: [
        { id: 1, title: 'Desenvolvimento Site', dev: 'Ana Silva', progress: 65, price: '3.500', status: 'ongoing', label: 'Em Andamento' },
        { id: 2, title: 'Design de Logo', dev: 'Carlos Mendes', progress: 90, price: '1.200', status: 'review', label: 'Em Revisão' }
    ],

    init() {
        this.renderProjects();
        this.setupEventListeners();
    },

    renderProjects() {
        const list = document.getElementById('project-list');
        list.innerHTML = this.projects.map(p => `
                    <div class="project-card ${p.id === 1 ? 'active' : ''}" onclick="controller.selectProject(${p.id})">
                        <div class="project-info">
                            <div>
                                <strong>${p.title}</strong>
                                <p style="font-size: 0.8rem; color: var(--text-dim); margin-top: 4px;">${p.dev} ★ 4.9</p>
                            </div>
                            <span class="status-badge ${p.status}">${p.label}</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-fill" style="width: ${p.progress}%"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-dim)">
                            <span>R$ ${p.price}</span>
                            <span>Progresso: ${p.progress}%</span>
                        </div>
                    </div>
                `).join('');
    },

    selectProject(id) {
        console.log("Projeto selecionado:", id);
        // Lógica para trocar o contexto do chat/timeline aqui
    },

    sendMessage() {
        const input = document.getElementById('chat-input');
        const chatBox = document.getElementById('chat-messages');

        if (input.value.trim() !== "") {
            const msg = document.createElement('div');
            msg.className = 'bubble sent';
            msg.innerHTML = `${input.value} <br><small>${new Date().getHours()}:${new Date().getMinutes()}</small>`;
            chatBox.appendChild(msg);
            input.value = "";
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    },

    newProject() {
        alert("Abrir modal de novo projeto...");
    },

    setupEventListeners() {
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }
};

// Inicia o app
controller.init();
