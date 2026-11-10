import React, { useState, useEffect, useRef } from 'react';
import readXlsxFile from 'read-excel-file';
import { 
  Users, MessageSquare, Plus, Search, Copy, Smartphone, Send, X, Trash2, Edit2, 
  MessageCircle, Bell, CalendarClock, FileDown, LayoutTemplate, DollarSign, Cloud, 
  Save, DownloadCloud, History, LogOut, Star, FileText, ShieldCheck, CheckCircle2, 
  Loader2, ClipboardEdit, Clock, CloudUpload, BarChart3, RotateCcw, Layers, PieChart,
  ArrowRight, Zap, Wrench, AlertTriangle, CheckSquare, ChevronLeft, ChevronRight, Menu,
  Sun, Moon, Check
} from 'lucide-react';

const defaultTemplates = [
  { id: 1, title: 'Agressiva (Planos)', text: 'Fala [Nome]! Cortei tudo que dava no sistema e liberei [Beneficios] por [Valor] mensais. Isso dá apenas [Custo diario] por dia. De bônus, você ainda ganha [Porcentual_Desconto] off na compra de um novo smartphone. Essa janela de aprovação fecha hoje. Bora fechar?' },
  { id: 2, title: 'Direta (Curta e Objetiva)', text: 'Oi [Nome]. Resumo da sua oferta: [Beneficios] inclusos por [Valor]/mês (custa só [Custo diario] ao dia). Fechando agora, eu ainda libero desconto para você pegar o seu novo smartphone. Posso aprovar no sistema?' },
  { id: 3, title: 'Detalhada (Transparência)', text: 'Olá [Nome], montei sua proposta passo a passo. Você leva o pacote completo com [Beneficios] pelo total de [Valor] ao mês. O investimento real é de apenas [Custo diario] por dia. Além disso, seu CPF qualificou para aquele desconto direto no aparelho. Vamos seguir com a ativação?' },
  { id: 4, title: 'Econômica (Custo Diário)', text: '[Nome], ter a melhor rede está custando menos que um café. São [Beneficios] por [Valor] mensais, exatamente [Custo diario] por dia. E o melhor: você para de pagar caro em celular avulso, pois tem desconto garantido na loja. Compensa demais, né?' },
  { id: 5, title: 'Benefício Máximo (Empilhamento)', text: 'Fala [Nome], empilhei todos os benefícios possíveis! Você leva [Beneficios], paga apenas [Valor] mensais (o que dá [Custo diario] por dia) e a cereja do bolo: desconto gigantesco para sair da loja de aparelho novo. É a melhor condição do mês. Fechado?' },
  
  { id: 6, title: 'Carência - Direta', text: 'Olá [Nome]! Passando para avisar que a carência do seu aparelho encerrou. O sistema já liberou a troca com até 60% de desconto em um smartphone novo. Quer dar uma olhada nos modelos?' },
  { id: 7, title: 'Carência - Urgência', text: 'Oi [Nome], tudo bem? Vi aqui que a sua carência de aparelho acabou. Com isso, abriu uma janela para você pegar um modelo zero com até 60% de desconto. Essa margem é por tempo limitado, posso te mandar as opções?' },
  { id: 8, title: 'Carência - VIP', text: '[Nome], excelente notícia: sua carência terminou e seu CPF entrou na lista VIP de troca. Você tem até 60% off liberado hoje para levar um novo celular. Vamos aproveitar?' },
  { id: 9, title: 'Carência - Curiosidade', text: 'Sabe aquele celular novo que você estava de olho, [Nome]? A carência da sua linha encerrou e o sistema liberou até 60% de desconto para você fazer o upgrade. Quer que eu simule os valores sem compromisso?' },
  { id: 10, title: 'Carência - Direito Adquirido', text: 'Fala [Nome]! O seu tempo de carência expirou, o que significa que você ganhou o direito de resgatar um modelo novo com até 60% de desconto direto na loja. Quando fica bom para você vir escolher o seu?' },

  { id: 11, title: 'Informativa e Direta', text: 'Oi [Nome], tudo bem? Dei uma olhada no sistema e vi que o [Marca_Aparelho] está saindo por [Valor] na sua linha. Se quiser aproveitar, me avisa.' },
  { id: 12, title: 'Aviso Amigável', text: 'Olá [Nome]. Passando só para te avisar que o valor atualizado do [Marca_Aparelho] para o seu perfil ficou em [Valor]. Qualquer coisa, estou por aqui.' },
  { id: 13, title: 'Relacionamento / Lembrança', text: 'Fala [Nome], tranquilo? Lembrei de você porque o sistema atualizou os preços e o [Marca_Aparelho] ficou por [Valor] para a sua conta. Me diz se faz sentido para você agora.' },
  { id: 14, title: 'Consultiva / Simulação', text: 'Oi [Nome]. Fiz a simulação direto no seu CPF e o [Marca_Aparelho] fechou no valor de [Valor]. Fica dentro do que você estava imaginando?' },
  { id: 15, title: 'Transparente e Simples', text: '[Nome], boa tarde! O [Marca_Aparelho] entrou com uma condição legal hoje para o seu número, ficando no valor final de [Valor]. Se quiser que eu reserve na loja, é só dar um ok.' }
];

const defaultObjections = [
  { id: 1, category: 'Fidelidade/Multa', keyword: 'multa fidelidade cancelar', script: 'A multa da sua operadora atual é um custo irrecuperável de um serviço que já não te atende. A economia mensal e os benefícios superiores que te ofereço aqui vão pagar essa multa em pouquíssimo tempo. Vale a pena continuar sofrendo na concorrência por causa de uma multa?' },
  { id: 2, category: 'Financeira', keyword: 'caro preço dinheiro', script: 'Entendo perfeitamente que o valor seja importante para você. Mas me diga: hoje você prefere pagar menos por um serviço que te deixa na mão, ou investir um pouquinho a mais para ter uma conexão que não trava e um suporte que resolve? Dividindo essa diferença, dá menos de R$ 1 por dia.' },
  { id: 3, category: 'Vou Pensar / Consultar', keyword: 'pensar falar esposa marido depois', script: 'Claro, é importante decidir com segurança! Só te aviso porque essa condição especial e a pontuação liberada no seu CPF são válidas para fechamento hoje. Posso já deixar pré-aprovado no sistema sem compromisso enquanto você confirma?' },
  { id: 4, category: 'Cobertura / Sinal', keyword: 'sinal cobertura internet trava', script: 'Justamente por isso a Claro investiu pesado na nova rede 5G e fibra na sua região. Além da velocidade superior, você conta com estabilidade garantida em contrato.' }
];

// Data no fuso LOCAL no formato AAAA-MM-DD (toISOString usa UTC e "pula" o dia após as 21h no Brasil)
const localISO = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDaysISO = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return localISO(d); };

