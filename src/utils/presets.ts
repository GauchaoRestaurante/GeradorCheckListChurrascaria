import { ChecklistConfig } from '../types/checklist';
import logoGauchao from '../assets/images/gauchao_logo_1792677788402.jpg';
import imgExtintor from '../assets/images/checklist_extintor_1792676435299.jpg';
import imgFerramentas from '../assets/images/checklist_ferramentas_1792676435301.jpg';
import imgLanterna from '../assets/images/checklist_lanterna_1792676436480.jpg';
import imgCapacete from '../assets/images/checklist_capacete_1792676436084.jpg';

export { logoGauchao, imgExtintor, imgFerramentas, imgLanterna, imgCapacete };

// Mapeador resiliente: garante que caminhos salvos em localStorage resolvam para os assets do Vite no GitHub Pages
export function resolveItemImage(url?: string): string {
  if (!url) return '';
  if (url.includes('gauchao_logo_1792677788402')) return logoGauchao;
  if (url.includes('checklist_extintor_1792676435299')) return imgExtintor;
  if (url.includes('checklist_ferramentas_1792676435301')) return imgFerramentas;
  if (url.includes('checklist_lanterna_1792676436480')) return imgLanterna;
  if (url.includes('checklist_capacete_1792676436084')) return imgCapacete;
  return url;
}

