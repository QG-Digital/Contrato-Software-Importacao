// Configuração da API do Telegram
const TELEGRAM_BOT_TOKEN = '8482589895:AAFlniNLs23lKqb4e7_nxvFHA9nU9NoeJF0';
const TELEGRAM_CHAT_ID = '5581669828';

// Elementos do DOM
const nomeInput = document.getElementById('nome');
const tipoDocSelect = document.getElementById('tipo-documento');
const docInput = document.getElementById('documento');
const emailInput = document.getElementById('email');
const telefoneInput = document.getElementById('telefone');
const termosCheck = document.getElementById('termos');
const lgpdCheck = document.getElementById('lgpd'); // CORRIGIDO: de dados para lgpd
const eletronicoCheck = document.getElementById('eletronico'); // NOVO: adicionado este checkbox
const acceptButton = document.getElementById('accept-button');
const loadingElement = document.getElementById('loading');
const successElement = document.getElementById('success-message');

// Formatação automática do campo de documento
tipoDocSelect.addEventListener('change', function() {
    const tipo = this.value;
    
    if (tipo === 'cpf') {
        docInput.placeholder = '000.000.000-00';
        docInput.maxLength = 14;
    } else if (tipo === 'cnpj') {
        docInput.placeholder = '00.000.000/0000-00';
        docInput.maxLength = 18;
    } else {
        docInput.placeholder = 'Selecione o tipo de documento primeiro';
        docInput.maxLength = 255;
    }
    
    validateForm();
});

// Formatação do CPF
function formatCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return cpf;
}

// Formatação do CNPJ
function formatCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    cnpj = cnpj.replace(/^(\d{2})(\d)/, '$1.$2');
    cnpj = cnpj.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    cnpj = cnpj.replace(/\.(\d{3})(\d)/, '.$1/$2');
    cnpj = cnpj.replace(/(\d{4})(\d)/, '$1-$2');
    return cnpj;
}

// Formatação do telefone
function formatPhone(phone) {
    phone = phone.replace(/\D/g, '');
    phone = phone.replace(/^(\d{2})(\d)/g, '($1) $2');
    phone = phone.replace(/(\d)(\d{4})$/, '$1-$2');
    return phone;
}

// Aplicar formatação enquanto o usuário digita
docInput.addEventListener('input', function() {
    const tipo = tipoDocSelect.value;
    
    if (tipo === 'cpf') {
        this.value = formatCPF(this.value);
    } else if (tipo === 'cnpj') {
        this.value = formatCNPJ(this.value);
    }
    
    validateForm();
});

telefoneInput.addEventListener('input', function() {
    this.value = formatPhone(this.value);
    validateForm();
});

// Validação dos campos em tempo real
function validateForm() {
    let isValid = true;
    
    // Validar nome
    if (!nomeInput.value.trim()) {
        isValid = false;
    }
    
    // Validar tipo de documento
    if (!tipoDocSelect.value) {
        isValid = false;
    }
    
    // Validar documento
    const tipo = tipoDocSelect.value;
    if (tipo === 'cpf' && docInput.value.length !== 14) {
        isValid = false;
    } else if (tipo === 'cnpj' && docInput.value.length !== 18) {
        isValid = false;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
        isValid = false;
    }
    
    // Validar telefone (mínimo 14 caracteres para (00) 00000-0000)
    if (telefoneInput.value.length < 14) {
        isValid = false;
    }
    
    // Validar checkboxes - CORRIGIDO: verificar os 3 checkboxes que existem no HTML
    if (!termosCheck.checked || !lgpdCheck.checked || !eletronicoCheck.checked) {
        isValid = false;
    }
    
    // Habilitar ou desabilitar o botão
    if (isValid) {
        acceptButton.disabled = false;
        acceptButton.classList.add('btn-enabled');
    } else {
        acceptButton.disabled = true;
        acceptButton.classList.remove('btn-enabled');
    }
    
    return isValid;
}

// Adicionar event listeners para validação em tempo real
nomeInput.addEventListener('input', validateForm);
tipoDocSelect.addEventListener('change', validateForm);
docInput.addEventListener('input', validateForm);
emailInput.addEventListener('input', validateForm);
telefoneInput.addEventListener('input', validateForm);
termosCheck.addEventListener('change', validateForm);
lgpdCheck.addEventListener('change', validateForm); // CORRIGIDO: de dados para lgpd
eletronicoCheck.addEventListener('change', validateForm); // NOVO: adicionado este listener

// Função para enviar mensagem via Telegram
async function sendTelegramMessage(message) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        return data.ok;
    } catch (error) {
        console.error('Erro ao enviar mensagem para o Telegram:', error);
        return false;
    }
}

// Ao clicar no botão de aceitação
acceptButton.addEventListener('click', async function() {
    if (!validateForm()) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }
    
    // Mostrar loading
    loadingElement.style.display = 'block';
    acceptButton.disabled = true;
    
    // Preparar mensagem para o Telegram
    const message = `
📋 <b>NOVO CONTRATO ACEITO - SISTEMA DE IMPORTAÇÃO</b>

<b>Nome:</b> ${nomeInput.value}
<b>Documento:</b> ${docInput.value} (${tipoDocSelect.value.toUpperCase()})
<b>E-mail:</b> ${emailInput.value}
<b>Telefone:</b> ${telefoneInput.value}

<b>Data/Hora:</b> ${new Date().toLocaleString('pt-BR')}
    `;
    
    // Enviar para o Telegram
    const success = await sendTelegramMessage(message);
    
    // Esconder loading
    loadingElement.style.display = 'none';
    
    if (success) {
        successElement.style.display = 'block';
        acceptButton.style.display = 'none';
        
        // Limpar formulário (opcional)
        setTimeout(() => {
            alert('Contrato aceito com sucesso! Em até 5 dias úteis você receberá o sistema por e-mail.');
        }, 2000);
    } else {
        alert('Erro ao processar contrato. Por favor, entre em contato conosco.');
        acceptButton.disabled = false;
    }
});

// Inicializar validação
validateForm();