const defaultMockClients = [
  {
    id: 1001,
    name: 'Mariana Ferreira',
    phone: '(11) 98765-4321',
    status: 'Lead Novo',
    interest: 'Combo Multi',
    fidelityEndDate: addDaysISO(5),
    followUpDate: localISO(),
    annotations: 'Cliente interessada em portabilidade de duas linhas + Fibra 1 Giga.',
    isGold: true,
    updatedAt: Date.now() - 3600000,
    interactionHistory: [
      { date: new Date().toLocaleDateString('pt-BR'), template: 'Simulação inicial Combo Multi 1 Giga + Pós 50GB' }
    ],
    customData: {}
  },
  {
    id: 1002,
    name: 'Carlos Eduardo Ribeiro',
    phone: '(21) 99876-5432',
    status: 'Em Negociação',
    interest: 'Single Residencial',
    fidelityEndDate: addDaysISO(25),
    followUpDate: localISO(),
    annotations: 'Trabalha em home office com vídeo 4K, avaliando proposta de Fibra 1 Giga.',
    isGold: true,
    updatedAt: Date.now() - 72 * 3600000,
    interactionHistory: [
      { date: new Date().toLocaleDateString('pt-BR'), template: 'Envio de comparativo de estabilidade Fibra Ótica' }
    ],
    customData: {}
  },
  {
    id: 1003,
    name: 'Patrícia Albuquerque',
    phone: '(31) 98765-1122',
    status: 'Aguardando Retorno',
    interest: 'Single Móvel',
    fidelityEndDate: addDaysISO(120),
    followUpDate: addDaysISO(1),
    annotations: 'Proposta de Pós 50GB + 2 dependentes enviada via WhatsApp.',
    isGold: false,
    updatedAt: Date.now() - 18 * 3600000,
    interactionHistory: [
      { date: new Date().toLocaleDateString('pt-BR'), template: 'Proposta formalizada com bônus de aparelho' }
    ],
    customData: {}
  },
  {
    id: 1004,
    name: 'Roberto Campos Neto',
    phone: '(11) 99112-3344',
    status: 'Agendado na Loja',
    interest: 'Troca de Aparelho',
    fidelityEndDate: addDaysISO(-10),
    followUpDate: localISO(),
    annotations: 'Fidelidade encerrada. Agendou visita às 16h para renovação com smartphone novo.',
    isGold: true,
    updatedAt: Date.now() - 7200000,
    interactionHistory: [
      { date: new Date().toLocaleDateString('pt-BR'), template: 'Convite VIP de renovação de fidelidade' }
    ],
    customData: {}
  },
  {
    id: 1005,
    name: 'Lucas Gabriel Antunes',
    phone: '(41) 99123-4567',
    status: 'Venda Fechada',
    interest: 'Combo Multi',
    fidelityEndDate: addDaysISO(365),
    followUpDate: addDaysISO(7),
    annotations: 'Pacote fechado: 1 Giga Fibra + Claro TV+ Box + Pós 50GB.',
    isGold: true,
    packageSummary: '1 Giga Fibra + Claro TV+ Box 4K + Pós 50GB',
    monthlyValue: '289,90',
    dueDay: '10',
    installDate: addDaysISO(1),
    installPeriod: 'Manhã',
    installStage: 'waiting',
    updatedAt: Date.now() - 12 * 3600000,
    interactionHistory: [
      { date: new Date().toLocaleDateString('pt-BR'), template: 'Fechamento de contrato e agendamento técnico' }
    ],
    customData: {}
  },
  {
    id: 1006,
    name: 'Renata Vasconcelos',
    phone: '(61) 98234-5678',
    status: 'Venda Fechada',
    interest: 'Single Residencial',
    fidelityEndDate: addDaysISO(360),
    followUpDate: addDaysISO(5),
    annotations: 'Instalação concluída. Aguardando janela de 24h úteis para baixa de comissão.',
    isGold: false,
    packageSummary: '1 Giga Fibra + Globoplay',
    monthlyValue: '149,90',
    dueDay: '15',
    installDate: localISO(),
    installPeriod: 'Tarde',
    installStage: 'installed',
    installedAt: Date.now() - 6 * 3600000,
    commissionDueAt: Date.now() + 18 * 3600000,
    updatedAt: Date.now() - 6 * 3600000,
    interactionHistory: [
      { date: new Date().toLocaleDateString('pt-BR'), template: 'Instalação concluída pelo técnico' }
    ],
    customData: {}
  },
  {
    id: 1007,
    name: 'Fernando Henrique Dias',
    phone: '(51) 98111-2233',
    status: 'Venda Fechada',
    interest: 'Combo Multi',
    fidelityEndDate: addDaysISO(350),
    followUpDate: addDaysISO(14),
    annotations: 'Contrato instalado e comissionado com sucesso.',
    isGold: true,
    packageSummary: 'Combo Multi 1 Giga + Pós 50GB + Premiere',
    monthlyValue: '319,80',
    dueDay: '05',
    installDate: addDaysISO(-2),
    installPeriod: 'Manhã',
    installStage: 'commissioned',
    installedAt: Date.now() - 48 * 3600000,
    commissionedAt: Date.now() - 12 * 3600000,
    updatedAt: Date.now() - 12 * 3600000,
    interactionHistory: [
      { date: new Date().toLocaleDateString('pt-BR'), template: 'Comissão confirmada no sistema' }
    ],
    customData: {}
  }
];
// Converte qualquer valor (inclusive texto "59,90") em número seguro
const num = (v) => { const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };
const money = (v) => num(v).toFixed(2).replace('.', ',');
const arr = (v) => (Array.isArray(v) ? v : []);
const stripEmojis = (str) => String(str || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu, '').replace(/[ \t]{2,}/g, ' ');

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loginUser, setLoginUser] = useState('demo');
  const [loginPass, setLoginPass] = useState('demo');

  const [activeTab, setActiveTab] = useState('clients');
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(() => {
    try { return typeof window !== 'undefined' && window.innerWidth < 768; } catch (e) { return false; }
  });
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('orion_theme') === 'dark'; } catch (e) { return false; }
  });

  useEffect(() => {
    try {
      document.documentElement.classList.toggle('dark-theme', darkMode);
      localStorage.setItem('orion_theme', darkMode ? 'dark' : 'light');
    } catch (e) {}
  }, [darkMode]);
  const [clients, setClients] = useState(defaultMockClients);
  
  const [selectedClientId, setSelectedClientId] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientForm, setClientForm] = useState({ name: '', phone: '', interest: 'Single Móvel', fidelityEndDate: '', followUpDate: '', annotations: '', interactionHistory: [], customData: {} });
  const [editingClientId, setEditingClientId] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [leadSearchTerm, setLeadSearchTerm] = useState('');
  const [isLeadDropdownOpen, setIsLeadDropdownOpen] = useState(false);
  const [showGoldOnly, setShowGoldOnly] = useState(false);
  const [showAttackQueue, setShowAttackQueue] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [crmViewMode, setCrmViewMode] = useState('list');

  const [internetOptions, setInternetOptions] = useState([
    { id: '1000', label: '1 Giga', single: 199.90, combo: 149.90, multi: 129.90, desc: 'Ultravelocidade Fibra.', beneficios: '1 Giga Fibra + App Claro TV+' }
  ]);
  const [tvOptions, setTvOptions] = useState([
    { id: 'tvbox', label: 'Claro TV+ Box', single: 134.90, combo: 119.90, multi: 99.90, extraPointPrice: 69.90, desc: 'Canais 4K oficiais.', details: 'Inclui Replay TV, comando de voz Alexa e acesso multitelas.', beneficios: 'Claro TV+ Box 4K Globoplay incluso' }
  ]);
  const [alacarteOptions, setAlacarteOptions] = useState([
    { id: 'premiere', label: 'Premiere', price: 59.90, beneficios: 'Premiere' },
    { id: 'telecine', label: 'Telecine', price: 29.90, beneficios: 'Telecine' },
    { id: 'max', label: 'Max (HBO)', price: 34.90, beneficios: 'Max' },
  ]);
  const [movelOptions, setMovelOptions] = useState([
    { id: 'controle_20', planType: 'controle', label: 'Controle 20GB', priceSingle: 59.90, priceCombo: 49.90, desc: '20GB + Apps', gigas: 20, beneficios: '20GB + WhatsApp ilimitado' },
    { id: 'pos_50', planType: 'pos', label: 'Pós 50GB', priceSingle: 124.90, priceCombo: 59.90, desc: '50GB + Passaporte', gigas: 50, beneficios: '50GB + Passaporte Américas' },
  ]);
  
  const [messageTemplates, setMessageTemplates] = useState(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateForm, setTemplateForm] = useState({ title: '', text: '' });
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const [customVariables, setCustomVariables] = useState([]);
  const [showVarModal, setShowVarModal] = useState(false);
  const [varForm, setVarForm] = useState({ name: '', description: '' });
  
  const [objections, setObjections] = useState(defaultObjections);
  const [objForm, setObjForm] = useState({ category: '', keyword: '', script: '' });
  const [editingObjId, setEditingObjId] = useState(null);
  const [showObjModal, setShowObjModal] = useState(false);

  const [statuses, setStatuses] = useState(['Lead Novo', 'Cliente Novo', 'Aguardando Retorno', 'Em Negociação', 'Agendado na Loja', 'Venda Fechada', 'Sem Interesse']);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [obsModal, setObsModal] = useState({ isOpen: false, client: null, text: '' });

  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationLog, setNotificationLog] = useState({});
  const [generatedMessage, setGeneratedMessage] = useState('');
  
  const [isAdhocClient, setIsAdhocClient] = useState(false);
  const [addAdhocToBase, setAddAdhocToBase] = useState(false);
  const [adhocName, setAdhocName] = useState('');
  const [adhocPhone, setAdhocPhone] = useState('');
  const [adhocCustomData, setAdhocCustomData] = useState({});
  
  const getDaysFromNow = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return localISO(d);
  };

  const [adhocFollowUpDate, setAdhocFollowUpDate] = useState(getDaysFromNow(7));
  const [adhocNotes, setAdhocNotes] = useState('');
  const [adhocStatus, setAdhocStatus] = useState('Em Negociação');
  
  const [onlyDeviceOffer, setOnlyDeviceOffer] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [marcaAparelho, setMarcaAparelho] = useState('');
  const [isTradeIn, setIsTradeIn] = useState(false);
  const [deviceOfferMode, setDeviceOfferMode] = useState('generic');
  const [devicePrice, setDevicePrice] = useState('');

  const [activityLog, setActivityLog] = useState([]);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [alertaDuplicidade, setAlertaDuplicidade] = useState(null);

  const [selInternet, setSelInternet] = useState('');
  const [selTV, setSelTV] = useState('');
  const [selAlacarte, setSelAlacarte] = useState([]);
  const [selMovel, setSelMovel] = useState('');
  const [isFiber, setIsFiber] = useState(false);
  const [tvPoints, setTvPoints] = useState(0);
  const [movelDependentes, setMovelDependentes] = useState(0);
  const [dependentePrice, setDependentePrice] = useState(49.90);
  const [extraPlans, setExtraPlans] = useState([]);
  const [showExtraPlanModal, setShowExtraPlanModal] = useState(false);

  // Opção 2 para Comparação (Ancoragem na Proposta)
  const [showOption2, setShowOption2] = useState(false);
  const [selInternet2, setSelInternet2] = useState('');
  const [selTV2, setSelTV2] = useState('');
  const [selAlacarte2, setSelAlacarte2] = useState([]);
  const [selMovel2, setSelMovel2] = useState('');
  const [isFiber2, setIsFiber2] = useState(false);
  const [tvPoints2, setTvPoints2] = useState(0);
  const [movelDependentes2, setMovelDependentes2] = useState(0);
  const [customBenefits2, setCustomBenefits2] = useState('');
  const [customPrice2, setCustomPrice2] = useState('');

  const [pricingTab, setPricingTab] = useState('movel');
  const [includeDevice, setIncludeDevice] = useState(false);
  const [proposalStatus, setProposalStatus] = useState('');
  const [showStatusRequiredModal, setShowStatusRequiredModal] = useState(false);
  const [newStatusName, setNewStatusName] = useState('');
  const [showObjDrawer, setShowObjDrawer] = useState(false);
  const [objSearch, setObjSearch] = useState('');
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [closingForm, setClosingForm] = useState({ due: '', installDate: '', period: 'Manhã' });
  const [closingSummaryModal, setClosingSummaryModal] = useState({
    isOpen: false,
    clientId: null,
    clientName: '',
    clientPhone: '',
    packageSummary: '',
    monthlyValue: '',
    dueDay: '10',
    includePortabilitySms: true,
    requiresInstallation: false,
    installDate: '',
    installPeriod: 'Manhã'
  });
  const [reportMonth, setReportMonth] = useState(localISO().slice(0, 7));
  const [compareMonth, setCompareMonth] = useState('');
  const [draggedInstallId, setDraggedInstallId] = useState(null);
  const [checklistItems, setChecklistItems] = useState([
    { id: 1, title: 'Checar Fila de Ataque de Hoje no CRM', priority: 'Alta', category: 'Rotina Diária', dueDate: '', done: false },
    { id: 2, title: 'Acompanhar instalações agendadas para o dia', priority: 'Alta', category: 'Instalações', dueDate: '', done: false },
    { id: 3, title: 'Conferir comissões que completaram 24h úteis', priority: 'Alta', category: 'Comissão', dueDate: '', done: false },
    { id: 4, title: 'Dar baixa nos retornos da Agenda do Dinheiro', priority: 'Normal', category: 'Pós-Venda', dueDate: '', done: false }
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Alta');
  const [newTaskCategory, setNewTaskCategory] = useState('Rotina Diária');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [checklistFilter, setChecklistFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const toastTimer = useRef(null);
  // Só grava no banco depois que os dados salvos foram carregados (evita sobrescrever com os valores padrão)
  const [hydrated, setHydrated] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(prev => ({ ...prev, show: false })), type === 'warning' ? 6000 : 3000);
  };

  const renameStatus = (old, novo) => {
    novo = (novo || '').trim();
    if (!novo || novo === old) return;
    if (statuses.includes(novo)) { showToast('Já existe um status com esse nome.', 'warning'); return; }
    setStatuses(prev => prev.map(x => x === old ? novo : x));
    setClients(prev => prev.map(c => c.status === old ? { ...c, status: novo } : c));
    if (statusFilter === old) setStatusFilter(novo);
    if (proposalStatus === old) setProposalStatus(novo);
  };
  const deleteStatus = (st) => {
    if (statuses.length <= 1) { showToast('Mantenha ao menos um status.', 'warning'); return; }
    const resto = statuses.filter(x => x !== st);
    const qtd = clients.filter(c => c.status === st).length;
    if (!window.confirm(qtd ? `${qtd} cliente(s) estão em "${st}" e serão movidos para "${resto[0]}". Excluir?` : `Excluir o status "${st}"?`)) return;
    setClients(prev => prev.map(c => c.status === st ? { ...c, status: resto[0] } : c));
    setStatuses(resto);
    if (statusFilter === st) setStatusFilter('');
    if (proposalStatus === st) setProposalStatus('');
  };
  const moveStatus = (i, d) => setStatuses(prev => { const a = [...prev]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });
  const addStatus = (e) => {
    e.preventDefault();
    const n = newStatusName.trim();
    if (!n) return;
    if (statuses.includes(n)) { showToast('Já existe um status com esse nome.', 'warning'); return; }
    setStatuses(prev => [...prev, n]);
    setNewStatusName('');
    showToast('Status adicionado!', 'success');
  };
  const lastInteraction = (c) => {
    let t = c.statusSince || c.id || 0;
    (c.interactionHistory || []).forEach(h => { const p = (h.date || '').split('/'); if (p.length === 3) { const d = new Date(+p[2], +p[1] - 1, +p[0]).getTime(); if (d > t) t = d; } });
    return t;
  };
  const coolingInfo = (c) => {
    if (c.status !== 'Em Negociação') return null;
    const d = Math.floor((Date.now() - lastInteraction(c)) / 86400000);
    return d > 5 ? { d, level: 'danger' } : d > 3 ? { d, level: 'warn' } : null;
  };
  const coolingClass = (c) => { const i = coolingInfo(c); return i ? (i.level === 'danger' ? '!border-red-500 ring-2 ring-red-400 animate-pulse' : '!border-amber-400 ring-2 ring-amber-300 animate-pulse') : ''; };
  const coolingBadge = (c) => { const i = coolingInfo(c); return i ? <div className={`mt-1 inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${i.level === 'danger' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>Esfriando: {i.d} dias sem interação</div> : null; };
  const fidelityInfo = (c) => {
    if (!c.fidelityEndDate) return null;
    const t = new Date(); t.setHours(0, 0, 0, 0);
    const days = Math.ceil((new Date(c.fidelityEndDate + 'T00:00:00') - t) / 86400000);
    const meses = Math.round(days / 30.4);
    if (days < 0) return { label: 'Fidelidade encerrada — oferecer renovação', cls: 'bg-emerald-100 text-emerald-700 border-emerald-300', bar: 'bg-emerald-400', pct: 100 };
    if (days <= 30) return { label: `Fidelidade vence em ${days} dia(s)`, cls: 'bg-amber-100 text-amber-700 border-amber-300', bar: 'bg-amber-400', pct: Math.max(4, Math.round(days / 730 * 100)) };
    return { label: `Faltam ${meses} ${meses === 1 ? 'mês' : 'meses'} de fidelidade`, cls: 'bg-blue-100 text-blue-700 border-blue-300', bar: 'bg-blue-400', pct: Math.min(100, Math.round(days / 730 * 100)) };
  };
  const fidelityChip = (c) => { const f = fidelityInfo(c); return f ? <div className="mt-1.5 max-w-[240px]"><span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${f.cls}`}>{f.label}</span><div className="h-1 bg-gray-200 rounded-full mt-1 overflow-hidden"><div className={`h-full rounded-full ${f.bar}`} style={{ width: f.pct + '%' }} /></div></div> : null; };
  const contactClient = (client) => {
    setClients(prev => prev.map(c => c.id === client.id ? { ...c, interactionHistory: [...(c.interactionHistory || []), { date: new Date().toLocaleDateString('pt-BR'), template: 'Contato via WhatsApp' }] } : c));
    addToHistory(`Contato via WhatsApp: ${client.name}`);
    openWhatsApp(client.phone, `Olá ${client.name}, tudo bem? Aqui é da Claro.`);
  };

  const formatPhoneMask = (val) => {
    if (!val) return '';
    let sanitizedVal = ('' + val).replace(/\(\(/g, '(').replace(/\)\)/g, ')');
    const cleaned = sanitizedVal.replace(/\D/g, '').slice(0, 11);
    const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    if (!match) return cleaned;
    if (match[3]) return `(${match[1]}) ${match[2]}-${match[3]}`;
    if (match[2]) return `(${match[1]}) ${match[2]}`;
    if (match[1]) return `(${match[1]}`;
    return cleaned;
  };

  const limparTelefone = (tel) => (tel || '').replace(/\D/g, '');

  const openWhatsApp = (phone, text) => {
    const formattedPhone = limparTelefone(phone);
    const cleanText = stripEmojis(text || 'Olá, tudo bem?');
    window.open(`https://wa.me/55${formattedPhone}?text=${encodeURIComponent(cleanText)}`, '_blank');
  };

  const addToHistory = (action) => {
      const now = new Date();
      const newLog = {
          id: Date.now(),
          action,
          date: now.toLocaleDateString('pt-BR'),
          time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          timestamp: now.getTime()
      };
      setActivityLog(prev => [newLog, ...prev]);
  };

  useEffect(() => {
      const now = Date.now();
      // Keep exactly 7 days of history
      setActivityLog(prev => prev.filter(log => (now - log.timestamp) <= 7 * 24 * 60 * 60 * 1000));
  }, [activeTab]);

  useEffect(() => {
    try {
      const savedClients = localStorage.getItem('orion_clients');
      if (savedClients) {
        const cl = JSON.parse(savedClients);
        const valid = Array.isArray(cl) ? cl.filter(c => c && typeof c === 'object') : [];
        setClients(valid.length > 0 ? valid : defaultMockClients);
      } else {
        setClients(defaultMockClients);
      }
      const savedTemplates = localStorage.getItem('orion_templates');
      if (savedTemplates) {
        const tpls = JSON.parse(savedTemplates);
        if (Array.isArray(tpls)) setMessageTemplates(tpls.map(t => ({ ...t, title: stripEmojis(t.title), text: stripEmojis(t.text) })));
      }
      const savedObjections = localStorage.getItem('orion_objections');
      if (savedObjections) {
        const objs = JSON.parse(savedObjections);
        if (Array.isArray(objs)) setObjections(objs.map(o => ({ ...o, script: stripEmojis(o.script) })));
      }
      const savedMovel = localStorage.getItem('orion_movel');
      if (savedMovel) setMovelOptions(JSON.parse(savedMovel));
      const savedInternet = localStorage.getItem('orion_internet');
      if (savedInternet) setInternetOptions(JSON.parse(savedInternet));
      const savedTv = localStorage.getItem('orion_tv');
      if (savedTv) setTvOptions(JSON.parse(savedTv));
      const savedAlacarte = localStorage.getItem('orion_alacarte');
      if (savedAlacarte) { const al = JSON.parse(savedAlacarte); if (Array.isArray(al)) setAlacarteOptions(al); }
      const savedStatuses = localStorage.getItem('orion_statuses');
      if (savedStatuses) setStatuses(JSON.parse(savedStatuses));
      const savedNotifs = localStorage.getItem('orion_notifications');
      if (savedNotifs) setNotificationLog(JSON.parse(savedNotifs));
      const savedVars = localStorage.getItem('orion_custom_vars');
      if (savedVars) setCustomVariables(JSON.parse(savedVars));
      const savedHistory = localStorage.getItem('orion_history');
      if (savedHistory) { const h = JSON.parse(savedHistory); setActivityLog(Array.isArray(h) ? h.filter(l => l && typeof l === 'object').map(l => ({ ...l, action: String(l.action ?? '') })) : []); }
      const savedDepPrice = localStorage.getItem('orion_dep_price');
      if (savedDepPrice) setDependentePrice(JSON.parse(savedDepPrice));
      const savedChecklist = localStorage.getItem('orion_checklist');
      if (savedChecklist) { const ck = JSON.parse(savedChecklist); if (Array.isArray(ck)) setChecklistItems(ck); }
    } catch(e) {
      console.error("Erro ao carregar dados locais", e);
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('orion_clients', JSON.stringify(clients));
        localStorage.setItem('orion_templates', JSON.stringify(messageTemplates));
        localStorage.setItem('orion_objections', JSON.stringify(objections));
        localStorage.setItem('orion_movel', JSON.stringify(movelOptions));
        localStorage.setItem('orion_internet', JSON.stringify(internetOptions));
        localStorage.setItem('orion_tv', JSON.stringify(tvOptions));
        localStorage.setItem('orion_alacarte', JSON.stringify(alacarteOptions));
        localStorage.setItem('orion_statuses', JSON.stringify(statuses));
        localStorage.setItem('orion_notifications', JSON.stringify(notificationLog));
        localStorage.setItem('orion_custom_vars', JSON.stringify(customVariables));
        localStorage.setItem('orion_history', JSON.stringify(activityLog));
        localStorage.setItem('orion_dep_price', JSON.stringify(dependentePrice));
        localStorage.setItem('orion_checklist', JSON.stringify(checklistItems));
    } catch(e) {
      console.error("Erro ao salvar dados locais", e);
    }
  }, [clients, messageTemplates, movelOptions, internetOptions, tvOptions, alacarteOptions, statuses, notificationLog, objections, customVariables, dependentePrice, activityLog, checklistItems]);

  useEffect(() => {
    const checkBackupTime = () => {
      const now = new Date();
      if (now.getHours() === 17 && now.getMinutes() === 40) {
        const lastBackupDate = localStorage.getItem('orion_last_cron_backup');
        const todayStr = now.toISOString().split('T')[0];
        if (lastBackupDate !== todayStr) {
          fetch('/api/backup', { method: 'POST', headers: { 'X-Orion': '1' } }).catch(() => {});
          localStorage.setItem('orion_last_cron_backup', todayStr);
          addToHistory('Backup automático das 17:40 realizado');
        }
      }
    };
    const timer = setInterval(checkBackupTime, 30000);
    return () => clearInterval(timer);
  }, [clients, messageTemplates, movelOptions, internetOptions, tvOptions, alacarteOptions, customVariables, objections]);

  const handleExportBackup = () => {
    const dataStr = JSON.stringify({ clients, messageTemplates, movelOptions, internetOptions, tvOptions, alacarteOptions, statuses, notificationLog, objections, customVariables, dependentePrice, checklistItems });
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `Backup_Claro_Orion_${new Date().toISOString().split('T')[0]}.json`;
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
       try {
          const data = JSON.parse(event.target.result);
          const parseMaybeJSON = (val) => {
            if (typeof val === 'string') {
              try { return JSON.parse(val); } catch { return undefined; }
            }
            return val;
          };
          const importedClients = data.clients || parseMaybeJSON(data.orion_clients);
          const importedTemplates = data.messageTemplates || parseMaybeJSON(data.orion_templates);
          const importedMovel = data.movelOptions || parseMaybeJSON(data.orion_movel);
          const importedInternet = data.internetOptions || parseMaybeJSON(data.orion_internet);
          const importedTv = data.tvOptions || parseMaybeJSON(data.orion_tv);
          const importedAlacarte = data.alacarteOptions || parseMaybeJSON(data.orion_alacarte);
          const importedStatuses = data.statuses || parseMaybeJSON(data.orion_statuses);
          const importedObjections = data.objections || parseMaybeJSON(data.orion_objections);
          const importedVars = data.customVariables || parseMaybeJSON(data.orion_custom_vars);
          const importedDepPrice = data.dependentePrice !== undefined ? data.dependentePrice : (data.orion_dep_price !== undefined ? parseFloat(data.orion_dep_price) : undefined);
          const importedChecklist = data.checklistItems || parseMaybeJSON(data.orion_checklist);

          const syncPayload = {};
          if (Array.isArray(importedClients)) { setClients(importedClients); syncPayload.orion_clients = JSON.stringify(importedClients); }
          if (Array.isArray(importedTemplates)) { setMessageTemplates(importedTemplates); syncPayload.orion_templates = JSON.stringify(importedTemplates); }
          if (Array.isArray(importedMovel)) { setMovelOptions(importedMovel); syncPayload.orion_movel = JSON.stringify(importedMovel); }
          if (Array.isArray(importedInternet)) { setInternetOptions(importedInternet); syncPayload.orion_internet = JSON.stringify(importedInternet); }
          if (Array.isArray(importedTv)) { setTvOptions(importedTv); syncPayload.orion_tv = JSON.stringify(importedTv); }
          if (Array.isArray(importedAlacarte)) { setAlacarteOptions(importedAlacarte); syncPayload.orion_alacarte = JSON.stringify(importedAlacarte); }
          if (Array.isArray(importedStatuses)) { setStatuses(importedStatuses); syncPayload.orion_statuses = JSON.stringify(importedStatuses); }
          if (Array.isArray(importedObjections)) { setObjections(importedObjections); syncPayload.orion_objections = JSON.stringify(importedObjections); }
          if (Array.isArray(importedVars)) { setCustomVariables(importedVars); syncPayload.orion_custom_vars = JSON.stringify(importedVars); }
          if (importedDepPrice !== undefined && !Number.isNaN(importedDepPrice)) { setDependentePrice(importedDepPrice); syncPayload.orion_dep_price = String(importedDepPrice); }
          if (Array.isArray(importedChecklist)) { setChecklistItems(importedChecklist); syncPayload.orion_checklist = JSON.stringify(importedChecklist); }

          if (Object.keys(syncPayload).length > 0) {
            try {
              await fetch('/api/db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Orion': '1' },
                body: JSON.stringify(syncPayload)
              });
            } catch (err) {}
          }

          showToast('Backup restaurado e sincronizado para todos os dispositivos!', 'success');
          addToHistory('Backup restaurado e sincronizado via arquivo JSON');
       } catch(e) {
          showToast('Erro ao ler arquivo de backup.', 'error');
       }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Orion': '1' }, body: JSON.stringify({ usuario: loginUser, senha: loginPass }) });
      const d = await r.json();
      if (d.ok) setIsAuthenticated(true); else alert('Usuário ou senha incorretos.');
    } catch (err) { alert('Não foi possível conectar ao servidor de autenticação do Órion.'); }
  };

  const getOperatorName = (username) => {
    const u = (username || '').trim().toLowerCase();
    if (u === 'ltz3n') return 'Operador Ariell';
    return 'Operador Ariell';
  };

  const allActiveNotifs = [];
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  clients.forEach(c => {
    if (c.fidelityEndDate) { const dl = Math.ceil((new Date(c.fidelityEndDate + 'T00:00:00') - todayDate) / 86400000); if (dl >= 0 && dl <= 7) allActiveNotifs.push({ type: 'fid', name: c.name, phone: c.phone, date: c.fidelityEndDate, notifKey: `fid_${c.id}` }); }
    if (c.followUpDate) {
      const folDate = new Date(c.followUpDate + 'T00:00:00');
      if (folDate <= todayDate) { 
        allActiveNotifs.push({ 
            type: c.tipoRetorno === 'pos-venda' ? 'pos-venda' : 'fol', 
            name: c.name, 
            phone: c.phone, 
            date: c.followUpDate, 
            notifKey: `fol_${c.id}` 
        });
      }
    }
    if (c.installStage === 'installed' && c.commissionDueAt && Date.now() >= c.commissionDueAt) {
      allActiveNotifs.push({
        type: 'comissao',
        name: c.name,
        phone: c.phone,
        date: localISO(new Date(c.commissionDueAt)),
        dueAt: c.commissionDueAt,
        packageSummary: c.packageSummary || '',
        notifKey: `com_${c.id}_${c.commissionDueAt}`
      });
    }
  });

  const getNotifStatus = (key) => {
    if (!notificationLog[key]) return 'unread';
    const readDate = new Date(notificationLog[key]);
    const diffDays = Math.floor((new Date() - readDate) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 ? 'recent' : 'archived';
  };

  const markAsRead = (key) => {
    if (!notificationLog[key]) {
      setNotificationLog(prev => ({...prev, [key]: new Date().toISOString()}));
    }
  };

  const unreadCount = allActiveNotifs.filter(n => getNotifStatus(n.notifKey) === 'unread').length;

  const categoryCount = (selInternet ? 1 : 0) + (selTV ? 1 : 0) + (selMovel ? 1 : 0);
  let basePrice = 0;
  let selectedItemsText = [];
  const isCombo = categoryCount >= 2;
  const isMulti = categoryCount === 3;

  if (selInternet) {
    const opt = internetOptions.find(i => i.id === selInternet);
    if(opt) {
      basePrice += isMulti ? (opt.multi || opt.combo) : (isCombo ? opt.combo : opt.single);
      let netTxt = opt.beneficios || `Internet Residencial ${opt.label}`; if (isFiber && !/[óo]tica/i.test(netTxt)) netTxt += ' (Fibra Ótica)'; selectedItemsText.push(netTxt);
    }
  }
  if (selTV) {
    const opt = tvOptions.find(t => t.id === selTV);
    if(opt) {
      basePrice += isMulti ? opt.multi : (isCombo ? opt.combo : opt.single);
      let tvDesc = opt.beneficios || `TV / Streaming ${opt.label}`;
      if (tvPoints > 0) {
        const extraPrice = opt.extraPointPrice !== undefined ? opt.extraPointPrice : 69.90;
        basePrice += (tvPoints * extraPrice);
        tvDesc += ` (+${tvPoints} Ponto(s) Extra(s))`;
      }
      if (selAlacarte.length > 0) {
        const alaNames = [];
        selAlacarte.forEach(alaId => {
          const alaOpt = alacarteOptions.find(a => a.id === alaId);
          if (alaOpt) {
            basePrice += (Number(alaOpt.price) || 0);
            alaNames.push(alaOpt.beneficios || alaOpt.label);
          }
        });
        if (alaNames.length > 0) {
          tvDesc += ` + ${alaNames.join(' + ')}`;
        }
      }
      selectedItemsText.push(tvDesc);
    }
  }
  if (selMovel) {
    const opt = movelOptions.find(m => m.id === selMovel);
    if(opt) {
      basePrice += isCombo ? opt.priceCombo : opt.priceSingle;
      basePrice += (movelDependentes * dependentePrice);
      let descMovel = opt.beneficios || `Plano Móvel ${opt.gigas}GB (${opt.desc})`;
      if (movelDependentes > 0) {
         descMovel += ` + dependentes`;
      }
      selectedItemsText.push(descMovel);
    }
  } else if (movelDependentes > 0) {
    basePrice += (movelDependentes * dependentePrice);
    selectedItemsText.push('dependentes');
  }

  extraPlans.forEach(ep => {
    basePrice += ep.price;
    selectedItemsText.push(`${ep.label} (${ep.beneficios || 'Plano Adicional'})`);
  });

  const benefitsStr = selectedItemsText.join(' + ');

  // Cálculo da Opção 2 para Comparação
  const categoryCount2 = (selInternet2 ? 1 : 0) + (selTV2 ? 1 : 0) + (selMovel2 ? 1 : 0);
  let calcPrice2 = 0;
  let selectedItemsText2 = [];
  const isCombo2 = categoryCount2 >= 2;
  const isMulti2 = categoryCount2 === 3;

  if (selInternet2) {
    const opt = internetOptions.find(i => i.id === selInternet2);
    if (opt) {
      calcPrice2 += isMulti2 ? (opt.multi || opt.combo) : (isCombo2 ? opt.combo : opt.single);
      let netTxt = opt.beneficios || `Internet Residencial ${opt.label}`;
      if (isFiber2 && !/[óo]tica/i.test(netTxt)) netTxt += ' (Fibra Ótica)';
      selectedItemsText2.push(netTxt);
    }
  }
  if (selTV2) {
    const opt = tvOptions.find(t => t.id === selTV2);
    if (opt) {
      calcPrice2 += isMulti2 ? opt.multi : (isCombo2 ? opt.combo : opt.single);
      let tvDesc = opt.beneficios || `TV / Streaming ${opt.label}`;
      if (tvPoints2 > 0) {
        const extraPrice = opt.extraPointPrice !== undefined ? opt.extraPointPrice : 69.90;
        calcPrice2 += (tvPoints2 * extraPrice);
        tvDesc += ` (+${tvPoints2} Ponto(s) Extra(s))`;
      }
      if (selAlacarte2.length > 0) {
        const alaNames2 = [];
        selAlacarte2.forEach(alaId => {
          const alaOpt = alacarteOptions.find(a => a.id === alaId);
          if (alaOpt) {
            calcPrice2 += (Number(alaOpt.price) || 0);
            alaNames2.push(alaOpt.beneficios || alaOpt.label);
          }
        });
        if (alaNames2.length > 0) {
          tvDesc += ` + ${alaNames2.join(' + ')}`;
        }
      }
      selectedItemsText2.push(tvDesc);
    }
  }
  if (selMovel2) {
    const opt = movelOptions.find(m => m.id === selMovel2);
    if (opt) {
      calcPrice2 += isCombo2 ? opt.priceCombo : opt.priceSingle;
      calcPrice2 += (movelDependentes2 * dependentePrice);
      let descMovel = opt.beneficios || `Plano Móvel ${opt.gigas}GB (${opt.desc})`;
      if (movelDependentes2 > 0) descMovel += ` + dependentes`;
      selectedItemsText2.push(descMovel);
    }
  } else if (movelDependentes2 > 0) {
    calcPrice2 += (movelDependentes2 * dependentePrice);
    selectedItemsText2.push('dependentes');
  }
  if (customBenefits2.trim()) selectedItemsText2.push(customBenefits2.trim());
  const benefitsStr2 = selectedItemsText2.join(' + ');
  const finalPrice2 = customPrice2 !== '' && String(customPrice2).trim() !== '' ? num(customPrice2) : calcPrice2;

  let clientData = isAdhocClient ? { name: adhocName || '[Nome]', phone: adhocPhone, customData: adhocCustomData } : (clients.find(c => c.id === parseInt(selectedClientId)) || { name: '[Nome]', phone: '', customData: {} });
  const clientName = (isAdhocClient ? adhocName : clientData.name) || '[Nome]';
  const clientDataStringified = JSON.stringify(clientData); 

  useEffect(() => {
    let template = messageTemplates.find(t => t.id === Number(selectedTemplate));

    if (!template && !showOption2) {
        setGeneratedMessage('');
        return;
    }

    const totalCostStr = (onlyDeviceOffer && deviceOfferMode === 'specific') ? (devicePrice ? `R$ ${devicePrice}` : '[Valor]') : (basePrice > 0 ? `R$ ${basePrice.toFixed(2).replace('.', ',')}` : '[Valor]');
    const dailyCost = basePrice > 0 ? basePrice / 30 : 0;
    const dailyCostStr = dailyCost > 0 ? `R$ ${dailyCost.toFixed(2).replace('.', ',')}` : '[Custo diario]';
    const benefitsFinalStr = benefitsStr || '[Beneficios]';
    const nameFinalStr = clientName === '[Nome]' ? '[Nome]' : clientName;
    const cleanPct = (discountPercentage || '').trim().replace(/^at[ée]\s+/i, '');
    const pctWithSymbol = cleanPct ? (cleanPct.includes('%') ? cleanPct : `${cleanPct}%`) : '';
    const discountFinalStr = `até ${pctWithSymbol || '[Porcentual_Desconto]'}`;
    const deviceBrandFinalStr = marcaAparelho || '[Marca_Aparelho]';

    if (showOption2) {
        const totalCostStr2 = finalPrice2 > 0 ? `R$ ${finalPrice2.toFixed(2).replace('.', ',')}` : '[Valor]';
        const dailyCost2 = finalPrice2 > 0 ? finalPrice2 / 30 : 0;
        const dailyCostStr2 = dailyCost2 > 0 ? `R$ ${dailyCost2.toFixed(2).replace('.', ',')}` : '[Custo diario]';
        const benefitsFinalStr2 = benefitsStr2 || '[Beneficios]';

        let intro = `Olá ${nameFinalStr}, tudo bem? Separei duas opções autorizadas no sistema para o seu perfil hoje:`;
        if (template) {
            let tplIntro = template.text;
            tplIntro = tplIntro.replace(/\[Nome\]/gi, nameFinalStr);
            tplIntro = tplIntro.replace(/\[Valor\]/gi, totalCostStr);
            tplIntro = tplIntro.replace(/\[Valor Total\]/gi, totalCostStr);
            tplIntro = tplIntro.replace(/\[Beneficios\]/gi, benefitsFinalStr);
            tplIntro = tplIntro.replace(/\[Benefícios\]/gi, benefitsFinalStr);
            tplIntro = tplIntro.replace(/\[Custo diario\]/gi, dailyCostStr);
            tplIntro = tplIntro.replace(/\[Custo diário\]/gi, dailyCostStr);
            tplIntro = tplIntro.replace(/\[Porcentual_Desconto\]/gi, discountFinalStr);
            if (!/\[Porcentual_Desconto\]/i.test(template.text) && pctWithSymbol) {
                tplIntro = tplIntro.replace(/at[ée]\s+\d+%/gi, `até ${pctWithSymbol}`);
            }
            tplIntro = tplIntro.replace(/at[ée]\s+at[ée]\s+/gi, 'até ');
            tplIntro = tplIntro.replace(/\[Marca_Aparelho\]/gi, deviceBrandFinalStr);
            customVariables.forEach(v => {
                const escapedVar = v.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`\\[${escapedVar}\\]`, 'gi');
                const parsedClientData = JSON.parse(clientDataStringified);
                const val = parsedClientData.customData?.[v.name] || `[${v.name}]`;
                tplIntro = tplIntro.replace(regex, val);
            });
            intro = tplIntro + '\n\n*Comparativo das duas opções autorizadas:*';
        }

        let compMsg = `${intro}\n\n` +
            `*OPÇÃO 1 (Pacote Completo):*\n` +
            `• Benefícios: ${benefitsFinalStr}\n` +
            `• Investimento: *${totalCostStr}/mês* (apenas *${dailyCostStr} por dia*)\n\n` +
            `*OPÇÃO 2 (Alternativa Econômica):*\n` +
            `• Benefícios: ${benefitsFinalStr2}\n` +
            `• Investimento: *${totalCostStr2}/mês* (apenas *${dailyCostStr2} por dia*)`;

        if (includeDevice && !onlyDeviceOffer) {
            let dev = deviceOfferMode === 'specific'
              ? `\n\n*Aparelho junto com o plano:* ${marcaAparelho || '[Modelo]'} por ${devicePrice ? 'R$ ' + devicePrice : '[Preço]'}`
              : `\n\n*Desconto pelo plano:* até ${pctWithSymbol || '[%]'} de desconto na compra de um novo smartphone`;
            if (isTradeIn) dev += ' (já considerando a entrega do seu aparelho atual na troca)';
            compMsg += dev + '.';
        }

        compMsg += `\n\nQual dessas duas opções faz mais sentido para você hoje: a Opção 1 ou a Opção 2?`;
        setGeneratedMessage(stripEmojis(compMsg));
        return;
    }

    let msg = template.text;
    msg = msg.replace(/\[Nome\]/gi, nameFinalStr);
    msg = msg.replace(/\[Valor\]/gi, totalCostStr);
    msg = msg.replace(/\[Valor Total\]/gi, totalCostStr); 
    msg = msg.replace(/\[Beneficios\]/gi, benefitsFinalStr);
    msg = msg.replace(/\[Benefícios\]/gi, benefitsFinalStr); 
    msg = msg.replace(/\[Custo diario\]/gi, dailyCostStr);
    msg = msg.replace(/\[Custo diário\]/gi, dailyCostStr);
    msg = msg.replace(/\[Porcentual_Desconto\]/gi, discountFinalStr);
    if (!/\[Porcentual_Desconto\]/i.test(template.text) && pctWithSymbol) {
        msg = msg.replace(/at[ée]\s+\d+%/gi, `até ${pctWithSymbol}`);
    }
    msg = msg.replace(/at[ée]\s+at[ée]\s+/gi, 'até ');
    msg = msg.replace(/\[Marca_Aparelho\]/gi, deviceBrandFinalStr);

    customVariables.forEach(v => {
        const escapedVar = v.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\[${escapedVar}\\]`, 'gi');
        const parsedClientData = JSON.parse(clientDataStringified);
        const val = parsedClientData.customData?.[v.name] || `[${v.name}]`;
        msg = msg.replace(regex, val);
    });

    if (isTradeIn && onlyDeviceOffer) {
        msg += '\n\n*Lembrando que essa condição especial já considera a avaliação e entrega do seu aparelho atual na troca.*';
    }

    if (includeDevice && !onlyDeviceOffer) {
        let dev = deviceOfferMode === 'specific'
          ? `\n\n*Aparelho junto com o plano:* ${marcaAparelho || '[Modelo]'} por ${devicePrice ? 'R$ ' + devicePrice : '[Preço]'}`
          : `\n\n*Desconto pelo plano:* até ${pctWithSymbol || '[%]'} de desconto na compra de um novo smartphone`;
        if (isTradeIn) dev += ' (já considerando a entrega do seu aparelho atual na troca)';
        msg += dev + '.';
    }

    setGeneratedMessage(stripEmojis(msg));
  }, [
      selectedTemplate, basePrice, benefitsStr, clientName, discountPercentage, marcaAparelho,
      isTradeIn, deviceOfferMode, devicePrice, onlyDeviceOffer, includeDevice, customVariables, clientDataStringified, messageTemplates,
      showOption2, finalPrice2, benefitsStr2
  ]);

  const handleResetProposal = () => {
    setSelInternet('');
    setSelTV('');
    setTvPoints(0);
    setSelAlacarte([]);
    setSelMovel('');
    setMovelDependentes(0);
    setExtraPlans([]);
    setShowOption2(false);
    setSelInternet2('');
    setSelTV2('');
    setSelAlacarte2([]);
    setSelMovel2('');
    setIsFiber2(false);
    setTvPoints2(0);
    setMovelDependentes2(0);
    setCustomBenefits2('');
    setCustomPrice2('');
    setSelectedClientId('');
    setIsAdhocClient(false);
    setAdhocName('');
    setAdhocPhone('');
    setSelectedTemplate('');
    setGeneratedMessage('');
    setOnlyDeviceOffer(false); setIncludeDevice(false); setIsFiber(false); setProposalStatus('');
    setMarcaAparelho('');
    setDiscountPercentage('');
    setDevicePrice('');
    setIsTradeIn(false);
    showToast('Proposta limpa com sucesso!', 'info');
  };

  const openClosingSummaryForClient = (clientObj) => {
    setClosingSummaryModal({
      isOpen: true,
      clientId: clientObj.id,
      clientName: clientObj.name || '',
      clientPhone: clientObj.phone || '',
      packageSummary: clientObj.packageSummary || benefitsStr || (clientObj.interest && clientObj.interest !== 'A Definir' ? clientObj.interest : ''),
      monthlyValue: clientObj.monthlyValue !== undefined && clientObj.monthlyValue !== '' ? String(clientObj.monthlyValue) : (basePrice > 0 ? basePrice.toFixed(2) : ''),
      dueDay: clientObj.dueDay || '10',
      includePortabilitySms: clientObj.includePortabilitySms !== undefined ? clientObj.includePortabilitySms : true,
      requiresInstallation: clientObj.requiresInstallation !== undefined ? clientObj.requiresInstallation : Boolean(selInternet || selTV || clientObj.interest === 'Internet Residencial' || clientObj.interest === 'Combo Multi'),
      installDate: clientObj.installDate || localISO(),
      installPeriod: clientObj.installPeriod || 'Manhã'
    });
  };

  const handleStatusChange = (clientId, newStatus, cName) => {
    const nowTs = Date.now();
    let targetClient = null;
    setClients(prev => prev.map(c => {
        if (c.id === clientId) {
            let updatedClient = { ...c, status: newStatus, statusSince: nowTs, updatedAt: nowTs };
            if (newStatus === 'Venda Fechada') {
                updatedClient.followUpDate = getDaysFromNow(7);
                updatedClient.tipoRetorno = 'pos-venda';
                showToast('Venda Fechada! Retorno de pós-venda agendado para 7 dias.', 'success');
            }
            targetClient = updatedClient;
            return updatedClient;
        }
        return c;
    }));
    if (newStatus === 'Venda Fechada') {
        const found = targetClient || clients.find(c => c.id === clientId) || { id: clientId, name: cName, phone: '' };
        openClosingSummaryForClient(found);
    }
    addToHistory(`Status alterado para ${newStatus}: ${cName}`);
  };

  const isInAttackQueue = (c) => {
    const todayLocal = localISO();
    const isFollowUpDue = Boolean(c.followUpDate && c.followUpDate <= todayLocal);
    const isStaleNegotiation = (c.status === 'Em Negociação' || c.status === 'Negociação') &&
      ((Date.now() - (c.updatedAt || c.statusSince || c.id || 0)) > 48 * 60 * 60 * 1000);
    const isGoldLead = Boolean(c.isGold);
    return isFollowUpDue || isStaleNegotiation || isGoldLead;
  };

  const [draggedClientId, setDraggedClientId] = useState(null);

  const renderClients = () => {
    let filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.phone || '').includes(searchTerm));
    if (showGoldOnly) filteredClients = filteredClients.filter(c => c.isGold);
    if (showAttackQueue) filteredClients = filteredClients.filter(c => isInAttackQueue(c));
    if (statusFilter) filteredClients = filteredClients.filter(c => c.status === statusFilter);
    const sortedClients = [...filteredClients].sort((a, b) => a.name.localeCompare(b.name));

    const handleImportClientsCSV = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const rows = text.split('\n').filter(r => r.trim());
            let importedCount = 0;
            const newClients = [];
            const existingPhones = new Set(clients.map(c => limparTelefone(c.phone)));
            const newPhonesInBatch = new Set();
            
            rows.forEach((row, i) => {
                if (i === 0 && (row.toLowerCase().includes('nome') || row.toLowerCase().includes('name'))) return; 
                const cols = row.split(/[,;]/);
                if (cols.length >= 2) {
                    const name = cols[0].trim();
                    let rawPhone = cols[1].trim().replace(/\(\(/g, '(').replace(/\)\)/g, ')');
                    const phone = formatPhoneMask(rawPhone);
                    const cleanPhone = limparTelefone(phone);
                    if (name && cleanPhone) {
                        if (!existingPhones.has(cleanPhone) && !newPhonesInBatch.has(cleanPhone)) {
                            newPhonesInBatch.add(cleanPhone);
                            const nowTs = Date.now();
                            newClients.push({
                                id: nowTs + i,
                                updatedAt: nowTs,
                                name,
                                phone,
                                status: statuses.includes('Lead Novo') ? 'Lead Novo' : 'Cliente Novo',
                                interest: 'A Definir',
                                fidelityEndDate: '',
                                followUpDate: getDaysFromNow(10),
                                isGold: false,
                                annotations: '',
                                interactionHistory: [],
                                customData: {}
                            });
                            importedCount++;
                        }
                    }
                }
            });
            
            if (newClients.length > 0) {
                setClients(prev => [...prev, ...newClients]);
                showToast(`${importedCount} clientes importados com sucesso!`, 'success');
                addToHistory(`Importação CSV: ${importedCount} novos clientes`);
            } else {
                showToast('Nenhum cliente válido ou novo encontrado no CSV.', 'warning');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleAddClient = (e) => {
      e.preventDefault();
      if (!clientForm.name || !clientForm.phone) return;
      
      const telefoneLimpo = limparTelefone(clientForm.phone);
      const clienteDuplicado = clients.find(c => limparTelefone(c.phone) === telefoneLimpo && c.id !== editingClientId);
      
      if (clienteDuplicado) {
          setAlertaDuplicidade(clienteDuplicado.name);
          setTimeout(() => setAlertaDuplicidade(null), 6000);
          return; 
      }

      const isGoldAuto = (clientForm.interest === 'Combo Multi' || clientForm.interest === 'Troca de Aparelho / iPhone' || clientForm.interest === 'Empresarial');
      const nowTs = Date.now();
      
      if (editingClientId) {
        setClients(prev => prev.map(c => c.id === editingClientId ? { ...c, ...clientForm, isGold: isGoldAuto, updatedAt: nowTs } : c));
        setEditingClientId(null);
        addToHistory(`Cliente atualizado: ${clientForm.name}`);
        showToast('Cliente atualizado!', 'success');
      } else {
        const newClient = {
          id: nowTs,
          updatedAt: nowTs,
          ...clientForm,
          isGold: isGoldAuto,
          status: statuses.includes('Cliente Novo') ? 'Cliente Novo' : statuses[0],
          interactionHistory: [],
          followUpDate: clientForm.followUpDate || getDaysFromNow(10)
        };
        setClients(prev => [...prev, newClient]);
        addToHistory(`Novo cliente cadastrado: ${clientForm.name}`);
        showToast('Novo cliente cadastrado!', 'success');
      }
      setClientForm({ name: '', phone: '', interest: 'Single Móvel', fidelityEndDate: '', followUpDate: '', annotations: '', interactionHistory: [], customData: {} });
      setShowClientModal(false);
    };

    const getStatusColor = (status) => {
      switch(status) {
        case 'Lead Novo': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
        case 'Cliente Novo': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'Aguardando Retorno': return 'bg-orange-100 text-orange-800 border-orange-300';
        case 'Em Negociação': return 'bg-amber-100 text-amber-800 border-amber-300';
        case 'Agendado na Loja': return 'bg-purple-100 text-purple-800 border-purple-300';
        case 'Venda Fechada': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        case 'Sem Interesse': return 'bg-rose-100 text-rose-800 border-rose-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const todayRetornos = clients.filter(c => c.followUpDate === todayStr && !c.retornoConcluidoHoje);

    return (
      <div className="space-y-4 w-full">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <span></span>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
               <button onClick={() => setCrmViewMode('list')} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${crmViewMode === 'list' ? 'bg-white text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>Lista</button>
               <button onClick={() => setCrmViewMode('kanban')} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${crmViewMode === 'kanban' ? 'bg-white text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>Funil</button>
            </div>
            <button onClick={() => setShowAttackQueue(!showAttackQueue)} className={`px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-1.5 shadow-sm ${showAttackQueue ? 'bg-[#DA291C] text-white ring-2 ring-red-300 shadow-red-200' : 'bg-red-50 border border-red-200 text-[#DA291C] hover:bg-red-100'}`}>
               <Zap size={16} /> Fila de Ataque de Hoje
            </button>
            <button onClick={() => setShowGoldOnly(!showGoldOnly)} className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-sm ${showGoldOnly ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-white border border-gray-200 text-gray-700 hover:bg-amber-50'}`}>
              <Star size={16} className={showGoldOnly ? 'fill-white' : 'text-amber-500'} /> {showGoldOnly ? 'Exibindo Ouro' : 'Filtrar Ouro'}
            </button>
            <label className="bg-blue-600 text-white px-3.5 py-2 rounded-xl flex items-center space-x-1.5 hover:bg-blue-700 transition shadow-sm font-bold text-xs sm:text-sm cursor-pointer">
               <FileDown size={16}/><span>Importar Lista</span>
               <input type="file" accept=".csv" onChange={handleImportClientsCSV} className="hidden" />
            </label>
            <button onClick={() => { setEditingClientId(null); setClientForm({ name: '', phone: '', interest: 'Single Móvel', fidelityEndDate: '', followUpDate: getDaysFromNow(10), annotations: '', interactionHistory: [], customData: {} }); setShowClientModal(true); }} className="bg-[#DA291C] text-white px-3.5 py-2 rounded-xl flex items-center space-x-1.5 hover:bg-red-700 transition shadow-sm font-bold text-xs sm:text-sm">
              <Plus size={16} /><span>Novo Cliente</span>
            </button>
          </div>
        </div>

        {/* Agenda Diária */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-4 text-white shadow-lg w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black flex items-center gap-2">
              <CalendarClock size={22} className="text-amber-300" /> Agenda do Dinheiro - Retornos de Hoje ({todayRetornos.length})
            </h3>
            <span className="text-xs bg-red-900/60 px-3 py-1 rounded-full border border-red-400/30">Prioridade Máxima</span>
          </div>
          {todayRetornos.length === 0 ? (
            <p className="text-red-100 text-sm italic">Nenhum retorno pendente agendado para hoje. Excelente dia para prospectar novos leads!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {todayRetornos.map(c => (
                <div 
                  key={`agenda_${c.id}`} 
                  onClick={() => {
                    setClients(prev => prev.map(client => client.id === c.id ? { ...client, retornoConcluidoHoje: true } : client));
                    addToHistory(`Retorno diário concluído: ${c.name}`);
                  }}
                  className="bg-white/10 hover:bg-white/20 transition p-3 rounded-xl border border-white/20 cursor-pointer flex items-center justify-between group relative"
                >
                  <div>
                    <h4 
                       onClick={(e) => { e.stopPropagation(); setObsModal({ isOpen: true, client: c, text: c.annotations || '' }); }} 
                       className="font-bold text-sm flex items-center gap-1.5 hover:text-amber-200 hover:underline transition cursor-pointer"
                       title="Clique para abrir as anotações"
                    >
                      {c.isGold ? <Star size={14} className="fill-amber-300 text-amber-300 shrink-0" /> : null}
                      <span>{c.name}</span>
                      {c.tipoRetorno === 'pos-venda' && (
                          <span className="ml-2 bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-md font-black uppercase shadow-sm border border-red-400">PÓS-VENDA / INDICAÇÃO</span>
                      )}
                    </h4>
                    <div className="text-xs text-red-100 mt-0.5 pointer-events-none">{c.phone ? c.phone.replace(/\(\(/g, '(').replace(/\)\)/g, ')') : ''}</div>
                    <div className="text-[10px] text-red-200/70 mt-1 font-bold pointer-events-none">Clique no card para dar baixa</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); openWhatsApp(c.phone, `Olá ${c.name}, tudo bem? Retornando o contato conforme combinado.`); }} className="bg-[#25D366] text-white p-2 rounded-lg shadow-sm hover:scale-105 transition"><MessageCircle size={16} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CRM View */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
          <div className="p-4 border-b border-gray-100 flex flex-col gap-3 bg-gray-50">
            <div className="flex flex-wrap gap-2">
               <button onClick={() => setStatusFilter('')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition shadow-sm ${statusFilter === '' ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'}`}>Todos os Status</button>
               {statuses.map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition shadow-sm ${statusFilter === s ? 'bg-[#DA291C] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'}`}>{s}</button>
               ))}
            </div>
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Buscar por nome ou telefone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-500 text-sm" />
            </div>
          </div>
          
          {crmViewMode === 'list' ? (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left min-w-[850px]">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-bold w-[25%]">Cliente / Perfil</th>
                    <th className="p-4 font-bold w-[20%]">Telefone</th>
                    <th className="p-4 font-bold w-[20%]">Data Retorno</th>
                    <th className="p-4 font-bold w-[20%]"><div className="flex items-center gap-2">Status <button onClick={() => setShowStatusModal(true)} className="bg-gray-200 hover:bg-gray-300 rounded-md p-1 transition" title="Gerenciar Status"><Plus size={12} /></button></div></th>
                    <th className="p-4 font-bold text-center w-[15%]">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 w-full">
                  {sortedClients.map(client => (
                    <tr key={client.id} className="hover:bg-gray-50/80 transition w-full">
                      <td className="p-4 font-medium">
                        <div className="flex items-center gap-2">
                          {client.isGold ? <Star size={16} className="fill-amber-400 text-amber-500 shrink-0" title="Base Ouro" /> : null}
                          <button onClick={() => setObsModal({ isOpen: true, client: client, text: client.annotations || '' })} className="text-gray-900 font-bold hover:text-[#DA291C] hover:underline flex items-center gap-2 text-left truncate">
                            {client.name}
                          </button>
                        </div>
{coolingBadge(client)}{fidelityChip(client)}
                      </td>
                      <td className="p-4 text-gray-600 text-sm">{client.phone ? client.phone.replace(/\(\(/g, '(').replace(/\)\)/g, ')') : ''}</td>
                      <td className="p-4 text-gray-600 text-sm font-medium">
                          {client.followUpDate ? <span className="flex items-center gap-1.5"><CalendarClock size={14} className="text-orange-500 shrink-0" /> {client.followUpDate.split('-').reverse().join('/')}</span> : '-'}
                      </td>
                      <td className="p-4">
                        <select value={client.status} onChange={(e) => handleStatusChange(client.id, e.target.value, client.name)} className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer outline-none text-center transition border ${getStatusColor(client.status)}`}>
                          {!statuses.includes(client.status) ? <option value={client.status}>{client.status}</option> : null}
                          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => { setIsAdhocClient(false); setSelectedClientId(client.id); setProposalStatus(''); setActiveTab('messages'); }} className="text-purple-600 bg-purple-50 hover:bg-purple-100 p-2 rounded-xl transition shadow-sm" title="Fazer proposta"><MessageSquare size={16} /></button>
                          <button onClick={() => contactClient(client)} className="text-green-600 bg-green-50 hover:bg-green-100 p-2 rounded-xl transition shadow-sm" title="WhatsApp"><MessageCircle size={16} /></button>
                          <button onClick={() => { setClientForm({...client}); setEditingClientId(client.id); setShowClientModal(true); }} className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-2 rounded-xl transition shadow-sm" title="Editar"><Edit2 size={16} /></button>
                          <button onClick={(e) => { 
                            e.stopPropagation();
                            if(window.confirm('Excluir cliente?')) { 
                              setClients(prev => prev.filter(c => c.id !== client.id)); 
                              if(parseInt(selectedClientId) === client.id) setSelectedClientId('');
                              showToast('Cliente excluído.', 'info'); 
                              addToHistory(`Cliente excluído: ${client.name}`); 
                            } 
                          }} className="text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-xl transition shadow-sm" title="Excluir"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto w-full p-4 h-[calc(100vh-320px)] min-h-[500px]">
               {statuses.map(s => {
                  const columnClients = sortedClients.filter(c => c.status === s);
                  if (statusFilter && statusFilter !== s) return null;
                  return (
                     <div 
                        key={s} 
                        className="w-[300px] flex-shrink-0 bg-gray-50 rounded-2xl flex flex-col border border-gray-200 shadow-sm overflow-hidden"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const clientId = e.dataTransfer.getData('text/plain');
                          if (clientId) {
                             const parsedId = parseInt(clientId);
                             const cl = clients.find(c => c.id === parsedId);
                             if (cl && cl.status !== s) {
                                handleStatusChange(parsedId, s, cl.name);
                             }
                          }
                          setDraggedClientId(null);
                        }}
                     >
                        <div className={`p-4 border-b border-gray-100 flex justify-between items-center ${getStatusColor(s)} bg-opacity-20`}>
                           <h3 className="font-bold text-sm tracking-wide">{s}</h3>
                           <span className="bg-white text-gray-800 px-2.5 py-0.5 rounded-md text-xs font-black shadow-sm">{columnClients.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                           {columnClients.map(client => (
                              <div 
                                 key={client.id} 
                                 draggable
                                 onDragStart={(e) => {
                                    setDraggedClientId(client.id);
                                    e.dataTransfer.setData('text/plain', client.id);
                                 }}
                                 onDragEnd={() => setDraggedClientId(null)}
                                 className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition flex flex-col gap-2.5 group relative cursor-grab active:cursor-grabbing ${draggedClientId === client.id ? 'opacity-50' : ''} ${coolingClass(client)}`}
                              >
                                 <div className="flex justify-between items-start gap-2">
                                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                       {client.isGold && <Star size={14} className="fill-amber-400 text-amber-500 shrink-0" />}
                                       <span 
                                          onClick={() => setObsModal({ isOpen: true, client: client, text: client.annotations || '' })}
                                          className="font-bold text-sm text-gray-800 truncate cursor-pointer hover:text-[#DA291C] hover:underline"
                                          title={client.name}
                                       >
                                          {client.name}
                                       </span>
                                    </div>
                                    <button onClick={(e) => { 
                                      e.stopPropagation();
                                      if(window.confirm('Excluir cliente?')) { 
                                        setClients(prev => prev.filter(c => c.id !== client.id)); 
                                        if(parseInt(selectedClientId) === client.id) setSelectedClientId('');
                                        showToast('Cliente excluído.', 'info'); 
                                        addToHistory(`Cliente excluído: ${client.name}`); 
                                      } 
                                    }} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"><Trash2 size={14}/></button>
                                 </div>
                                 <div className="text-xs text-gray-500 font-medium">{client.phone ? client.phone.replace(/\(\(/g, '(').replace(/\)\)/g, ')') : ''}</div>
{coolingBadge(client)}{fidelityChip(client)}
                                 {client.followUpDate && (
                                    <div className="text-[10px] text-gray-400 flex items-center gap-1 font-bold">
                                       <CalendarClock size={12} className="text-orange-400 shrink-0"/>
                                       Ret. {client.followUpDate.split('-').reverse().join('/')}
                                    </div>
                                 )}
                                 <div className="mt-1 pt-3 border-t border-gray-50 flex items-center justify-between">
                                    <select 
                                       value={client.status} 
                                       onChange={(e) => handleStatusChange(client.id, e.target.value, client.name)} 
                                       className={`text-[10px] font-bold rounded-lg px-2 py-1 outline-none cursor-pointer w-[110px] truncate shadow-sm border ${getStatusColor(client.status)} bg-opacity-30`}
                                    >
                                       {!statuses.includes(client.status) ? <option value={client.status}>{client.status}</option> : null}
                                       {statuses.map(st => <option key={st} value={st}>{st}</option>)}
                                    </select>
                                    
                                    <div className="flex gap-1">
                                       <button onClick={() => { setIsAdhocClient(false); setSelectedClientId(client.id); setProposalStatus(''); setActiveTab('messages'); }} className="text-purple-600 hover:bg-purple-50 p-1.5 rounded-lg transition" title="Fazer proposta"><MessageSquare size={14} /></button>
                                       <button onClick={() => contactClient(client)} className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition" title="WhatsApp"><MessageCircle size={14} /></button>
                                       <button onClick={() => { setClientForm({...client}); setEditingClientId(client.id); setShowClientModal(true); }} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition" title="Editar"><Edit2 size={14} /></button>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  );
               })}
            </div>
          )}
        </div>

        {/* Modal Formulário Cliente */}
        {showClientModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 bg-[#DA291C] text-white shrink-0">
                <h3 className="text-lg font-black">{editingClientId ? 'Editar Cliente' : 'Novo Cadastro de Cliente'}</h3>
                <button onClick={() => setShowClientModal(false)} className="text-white hover:bg-red-700 p-1.5 rounded-lg transition"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddClient} className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[80vh]">
                <div><label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nome Completo *</label><input type="text" required value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:border-red-500" placeholder="Ex: Carlos Alberto" /></div>
                <div><label className="block text-xs font-bold text-gray-600 uppercase mb-1">WhatsApp / Telefone *</label><input type="text" required value={clientForm.phone} onChange={e => setClientForm({...clientForm, phone: formatPhoneMask(e.target.value)})} className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:border-red-500" placeholder="(61) 99999-9999" /></div>
                <div><label className="block text-xs font-bold text-gray-600 uppercase mb-1">Tipo de Interesse</label><select value={clientForm.interest} onChange={e => setClientForm({...clientForm, interest: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none bg-white focus:border-red-500 font-medium"><option value="Single Móvel">Single Móvel</option><option value="Internet Residencial">Internet Residencial</option><option value="Combo Multi">Combo Multi (Gera Base Ouro)</option><option value="Troca de Aparelho / iPhone">Troca de Aparelho (Base Ouro)</option><option value="Empresarial">Empresarial (Base Ouro)</option></select></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-gray-600 uppercase mb-1">Data de Retorno (Agenda)</label><input type="date" value={clientForm.followUpDate} onChange={e => setClientForm({...clientForm, followUpDate: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:border-red-500" /></div>
                  <div><label className="block text-xs font-bold text-gray-600 uppercase mb-1">Fim da Fidelidade</label><input type="date" value={clientForm.fidelityEndDate || ''} onChange={e => setClientForm({...clientForm, fidelityEndDate: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:border-red-500" /></div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                     <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Observações Iniciais</label>
                     <textarea value={clientForm.annotations} onChange={e => setClientForm({...clientForm, annotations: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:border-red-500 min-h-[90px]" placeholder="Anote detalhes da negociação na criação..." />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 shrink-0">
                  <button type="button" onClick={() => setShowClientModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition">Cancelar</button>
                  <button type="submit" className="bg-[#DA291C] hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition">Salvar Cliente</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Notas */}
        {obsModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 bg-blue-600 text-white shrink-0">
                <h3 className="text-lg font-bold">Anotações do Cliente</h3>
                <button onClick={() => setObsModal({ isOpen: false, client: null, text: '' })} className="text-white hover:bg-blue-700 p-1 rounded-lg"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto flex-1 max-h-[80vh]">
                <label className="block text-xs font-bold text-gray-600 uppercase">Histórico / Observações</label>
                <textarea value={obsModal.text} onChange={(e) => setObsModal({ ...obsModal, text: e.target.value })} className="w-full p-3 border border-gray-300 rounded-xl min-h-[140px] text-sm outline-none focus:border-blue-500" placeholder="Digite detalhes da negociação..." />
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                <button onClick={() => setObsModal({ isOpen: false, client: null, text: '' })} className="px-5 py-2 rounded-xl text-sm font-bold text-gray-600">Cancelar</button>
                <button onClick={() => { if(obsModal.client) { setClients(clients.map(c => c.id === obsModal.client.id ? { ...c, annotations: obsModal.text } : c)); } setObsModal({ isOpen: false, client: null, text: '' }); showToast('Anotações salvas!', 'success'); }} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-blue-700">Salvar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMessages = () => {
    const sortedClients = [...clients].sort((a, b) => a.name.localeCompare(b.name));
    const filteredLeads = sortedClients.filter(c => 
        c.name.toLowerCase().includes(leadSearchTerm.toLowerCase()) || 
        (c.phone || '').includes(leadSearchTerm)
    );

    const fmtDate = (d) => d ? d.split('-').reverse().join('/') : '';
    const cleanDiscountPct = (discountPercentage || '').trim().replace(/^at[ée]\s+/i, '');
    const fmtPctValue = cleanDiscountPct ? (cleanDiscountPct.includes('%') ? cleanDiscountPct : `${cleanDiscountPct}%`) : '[%]';
    const buildClosingText = () => {
      const L = ['*Resumo de Fechamento*', `Olá, ${clientName}! Confirmando os dados do seu pedido:`, ''];
      if (benefitsStr) L.push(`*Pacote:* ${benefitsStr}`);
      if (basePrice > 0) L.push(`*Valor mensal:* R$ ${basePrice.toFixed(2).replace('.', ',')}`);
      if (includeDevice || onlyDeviceOffer) L.push(`*Aparelho:* ${deviceOfferMode === 'specific' ? `${marcaAparelho || '[Modelo]'} por R$ ${devicePrice || '--'}` : `até ${fmtPctValue} de desconto na compra de um novo smartphone`}${isTradeIn ? ' (com troca do aparelho usado)' : ''}`);
      if (closingForm.due) L.push(`*Vencimento da fatura:* ${fmtDate(closingForm.due)}`);
      if (closingForm.installDate) L.push(`*Instalação técnica:* ${fmtDate(closingForm.installDate)} (${closingForm.period})`);
      L.push('', 'Qualquer dúvida é só me chamar por aqui. Obrigado por escolher a Claro!');
      return stripEmojis(L.join('\n'));
    };
    const closingText = showClosingModal ? buildClosingText() : '';
    const filteredObjs = objections.filter(o => `${o.category} ${o.keyword || ''} ${o.script}`.toLowerCase().includes(objSearch.toLowerCase()));

    const executeSendAction = (overrideStatus) => {
      const selectedTemplateObj = messageTemplates.find(t => t.id === Number(selectedTemplate));
      const templateName = selectedTemplateObj ? selectedTemplateObj.title : 'Mensagem Avulsa';
      const targetStatus = (overrideStatus !== undefined ? overrideStatus : proposalStatus) || '';

      if (!targetStatus || targetStatus === 'Escolha' || targetStatus === 'Escolher') {
        setShowStatusRequiredModal(true);
        showToast('Campo Status em branco! Selecione uma opção para continuar.', 'warning');
        return;
      }

      if (isAdhocClient && addAdhocToBase && adhocName) {
        const telefoneLimpo = limparTelefone(adhocPhone);
        const duplicate = clients.find(c => limparTelefone(c.phone) === telefoneLimpo);
        if (duplicate) {
             setAlertaDuplicidade(duplicate.name);
             setTimeout(() => setAlertaDuplicidade(null), 6000);
             return;
        }

        const nowTs = Date.now();
        const newClient = {
          id: nowTs,
          updatedAt: nowTs,
          name: adhocName,
          phone: adhocPhone,
          status: targetStatus,
          isGold: false,
          interest: 'Proposta Diretiva',
          fidelityEndDate: '',
          followUpDate: targetStatus === 'Venda Fechada' ? getDaysFromNow(7) : adhocFollowUpDate,
          tipoRetorno: targetStatus === 'Venda Fechada' ? 'pos-venda' : undefined,
          annotations: adhocNotes,
          interactionHistory: [{ date: new Date().toLocaleDateString('pt-BR'), template: templateName }],
          customData: adhocCustomData
        };
        setClients(prev => [...prev, newClient]);
        addToHistory(`Proposta enviada e lead salvo (Status: ${targetStatus}): ${adhocName}`);
        setAddAdhocToBase(false);
        showToast(`Cliente salvo na base!`, "success");
        if (targetStatus === 'Venda Fechada') openClosingSummaryForClient(newClient);
      } else if (!isAdhocClient && selectedClientId) {
         const nowTs = Date.now();
         let updatedTarget = null;
         setClients(prevClients => prevClients.map(c => {
            if (c.id === parseInt(selectedClientId)) {
               const newHistory = [...(c.interactionHistory || []), { date: new Date().toLocaleDateString('pt-BR'), template: templateName }];
               const updated = {
                 ...c,
                 interactionHistory: newHistory,
                 status: targetStatus,
                 statusSince: c.status === targetStatus ? c.statusSince : nowTs,
                 updatedAt: nowTs,
                 followUpDate: targetStatus === 'Venda Fechada' ? getDaysFromNow(7) : c.followUpDate,
                 tipoRetorno: targetStatus === 'Venda Fechada' ? 'pos-venda' : c.tipoRetorno
               };
               updatedTarget = updated;
               return updated;
            }
            return c;
         }));
         addToHistory(`Proposta enviada (Status atualizado: ${targetStatus}): ${clientData.name}`);
         if (targetStatus === 'Venda Fechada' && updatedTarget) openClosingSummaryForClient(updatedTarget);
      }
      openWhatsApp(clientData.phone || adhocPhone, generatedMessage);
    };

    const handleSendAction = () => executeSendAction();

    return (
      <div className="space-y-4 w-full">
        
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
          {/* PAINEL ESQUERDO */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Selecionar Lead</label>
              
              <div className="relative w-full mb-3">
                <button
                  type="button"
                  onClick={() => setIsLeadDropdownOpen(!isLeadDropdownOpen)}
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none bg-gray-50 text-sm font-medium flex justify-between items-center text-left focus:border-red-400 focus:ring-1 focus:ring-red-100 transition"
                >
                  <span className="truncate pr-4 text-gray-700">
                    {isAdhocClient ? '+ Cliente novo (Avulso)' :
                      (selectedClientId ?
                        (() => {
                           const c = clients.find(c => c.id === parseInt(selectedClientId));
                           return c ? `${c.name} (${(c.phone||'').replace(/\(\(/g, '(').replace(/\)\)/g, ')')})` : 'Selecione um lead da base...';
                        })()
                        : 'Selecione um lead da base...'
                      )
                    }
                  </span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform shrink-0 ${isLeadDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>

                {isLeadDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[300px]">
                    <div className="p-2 border-b border-gray-100 bg-gray-50 shrink-0">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                        <input
                          type="text" autoFocus placeholder="Pesquisar nome ou número..."
                          value={leadSearchTerm} onChange={(e) => setLeadSearchTerm(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg outline-none bg-white text-sm font-medium focus:border-red-400 focus:ring-1 focus:ring-red-100 transition"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto w-full flex-1">
                      <button
                        type="button"
                        onClick={() => { setIsAdhocClient(true); setSelectedClientId(''); setIsLeadDropdownOpen(false); setLeadSearchTerm(''); setAdhocFollowUpDate(getDaysFromNow(7)); setProposalStatus(''); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 border-b border-gray-50 transition"
                      >
                        + Cliente novo (Avulso)
                      </button>
                      {filteredLeads.map(c => (
                        <button
                          type="button" key={c.id}
                          onClick={() => { setIsAdhocClient(false); setSelectedClientId(c.id); setIsLeadDropdownOpen(false); setLeadSearchTerm(''); setProposalStatus(''); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 border-b border-gray-50 last:border-none transition font-medium"
                        >
                          {c.name} <span className="text-gray-400 text-xs ml-1">({(c.phone||'').replace(/\(\(/g, '(').replace(/\)\)/g, ')')})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isAdhocClient ? (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className="block text-xs font-bold text-gray-700 mb-1">Nome *</label><input type="text" value={adhocName} onChange={e => setAdhocName(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none" placeholder="Nome" /></div>
                    <div><label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp</label><input type="text" value={adhocPhone} onChange={e => setAdhocPhone(formatPhoneMask(e.target.value))} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none" placeholder="(61) 9..." /></div>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer pt-1">
                    <input type="checkbox" checked={addAdhocToBase} onChange={e => setAddAdhocToBase(e.target.checked)} className="rounded text-blue-600 w-4 h-4 cursor-pointer" />
                    <span className="text-xs font-bold text-blue-900">Salvar este cliente na base local automaticamente</span>
                  </label>
                </div>
              ) : null}

              {(isAdhocClient || selectedClientId) ? (
                <div className="mt-3 flex flex-col sm:flex-row gap-3">
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex-1">
                     <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Data de Retorno (Sino)</label>
                     <input
                       type="date"
                       value={isAdhocClient ? adhocFollowUpDate : (clientData.followUpDate || '')}
                       onChange={(e) => {
                         if (isAdhocClient) setAdhocFollowUpDate(e.target.value);
                         else setClients(clients.map(c => c.id === parseInt(selectedClientId) ? { ...c, followUpDate: e.target.value } : c));
                       }}
                       className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition font-bold text-gray-700 cursor-pointer shadow-sm"
                     />
                  </div>
                  
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex-1">
                     <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                       Status do Cliente <span className="text-red-500">*</span>
                     </label>
                     <select 
                       value={proposalStatus} 
                       onChange={e => setProposalStatus(e.target.value)} 
                       className={`w-full p-2.5 border rounded-lg text-sm bg-white outline-none focus:border-red-400 font-bold cursor-pointer shadow-sm ${!proposalStatus || proposalStatus === 'Escolha' || proposalStatus === 'Escolher' ? 'border-amber-400 text-amber-700 bg-amber-50/30' : 'border-gray-300 text-gray-700'}`}
                     >
                       <option value="">Escolha</option>
                       {proposalStatus && proposalStatus !== 'Escolha' && proposalStatus !== 'Escolher' && !statuses.includes(proposalStatus) ? <option value={proposalStatus}>{proposalStatus}</option> : null}
                       {statuses.map(st => <option key={st} value={st}>{st}</option>)}
                     </select>
                  </div>
                  <button 
                      onClick={() => setShowQuickModal(true)} 
                      className="bg-blue-50 text-blue-700 px-5 py-2.5 sm:py-0 rounded-xl border border-blue-200 hover:bg-blue-100 transition flex sm:flex-col items-center justify-center gap-1.5 font-bold text-[10px] uppercase shadow-sm"
                      title="Notas Rápida"
                  >
                      <ClipboardEdit size={18} />
                      <span>Notas & Status</span>
                  </button>
                </div>
              ) : null}
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                   <label className="block text-sm font-bold text-gray-800">Montar Pacote / Oferta</label>
                   <button onClick={() => setShowExtraPlanModal(true)} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-xs font-bold border border-purple-200 hover:bg-purple-100 transition flex items-center gap-1">
                      <Plus size={12}/> Adicionar Plano Avulso/Extra
                   </button>
                </div>

                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    
                    <div className="mb-2 bg-purple-50 p-3 rounded-xl border border-purple-200 shadow-sm">
                       <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={onlyDeviceOffer} onChange={e => {setOnlyDeviceOffer(e.target.checked); if(e.target.checked){setIncludeDevice(false); setSelInternet(''); setSelTV(''); setSelMovel(''); setMovelDependentes(0); setSelAlacarte([]);}}} className="rounded text-purple-600 w-5 h-5 cursor-pointer" />
                          <span className="font-bold text-purple-900 text-sm">Apenas Oferta de Aparelho (Desativar Planos)</span>
                       </label>
                       <label className="flex items-center space-x-2 cursor-pointer mt-3">
                          <input type="checkbox" checked={includeDevice} onChange={e => { setIncludeDevice(e.target.checked); if (e.target.checked) setOnlyDeviceOffer(false); }} className="rounded text-purple-600 w-5 h-5 cursor-pointer" />
                          <span className="font-bold text-purple-900 text-sm">Incluir aparelho junto com o plano (proposta única)</span>
                       </label>
                       
                       {(onlyDeviceOffer || includeDevice) ? (
                          <div className="mt-4 bg-white p-4 sm:p-5 rounded-xl border border-purple-100 shadow-sm">
                             <div className="flex flex-wrap gap-4 sm:gap-6 mb-4 border-b border-gray-100 pb-4">
                                 <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="offerMode" checked={deviceOfferMode === 'generic'} onChange={() => setDeviceOfferMode('generic')} className="text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer" />
                                    <span className="text-sm font-bold text-gray-700">Desconto Genérico (%)</span>
                                 </label>
                                 <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="offerMode" checked={deviceOfferMode === 'specific'} onChange={() => setDeviceOfferMode('specific')} className="text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer" />
                                    <span className="text-sm font-bold text-gray-700">Modelo e Preço Específico</span>
                                 </label>
                             </div>
                             
                             {deviceOfferMode === 'generic' ? (
                                 <div>
                                    <label className="block text-xs font-bold text-purple-800 mb-1">Porcentagem de Desconto (%)</label>
                                    <input type="text" placeholder="Ex: 40%, 60%" value={discountPercentage} onChange={e => setDiscountPercentage(e.target.value)} className="w-full p-3 border border-purple-200 rounded-lg text-sm bg-white outline-none focus:border-purple-400 transition" />
                                 </div>
                             ) : (
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-purple-800 mb-1">Modelo do Aparelho</label>
                                        <input type="text" placeholder="Ex: iPhone 15 Pro" value={marcaAparelho} onChange={e => setMarcaAparelho(e.target.value)} className="w-full p-3 border border-purple-200 rounded-lg text-sm bg-white outline-none focus:border-purple-400 transition" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-purple-800 mb-1">Preço Final/Repasse (R$)</label>
                                        <input type="text" placeholder="Ex: 4.500,00" value={devicePrice} onChange={e => setDevicePrice(e.target.value)} className="w-full p-3 border border-purple-200 rounded-lg text-sm bg-white outline-none focus:border-purple-400 transition" />
                                    </div>
                                 </div>
                             )}
                             
                             <label className={`flex items-center justify-center p-3 mt-5 rounded-lg cursor-pointer transition font-bold text-sm border ${isTradeIn ? 'bg-orange-100 border-orange-400 text-orange-800 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                                <input type="checkbox" checked={isTradeIn} onChange={e => setIsTradeIn(e.target.checked)} className="hidden" />
                                Ativar Argumento de Troca (Aparelho Usado)
                             </label>
                          </div>
                       ) : null}
                    </div>

                    {!onlyDeviceOffer ? (
                        <React.Fragment>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-gray-600 uppercase">Internet Residencial</label>
                                    <label className="flex items-center space-x-1.5 cursor-pointer bg-gray-200 px-2.5 py-1 rounded-md hover:bg-gray-300 transition">
                                        <input type="checkbox" checked={isFiber} onChange={e => setIsFiber(e.target.checked)} className="rounded text-blue-600 w-3 h-3 cursor-pointer outline-none" />
                                        <span className="text-[10px] font-bold text-gray-700 uppercase">Fibra Ótica</span>
                                    </label>
                                </div>
                                <select value={selInternet} onChange={e=>setSelInternet(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none">
                                    <option value="">-- Sem Internet --</option>
                                    {internetOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">TV / Streaming</label>
                                <select value={selTV} onChange={e=>{setSelTV(e.target.value); setTvPoints(0); setSelAlacarte([]);}} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none">
                                    <option value="">-- Sem TV --</option>
                                    {tvOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                                </select>
                                </div>
                                <div className="w-32">
                                    <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase whitespace-nowrap overflow-hidden text-ellipsis">Pontos Adicionais</label>
                                    <input type="number" min="0" disabled={!selTV} value={tvPoints} onChange={e => setTvPoints(Math.max(0, parseInt(e.target.value) || 0))} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none disabled:bg-gray-100 disabled:text-gray-400" />
                                    {selTV ? <div className="text-[10px] text-gray-400 mt-1 font-bold">R$ {Number((tvOptions.find(t => t.id === selTV) || {}).extraPointPrice ?? 69.9).toFixed(2).replace('.', ',')} cada</div> : null}
                                </div>
                            </div>
                            {selTV ? (
                                <div className="p-3 bg-red-50/60 rounded-xl border border-red-200 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-red-900 uppercase">Serviços À La Carte (Adicionais TV Box)</span>
                                        {selAlacarte.length > 0 && (
                                            <button type="button" onClick={() => setSelAlacarte([])} className="text-[10px] font-bold text-red-600 hover:underline">Limpar</button>
                                        )}
                                    </div>
                                    {alacarteOptions.length === 0 ? (
                                        <p className="text-xs text-gray-500">Nenhum serviço à la carte cadastrado em Serviços e Preços.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {alacarteOptions.map(ala => {
                                                const isSelected = selAlacarte.includes(ala.id);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={ala.id}
                                                        onClick={() => setSelAlacarte(prev => isSelected ? prev.filter(id => id !== ala.id) : [...prev, ala.id])}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${isSelected ? 'bg-[#DA291C] text-white border-[#DA291C] shadow-sm' : 'bg-white text-gray-700 border-gray-300 hover:border-red-300 hover:bg-red-50'}`}
                                                    >
                                                        <span>{isSelected ? '✓ ' : '+ '}{ala.label}</span>
                                                        <span className={`text-[10px] ${isSelected ? 'text-red-100' : 'text-gray-400'}`}>R$ {Number(ala.price || 0).toFixed(2).replace('.', ',')}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : null}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Plano Móvel</label>
                                    <select value={selMovel} onChange={e=>setSelMovel(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none">
                                        <option value="">-- Sem Móvel --</option>
                                        {movelOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                                    </select>
                                </div>
                                <div className="w-32">
                                    <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase whitespace-nowrap overflow-hidden text-ellipsis" title={`Dependentes (R$ ${dependentePrice.toFixed(2).replace('.', ',')} cada)`}>
                                        Qtd. Dependentes
                                    </label>
                                    <input 
                                        type="number" 
                                        min="0" 
                                        value={movelDependentes} 
                                        onChange={e => setMovelDependentes(parseInt(e.target.value) || 0)} 
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none" 
                                    />
                                </div>
                            </div>
                            {extraPlans.length > 0 && (
                                <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                                   <div className="text-xs font-bold text-purple-900 mb-2">Planos Adicionais Inclusos:</div>
                                   <div className="space-y-1">
                                      {extraPlans.map((ep, idx) => (
                                         <div key={idx} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border border-purple-100">
                                            <span>{ep.label} (R$ {ep.price.toFixed(2).replace('.', ',')})</span>
                                            <button onClick={() => setExtraPlans(extraPlans.filter((_, i) => i !== idx))} className="text-red-500 font-bold hover:underline">Remover</button>
                                         </div>
                                      ))}
                                   </div>
                                </div>
                            )}
                        </React.Fragment>
                    ) : null}
                </div>
            </div>

            {!onlyDeviceOffer ? (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Valor Final da Proposta {showOption2 ? '(Opção 1)' : ''}</span>
                  <span className="font-black text-3xl text-emerald-600">R$ {basePrice.toFixed(2).replace('.', ',')}</span>
                  {includeDevice ? <span className="text-xs font-bold text-purple-700 mt-2">{deviceOfferMode === 'specific' ? `+ Aparelho: ${marcaAparelho || '[Modelo]'} — R$ ${devicePrice || '--'}` : `*Desconto pelo plano:* até ${fmtPctValue} de desconto na compra de um novo smartphone.`}</span> : null}
                </div>
            ) : null}

            {!onlyDeviceOffer ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowOption2(!showOption2)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 border shadow-sm ${showOption2 ? 'bg-[#DA291C] text-white border-[#DA291C]' : 'bg-white text-gray-700 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-[#DA291C]'}`}
                  >
                    <Layers size={15} />
                    {showOption2 ? 'Remover Opção 2 de Comparação' : '+ Adicionar Opção 2 para Comparação'}
                  </button>

                  {showOption2 ? (
                    <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                        <span className="text-xs font-black text-amber-900 uppercase tracking-wide">Montagem da Opção 2 (Comparação / Ancoragem)</span>
                        <span className="text-[11px] font-bold text-amber-700">Custo diário: R$ {(finalPrice2 / 30).toFixed(2).replace('.', ',')}/dia</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-bold text-gray-600 uppercase">Internet</label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input type="checkbox" checked={isFiber2} onChange={e => setIsFiber2(e.target.checked)} className="w-3 h-3" />
                              <span className="text-[9px] font-bold text-gray-600">Fibra</span>
                            </label>
                          </div>
                          <select value={selInternet2} onChange={e => setSelInternet2(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white outline-none">
                            <option value="">-- Sem Internet --</option>
                            {internetOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">TV / Streaming</label>
                          <select value={selTV2} onChange={e => { setSelTV2(e.target.value); setTvPoints2(0); setSelAlacarte2([]); }} className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white outline-none">
                            <option value="">-- Sem TV --</option>
                            {tvOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Plano Móvel</label>
                          <select value={selMovel2} onChange={e => setSelMovel2(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white outline-none">
                            <option value="">-- Sem Móvel --</option>
                            {movelOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                            Pontos Adicionais TV {selTV2 ? `(R$ ${Number((tvOptions.find(t => t.id === selTV2) || {}).extraPointPrice ?? 69.9).toFixed(2).replace('.', ',')} cada)` : ''}
                          </label>
                          <input
                            type="number"
                            min="0"
                            disabled={!selTV2}
                            value={tvPoints2}
                            onChange={e => setTvPoints2(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white outline-none disabled:bg-gray-100 disabled:text-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1" title={`Dependentes (R$ ${dependentePrice.toFixed(2).replace('.', ',')} cada)`}>
                            Qtd. Dependentes Móvel (R$ {dependentePrice.toFixed(2).replace('.', ',')} cada)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={movelDependentes2}
                            onChange={e => setMovelDependentes2(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white outline-none"
                          />
                        </div>
                      </div>

                      {selTV2 ? (
                        <div className="p-2.5 bg-white/80 rounded-xl border border-amber-300 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-900 uppercase">Serviços À La Carte — Opção 2</span>
                            {selAlacarte2.length > 0 && (
                              <button type="button" onClick={() => setSelAlacarte2([])} className="text-[10px] font-bold text-red-600 hover:underline">Limpar</button>
                            )}
                          </div>
                          {alacarteOptions.length === 0 ? (
                            <p className="text-[11px] text-gray-500">Nenhum serviço à la carte cadastrado.</p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {alacarteOptions.map(ala => {
                                const isSelected2 = selAlacarte2.includes(ala.id);
                                return (
                                  <button
                                    type="button"
                                    key={ala.id}
                                    onClick={() => setSelAlacarte2(prev => isSelected2 ? prev.filter(id => id !== ala.id) : [...prev, ala.id])}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 ${isSelected2 ? 'bg-[#DA291C] text-white border-[#DA291C] shadow-sm' : 'bg-white text-gray-700 border-gray-300 hover:border-red-300 hover:bg-red-50'}`}
                                  >
                                    <span>{isSelected2 ? '✓ ' : '+ '}{ala.label}</span>
                                    <span className={`text-[9px] ${isSelected2 ? 'text-red-100' : 'text-gray-400'}`}>R$ {Number(ala.price || 0).toFixed(2).replace('.', ',')}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : null}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Benefícios Extras / Descrição Opção 2</label>
                          <input
                            type="text"
                            value={customBenefits2}
                            onChange={e => setCustomBenefits2(e.target.value)}
                            placeholder="Ex: Plano Single mais econômico"
                            className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Valor Final da Opção 2 (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={customPrice2 !== '' ? customPrice2 : (calcPrice2 > 0 ? calcPrice2.toFixed(2) : '')}
                            onChange={e => setCustomPrice2(e.target.value)}
                            placeholder={calcPrice2 > 0 ? calcPrice2.toFixed(2) : '0,00'}
                            className="w-full p-2 border border-amber-300 rounded-lg text-xs font-bold bg-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-amber-200">
                        <span className="text-[11px] font-bold text-gray-600 truncate pr-2">Resumo Opção 2: <strong className="text-gray-800">{benefitsStr2 || 'Selecione os produtos acima'}</strong></span>
                        <span className="font-black text-base text-amber-700 shrink-0">R$ {finalPrice2.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
            ) : null}
          </div>

          {/* PAINEL DIREITO: Template */}
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col h-full">
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Template de Mensagem</label>
              <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)} className="w-full p-3 border border-red-300 rounded-xl text-sm bg-white font-bold outline-none text-red-700 shadow-sm cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-200">
                   <option value="">Selecione um script / template...</option>
                   {messageTemplates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>

            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2 flex items-center"><MessageSquare size={16} className="mr-2" /> Revisão do Texto (Editável)</h3>
            <textarea 
               value={generatedMessage} 
               onChange={(e) => setGeneratedMessage(e.target.value)}
               className="w-full p-5 rounded-xl shadow-sm text-gray-800 leading-relaxed border border-gray-300 border-l-4 border-l-red-500 text-sm flex-1 min-h-[240px] resize-none outline-none focus:border-red-500 bg-white"
               placeholder="A mensagem será montada aqui automaticamente..."
            />

            <div className="mt-auto pt-4 flex flex-wrap gap-3">
              <button onClick={() => { navigator.clipboard.writeText(stripEmojis(generatedMessage)); showToast('Copiado!', 'success'); }} disabled={!generatedMessage} className="flex-1 bg-white border border-gray-300 text-gray-700 py-3.5 rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
                <Copy size={18}/> Copiar
              </button>
              <button onClick={handleSendAction} disabled={!generatedMessage} className={`flex-1 py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md ${generatedMessage ? 'bg-[#25D366] text-white hover:bg-green-600' : 'bg-gray-300 text-gray-500'}`}>
                <Send size={18}/> Enviar WhatsApp
              </button>
              <div className="w-full flex gap-3">
                <button onClick={() => setShowClosingModal(true)} className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-[#DA291C] transition flex items-center justify-center gap-2 shadow-sm"><FileText size={16}/> Resumo de Fechamento</button>
                <button onClick={handleResetProposal} className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition flex items-center justify-center gap-2 shadow-sm"><RotateCcw size={16}/> Limpar / Recomeçar</button>
              </div>
            </div>
          </div>
        </div>

        {showClosingModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-5 bg-gray-900 text-white shrink-0"><h3 className="text-lg font-bold">Resumo de Fechamento</h3><button onClick={() => setShowClosingModal(false)} className="hover:bg-gray-700 p-1.5 rounded-lg"><X size={20}/></button></div>
              <div className="p-5 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-bold text-gray-600 uppercase mb-1">Vencimento da fatura</label><input type="date" value={closingForm.due} onChange={e => setClosingForm({ ...closingForm, due: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-xl text-sm outline-none" /></div>
                  <div><label className="block text-xs font-bold text-gray-600 uppercase mb-1">Data da instalação</label><input type="date" value={closingForm.installDate} onChange={e => setClosingForm({ ...closingForm, installDate: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-xl text-sm outline-none" /></div>
                </div>
                <div className="flex gap-2">
                  {['Manhã', 'Tarde'].map(p => <button key={p} onClick={() => setClosingForm({ ...closingForm, period: p })} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition ${closingForm.period === p ? 'bg-[#DA291C] text-white border-[#DA291C]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>{p}</button>)}
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl p-4 font-sans leading-relaxed">{closingText}</pre>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
                <button onClick={() => { navigator.clipboard.writeText(closingText); showToast('Resumo copiado!', 'success'); }} className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"><Copy size={16}/> Copiar</button>
                <button onClick={() => {
                  if (!isAdhocClient && selectedClientId) setClients(prev => prev.map(c => c.id === parseInt(selectedClientId) ? { ...c, interactionHistory: [...(c.interactionHistory || []), { date: new Date().toLocaleDateString('pt-BR'), template: 'Resumo de Fechamento' }] } : c));
                  addToHistory(`Resumo de fechamento enviado: ${clientName}`);
                  openWhatsApp(clientData.phone || adhocPhone, closingText);
                }} className="flex-1 bg-[#25D366] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"><Send size={16}/> Enviar WhatsApp</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Notas */}
        {showQuickModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
                  <div className="flex justify-between items-center p-5 bg-blue-600 text-white">
                     <h3 className="text-lg font-bold flex items-center gap-2"><ClipboardEdit size={18}/> Anotações do Cliente</h3>
                     <button onClick={() => setShowQuickModal(false)} className="text-white hover:bg-blue-700 p-1.5 rounded-lg transition"><X size={20}/></button>
                  </div>
                  <div className="p-6 space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Anotações do Atendimento</label>
                        <textarea 
                            value={isAdhocClient ? adhocNotes : (clientData.annotations || '')} 
                            onChange={(e) => {
                                if (isAdhocClient) setAdhocNotes(e.target.value);
                                else setClients(clients.map(c => c.id === clientData.id ? { ...c, annotations: e.target.value } : c));
                            }}
                            className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 min-h-[140px] resize-none" 
                            placeholder="Anote detalhes da negociação, restrições..."
                        />
                     </div>
                  </div>
                  <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                     <button onClick={() => setShowQuickModal(false)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition">Concluir</button>
                  </div>
               </div>
            </div>
        )}

        {/* Modal: Adicionar Plano Avulso/Extra */}
        {showExtraPlanModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-5 bg-purple-600 text-white">
                <h3 className="text-lg font-bold">Adicionar Plano Avulso ou Extra</h3>
                <button onClick={() => setShowExtraPlanModal(false)} className="text-white hover:bg-purple-700 p-1 rounded-lg"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs text-gray-500">Selecione um plano móvel avulso para agregar ao valor total desta proposta:</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                   {movelOptions.map(m => (
                      <div key={m.id} onClick={() => {
                         setExtraPlans([...extraPlans, { label: m.label, price: m.priceSingle, beneficios: m.beneficios }]);
                         setShowExtraPlanModal(false);
                         showToast('Plano adicional incluído!', 'success');
                      }} className="p-3 border border-gray-200 hover:border-purple-400 rounded-xl cursor-pointer bg-gray-50 hover:bg-purple-50 transition flex justify-between items-center">
                         <div>
                            <div className="font-bold text-sm text-gray-800">{m.label}</div>
                            <div className="text-xs text-gray-500">{m.beneficios}</div>
                         </div>
                         <div className="font-black text-purple-600 text-sm">R$ {m.priceSingle.toFixed(2).replace('.', ',')}</div>
                      </div>
                   ))}
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button onClick={() => setShowExtraPlanModal(false)} className="px-5 py-2 rounded-xl text-sm font-bold text-gray-600">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTemplates = () => {
    const handleSaveTemplate = (e) => {
        e.preventDefault();
        if(!templateForm.title || !templateForm.text) return;
        if(editingTemplateId) {
            setMessageTemplates(messageTemplates.map(t => t.id === editingTemplateId ? { ...t, ...templateForm } : t));
            showToast('Padrão atualizado com sucesso!', 'success');
        } else {
            setMessageTemplates([...messageTemplates, { id: Date.now(), ...templateForm }]);
            showToast('Novo padrão criado!', 'success');
        }
        setShowTemplateModal(false);
    };

    return (
      <div className="space-y-4 w-full">
        
        
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
               <h3 className="text-lg font-bold text-gray-800">Padrões Cadastrados ({messageTemplates.length})</h3>
               <div className="flex flex-wrap items-center gap-2 sm:gap-3"><button onClick={() => setShowVarModal(true)} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm border border-blue-200 shadow-sm hover:bg-blue-100 transition flex items-center gap-2">
                <Plus size={16} /> Gerenciar Variáveis
            </button><button onClick={() => { setEditingTemplateId(null); setTemplateForm({ title: '', text: '' }); setShowTemplateModal(true); }} className="bg-[#DA291C] text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm shadow-sm hover:bg-red-700 transition">
                  <Plus size={16} /> Novo Padrão
               </button></div>
           </div>
           <div className="space-y-4 w-full">
              {messageTemplates.map(t => (
                 <div key={t.id} className="p-4 sm:p-5 border border-gray-200 rounded-xl bg-gray-50 relative w-full group transition hover:border-blue-300">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                       <button onClick={() => { setTemplateForm({ title: t.title, text: t.text }); setEditingTemplateId(t.id); setShowTemplateModal(true); }} className="text-blue-500 hover:bg-blue-100 p-1.5 rounded-lg transition" title="Editar"><Edit2 size={16}/></button>
                       <button onClick={() => { setMessageTemplates(messageTemplates.filter(item => item.id !== t.id)); showToast('Padrão excluído.', 'info'); }} className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition" title="Excluir"><Trash2 size={16}/></button>
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm mb-3 border-b border-gray-200 pb-2 pr-20">{t.title}</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap font-medium">{t.text}</p>
                 </div>
              ))}
           </div>
        </div>

        {/* Modal: Gerenciar Variáveis */}
        {showVarModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 bg-blue-600 text-white">
                <h3 className="text-lg font-bold">Gerenciar Variáveis Customizadas</h3>
                <button onClick={() => setShowVarModal(false)} className="text-white hover:bg-blue-700 p-1.5 rounded-lg"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!varForm.name) return;
                  setCustomVariables([...customVariables, { id: Date.now(), ...varForm }]);
                  setVarForm({ name: '', description: '' });
                  showToast('Variável criada!', 'success');
                }} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                  <h4 className="font-bold text-sm text-gray-800">Nova Variável</h4>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nome (ex: Cod_Cliente)</label>
                    <input type="text" required value={varForm.name} onChange={e => setVarForm({...varForm, name: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none" placeholder="Nome sem espaços" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Descrição</label>
                    <input type="text" value={varForm.description} onChange={e => setVarForm({...varForm, description: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none" placeholder="O que ela representa" />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-blue-700 transition">Adicionar Variável</button>
                </form>

                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-gray-800">Variáveis Ativas ({customVariables.length})</h4>
                  {customVariables.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Nenhuma variável customizada cadastrada.</p>
                  ) : (
                    customVariables.map(v => (
                      <div key={v.id} className="p-3 border border-gray-200 rounded-xl bg-white flex justify-between items-center">
                        <div>
                          <div className="font-bold text-sm text-blue-600">[{v.name}]</div>
                          <div className="text-xs text-gray-500">{v.description}</div>
                        </div>
                        <button onClick={() => setCustomVariables(customVariables.filter(item => item.id !== v.id))} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={16}/></button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button onClick={() => setShowVarModal(false)} className="bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm">Fechar</button>
              </div>
            </div>
          </div>
        )}

        {showTemplateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
              <div className="flex justify-between items-center p-6 bg-blue-600 text-white rounded-t-2xl">
                <h3 className="text-lg font-bold">{editingTemplateId ? 'Editar Padrão' : 'Novo Padrão'}</h3>
                <button onClick={() => setShowTemplateModal(false)} className="hover:bg-blue-700 p-1.5 rounded-lg transition"><X size={20}/></button>
              </div>
              <form onSubmit={handleSaveTemplate} className="p-6 space-y-4">
                <div>
                   <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Título do Padrão</label>
                   <input type="text" required value={templateForm.title} onChange={e => setTemplateForm({...templateForm, title: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500" placeholder="Ex: Oferta VIP Celular" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Texto (Use variáveis como [Nome], [Valor]...)</label>
                   <textarea required value={templateForm.text} onChange={e => setTemplateForm({...templateForm, text: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 min-h-[160px]" placeholder="Olá [Nome], sua proposta ficou em [Valor]..." />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setShowTemplateModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition">Cancelar</button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition">Salvar Padrão</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderObjections = () => {
      const handleImportObjections = async (e) => {
          const file = e.target.files[0];
          e.target.value = '';
          if (!file) return;
          try {
              let rows;
              if (/\.csv$/i.test(file.name)) {
                  const t = await file.text();
                  rows = t.split(/\r?\n/).filter(r => r.trim()).map(r => { const i = r.search(/[;,]/); const q = x => x.trim().replace(/^"|"$/g, ''); return i < 0 ? [q(r), ''] : [q(r.slice(0, i)), q(r.slice(i + 1))]; });
              } else {
                  rows = await readXlsxFile(file);
              }
              let list = rows.map(r => [String(r[0] ?? '').trim(), String(r[1] ?? '').trim()]).filter(([t, x]) => t && x);
              if (list.length && /^(t[ií]tulo|categoria|obje[cç][aã]o)$/i.test(list[0][0])) list = list.slice(1);
              const existing = new Set(objections.map(o => (o.category + '|' + o.script).toLowerCase()));
              const novas = list.filter(([t, x]) => !existing.has((t + '|' + x).toLowerCase())).map(([t, x], i) => ({ id: Date.now() + i, category: t, keyword: '', script: x }));
              if (novas.length === 0) { showToast('Nenhuma objeção nova encontrada no arquivo.', 'warning'); return; }
              setObjections(prev => [...prev, ...novas]);
              addToHistory(`Importação Excel: ${novas.length} objeções`);
              showToast(`${novas.length} objeções importadas!`, 'success');
          } catch (err) {
              showToast('Não consegui ler o arquivo. Use .xlsx com título na coluna A e resposta na coluna B.', 'error');
          }
      };

      const handleSaveObj = (e) => {
          e.preventDefault();
          if(!objForm.category || !objForm.script) return;
          if(editingObjId) {
              setObjections(objections.map(o => o.id === editingObjId ? { ...o, ...objForm } : o));
              showToast('Objeção atualizada!', 'success');
          } else {
              setObjections([...objections, { id: Date.now(), ...objForm }]);
              showToast('Nova objeção salva!', 'success');
          }
          setShowObjModal(false);
      };

      return (
          <div className="space-y-4 w-full h-full flex flex-col">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
                 <p className="text-sm text-gray-500">Para cadastrar várias de uma vez, importe um Excel: título na coluna A e resposta na coluna B.</p>
                 <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <label className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm shadow-sm hover:bg-blue-700 transition cursor-pointer">
                       <FileDown size={16} /> Importar Excel
                       <input type="file" accept=".xlsx,.csv" onChange={handleImportObjections} className="hidden" />
                    </label>
                    <button onClick={() => { setEditingObjId(null); setObjForm({ category: '', keyword: '', script: '' }); setShowObjModal(true); }} className="bg-[#DA291C] text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm shadow-sm hover:bg-red-700 transition">
                    <Plus size={16} /> Nova Objeção
                 </button>
                 </div>
             </div>
             
             <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 overflow-auto">
                {objections.map(obj => (
                    <div key={obj.id} className="p-4 sm:p-5 border border-gray-200 rounded-xl bg-gray-50 flex flex-col gap-3 group hover:border-red-300 transition shadow-sm mb-4 relative">
                         <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                             <button onClick={() => { setObjForm({ category: obj.category, keyword: obj.keyword, script: obj.script }); setEditingObjId(obj.id); setShowObjModal(true); }} className="text-blue-500 hover:bg-blue-100 p-1.5 rounded-lg transition" title="Editar"><Edit2 size={16}/></button>
                             <button onClick={() => { setObjections(objections.filter(item => item.id !== obj.id)); showToast('Objeção excluída.', 'info'); }} className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition" title="Excluir"><Trash2 size={16}/></button>
                         </div>
                         <span className="bg-red-100 text-red-800 text-[10px] font-bold uppercase px-2.5 py-1 rounded-md self-start">{obj.category}</span>
                         <p className="text-sm text-gray-800 font-medium leading-relaxed border-l-4 border-red-500 pl-3 pr-16">{obj.script}</p>
                    </div>
                ))}
             </div>

             {showObjModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
                  <div className="flex justify-between items-center p-6 bg-red-600 text-white rounded-t-2xl">
                    <h3 className="text-lg font-bold">{editingObjId ? 'Editar Objeção' : 'Nova Objeção'}</h3>
                    <button onClick={() => setShowObjModal(false)} className="hover:bg-red-700 p-1.5 rounded-lg transition"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleSaveObj} className="p-6 space-y-4">
                    <div>
                       <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Categoria (Ex: Financeira, Multa)</label>
                       <input type="text" required value={objForm.category} onChange={e => setObjForm({...objForm, category: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:border-red-500" />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Argumento / Script de Quebra</label>
                       <textarea required value={objForm.script} onChange={e => setObjForm({...objForm, script: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:border-red-500 min-h-[140px]" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                      <button type="button" onClick={() => setShowObjModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition">Cancelar</button>
                      <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition">Salvar Objeção</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
      );
  };

  const renderPricing = () => (
    <div className="space-y-4 w-full">
      <div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3 border-b border-gray-200 pb-3 mt-0">
           <button onClick={() => setPricingTab('movel')} className={`px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 ${pricingTab === 'movel' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-purple-50'}`}><Smartphone size={18} /> Celulares</button>
           <button onClick={() => setPricingTab('internet')} className={`px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 ${pricingTab === 'internet' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-blue-50'}`}><Cloud size={18} /> Internet</button>
           <button onClick={() => setPricingTab('tv')} className={`px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 ${pricingTab === 'tv' ? 'bg-[#DA291C] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-red-50'}`}><LayoutTemplate size={18} /> TV Box</button>
        </div>
      </div>

      {pricingTab === 'movel' && (
      <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden w-full">
          <div className="bg-purple-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-6 border-b border-purple-100">
            <h3 className="text-base sm:text-lg font-bold text-purple-900">Planos Móveis (Controle e Pós)</h3>
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-purple-200 shadow-sm">
                    <label className="text-xs font-bold text-purple-800">Valor Dependente Extra (R$):</label>
                    <input type="number" step="0.01" value={dependentePrice} onChange={e => setDependentePrice(parseFloat(e.target.value) || 0)} className="w-20 p-1 text-sm outline-none border-b border-purple-300 font-bold bg-transparent" />
                </div>
                <button onClick={() => setMovelOptions([...movelOptions, { id: 'movel_' + Date.now(), planType: 'controle', label: 'Novo Plano', priceSingle: 0, priceCombo: 0, gigas: 0, desc: '', beneficios: '' }])} className="text-sm bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-xl font-bold transition flex items-center gap-1"><Plus size={16} /> Novo Plano</button>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 space-y-8 w-full">
            <div className="w-full">
              <h4 className="text-sm font-bold text-purple-800 mb-4 border-b pb-2">Planos Controle</h4>
              <div className="space-y-4 w-full">
                {movelOptions.filter(m => m.planType === 'controle').map((opt) => (
                  <div key={opt.id} className="relative bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm w-full group hover:border-purple-300">
                    <button onClick={() => setMovelOptions(movelOptions.filter(m => m.id !== opt.id))} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-gray-50 p-2 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"><Trash2 size={16} /></button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end pr-8 sm:pr-10 mb-3 w-full">
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label><input type="text" value={opt.label} onChange={(e) => setMovelOptions(movelOptions.map(m => m.id === opt.id ? { ...m, label: e.target.value } : m))} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" /></div>
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label><select value={opt.planType} onChange={(e) => setMovelOptions(movelOptions.map(m => m.id === opt.id ? { ...m, planType: e.target.value } : m))} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none"><option value="controle">Controle</option><option value="pos">Pós-pago</option></select></div>
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gigas</label><input type="number" value={opt.gigas} onChange={(e) => setMovelOptions(movelOptions.map(m => m.id === opt.id ? { ...m, gigas: parseInt(e.target.value)||0 } : m))} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" /></div>
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Avulso (R$)</label><input type="number" step="0.01" value={opt.priceSingle} onChange={(e) => setMovelOptions(movelOptions.map(m => m.id === opt.id ? { ...m, priceSingle: parseFloat(e.target.value)||0 } : m))} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" /></div>
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Combo (R$)</label><input type="number" step="0.01" value={opt.priceCombo} onChange={(e) => setMovelOptions(movelOptions.map(m => m.id === opt.id ? { ...m, priceCombo: parseFloat(e.target.value)||0 } : m))} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" /></div>
                    </div>
                    <div className="pr-8 sm:pr-10">
                       <label className="block text-xs font-bold text-purple-600 uppercase mb-1">Benefícios na Proposta (O que o cliente lê)</label>
                       <input type="text" value={opt.beneficios || ''} onChange={(e) => setMovelOptions(movelOptions.map(m => m.id === opt.id ? { ...m, beneficios: e.target.value } : m))} className="w-full p-2 border border-purple-200 bg-purple-50 rounded-lg text-sm outline-none" placeholder="Ex: 20GB de Internet + WhatsApp Ilimitado" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full">
              <h4 className="text-sm font-bold text-purple-800 mb-4 border-b pb-2">Planos Pós-pago</h4>
              <div className="space-y-4 w-full">
                {movelOptions.filter(m => m.planType !== 'controle').map((opt) => (
                  <div key={opt.id} className="relative bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm w-full group hover:border-purple-300">
                    <button onClick={() => setMovelOptions(movelOptions.filter(m => m.id !== opt.id))} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-gray-50 p-2 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"><Trash2 size={16} /></button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end pr-8 sm:pr-10 mb-3 w-full">
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label><input type="text" value={opt.label} onChange={(e) => setMovelOptions(movelOptions.map(m => m.id === opt.id ? { ...m, label: e.target.value } : m))} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" /></div>
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label><select value={opt.planType} onChange={(e) => setMovelOptions(movelOptions.map(m => m.id === opt.id ? { ...m, planType: e.target.value } : m))} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none"><option value="controle">Controle</option><option value="pos">Pós-pago</option></select></div>
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gigas</label><input type="number" value={opt.gigas} onChange={(e) => setMovelOptions(movelOptions.map(m => m.id === opt.id ? { ...m, gigas: parseInt(e.target.value)||0 } : m))} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" /></div>
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Avulso (R$)</label><input type="number" step="0.01" value={opt.priceSingle} onChange={(e) => setMovelOptions(movelOptions.map(m => m.id === opt.id ? { ...m, priceSingle: parseFloat(e.target.value)||0 } : m))} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" /></div>
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Combo (R$)</label><input type="number" step="0.01" value={opt.priceCombo} onChange={(e) => setMovelOptions(movelOptions.map(m => m.id === opt.id ? { ...m, priceCombo: parseFloat(e.target.value)||0 } : m))} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" /></div>
                    </div>
                    <div className="pr-8 sm:pr-10">
                       <label className="block text-xs font-bold text-purple-600 uppercase mb-1">Benefícios na Proposta (O que o cliente lê)</label>
                       <input type="text" value={opt.beneficios || ''} onChange={(e) => setMovelOptions(movelOptions.map(m => m.id === opt.id ? { ...m, beneficios: e.target.value } : m))} className="w-full p-2 border border-purple-200 bg-purple-50 rounded-lg text-sm outline-none" placeholder="Ex: 50GB + Passaporte Américas" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>
      )}

      {pricingTab === 'internet' && (
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden w-full">
          <div className="bg-blue-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-6 border-b border-blue-100">
            <h3 className="text-base sm:text-lg font-bold text-blue-900">Internet Residencial</h3>
            <button onClick={() => setInternetOptions([...internetOptions, { id: 'net_' + Date.now(), label: 'Nova Internet', single: 0, combo: 0, multi: 0, desc: '', beneficios: '' }])} className="text-sm bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl font-bold transition flex items-center gap-1"><Plus size={16} /> Nova Internet</button>
          </div>
          <div className="p-4 sm:p-6 space-y-4 w-full">
            {internetOptions.map((opt) => (
              <div key={opt.id} className="relative bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm pr-10 sm:pr-12 group hover:border-blue-300">
                <button onClick={() => setInternetOptions(internetOptions.filter(i => i.id !== opt.id))} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"><Trash2 size={16}/></button>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end mb-3">
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label><input type="text" value={opt.label} onChange={(e) => setInternetOptions(internetOptions.map(i => i.id === opt.id ? { ...i, label: e.target.value } : i))} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" /></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Single (R$)</label><input type="number" step="0.01" value={opt.single} onChange={(e) => setInternetOptions(internetOptions.map(i => i.id === opt.id ? { ...i, single: parseFloat(e.target.value)||0 } : i))} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" /></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Combo (R$)</label><input type="number" step="0.01" value={opt.combo} onChange={(e) => setInternetOptions(internetOptions.map(i => i.id === opt.id ? { ...i, combo: parseFloat(e.target.value)||0 } : i))} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" /></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Multi (R$)</label><input type="number" step="0.01" value={opt.multi} onChange={(e) => setInternetOptions(internetOptions.map(i => i.id === opt.id ? { ...i, multi: parseFloat(e.target.value)||0 } : i))} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" /></div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-blue-600 uppercase mb-1">Benefícios na Proposta</label>
                    <input type="text" value={opt.beneficios || ''} onChange={(e) => setInternetOptions(internetOptions.map(i => i.id === opt.id ? { ...i, beneficios: e.target.value } : i))} className="w-full p-2 border border-blue-200 bg-blue-50 rounded-lg text-sm outline-none" placeholder="Ex: 1 Giga de Internet Fibra + Wi-Fi 6" />
                </div>
              </div>
            ))}
          </div>
      </div>
      )}

      {pricingTab === 'tv' && (
      <div className="space-y-6 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden w-full">
          <div className="bg-red-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-6 border-b border-red-100">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-red-900">Planos de TV Box</h3>
              <p className="text-xs text-red-700">Pacotes principais de TV e Streaming</p>
            </div>
            <button onClick={() => setTvOptions([...tvOptions, { id: 'tv_' + Date.now(), label: 'Nova TV', single: 0, combo: 0, multi: 0, extraPointPrice: 69.90, desc: '', details: '', beneficios: '' }])} className="text-sm bg-[#DA291C] text-white hover:bg-red-700 px-4 py-2 rounded-xl font-bold transition flex items-center gap-1"><Plus size={16} /> Nova TV</button>
          </div>
          <div className="p-4 sm:p-6 space-y-4 w-full">
            {tvOptions.map((opt) => (
              <div key={opt.id} className="relative bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm pr-10 sm:pr-12 group hover:border-red-300">
                <button onClick={() => setTvOptions(tvOptions.filter(t => t.id !== opt.id))} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"><Trash2 size={16}/></button>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end mb-3">
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label><input type="text" value={opt.label} onChange={(e) => setTvOptions(tvOptions.map(t => t.id === opt.id ? { ...t, label: e.target.value } : t))} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" /></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Single (R$)</label><input type="number" step="0.01" value={opt.single} onChange={(e) => setTvOptions(tvOptions.map(t => t.id === opt.id ? { ...t, single: parseFloat(e.target.value)||0 } : t))} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" /></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Combo (R$)</label><input type="number" step="0.01" value={opt.combo} onChange={(e) => setTvOptions(tvOptions.map(t => t.id === opt.id ? { ...t, combo: parseFloat(e.target.value)||0 } : t))} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" /></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Multi (R$)</label><input type="number" step="0.01" value={opt.multi} onChange={(e) => setTvOptions(tvOptions.map(t => t.id === opt.id ? { ...t, multi: parseFloat(e.target.value)||0 } : t))} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" /></div>
                    <div><label className="block text-xs font-bold text-red-600 uppercase mb-1">Pto Extra</label><input type="number" step="0.01" value={opt.extraPointPrice !== undefined ? opt.extraPointPrice : 69.90} onChange={(e) => setTvOptions(tvOptions.map(t => t.id === opt.id ? { ...t, extraPointPrice: parseFloat(e.target.value)||0 } : t))} className="w-full p-2 border border-red-200 bg-red-50 rounded-lg text-sm outline-none" /></div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-red-600 uppercase mb-1">Benefícios na Proposta</label>
                    <input type="text" value={opt.beneficios || ''} onChange={(e) => setTvOptions(tvOptions.map(t => t.id === opt.id ? { ...t, beneficios: e.target.value } : t))} className="w-full p-2 border border-red-200 bg-red-50 rounded-lg text-sm outline-none" placeholder="Ex: Claro TV+ Box 4K com Globoplay" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden w-full">
          <div className="bg-amber-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-6 border-b border-amber-100">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-amber-900">Serviços À La Carte (Adicionais de TV Box)</h3>
              <p className="text-xs text-amber-700">Canais avulsos, pacotes de futebol, filmes e streamings extras que aparecem ao selecionar TV Box na proposta</p>
            </div>
            <button
              onClick={() => setAlacarteOptions([...alacarteOptions, { id: 'ala_' + Date.now(), label: 'Novo Serviço À La Carte', price: 29.90, beneficios: '' }])}
              className="text-sm bg-amber-600 text-white hover:bg-amber-700 px-4 py-2 rounded-xl font-bold transition flex items-center gap-1 shadow-sm"
            >
              <Plus size={16} /> Novo Serviço À La Carte
            </button>
          </div>
          <div className="p-4 sm:p-6 space-y-3 w-full">
            {alacarteOptions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Nenhum serviço à la carte cadastrado. Clique em "+ Novo Serviço À La Carte" para adicionar.</p>
            ) : (
              alacarteOptions.map((ala) => (
                <div key={ala.id} className="relative bg-white p-4 rounded-xl border border-gray-200 shadow-sm pr-10 sm:pr-12 group hover:border-amber-400 transition">
                  <button
                    onClick={() => {
                      setAlacarteOptions(alacarteOptions.filter(a => a.id !== ala.id));
                      setSelAlacarte(prev => prev.filter(id => id !== ala.id));
                      setSelAlacarte2(prev => prev.filter(id => id !== ala.id));
                    }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
                    title="Remover serviço à la carte"
                  >
                    <Trash2 size={16}/>
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Canal / Serviço</label>
                      <input
                        type="text"
                        value={ala.label}
                        onChange={(e) => setAlacarteOptions(alacarteOptions.map(a => a.id === ala.id ? { ...a, label: e.target.value } : a))}
                        placeholder="Ex: Premiere, Telecine, Max..."
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor Mensal (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={ala.price}
                        onChange={(e) => setAlacarteOptions(alacarteOptions.map(a => a.id === ala.id ? { ...a, price: parseFloat(e.target.value) || 0 } : a))}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-amber-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-700 uppercase mb-1">Nome Exibido na Proposta (Opcional)</label>
                      <input
                        type="text"
                        value={ala.beneficios || ''}
                        onChange={(e) => setAlacarteOptions(alacarteOptions.map(a => a.id === ala.id ? { ...a, beneficios: e.target.value } : a))}
                        placeholder={ala.label || 'Ex: Premiere Futebol'}
                        className="w-full p-2 border border-amber-200 bg-amber-50/50 rounded-lg text-sm outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );

  const renderHistory = () => (
      <div className="space-y-4 w-full flex flex-col">
          <div className="flex justify-between items-center gap-4 shrink-0">
              <span></span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={14}/> Retenção 7 Dias</span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {activityLog.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-gray-400 py-12">
                      <History size={48} className="mb-4 opacity-50" />
                      <p className="text-sm font-medium">Nenhum registro de atividade recente.</p>
                  </div>
              ) : (
                  <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
                      {activityLog.map((log) => (
                          <div key={log.id} className="relative pl-6 group">
                              <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full group-hover:bg-blue-500 transition-colors"></div>
                              <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-3">
                                      <span className="text-sm font-bold text-gray-800">{log.action}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                                      <span className="flex items-center gap-1"><Clock size={12}/> {log.date} às {log.time}</span>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
  );

  const renderReports = () => {
    const getMetrics = (monthStr) => {
        if (!monthStr) return null;
        const [year, month] = monthStr.split('-');
        
        const monthClients = clients.filter(c => {
            const date = new Date(c.id);
            return date.getFullYear() === parseInt(year) && date.getMonth() + 1 === parseInt(month);
        });
        
        const vendasFechadas = monthClients.filter(c => c.status === 'Venda Fechada').length;
        const semInteresse = monthClients.filter(c => c.status === 'Sem Interesse').length;
        const emNegociacao = monthClients.filter(c => c.status === 'Em Negociação').length;
        
        const propostasEnviadas = activityLog.filter(l => {
            const lDate = new Date(l.timestamp);
            return String(l.action || '').includes('Proposta') && lDate.getFullYear() === parseInt(year) && lDate.getMonth() + 1 === parseInt(month);
        }).length;

        const movelCount = monthClients.filter(c => c.interest === 'Single Móvel' || c.interest === 'Troca de Aparelho / iPhone').length;
        const internetCount = monthClients.filter(c => c.interest === 'Internet Residencial').length;
        const comboCount = monthClients.filter(c => c.interest === 'Combo Multi').length;

        return { 
            total: monthClients.length, 
            vendasFechadas, semInteresse, emNegociacao, propostasEnviadas, 
            movelCount, internetCount, comboCount 
        };
    };

    const metrics1 = getMetrics(reportMonth);
    const metrics2 = compareMonth ? getMetrics(compareMonth) : null;

    const renderPieChart = (val1, val2, color1, color2, label1, label2) => {
        const total = val1 + val2 || 1; 
        const pct1 = Math.round((val1 / total) * 100);
        return (
            <div className="flex flex-col items-center gap-4">
                <div 
                    className="w-32 h-32 rounded-full shadow-inner border border-gray-100" 
                    style={{ background: `conic-gradient(${color1} ${pct1}%, ${color2} ${pct1}% 100%)` }} 
                />
                <div className="flex flex-col gap-1 w-full text-xs font-bold text-gray-600">
                    <div className="flex justify-between"><span className="flex items-center gap-1"><div className={`w-3 h-3 rounded-sm`} style={{backgroundColor: color1}}></div>{label1}</span> <span>{pct1}%</span></div>
                    <div className="flex justify-between"><span className="flex items-center gap-1"><div className={`w-3 h-3 rounded-sm`} style={{backgroundColor: color2}}></div>{label2}</span> <span>{100 - pct1}%</span></div>
                </div>
            </div>
        );
    };

    return (
      <div className="space-y-4 w-full print-expand">
        

        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap gap-3 sm:gap-4 items-center no-print">
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mês Base</label>
               <input type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className="p-2.5 border border-gray-300 rounded-lg text-sm outline-none font-bold text-gray-700" />
            </div>
            <div className="text-gray-300 hidden sm:block"><ArrowRight size={20}/></div>
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Comparar com</label>
               <input type="month" value={compareMonth} onChange={(e) => setCompareMonth(e.target.value)} className="p-2.5 border border-gray-300 rounded-lg text-sm outline-none font-bold text-gray-700" />
            </div>
            <button onClick={() => setCompareMonth('')} className="mt-2 sm:mt-4 text-xs font-bold text-red-500 hover:underline">Limpar Comparação</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
               <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2"><PieChart size={18} className="text-blue-500 shrink-0"/> Conversão: Mês Base ({reportMonth})</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                   <div>
                       <div className="mb-4">
                           <div className="text-xs font-bold text-gray-400 uppercase">Total Leads Mês</div>
                           <div className="text-3xl font-black text-gray-800">{metrics1?.total || 0}</div>
                       </div>
                       <div className="mb-4">
                           <div className="text-xs font-bold text-emerald-500 uppercase">Vendas Fechadas</div>
                           <div className="text-2xl font-black text-emerald-600">{metrics1?.vendasFechadas || 0}</div>
                       </div>
                       <div>
                           <div className="text-xs font-bold text-blue-500 uppercase">Propostas Enviadas</div>
                           <div className="text-2xl font-black text-blue-600">{metrics1?.propostasEnviadas || 0}</div>
                       </div>
                   </div>
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                       {renderPieChart(metrics1?.vendasFechadas || 0, metrics1?.semInteresse || 0, '#10b981', '#f43f5e', 'Vendas Fechadas', 'Perdidos/Sem Interesse')}
                   </div>
               </div>
            </div>

            {metrics2 && (
                <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
                   <h3 className="text-base sm:text-lg font-bold text-gray-600 mb-6 border-b pb-2 flex items-center gap-2"><PieChart size={18} className="shrink-0"/> Comparativo ({compareMonth})</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center opacity-80">
                       <div>
                           <div className="mb-4">
                               <div className="text-xs font-bold text-gray-400 uppercase">Total Leads Mês</div>
                               <div className="text-3xl font-black text-gray-700">{metrics2.total}</div>
                           </div>
                           <div className="mb-4">
                               <div className="text-xs font-bold text-gray-500 uppercase">Vendas Fechadas</div>
                               <div className="text-2xl font-black text-gray-600">{metrics2.vendasFechadas}</div>
                           </div>
                           <div>
                               <div className="text-xs font-bold text-gray-500 uppercase">Propostas Enviadas</div>
                               <div className="text-2xl font-black text-gray-600">{metrics2.propostasEnviadas}</div>
                           </div>
                       </div>
                       <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                           {renderPieChart(metrics2.vendasFechadas, metrics2.semInteresse, '#9ca3af', '#fca5a5', 'Vendas Fechadas', 'Perdidos/Sem Int.')}
                       </div>
                   </div>
                </div>
            )}

            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:col-span-2">
               <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-6 border-b pb-2">Distribuição de Interesses (Mês Base)</h3>
               <div className="flex flex-wrap items-center justify-around gap-6">
                   {renderPieChart(metrics1?.comboCount || 0, (metrics1?.movelCount || 0) + (metrics1?.internetCount || 0), '#8b5cf6', '#e5e7eb', 'Combo Multi', 'Outros')}
                   {renderPieChart(metrics1?.movelCount || 0, (metrics1?.comboCount || 0) + (metrics1?.internetCount || 0), '#3b82f6', '#e5e7eb', 'Apenas Móvel', 'Outros')}
                   {renderPieChart(metrics1?.internetCount || 0, (metrics1?.movelCount || 0) + (metrics1?.comboCount || 0), '#10b981', '#e5e7eb', 'Apenas Internet', 'Outros')}
               </div>
            </div>
        </div>
      </div>
    );
  };

  const renderBackup = () => (
       <div className="space-y-4 w-full">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-2xl space-y-4">
             <div>
               <h3 className="text-lg font-bold text-gray-800 mb-2">Segurança de Dados (JSON)</h3>
               <p className="text-sm text-gray-500 mb-6">Baixe uma cópia de segurança de todos os seus clientes e configurações, ou restaure um backup anterior. O sistema cria backups automáticos diariamente às 17:40.</p>
               <button onClick={handleExportBackup} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-md">
                  <DownloadCloud size={20} /> Baixar Arquivo de Backup (.json)
               </button>
             </div>
             
             <div className="pt-6 border-t border-gray-100">
               <h3 className="text-lg font-bold text-gray-800 mb-2">Restaurar Backup</h3>
               <p className="text-sm text-gray-500 mb-4">Selecione um arquivo de backup (.json) para repopular a base de dados instantaneamente.</p>
               <label className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer border border-gray-200">
                  <CloudUpload size={20} /> Selecionar Arquivo (.json)
                  <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
               </label>
             </div>
          </div>
       </div>
  );

  // Cálculo estrito de 24h em Dias Úteis:
  // Sexta-feira (5) -> +72h (Segunda); Sábado (6) -> +48h (Segunda); Segunda a Quinta (e Domingo) -> +24h
  const calcCommissionDueAt = (fromMs = Date.now()) => {
    const day = new Date(fromMs).getDay();
    const hoursToAdd = day === 5 ? 72 : day === 6 ? 48 : 24;
    return fromMs + hoursToAdd * 60 * 60 * 1000;
  };

  const moveInstallationStage = (clientId, targetStage) => {
    const cl = clients.find(c => c.id === clientId);
    if (!cl || cl.installStage === targetStage) return;
    if (targetStage === 'installed') {
      confirmClientInstallation(cl);
    } else if (targetStage === 'commissioned') {
      confirmClientCommission(cl);
    } else if (targetStage === 'waiting') {
      const nowTs = Date.now();
      setClients(prev => prev.map(c => c.id === clientId ? {
        ...c,
        installStage: 'waiting',
        installedAt: null,
        commissionDueAt: null,
        commissionedAt: null,
        updatedAt: nowTs
      } : c));
      addToHistory(`Contrato retornado para Aguardando Instalação: ${cl.name}`);
      showToast('Contrato movido para Aguardando Instalação.', 'info');
    }
  };

  const handleQuebraInstallation = (client) => {
    if (!window.confirm(`Registrar QUEBRA (desistência) do contrato de "${client.name}"?\n\nO card será removido de Instalações e o cliente voltará para "Sem Interesse" no CRM.`)) return;
    const nowTs = Date.now();
    setClients(prev => prev.map(c => c.id === client.id ? {
      ...c,
      requiresInstallation: false,
      installStage: null,
      installedAt: null,
      commissionDueAt: null,
      commissionedAt: null,
      status: statuses.includes('Sem Interesse') ? 'Sem Interesse' : c.status,
      statusSince: nowTs,
      updatedAt: nowTs,
      annotations: `${c.annotations ? c.annotations + '\n' : ''}[${new Date().toLocaleDateString('pt-BR')}] QUEBRA / Desistência registrada na instalação.`
    } : c));
    addToHistory(`QUEBRA (desistência) de instalação registrada: ${client.name}`);
    showToast(`Quebra registrada para ${client.name}. Removido das instalações.`, 'warning');
  };

  const confirmClientInstallation = (client) => {
    const nowTs = Date.now();
    const dueTs = calcCommissionDueAt(nowTs);
    setClients(prev => prev.map(c => c.id === client.id ? {
      ...c,
      installStage: 'installed',
      installedAt: nowTs,
      commissionDueAt: dueTs,
      updatedAt: nowTs
    } : c));
    addToHistory(`Instalação confirmada (Comissão em 24h úteis): ${client.name}`);
    showToast('Instalação confirmada! Rastreio de comissão de 24h úteis iniciado.', 'success');
  };

  const confirmClientCommission = (client) => {
    const nowTs = Date.now();
    setClients(prev => prev.map(c => c.id === client.id ? {
      ...c,
      installStage: 'commissioned',
      commissionedAt: nowTs,
      updatedAt: nowTs
    } : c));
    addToHistory(`Comissão confirmada e contrato arquivado: ${client.name}`);
    showToast('Comissão confirmada! Contrato arquivado nos concluídos.', 'success');
  };

  const buildClosingSummaryText = () => {
    const fmtD = (d) => d ? d.split('-').reverse().join('/') : '--';
    const valNum = num(closingSummaryModal.monthlyValue);
    const valFormatted = valNum > 0 ? `R$ ${valNum.toFixed(2).replace('.', ',')}` : 'A confirmar';
    const lines = [
      `*Confirmação de Contratação — Claro*`,
      `Olá, *${closingSummaryModal.clientName || 'Cliente'}*! Parabéns pela excelente escolha. Segue o resumo do seu contrato e os próximos passos:`,
      ``,
      `*Pacote Contratado:* ${closingSummaryModal.packageSummary || 'Conforme alinhado'}`,
      `*Valor Mensal:* ${valFormatted}`,
      `*Vencimento da Fatura:* Todo dia *${closingSummaryModal.dueDay || '10'}*`
    ];
    if (closingSummaryModal.includePortabilitySms) {
      lines.push(
        ``,
        `*Importante — Portabilidade:* Você receberá um SMS da operadora solicitando a confirmação da portabilidade. Responda *SIM* em até *2 horas* para autorizar a transferência do seu número sem atrasos.`
      );
    }
    if (closingSummaryModal.requiresInstallation) {
      lines.push(
        ``,
        `*Agendamento de Instalação / Entrega:*`,
        `• Data agendada: *${fmtD(closingSummaryModal.installDate)}*`,
        `• Período: *${closingSummaryModal.installPeriod || 'Manhã'}*`,
        `_(Lembrando que é necessário ter uma pessoa maior de 18 anos com documento no local para receber o técnico/entrega)._`
      );
    }
    lines.push(
      ``,
      `Qualquer dúvida até a conclusão, estou 100% à disposição por aqui. Bem-vindo(a) à Claro!`
    );
    return lines.join('\n');
  };

  const handleSaveAndSendClosingSummary = (sendWhats = true) => {
    const text = buildClosingSummaryText();
    const nowTs = Date.now();
    if (closingSummaryModal.clientId) {
      setClients(prev => prev.map(c => {
        if (c.id === closingSummaryModal.clientId) {
          const newHist = [...(c.interactionHistory || []), { date: new Date().toLocaleDateString('pt-BR'), template: 'Resumo de Fechamento & Instalação' }];
          return {
            ...c,
            status: 'Venda Fechada',
            updatedAt: nowTs,
            followUpDate: c.followUpDate || getDaysFromNow(7),
            tipoRetorno: 'pos-venda',
            packageSummary: closingSummaryModal.packageSummary,
            monthlyValue: num(closingSummaryModal.monthlyValue),
            dueDay: closingSummaryModal.dueDay,
            includePortabilitySms: closingSummaryModal.includePortabilitySms,
            requiresInstallation: closingSummaryModal.requiresInstallation,
            installDate: closingSummaryModal.requiresInstallation ? closingSummaryModal.installDate : '',
            installPeriod: closingSummaryModal.requiresInstallation ? closingSummaryModal.installPeriod : 'Manhã',
            installStage: closingSummaryModal.requiresInstallation ? (c.installStage === 'installed' || c.installStage === 'commissioned' ? c.installStage : 'waiting') : c.installStage,
            interactionHistory: newHist
          };
        }
        return c;
      }));
    }
    addToHistory(`Resumo de fechamento salvo${closingSummaryModal.requiresInstallation ? ' + Instalação agendada' : ''}: ${closingSummaryModal.clientName}`);
    showToast('Dados de fechamento salvos com sucesso!', 'success');
    if (sendWhats && closingSummaryModal.clientPhone) {
      openWhatsApp(closingSummaryModal.clientPhone, text);
    }
    setClosingSummaryModal(prev => ({ ...prev, isOpen: false }));
  };

  const pendingInstallationsCount = clients.filter(c => c.installStage === 'waiting' || c.installStage === 'installed').length;
  const pendingChecklistCount = checklistItems.filter(t => !t.done).length;

  const renderInstallations = () => {
    const todayLocal = localISO();
    const colWaiting = clients.filter(c => c.installStage === 'waiting').sort((a, b) => (a.installDate || '9999').localeCompare(b.installDate || '9999'));
    const colInstalled = clients.filter(c => c.installStage === 'installed').sort((a, b) => (a.commissionDueAt || 0) - (b.commissionDueAt || 0));
    const colCommissioned = clients.filter(c => c.installStage === 'commissioned').sort((a, b) => (b.commissionedAt || 0) - (a.commissionedAt || 0));

    const fmtDateBR = (d) => d ? d.split('-').reverse().join('/') : 'Sem data';
    const fmtDateTimeBR = (ms) => {
      if (!ms) return '--';
      const d = new Date(ms);
      return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    };
    const remainingLabel = (dueMs) => {
      if (!dueMs) return '';
      const diff = dueMs - Date.now();
      if (diff <= 0) return 'Prazo de 24h úteis vencido — Conferir Comissão!';
      const totalHours = Math.ceil(diff / (1000 * 60 * 60));
      return `Conferir em ~${totalHours}h (${fmtDateTimeBR(dueMs)})`;
    };

    const handleDropOnStage = (e, stage) => {
      e.preventDefault();
      const rawId = e.dataTransfer.getData('text/plain');
      if (rawId) {
        moveInstallationStage(parseInt(rawId), stage);
      }
      setDraggedInstallId(null);
    };

    return (
      <div className="space-y-4 w-full">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
          <div>
            <h2 className="text-base font-black text-gray-800 flex items-center gap-2">
              <Wrench size={18} className="text-[#DA291C] shrink-0" /> Fluxo de Paz de Espírito — Instalações & Rastreio de Comissão (24h Úteis)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Arraste os cards entre as colunas como no Kanban ou use os botões de confirmação. Em caso de desistência, clique em <strong>Quebra / Excluir</strong>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold">
              Aguardando Instalação: <strong>{colWaiting.length}</strong>
            </span>
            <span className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold">
              Aguardando Comissão: <strong>{colInstalled.length}</strong>
            </span>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold">
              Concluídos: <strong>{colCommissioned.length}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full lg:h-[calc(100vh-220px)] lg:min-h-[540px]">
          {/* COLUNA 1: Aguardando Instalação */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDropOnStage(e, 'waiting')}
            className="bg-gray-100/80 rounded-2xl border border-gray-200 flex flex-col overflow-hidden shadow-sm"
          >
            <div className="p-4 bg-amber-500 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide">1. Aguardando Instalação</h3>
                <p className="text-[11px] text-amber-100 font-medium">Visitas técnicas e entregas agendadas</p>
              </div>
              <span className="bg-white text-amber-900 px-2.5 py-1 rounded-lg text-xs font-black shadow-sm">{colWaiting.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {colWaiting.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs font-medium">Nenhuma instalação pendente no momento.</div>
              ) : colWaiting.map(c => {
                const isToday = c.installDate === todayLocal;
                const isOverdue = Boolean(c.installDate && c.installDate < todayLocal);
                const cardStyle = isOverdue
                  ? 'bg-red-50 border-2 border-red-500 shadow-red-100'
                  : isToday
                  ? 'bg-amber-50 border-2 border-amber-400 shadow-amber-100'
                  : 'bg-white border border-gray-200';
                return (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) => { setDraggedInstallId(c.id); e.dataTransfer.setData('text/plain', String(c.id)); }}
                    onDragEnd={() => setDraggedInstallId(null)}
                    className={`p-4 rounded-xl shadow-sm flex flex-col gap-2.5 transition cursor-grab active:cursor-grabbing ${draggedInstallId === c.id ? 'opacity-50' : ''} ${cardStyle}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span
                          onClick={() => openClosingSummaryForClient(c)}
                          className="font-black text-sm text-gray-900 hover:text-[#DA291C] hover:underline cursor-pointer"
                          title="Clique para editar dados da instalação"
                        >
                          {c.name}
                        </span>
                        <div className="text-xs text-gray-500 font-medium">{c.phone}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isOverdue ? (
                          <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow-sm">Atrasado</span>
                        ) : isToday ? (
                          <span className="bg-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow-sm">Hoje</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">Agendado</span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleQuebraInstallation(c); }}
                          className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition"
                          title="Excluir / Registrar QUEBRA (Desistência do cliente)"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {c.packageSummary ? (
                      <div className="text-xs text-gray-700 bg-white/80 p-2 rounded-lg border border-gray-200/80 font-medium">
                        <strong>Pacote:</strong> {c.packageSummary}
                        {c.monthlyValue ? <span className="block text-emerald-700 font-bold mt-0.5">R$ {num(c.monthlyValue).toFixed(2).replace('.', ',')}/mês (Venc. dia {c.dueDay || '10'})</span> : null}
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between text-xs font-bold text-gray-700 pt-1">
                      <span className="flex items-center gap-1.5">
                        <CalendarClock size={14} className={isOverdue ? 'text-red-600' : isToday ? 'text-amber-600' : 'text-gray-500'} />
                        {fmtDateBR(c.installDate)} • {c.installPeriod || 'Manhã'}
                      </span>
                      <button
                        onClick={() => openWhatsApp(c.phone, `Olá ${c.name}, tudo bem? Passando para acompanhar sua instalação agendada para ${fmtDateBR(c.installDate)} (${c.installPeriod || 'Manhã'}). Deu tudo certo por aí?`)}
                        className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition"
                        title="Chamar no WhatsApp"
                      >
                        <MessageCircle size={15} />
                      </button>
                    </div>

                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => confirmClientInstallation(c)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-3 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <Check size={14} /> Confirmar Instalação
                      </button>
                      <button
                        onClick={() => handleQuebraInstallation(c)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-black text-[11px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1"
                        title="Registrar desistência do cliente (Quebra)"
                      >
                        <Trash2 size={13} /> Quebra
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUNA 2: Instalado — Aguardando Comissão (24h Úteis) */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDropOnStage(e, 'installed')}
            className="bg-gray-100/80 rounded-2xl border border-gray-200 flex flex-col overflow-hidden shadow-sm"
          >
            <div className="p-4 bg-blue-600 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide">2. Instalado — Aguardando Comissão (24h Úteis)</h3>
                <p className="text-[11px] text-blue-100 font-medium">Prazo de 24h úteis para conferência no sistema</p>
              </div>
              <span className="bg-white text-blue-900 px-2.5 py-1 rounded-lg text-xs font-black shadow-sm">{colInstalled.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {colInstalled.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs font-medium">Nenhum contrato aguardando comissão.</div>
              ) : colInstalled.map(c => {
                const isDue = Boolean(c.commissionDueAt && Date.now() >= c.commissionDueAt);
                return (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) => { setDraggedInstallId(c.id); e.dataTransfer.setData('text/plain', String(c.id)); }}
                    onDragEnd={() => setDraggedInstallId(null)}
                    className={`p-4 rounded-xl shadow-sm flex flex-col gap-2.5 transition cursor-grab active:cursor-grabbing ${draggedInstallId === c.id ? 'opacity-50' : ''} ${isDue ? 'bg-amber-50 border-2 border-amber-500 ring-2 ring-amber-200' : 'bg-white border border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-black text-sm text-gray-900">{c.name}</span>
                        <div className="text-xs text-gray-500 font-medium">{c.phone}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isDue ? (
                          <span className="bg-[#DA291C] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow-sm">CONFERIR COMISSÃO</span>
                        ) : (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">Em 24h Úteis</span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleQuebraInstallation(c); }}
                          className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition"
                          title="Excluir / Registrar QUEBRA (Desistência do cliente)"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {c.packageSummary ? (
                      <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-200 font-medium">
                        <strong>Pacote:</strong> {c.packageSummary}
                        {c.monthlyValue ? <span className="block text-emerald-700 font-bold mt-0.5">R$ {num(c.monthlyValue).toFixed(2).replace('.', ',')}/mês</span> : null}
                      </div>
                    ) : null}

                    <div className="text-[11px] bg-blue-50/70 border border-blue-200 rounded-lg p-2.5 text-blue-900 space-y-1">
                      <div><strong>Instalado em:</strong> {fmtDateTimeBR(c.installedAt)}</div>
                      <div className="font-black text-blue-950">{remainingLabel(c.commissionDueAt)}</div>
                    </div>

                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => confirmClientCommission(c)}
                        className="flex-1 bg-gray-900 hover:bg-[#DA291C] text-white font-black text-xs py-2.5 px-3 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <DollarSign size={14} /> Comissão Subiu (Arquivar)
                      </button>
                      <button
                        onClick={() => handleQuebraInstallation(c)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-black text-[11px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1"
                        title="Registrar desistência do cliente (Quebra)"
                      >
                        <Trash2 size={13} /> Quebra
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUNA 3: Comissão Confirmada (Concluídos) */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDropOnStage(e, 'commissioned')}
            className="bg-gray-100/80 rounded-2xl border border-gray-200 flex flex-col overflow-hidden shadow-sm"
          >
            <div className="p-4 bg-emerald-600 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide">3. Comissão Confirmada (Concluídos)</h3>
                <p className="text-[11px] text-emerald-100 font-medium">Contratos finalizados — seguro guardar o físico</p>
              </div>
              <span className="bg-white text-emerald-900 px-2.5 py-1 rounded-lg text-xs font-black shadow-sm">{colCommissioned.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {colCommissioned.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs font-medium">Nenhum contrato concluído no histórico ainda.</div>
              ) : colCommissioned.map(c => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={(e) => { setDraggedInstallId(c.id); e.dataTransfer.setData('text/plain', String(c.id)); }}
                  onDragEnd={() => setDraggedInstallId(null)}
                  className={`p-4 rounded-xl bg-white border border-emerald-200 shadow-sm flex flex-col gap-2 cursor-grab active:cursor-grabbing ${draggedInstallId === c.id ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-black text-sm text-gray-900">{c.name}</span>
                      <div className="text-xs text-gray-500 font-medium">{c.phone}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">Comissionado</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleQuebraInstallation(c); }}
                        className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition"
                        title="Excluir / Registrar QUEBRA"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {c.packageSummary ? (
                    <div className="text-xs text-gray-600 font-medium">
                      {c.packageSummary} {c.monthlyValue ? `• R$ ${num(c.monthlyValue).toFixed(2).replace('.', ',')}/mês` : ''}
                    </div>
                  ) : null}
                  <div className="text-[11px] text-emerald-700 font-bold border-t border-gray-100 pt-2">
                    Confirmado em {fmtDateTimeBR(c.commissionedAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChecklist = () => {
    const handleAddTask = (e) => {
      e.preventDefault();
      if (!newTaskTitle.trim()) return;
      const newTask = {
        id: Date.now(),
        title: newTaskTitle.trim(),
        priority: newTaskPriority,
        category: newTaskCategory,
        dueDate: newTaskDueDate,
        done: false
      };
      setChecklistItems(prev => [newTask, ...prev]);
      setNewTaskTitle('');
      setNewTaskDueDate('');
      addToHistory(`Responsabilidade adicionada ao checklist: ${newTask.title}`);
      showToast('Responsabilidade adicionada!', 'success');
    };

    const toggleTask = (id) => {
      setChecklistItems(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const deleteTask = (id) => {
      setChecklistItems(prev => prev.filter(t => t.id !== id));
      showToast('Item removido do checklist.', 'info');
    };

    const resetAllDone = () => {
      setChecklistItems(prev => prev.map(t => ({ ...t, done: false })));
      showToast('Checklist reiniciado para um novo dia!', 'info');
    };

    const clearCompleted = () => {
      setChecklistItems(prev => prev.filter(t => !t.done));
      showToast('Tarefas concluídas limpas!', 'info');
    };

    const total = checklistItems.length;
    const doneCount = checklistItems.filter(t => t.done).length;
    const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    const filteredTasks = checklistItems.filter(t => {
      if (checklistFilter === 'pending') return !t.done;
      if (checklistFilter === 'done') return t.done;
      return true;
    });

    const priorityStyle = (p) => {
      if (p === 'Urgente') return 'bg-red-100 text-red-800 border-red-300';
      if (p === 'Alta') return 'bg-amber-100 text-amber-800 border-amber-300';
      return 'bg-blue-100 text-blue-800 border-blue-300';
    };

    return (
      <div className="space-y-4 w-full">
        {/* Cabeçalho e Progresso */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <h2 className="text-base font-black text-gray-800 flex items-center gap-2">
              <CheckSquare size={18} className="text-[#DA291C] shrink-0" /> Checklist de Responsabilidades & Rotina Operacional
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Liste e marque todas as suas responsabilidades do dia para garantir que nenhuma entrega, instalação ou retorno passe batido.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-black text-gray-700 shrink-0">{doneCount}/{total} concluídas ({pct}%)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={resetAllDone}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition flex items-center gap-1.5"
              title="Desmarcar todas para repetir a rotina do dia"
            >
              <RotateCcw size={14} /> Reiniciar Rotina Diária
            </button>
            {doneCount > 0 && (
              <button
                onClick={clearCompleted}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Limpar Concluídas
              </button>
            )}
          </div>
        </div>

        {/* Formulário de Nova Responsabilidade */}
        <form onSubmit={handleAddTask} className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nova Responsabilidade / Tarefa *</label>
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Ex: Ligar para cliente João confirmar portabilidade às 14h..."
              className="w-full p-2.5 border border-gray-300 rounded-xl text-sm outline-none"
            />
          </div>
          <div className="w-full md:w-40">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Categoria</label>
            <select value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white outline-none font-medium">
              <option value="Rotina Diária">Rotina Diária</option>
              <option value="Follow-up / Vendas">Follow-up / Vendas</option>
              <option value="Instalações">Instalações</option>
              <option value="Comissão">Comissão</option>
              <option value="Pós-Venda">Pós-Venda</option>
              <option value="Loja / Administrativo">Loja / Administrativo</option>
            </select>
          </div>
          <div className="w-full md:w-36">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Prioridade</label>
            <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white outline-none font-bold">
              <option value="Urgente">Urgente</option>
              <option value="Alta">Alta</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
          <div className="w-full md:w-40">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Prazo (Opcional)</label>
            <input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white outline-none" />
          </div>
          <button type="submit" className="w-full md:w-auto bg-[#DA291C] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-black text-sm shadow-sm transition flex items-center justify-center gap-1.5 shrink-0">
            <Plus size={18} /> Adicionar
          </button>
        </form>

        {/* Lista de Responsabilidades */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setChecklistFilter('all')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${checklistFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'}`}>Todas ({total})</button>
              <button onClick={() => setChecklistFilter('pending')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${checklistFilter === 'pending' ? 'bg-[#DA291C] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'}`}>Pendentes ({total - doneCount})</button>
              <button onClick={() => setChecklistFilter('done')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${checklistFilter === 'done' ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'}`}>Concluídas ({doneCount})</button>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm font-medium">
                Nenhuma responsabilidade nesta visão. Adicione acima para não esquecer nada!
              </div>
            ) : filteredTasks.map(task => (
              <div key={task.id} className={`p-4 flex items-center justify-between gap-4 transition hover:bg-gray-50 ${task.done ? 'bg-emerald-50/40' : ''}`}>
                <label className="flex items-center gap-3.5 flex-1 cursor-pointer">
                  <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {task.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">{task.category || 'Geral'}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${priorityStyle(task.priority)}`}>{task.priority || 'Normal'}</span>
                      {task.dueDate && (
                        <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                          <CalendarClock size={12} className="text-orange-500" /> {task.dueDate.split('-').reverse().join('/')}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition"
                  title="Excluir responsabilidade"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden m-0 w-full"
        style={{ background: darkMode ? 'linear-gradient(180deg, #991B1B 0%, #450A0A 40%, #0F1115 40%)' : 'linear-gradient(180deg, #DA291C 0%, #B71C1C 40%, #F3F4F6 40%)' }}
      >
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className="fixed top-4 right-4 z-50 px-3 py-2 rounded-xl bg-black/30 hover:bg-black/50 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm transition"
          title={darkMode ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          <span>{darkMode ? 'Claro' : 'Escuro'}</span>
        </button>
        <style>{`
          @media print {
            .no-print { display: none !important; }
            .print-expand { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
            body { background: white !important; }
            .fixed { display: none !important; } 
          }
        `}</style>
        
        <div className="relative z-10 w-full max-w-[380px] flex flex-col items-center">
          <div className="flex flex-col items-center justify-center mb-8 w-full"><h1 className="text-5xl font-black text-white tracking-tight">Claro Órion</h1><p className="text-white/80 text-sm mt-2 font-medium">Sistema de Vendas</p></div>

          <div 
            className="w-full bg-white flex flex-col border border-gray-100 px-6 py-8 sm:px-12 sm:py-10"
            style={{ borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08), 0 0 40px rgba(218, 41, 28, 0.05)' }}
          >
            <div className="text-center flex flex-col gap-1 mb-8">
              <h2 className="text-xl font-bold text-slate-900">Acesso Restrito</h2>
              <p className="text-sm text-gray-500">Insira suas credenciais para entrar</p>
            </div>
            
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Login</label>
                <input type="text" required value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition bg-gray-50 text-gray-800 text-sm" placeholder="Seu usuário" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Senha</label>
                <input type="password" required value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition bg-gray-50 text-gray-800 text-sm tracking-widest" placeholder="........" />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full font-bold py-4 rounded-xl text-white transition-transform active:scale-[0.98] text-sm" style={{ backgroundColor: '#DA291C', boxShadow: '0 8px 20px rgba(218, 41, 28, 0.3)' }}>Entrar no Sistema</button>
              </div>
            </form>
            <div className="mt-8 text-center border-t border-gray-100 pt-5">
              <p className="text-[11px] font-medium text-gray-400">Acesso restrito para funcionários autorizados.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="h-screen bg-gray-50 flex overflow-hidden w-full font-sans">
          <style>{`
          @media print {
            .no-print { display: none !important; }
            .print-expand { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
            body { background: white !important; }
            .fixed { display: none !important; } 
          }`}</style>
          
          {alertaDuplicidade && (
            <div className="fixed top-6 right-6 z-[200] bg-white border-l-4 border-red-500 shadow-[0_10px_25px_rgba(0,0,0,0.1)] p-4 rounded-r-lg max-w-sm flex items-start gap-3">
              <div className="text-red-500 mt-0.5"><AlertTriangle size={18} /></div>
              <div>
                <h4 className="font-bold text-red-600 text-sm mb-1">Atenção: Contato Duplicado</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Este número já está cadastrado na base sob o nome de <strong className="text-red-600">{alertaDuplicidade}</strong>. Não é possível inserir contatos em duplicidade.
                </p>
              </div>
              <button onClick={() => setAlertaDuplicidade(null)} className="text-gray-400 hover:text-red-600 ml-2"><X size={16} /></button>
            </div>
          )}
          {toast.show && (
              <div className="fixed bottom-20 right-6 z-[200]">
                  <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 font-bold text-sm max-w-sm ${toast.type === 'success' ? 'bg-[#25D366] text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : toast.type === 'warning' ? 'bg-white text-gray-800 border-l-4 border-red-500' : 'bg-gray-900 text-white'}`}>
                      {toast.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : toast.type === 'error' ? <X size={20} className="shrink-0" /> : <Bell size={20} className="shrink-0" />}
                      <span className="leading-relaxed">{toast.message}</span>
                  </div>
              </div>
          )}

          {closingSummaryModal.isOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[92vh] overflow-hidden">
                <div className="flex justify-between items-center p-5 bg-[#DA291C] text-white shrink-0">
                  <div>
                    <h3 className="text-lg font-black">Venda Fechada: Resumo & Instalação</h3>
                    <p className="text-xs text-red-100 font-medium">Cliente: {closingSummaryModal.clientName}</p>
                  </div>
                  <button onClick={() => setClosingSummaryModal(prev => ({ ...prev, isOpen: false }))} className="hover:bg-red-700 p-1.5 rounded-lg transition"><X size={20} /></button>
                </div>

                <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Resumo do Pacote Contratado</label>
                      <input
                        type="text"
                        value={closingSummaryModal.packageSummary}
                        onChange={e => setClosingSummaryModal(prev => ({ ...prev, packageSummary: e.target.value }))}
                        placeholder="Ex: Combo Multi 1 Giga + Pós 50GB"
                        className="w-full p-2.5 border border-gray-300 rounded-xl text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Valor Mensal (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={closingSummaryModal.monthlyValue}
                        onChange={e => setClosingSummaryModal(prev => ({ ...prev, monthlyValue: e.target.value }))}
                        placeholder="149,90"
                        className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Dia de Vencimento da Fatura</label>
                    <div className="flex flex-wrap gap-2">
                      {['05', '10', '15', '20', '25'].map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setClosingSummaryModal(prev => ({ ...prev, dueDay: d }))}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black border transition ${closingSummaryModal.dueDay === d ? 'bg-[#DA291C] text-white border-[#DA291C]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                          Dia {d}
                        </button>
                      ))}
                      <input
                        type="text"
                        value={closingSummaryModal.dueDay}
                        onChange={e => setClosingSummaryModal(prev => ({ ...prev, dueDay: e.target.value }))}
                        placeholder="Outro (ex: 10)"
                        className="flex-1 min-w-[90px] p-2 border border-gray-300 rounded-xl text-xs font-bold text-center outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={closingSummaryModal.includePortabilitySms}
                        onChange={e => setClosingSummaryModal(prev => ({ ...prev, includePortabilitySms: e.target.checked }))}
                      />
                      <span className="text-xs font-bold text-gray-800">Incluir aviso de SMS de Portabilidade</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={closingSummaryModal.requiresInstallation}
                        onChange={e => setClosingSummaryModal(prev => ({ ...prev, requiresInstallation: e.target.checked, installDate: prev.installDate || localISO() }))}
                      />
                      <span className="text-xs font-bold text-gray-800">Requer Instalação Técnica / Entrega (Internet ou TV Box)</span>
                    </label>
                  </div>

                  {closingSummaryModal.requiresInstallation && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                      <div>
                        <label className="block text-xs font-bold text-amber-900 uppercase mb-1">Data Agendada da Instalação</label>
                        <input
                          type="date"
                          value={closingSummaryModal.installDate}
                          onChange={e => setClosingSummaryModal(prev => ({ ...prev, installDate: e.target.value }))}
                          className="w-full p-2.5 border border-amber-300 rounded-xl text-sm bg-white outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-amber-900 uppercase mb-1">Período</label>
                        <div className="flex gap-2">
                          {['Manhã', 'Tarde'].map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setClosingSummaryModal(prev => ({ ...prev, installPeriod: p }))}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition ${closingSummaryModal.installPeriod === p ? 'bg-[#DA291C] text-white border-[#DA291C]' : 'bg-white text-gray-700 border-amber-300'}`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prévia da Mensagem de Confirmação</label>
                    <pre className="whitespace-pre-wrap text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-xl p-3.5 font-sans leading-relaxed max-h-48 overflow-y-auto">
                      {buildClosingSummaryText()}
                    </pre>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSaveAndSendClosingSummary(false)}
                    className="px-4 py-3 rounded-xl font-bold text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Apenas Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveAndSendClosingSummary(true)}
                    className="flex-1 bg-[#25D366] hover:bg-green-600 text-white py-3 px-4 rounded-xl font-black text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Send size={16} /> Enviar Resumo no WhatsApp & Salvar
                  </button>
                </div>
              </div>
            </div>
          )}

          {showStatusModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh] overflow-hidden">
                <div className="flex justify-between items-center p-5 bg-[#DA291C] text-white shrink-0">
                  <h3 className="text-lg font-black">Gerenciar Status</h3>
                  <button onClick={() => setShowStatusModal(false)} className="hover:bg-red-700 p-1.5 rounded-lg transition"><X size={20} /></button>
                </div>
                <div className="p-5 space-y-2 overflow-y-auto">
                  {statuses.map((st, i) => (
                    <div key={st} className="flex items-center gap-2">
                      <input defaultValue={st} onBlur={e => { if (e.target.value.trim() !== st) renameStatus(st, e.target.value); }} onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }} className="flex-1 p-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 outline-none" />
                      <button onClick={() => moveStatus(i, -1)} disabled={i === 0} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 font-black text-xs">▲</button>
                      <button onClick={() => moveStatus(i, 1)} disabled={i === statuses.length - 1} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 font-black text-xs">▼</button>
                      <button onClick={() => deleteStatus(st)} className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
                <form onSubmit={addStatus} className="p-5 bg-gray-50 border-t border-gray-100 flex gap-2 shrink-0">
                  <input value={newStatusName} onChange={e => setNewStatusName(e.target.value)} placeholder="Novo status..." className="flex-1 p-2.5 border border-gray-300 rounded-xl text-sm outline-none bg-white" />
                  <button type="submit" className="bg-[#DA291C] text-white px-5 rounded-xl font-bold text-sm hover:bg-red-700 transition flex items-center gap-1"><Plus size={16} /> Adicionar</button>
                </form>
              </div>
            </div>
          )}

          {showStatusRequiredModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[130] p-4">
              <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-red-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="bg-red-600 text-white p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <AlertTriangle size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Campo Obrigatório em Branco</h3>
                    <p className="text-xs text-red-100">Status do cliente não selecionado</p>
                  </div>
                  <button 
                    onClick={() => setShowStatusRequiredModal(false)} 
                    className="ml-auto text-white/80 hover:text-white p-1 rounded-lg transition"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-xl">
                    <p className="text-sm text-red-900 font-medium leading-relaxed">
                      Atenção: O campo <strong>Status do Cliente</strong> está na opção <em>"Escolha"</em>.
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Este campo ficou em branco. Por favor, selecione um status antes de prosseguir.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Selecione o Status do Cliente:</label>
                    <select 
                      value={proposalStatus} 
                      onChange={e => setProposalStatus(e.target.value)} 
                      className="w-full p-3 border-2 border-red-300 rounded-xl text-sm bg-white outline-none focus:border-red-500 font-bold text-gray-800 cursor-pointer shadow-sm"
                    >
                      <option value="">Escolha</option>
                      {statuses.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowStatusRequiredModal(false)} 
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                    >
                      Voltar
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        if (proposalStatus && proposalStatus !== 'Escolha' && proposalStatus !== 'Escolher') {
                          const chosen = proposalStatus;
                          setShowStatusRequiredModal(false);
                          executeSendAction(chosen);
                        } else {
                          showToast('Por favor, selecione um status válido!', 'warning');
                        }
                      }} 
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#DA291C] text-white hover:bg-red-700 transition shadow-md"
                    >
                      Confirmar e Enviar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BACKDROP MOBILE QUANDO SIDEBAR EXPANDIDA */}
          {!isSidebarMinimized && (
            <div
              onClick={() => setIsSidebarMinimized(true)}
              className="fixed inset-0 bg-black/40 z-[115] md:hidden no-print"
            />
          )}

          {/* SIDEBAR */}
          <div className={`${isSidebarMinimized ? 'w-14 md:w-20 relative z-20' : 'fixed md:relative inset-y-0 left-0 z-[120] md:z-20 w-64'} bg-gray-900 text-white flex flex-col shadow-xl shrink-0 no-print transition-all duration-200`}>
              <div className={`border-b border-gray-800 flex items-center ${isSidebarMinimized ? 'justify-center p-2.5 md:p-4 gap-1' : 'justify-between px-5 py-5'}`}>
                  {!isSidebarMinimized ? (
                    <div className="flex flex-col">
                      <h1 className="text-xl font-black text-white tracking-tight leading-none">ÓRION</h1>
                      <span className="text-gray-400 text-[9px] font-bold tracking-[0.2em] mt-1">SISTEMA DE VENDAS</span>
                    </div>
                  ) : (
                    <span className="hidden md:inline text-lg font-black text-[#DA291C] tracking-tight" title="Claro Órion">Ó</span>
                  )}
                  <button
                    onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
                    className="p-2 rounded-xl bg-gray-800 hover:bg-[#DA291C] text-gray-300 hover:text-white transition shadow-sm"
                    title={isSidebarMinimized ? 'Maximizar Menu Lateral' : 'Minimizar Menu Lateral'}
                  >
                    {isSidebarMinimized ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                  </button>
              </div>

              <nav className={`flex-1 overflow-y-auto py-4 md:py-5 space-y-1.5 ${isSidebarMinimized ? 'px-1.5 md:px-2.5' : 'px-4'}`}>
                  <button
                    onClick={() => { setActiveTab('clients'); if (window.innerWidth < 768) setIsSidebarMinimized(true); }}
                    title="Meus Leads & CRM"
                    className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-3'} rounded-xl transition font-bold text-sm ${activeTab === 'clients' ? 'bg-[#DA291C] text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <Users size={18} className="shrink-0"/>
                    {!isSidebarMinimized && <span>Meus Leads & CRM</span>}
                  </button>
                  <button
                    onClick={() => { setActiveTab('messages'); if (window.innerWidth < 768) setIsSidebarMinimized(true); }}
                    title="Propostas & Venda"
                    className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-3'} rounded-xl transition font-bold text-sm ${activeTab === 'messages' ? 'bg-[#DA291C] text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <MessageSquare size={18} className="shrink-0"/>
                    {!isSidebarMinimized && <span>Propostas & Venda</span>}
                  </button>
                  <button
                    onClick={() => { setActiveTab('installations'); if (window.innerWidth < 768) setIsSidebarMinimized(true); }}
                    title="Instalações"
                    className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-2 py-3 relative' : 'justify-between px-4 py-3'} rounded-xl transition font-bold text-sm ${activeTab === 'installations' ? 'bg-[#DA291C] text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <span className={`flex items-center ${isSidebarMinimized ? '' : 'space-x-3'}`}><Wrench size={18} className="shrink-0"/>{!isSidebarMinimized && <span>Instalações</span>}</span>
                    {pendingInstallationsCount > 0 && (
                      <span className={`${isSidebarMinimized ? 'absolute -top-1 -right-1 px-1.5 py-0 text-[9px]' : 'px-2 py-0.5 text-[11px]'} rounded-full font-black ${activeTab === 'installations' ? 'bg-white text-[#DA291C]' : 'bg-[#DA291C] text-white'}`}>
                        {pendingInstallationsCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => { setActiveTab('checklist'); if (window.innerWidth < 768) setIsSidebarMinimized(true); }}
                    title="Checklist"
                    className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-2 py-3 relative' : 'justify-between px-4 py-3'} rounded-xl transition font-bold text-sm ${activeTab === 'checklist' ? 'bg-[#DA291C] text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <span className={`flex items-center ${isSidebarMinimized ? '' : 'space-x-3'}`}><CheckSquare size={18} className="shrink-0"/>{!isSidebarMinimized && <span>Checklist</span>}</span>
                    {pendingChecklistCount > 0 && (
                      <span className={`${isSidebarMinimized ? 'absolute -top-1 -right-1 px-1.5 py-0 text-[9px]' : 'px-2 py-0.5 text-[11px]'} rounded-full font-black ${activeTab === 'checklist' ? 'bg-white text-[#DA291C]' : 'bg-amber-500 text-white'}`}>
                        {pendingChecklistCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => { setActiveTab('templates'); if (window.innerWidth < 768) setIsSidebarMinimized(true); }}
                    title="Padrões de Texto"
                    className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-3'} rounded-xl transition font-bold text-sm ${activeTab === 'templates' ? 'bg-[#DA291C] text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <FileText size={18} className="shrink-0"/>
                    {!isSidebarMinimized && <span>Padrões de Texto</span>}
                  </button>
                  <button
                    onClick={() => { setActiveTab('objections'); if (window.innerWidth < 768) setIsSidebarMinimized(true); }}
                    title="Quebra de Objeções"
                    className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-3'} rounded-xl transition font-bold text-sm ${activeTab === 'objections' ? 'bg-[#DA291C] text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <ShieldCheck size={18} className="shrink-0"/>
                    {!isSidebarMinimized && <span>Quebra de Objeções</span>}
                  </button>
                  <button
                    onClick={() => { setActiveTab('pricing'); if (window.innerWidth < 768) setIsSidebarMinimized(true); }}
                    title="Serviços e Preços"
                    className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-3'} rounded-xl transition font-bold text-sm ${activeTab === 'pricing' ? 'bg-[#DA291C] text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <DollarSign size={18} className="shrink-0"/>
                    {!isSidebarMinimized && <span>Serviços e Preços</span>}
                  </button>
                  <button
                    onClick={() => { setActiveTab('history'); if (window.innerWidth < 768) setIsSidebarMinimized(true); }}
                    title="Histórico"
                    className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-3'} rounded-xl transition font-bold text-sm ${activeTab === 'history' ? 'bg-[#DA291C] text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <History size={18} className="shrink-0"/>
                    {!isSidebarMinimized && <span>Histórico</span>}
                  </button>
                  <button
                    onClick={() => { setActiveTab('reports'); if (window.innerWidth < 768) setIsSidebarMinimized(true); }}
                    title="Relatórios"
                    className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-3'} rounded-xl transition font-bold text-sm ${activeTab === 'reports' ? 'bg-[#DA291C] text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <BarChart3 size={18} className="shrink-0"/>
                    {!isSidebarMinimized && <span>Relatórios</span>}
                  </button>
                  <button
                    onClick={() => { setActiveTab('backup'); if (window.innerWidth < 768) setIsSidebarMinimized(true); }}
                    title="Backup Local"
                    className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-3'} rounded-xl transition font-bold text-sm ${activeTab === 'backup' ? 'bg-[#DA291C] text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <Save size={18} className="shrink-0"/>
                    {!isSidebarMinimized && <span>Backup Local</span>}
                  </button>
              </nav>
              
              <div className="p-2 md:p-3 border-t border-gray-800">
                   <button
                     onClick={() => setIsAuthenticated(false)}
                     title="Sair do Sistema"
                     className={`w-full flex items-center justify-center ${isSidebarMinimized ? 'px-2 py-3' : 'space-x-2 px-4 py-3'} rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition font-bold text-sm`}
                   >
                     <LogOut size={18} className="shrink-0"/>
                     {!isSidebarMinimized && <span>Sair do Sistema</span>}
                   </button>
              </div>
          </div>

          <div className="flex-1 flex flex-col h-screen min-h-0 min-w-0 overflow-hidden">
              <header className="bg-white border-b border-gray-200 px-3 py-2.5 sm:px-6 sm:py-3 flex justify-between items-center gap-2 shrink-0 z-10 shadow-sm no-print">
                  <div className="flex items-center gap-2 min-w-0">
                      <h1 className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 truncate">
                          {activeTab === 'clients' && 'Gestão de Leads e CRM'}
                          {activeTab === 'messages' && 'Gerador de Propostas'}
                          {activeTab === 'installations' && 'Instalações & Comissão (24h Úteis)'}
                          {activeTab === 'checklist' && 'Checklist de Responsabilidades'}
                          {activeTab === 'templates' && 'Padrões de Texto'}
                          {activeTab === 'objections' && 'Quebra de Objeções'}
                          {activeTab === 'pricing' && 'Serviços e Preços'}
                          {activeTab === 'history' && 'Histórico de Atividades'}
                          {activeTab === 'reports' && 'Relatórios e Métricas'}
                          {activeTab === 'backup' && 'Backup Local'}
                      </h1>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
                      <button
                          onClick={() => setDarkMode(!darkMode)}
                          className={`px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700 text-amber-400 hover:bg-gray-700' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}
                          title={darkMode ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
                      >
                          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                          <span className="hidden sm:inline">{darkMode ? 'Claro' : 'Escuro'}</span>
                      </button>
                      <div className="relative">
                          <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 sm:p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition relative">
                              <Bell size={18} />
                              {unreadCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-[#DA291C] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">{unreadCount}</span>}
                          </button>
                          {showNotifications && (
                              <div className="absolute right-0 mt-3 w-[calc(100vw-80px)] sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                                  <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
                                      <h3 className="font-bold flex items-center gap-2"><Bell size={16}/> Notificações</h3>
                                      <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-white"><X size={18}/></button>
                                  </div>
                                  <div className="max-h-80 overflow-y-auto">
                                      {allActiveNotifs.length === 0 ? (
                                          <div className="p-6 text-center text-sm text-gray-500 font-medium">Nenhum alerta para hoje.</div>
                                      ) : (
                                          allActiveNotifs.map((n, i) => (
                                              <div key={i} className={`p-4 border-b border-gray-50 flex flex-col gap-2 hover:bg-gray-50 transition cursor-pointer ${getNotifStatus(n.notifKey) === 'unread' ? 'bg-red-50/50' : ''}`} onClick={() => { markAsRead(n.notifKey); if (n.type === 'comissao') { setActiveTab('installations'); setShowNotifications(false); } }}>
                                                  <div className="flex items-center gap-2">
                                                      {n.type === 'fid' ? <Star size={16} className="text-blue-500" /> : n.type === 'fol' ? <CalendarClock size={16} className="text-amber-500" /> : n.type === 'comissao' ? <DollarSign size={16} className="text-emerald-600" /> : <ShieldCheck size={16} className="text-red-500" />}
                                                      <span className={`font-bold text-sm ${n.type === 'comissao' ? 'bg-[#DA291C] text-white px-2 py-0.5 rounded-md text-xs font-black uppercase' : 'text-gray-800'}`}>{n.type === 'fid' ? 'Fidelidade vencendo' : n.type === 'fol' ? 'Retorno Agendado' : n.type === 'comissao' ? 'CONFERIR COMISSÃO' : 'PÓS-VENDA / INDICAÇÃO'}</span>
                                                  </div>
                                                  <div className="text-sm text-gray-600"><span className="font-bold text-gray-800">{n.name}</span> ({n.phone})</div>
                                                  <div className="text-xs text-gray-400 font-medium">Data: {new Date(n.date + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                                              </div>
                                          ))
                                      )}
                                  </div>
                              </div>
                          )}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#DA291C] flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md uppercase">
                            {getOperatorName(loginUser).replace('Operador ', '').replace('Operadora ', '').charAt(0)}
                          </div>
                          <div className="hidden md:block">
                              <p className="text-sm font-bold text-gray-800">{getOperatorName(loginUser)}</p>
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ativo na Loja</p>
                          </div>
                      </div>
                  </div>
              
              </header>

              <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-5 bg-gray-50 relative print-expand">
                  <div className="max-w-[1600px] mx-auto pb-20 print-expand">
                      {activeTab === 'clients' && renderClients()}
                      {activeTab === 'messages' && renderMessages()}
                      {activeTab === 'installations' && renderInstallations()}
                      {activeTab === 'checklist' && renderChecklist()}
                      {activeTab === 'templates' && renderTemplates()}
                      {activeTab === 'objections' && renderObjections()}
                      {activeTab === 'pricing' && renderPricing()}
                      {activeTab === 'history' && renderHistory()}
                      {activeTab === 'reports' && renderReports()}
                      {activeTab === 'backup' && renderBackup()}
                  </div>
              </main>
          </div>

          {/* BOTÃO FLUTUANTE CANTO INFERIOR DIREITO: ABRE/FECHA MENU LATERAL FLUTUANTE DE QUEBRA DE OBJEÇÕES */}
          <button
            type="button"
            onClick={() => setShowObjDrawer(prev => !prev)}
            className={`fixed bottom-4 right-3 sm:bottom-5 sm:right-5 z-[90] px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl flex items-center gap-2 font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all border-2 no-print ${showObjDrawer ? 'bg-[#DA291C] text-white border-white/40 ring-4 ring-red-500/30' : 'bg-gray-900 hover:bg-[#DA291C] text-white border-white/20'}`}
            title="Abrir/Fechar Menu Lateral Flutuante de Quebra de Objeções"
          >
            <ShieldCheck size={17} />
            <span>{showObjDrawer ? 'Fechar Objeções' : 'Quebra de Objeções'}</span>
          </button>

          {/* MENU LATERAL FLUTUANTE DIREITO: QUEBRA DE OBJEÇÕES COM BARRA DE PESQUISA */}
          {showObjDrawer && (
            <aside
              style={{ width: '400px', maxWidth: 'calc(100vw - 16px)', top: '60px', bottom: '68px', right: '8px' }}
              className="fixed bg-white z-[95] rounded-2xl shadow-2xl border-2 border-gray-200 flex flex-col overflow-hidden no-print"
            >
              <div className="p-4 bg-gray-900 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#DA291C] flex items-center justify-center text-white shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm leading-tight">Quebra de Objeções</h3>
                    <p className="text-[11px] text-gray-400">Menu lateral flutuante • Consulta rápida</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setShowObjDrawer(false); setActiveTab('objections'); }}
                    className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-[11px] font-bold transition"
                    title="Ir para aba de cadastro de objeções"
                  >
                    Gerenciar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowObjDrawer(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
                    title="Fechar menu flutuante"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Barra de Pesquisa */}
              <div className="p-3.5 border-b border-gray-200 bg-gray-50 shrink-0 space-y-2.5">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Pesquisar objeção (ex: caro, multa, pensar)..."
                    value={objSearch}
                    onChange={e => setObjSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-xl text-xs font-medium outline-none bg-white focus:border-[#DA291C]"
                  />
                  {objSearch && (
                    <button
                      type="button"
                      onClick={() => setObjSearch('')}
                      className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-700 p-0.5"
                      title="Limpar pesquisa"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {/* Filtro rápido por categorias */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setObjSearch('')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase shrink-0 border transition ${!objSearch ? 'bg-[#DA291C] text-white border-[#DA291C]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                  >
                    Todas ({objections.length})
                  </button>
                  {Array.from(new Set(objections.map(o => o.category || o.title).filter(Boolean))).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setObjSearch(objSearch === cat ? '' : cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 border transition ${objSearch.toLowerCase() === String(cat).toLowerCase() ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de Objeções */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3">
                {(() => {
                  const q = (objSearch || '').toLowerCase().trim();
                  const list = objections.filter(o => {
                    const cat = String(o.category || o.title || '').toLowerCase();
                    const kw = String(o.keyword || '').toLowerCase();
                    const scr = String(o.script || o.response || '').toLowerCase();
                    return !q || cat.includes(q) || kw.includes(q) || scr.includes(q);
                  });

                  if (list.length === 0) {
                    return (
                      <div className="text-center py-10 px-4 text-gray-400 text-xs font-medium">
                        Nenhuma objeção encontrada para "{objSearch}".
                      </div>
                    );
                  }

                  return list.map(o => {
                    const catLabel = stripEmojis(o.category || o.title || 'Objeção');
                    const scriptText = stripEmojis(o.script || o.response || '');
                    return (
                      <div key={o.id} className="p-3.5 rounded-xl border border-gray-200 hover:border-red-400 bg-white shadow-sm space-y-2.5 transition">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-[10px] uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-md">
                            {catLabel}
                          </span>
                        </div>
                        <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap border-l-2 border-[#DA291C] pl-2.5">
                          {scriptText}
                        </p>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(scriptText);
                              showToast('Argumento copiado para a área de transferência!', 'success');
                            }}
                            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition"
                          >
                            <Copy size={13} /> Copiar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setGeneratedMessage(prev => (prev ? prev + '\n\n' : '') + scriptText);
                              if (activeTab !== 'messages') setActiveTab('messages');
                              showToast('Argumento inserido na proposta!', 'success');
                            }}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-[#DA291C] border border-red-200 py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition"
                          >
                            <Plus size={13} /> Usar na Proposta
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </aside>
          )}
      </div>
  );
}