// Inline high-contrast SVG placeholders for items without local photography
export function createSvgThumbnail(label: string, iconType: string, bgColor = '#f8fafc', strokeColor = '#0f172a'): string {
  const icons: Record<string, string> = {
    car: `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.7C2 10.9 2 11.2 2 11.5V16c0 .6.4 1 1 1h2m0 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0m6 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
    triangle: `<polygon points="12 3 22 21 2 21 12 3" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="12" y1="10" x2="12" y2="14" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="18" r="0.75" fill="${strokeColor}"/>`,
    oil: `<path d="M12 2v4m0 0a6 6 0 1 0 6 6c0-2-2-4.5-6-10z" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
    wheel: `<circle cx="12" cy="12" r="9" stroke="${strokeColor}" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="3" stroke="${strokeColor}" stroke-width="2" fill="none"/><path d="M12 3v6m0 6v6M3 12h6m6 0h6" stroke="${strokeColor}" stroke-width="2"/>`,
    medical: `<rect x="3" y="6" width="18" height="15" rx="2" stroke="${strokeColor}" stroke-width="2" fill="none"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M12 10v6m-3-3h6" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round"/>`,
    wrench: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="${strokeColor}" stroke-width="2" fill="none"/>`,
    gauge: `<circle cx="12" cy="12" r="9" stroke="${strokeColor}" stroke-width="2" fill="none"/><path d="m14 10-3 3" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="1.5" fill="${strokeColor}"/>`,
    key: `<circle cx="7.5" cy="15.5" r="4.5" stroke="${strokeColor}" stroke-width="2" fill="none"/><path d="m11 12 7-7m-2 0 3 3m-4 1 2 2" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round"/>`,
    battery: `<rect x="2" y="7" width="16" height="10" rx="2" stroke="${strokeColor}" stroke-width="2" fill="none"/><line x1="20" y1="10" x2="20" y2="14" stroke="${strokeColor}" stroke-width="2"/><line x1="6" y1="12" x2="10" y2="12" stroke="${strokeColor}" stroke-width="2"/><line x1="8" y1="10" x2="8" y2="14" stroke="${strokeColor}" stroke-width="2"/>`,
    clipboard: `<rect x="4" y="4" width="16" height="16" rx="2" stroke="${strokeColor}" stroke-width="2" fill="none"/><path d="M9 2h6a1 1 0 0 1 1 1v2H8V3a1 1 0 0 1 1-1z" stroke="${strokeColor}" stroke-width="2" fill="none"/><polyline points="8 12 11 15 16 9" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  };

  const iconSvg = icons[iconType] || icons.clipboard;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" fill="${bgColor}"/>
    ${iconSvg}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const PRESET_VEHICLE_CHECKLIST: ChecklistConfig = {
  id: 'preset-veiculo-seguranca',
  title: 'CHECKLIST DE INSPEÇÃO E SEGURANÇA',
  subtitle: 'Conferência obrigatória antes da saída do veículo ou início do turno',
  companyLogoUrl: logoGauchao,
  showCompanyLogo: true,
  companyName: 'Gauchão Restaurante e Cozinha Industrial',
  showCompanyName: true,
  columns: 2,
  fontSize: 'lg',
  photoSize: 'md',
  itemSpacing: 'balanced',
  checkboxStyle: 'standard',
  showItemNumbers: true,
  highContrast: true,
  showNotesArea: true,
  notesTitle: 'Observações / Ocorrências:',
  notesLines: 2,
  headerFields: {
    showDate: true,
    dateLabel: 'Data:',
    showInspector: true,
    inspectorLabel: 'Responsável:',
    showSignature: true,
    signatureLabel: 'Assinatura:',
    showLocation: true,
    locationLabel: 'Placa / Veículo:',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: [
    {
      id: 'item-1',
      title: 'Extintor de Incêndio',
      subtitle: 'Pressão no verde e lacre intacto',
      imageUrl: imgExtintor,
      checked: false,
    },
    {
      id: 'item-2',
      title: 'Kit de Ferramentas e Chaves',
      subtitle: 'Alicate, chaves de fenda e boca',
      imageUrl: imgFerramentas,
      checked: false,
    },
    {
      id: 'item-3',
      title: 'Lanterna Portátil Recarregável',
      subtitle: 'Com bateria carregada e funcionando',
      imageUrl: imgLanterna,
      checked: false,
    },
    {
      id: 'item-4',
      title: 'Capacete e Luvas de Proteção (EPI)',
      subtitle: 'Em bom estado, sem trincas',
      imageUrl: imgCapacete,
      checked: false,
    },
    {
      id: 'item-5',
      title: 'Triângulo e Macaco Hidráulico',
      subtitle: 'Verificar alavanca e funcionamento',
      imageUrl: createSvgThumbnail('Triângulo', 'triangle', '#fee2e2', '#b91c1c'),
      checked: false,
    },
    {
      id: 'item-6',
      title: 'Nível de Óleo do Motor',
      subtitle: 'Verificar na vareta entre Min e Max',
      imageUrl: createSvgThumbnail('Óleo', 'oil', '#fef3c7', '#b45309'),
      checked: false,
    },
    {
      id: 'item-7',
      title: 'Pneu Estepe e Calibragem',
      subtitle: 'Sulcos sem desgaste excessivo',
      imageUrl: createSvgThumbnail('Estepe', 'wheel', '#f1f5f9', '#1e293b'),
      checked: false,
    },
    {
      id: 'item-8',
      title: 'Kit Primeiros Socorros',
      subtitle: 'Gaze, ataduras, antisséptico',
      imageUrl: createSvgThumbnail('Primeiros Socorros', 'medical', '#ecfdf5', '#047857'),
      checked: false,
    },
    {
      id: 'item-9',
      title: 'Faróis e Lanternas de Alerta',
      subtitle: 'Luz alta, baixa e pisca-alerta',
      imageUrl: createSvgThumbnail('Faróis', 'gauge', '#fef9c3', '#a16207'),
      checked: false,
    },
    {
      id: 'item-10',
      title: 'Chave Reserva e Documentos',
      subtitle: 'Documento do veículo e CRLV em dia',
      imageUrl: createSvgThumbnail('Documentos', 'key', '#ede9fe', '#6d28d9'),
      checked: false,
    },
    {
      id: 'item-11',
      title: 'Carga da Bateria e Cabos',
      subtitle: 'Cabos de chupeta e terminais limpos',
      imageUrl: createSvgThumbnail('Bateria', 'battery', '#e0f2fe', '#0369a1'),
      checked: false,
    },
    {
      id: 'item-12',
      title: 'Limpeza e Estado Geral',
      subtitle: 'Sem avarias externas ou vazamentos',
      imageUrl: createSvgThumbnail('Geral', 'car', '#f3f4f6', '#374151'),
      checked: false,
    },
  ],
};

export const PRESET_TOOLS_CHECKLIST: ChecklistConfig = {
  id: 'preset-ferramentas-oficina',
  title: 'CONFERÊNCIA DE FERRAMENTAS E BANCADA',
  subtitle: 'Verificação dos itens na entrega e devolução da bancada de serviço',
  columns: 2,
  fontSize: 'lg',
  photoSize: 'md',
  itemSpacing: 'balanced',
  checkboxStyle: 'standard',
  showItemNumbers: true,
  highContrast: true,
  showNotesArea: true,
  notesTitle: 'Itens Faltantes ou Danificados:',
  notesLines: 2,
  headerFields: {
    showDate: true,
    dateLabel: 'Data:',
    showInspector: true,
    inspectorLabel: 'Operador / Técnico:',
    showSignature: true,
    signatureLabel: 'Assinatura:',
    showLocation: true,
    locationLabel: 'Bancada / Caixa Nº:',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: [
    {
      id: 't-1',
      title: 'Jogo de Chaves e Alicates',
      subtitle: 'Verificar alicate universal e de bico',
      imageUrl: imgFerramentas,
      checked: false,
    },
    {
      id: 't-2',
      title: 'Lanterna de Inspeção LED',
      subtitle: 'Bateria recarregada para turno',
      imageUrl: imgLanterna,
      checked: false,
    },
    {
      id: 't-3',
      title: 'Extintor da Área de Trabalho',
      subtitle: 'Desobstruído e pronto para uso',
      imageUrl: imgExtintor,
      checked: false,
    },
    {
      id: 't-4',
      title: 'Equipamento de Proteção Individual',
      subtitle: 'Capacete com carneira e luvas',
      imageUrl: imgCapacete,
      checked: false,
    },
    {
      id: 't-5',
      title: 'Torquímetro e Soquetes',
      subtitle: 'Calibrado e guardado no estojo',
      imageUrl: createSvgThumbnail('Torquímetro', 'wrench', '#f1f5f9', '#1e293b'),
      checked: false,
    },
    {
      id: 't-6',
      title: 'Manômetro de Medição',
      subtitle: 'Sem trincas no visor analógico',
      imageUrl: createSvgThumbnail('Manômetro', 'gauge', '#fef3c7', '#b45309'),
      checked: false,
    },
    {
      id: 't-7',
      title: 'Baterias Sobressalentes',
      subtitle: 'Carregador conectado e funcional',
      imageUrl: createSvgThumbnail('Bateria', 'battery', '#e0f2fe', '#0369a1'),
      checked: false,
    },
    {
      id: 't-8',
      title: 'Caixa de Parafusos e Fixadores',
      subtitle: 'Organizada por bitola e tipo',
      imageUrl: createSvgThumbnail('Estojo', 'triangle', '#ede9fe', '#6d28d9'),
      checked: false,
    },
    {
      id: 't-9',
      title: 'Kit de Primeiros Socorros Local',
      subtitle: 'Materiais dentro do prazo de validade',
      imageUrl: createSvgThumbnail('Primeiros Socorros', 'medical', '#ecfdf5', '#047857'),
      checked: false,
    },
    {
      id: 't-10',
      title: 'Chaves de Acesso e Cadeados',
      subtitle: 'Devolvidos ao quadro de chaves',
      imageUrl: createSvgThumbnail('Chaves', 'key', '#fef9c3', '#a16207'),
      checked: false,
    },
  ],
};

export const PRESET_3_COLUMNS_CHECKLIST: ChecklistConfig = {
  id: 'preset-3-colunas-compacto',
  title: 'CHECKLIST GERAL DE VERIFICAÇÃO',
  subtitle: 'Layout otimizado com 3 colunas para conferência rápida de múltiplos itens',
  columns: 3,
  fontSize: 'base',
  photoSize: 'sm',
  itemSpacing: 'compact',
  checkboxStyle: 'standard',
  showItemNumbers: true,
  highContrast: true,
  showNotesArea: true,
  notesTitle: 'Observações:',
  notesLines: 2,
  headerFields: {
    showDate: true,
    dateLabel: 'Data:',
    showInspector: true,
    inspectorLabel: 'Responsável:',
    showSignature: true,
    signatureLabel: 'Visto:',
    showLocation: true,
    locationLabel: 'Setor:',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: [
    { id: 'c-1', title: 'Extintor PQS', subtitle: 'Manômetro ok', imageUrl: imgExtintor },
    { id: 'c-2', title: 'Ferramentas', subtitle: 'Kit completo', imageUrl: imgFerramentas },
    { id: 'c-3', title: 'Lanterna', subtitle: 'Bateria 100%', imageUrl: imgLanterna },
    { id: 'c-4', title: 'Capacete / Luvas', subtitle: 'EPIs limpos', imageUrl: imgCapacete },
    { id: 'c-5', title: 'Triângulo', subtitle: 'Sinalização', imageUrl: createSvgThumbnail('Triângulo', 'triangle', '#fee2e2', '#b91c1c') },
    { id: 'c-6', title: 'Nível Óleo', subtitle: 'Vareta motor', imageUrl: createSvgThumbnail('Óleo', 'oil', '#fef3c7', '#b45309') },
    { id: 'c-7', title: 'Pneu Reserva', subtitle: 'Calibrado', imageUrl: createSvgThumbnail('Estepe', 'wheel', '#f1f5f9', '#1e293b') },
    { id: 'c-8', title: 'Estojo Socorro', subtitle: 'Completo', imageUrl: createSvgThumbnail('Médico', 'medical', '#ecfdf5', '#047857') },
    { id: 'c-9', title: 'Chaves Acesso', subtitle: 'No quadro', imageUrl: createSvgThumbnail('Chave', 'key', '#ede9fe', '#6d28d9') },
    { id: 'c-10', title: 'Baterias', subtitle: 'Recarregadas', imageUrl: createSvgThumbnail('Bateria', 'battery', '#e0f2fe', '#0369a1') },
    { id: 'c-11', title: 'Medidor Pressão', subtitle: 'Calibrado', imageUrl: createSvgThumbnail('Medidor', 'gauge', '#fef9c3', '#a16207') },
    { id: 'c-12', title: 'Documentos', subtitle: 'Em ordem', imageUrl: createSvgThumbnail('Doc', 'car', '#f3f4f6', '#374151') },
    { id: 'c-13', title: 'Trava Segurança', subtitle: 'Testada', imageUrl: createSvgThumbnail('Trava', 'wrench', '#f1f5f9', '#1e293b') },
    { id: 'c-14', title: 'Cabo Auxiliar', subtitle: 'Sem cortes', imageUrl: createSvgThumbnail('Cabo', 'battery', '#e0f2fe', '#0369a1') },
    { id: 'c-15', title: 'Área Limpa', subtitle: 'Organizada', imageUrl: createSvgThumbnail('Área', 'clipboard', '#ecfdf5', '#047857') },
  ],
};

export const PRESET_GAUCHAO_RESTAURANTE: ChecklistConfig = {
  id: 'preset-gauchao-cozinha-industrial',
  title: 'CHECKLIST DIÁRIO DE BOAS PRÁTICAS & HIGIENE',
  subtitle: 'Conferência obrigatória de abertura/troca de turno da Cozinha Industrial',
  companyLogoUrl: logoGauchao,
  showCompanyLogo: true,
  companyName: 'Gauchão Restaurante e Cozinha Industrial',
  showCompanyName: true,
  columns: 2,
  fontSize: 'lg',
  photoSize: 'md',
  imageFitMode: 'contain',
  itemSpacing: 'balanced',
  checkboxStyle: 'standard',
  showItemNumbers: true,
  highContrast: true,
  headerSignBox: {
    show: true,
    dateLabel: 'DATA:',
    signatureLabel: 'ASSINATURA:',
  },
  showSimpleSection: true,
  simpleSectionTitle: 'ROTINA OPERACIONAL & HIGIENE (ASSINALAR À CANETA)',
  simpleColumns: 2,
  showNotesArea: true,
  notesTitle: 'Ocorrências / Desvios Encontrados:',
  notesLines: 2,
  headerFields: {
    showDate: true,
    dateLabel: 'Data:',
    showInspector: true,
    inspectorLabel: 'Nutricionista / Resp.:',
    showSignature: true,
    signatureLabel: 'Assinatura:',
    showLocation: true,
    locationLabel: 'Turno / Setor:',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: [
    {
      id: 'g-1',
      title: 'Temperatura das Câmaras e Geladeiras',
      subtitle: 'Conferir termômetro (Resfriados < 4°C, Congelados < -18°C)',
      imageUrl: createSvgThumbnail('Temperatura', 'gauge', '#e0f2fe', '#0369a1'),
      type: 'photo',
      checked: false,
    },
    {
      id: 'g-2',
      title: 'EPIs e Higiene Pessoal da Equipe',
      subtitle: 'Touca, uniforme limpo, unhas curtas e luvas descartáveis',
      imageUrl: imgCapacete,
      type: 'photo',
      checked: false,
    },
    {
      id: 'g-3',
      title: 'Higienização de Bancadas e Tábuas',
      subtitle: 'Sanitização com álcool 70% e separação por cores',
      imageUrl: createSvgThumbnail('Higienização', 'medical', '#ecfdf5', '#047857'),
      type: 'photo',
      checked: false,
    },
    {
      id: 'g-4',
      title: 'Etiquetagem e Validade dos Alimentos',
      subtitle: 'Todos os potes com data de abertura e validade legíveis',
      imageUrl: createSvgThumbnail('Validade', 'key', '#fef9c3', '#a16207'),
      type: 'photo',
      checked: false,
    },
    {
      id: 'g-5',
      title: 'Qualidade do Óleo das Fritadeiras',
      subtitle: 'Óleo límpido, sem fumaça excessiva ou alteração de odor',
      imageUrl: createSvgThumbnail('Óleo', 'oil', '#fef3c7', '#b45309'),
      type: 'photo',
      checked: false,
    },
    {
      id: 'g-6',
      title: 'Extintores e Saídas de Emergência',
      subtitle: 'Desobstruídos, manômetro no verde e lacre intacto',
      imageUrl: imgExtintor,
      type: 'photo',
      checked: false,
    },
    {
      id: 'g-7',
      title: 'Pias de Higienização das Mãos',
      subtitle: 'Sabonete bactericida, papel toalha e lixeira com pedal',
      imageUrl: createSvgThumbnail('Pia', 'medical', '#e0f2fe', '#0369a1'),
      type: 'photo',
      checked: false,
    },
    {
      id: 'g-8',
      title: 'Coifas e Sistema de Exaustão',
      subtitle: 'Filtros limpos, funcionando sem ruídos anormais',
      imageUrl: createSvgThumbnail('Exaustão', 'wrench', '#f1f5f9', '#1e293b'),
      type: 'photo',
      checked: false,
    },
    {
      id: 'g-9',
      title: 'Coleta de Amostras do Cardápio do Dia',
      subtitle: 'Amostras de 100g identificadas no freezer por 72 horas',
      type: 'simple',
      checked: false,
    },
    {
      id: 'g-10',
      title: 'Lixeiras com Tampa e Acionamento por Pedal',
      subtitle: 'Sacos plásticos íntegros e tampas fechadas',
      type: 'simple',
      checked: false,
    },
    {
      id: 'g-11',
      title: 'Caixas de Gordura e Ralos Sifonados',
      subtitle: 'Telas milimétricas no lugar, limpas e sem refluxo de água',
      type: 'simple',
      checked: false,
    },
    {
      id: 'g-12',
      title: 'Fechamento dos Registros de Gás e Energia',
      subtitle: 'Conferência obrigatória ao término das atividades',
      type: 'simple',
      checked: false,
    },
  ],
};

