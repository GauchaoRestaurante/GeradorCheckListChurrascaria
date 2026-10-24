import { ChecklistConfig } from '../types/checklist';
import {
  PRESET_GAUCHAO_RESTAURANTE,
  PRESET_VEHICLE_CHECKLIST,
  PRESET_TOOLS_CHECKLIST,
  PRESET_3_COLUMNS_CHECKLIST,
  resolveItemImage,
  logoGauchao,
} from './presets';

const ACTIVE_KEY = 'checklist_a4_active_config';
const LIBRARY_KEY = 'checklist_a4_saved_library';

export function getInitialChecklist(): ChecklistConfig {
  try {
    const saved = localStorage.getItem(ACTIVE_KEY);
    if (saved) {
      const parsed: ChecklistConfig = JSON.parse(saved);
      // Garante que o nome da empresa e logo estejam definidos
      if (!parsed.companyName) {
        parsed.companyName = 'Gauchão Restaurante e Cozinha Industrial';
        parsed.showCompanyName = true;
      }
      if (!parsed.companyLogoUrl) {
        parsed.companyLogoUrl = logoGauchao;
        parsed.showCompanyLogo = true;
      } else {
        parsed.companyLogoUrl = resolveItemImage(parsed.companyLogoUrl);
      }
      if (!parsed.headerSignBox) {
        parsed.headerSignBox = { show: true, dateLabel: 'DATA:', signatureLabel: 'ASSINATURA:' };
      }
      // Resolve imagens de itens padrão se existirem
      if (Array.isArray(parsed.items)) {
        parsed.items = parsed.items.map((item) => ({
          ...item,
          imageUrl: resolveItemImage(item.imageUrl),
        }));
      }
      return parsed;
    }
  } catch (e) {
    console.error('Erro ao recuperar checklist ativo:', e);
  }
  return PRESET_GAUCHAO_RESTAURANTE;
}

export function saveActiveChecklist(config: ChecklistConfig): void {
  try {
    const updated = { ...config, updatedAt: new Date().toISOString() };
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(updated));
    
    // Também atualiza na biblioteca se já existir
    const library = getSavedChecklists();
    const index = library.findIndex(item => item.id === config.id);
    if (index >= 0) {
      library[index] = updated;
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
    }
  } catch (e) {
    console.error('Erro ao salvar checklist ativo:', e);
  }
}

export function getSavedChecklists(): ChecklistConfig[] {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Erro ao listar checklists:', e);
  }
  // Se estiver vazio pela primeira vez, inicializa com os 4 modelos
  const defaults = [
    PRESET_GAUCHAO_RESTAURANTE,
    PRESET_VEHICLE_CHECKLIST,
    PRESET_TOOLS_CHECKLIST,
    PRESET_3_COLUMNS_CHECKLIST,
  ];
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(defaults));
  return defaults;
}

export function saveChecklistToLibrary(config: ChecklistConfig): ChecklistConfig[] {
  const library = getSavedChecklists();
  const index = library.findIndex(item => item.id === config.id);
  const updated = { ...config, updatedAt: new Date().toISOString() };
  
  if (index >= 0) {
    library[index] = updated;
  } else {
    library.unshift(updated);
  }
  
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
  return library;
}

export function deleteChecklistFromLibrary(id: string): ChecklistConfig[] {
  const library = getSavedChecklists().filter(item => item.id !== id);
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
  return library;
}

export function exportChecklistToJson(config: ChecklistConfig): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
  const downloadAnchor = document.createElement('a');
  const sanitizedTitle = (config.title || 'checklist').toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${sanitizedTitle}_a4.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function readJsonFile(file: File): Promise<ChecklistConfig> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!parsed.items || !Array.isArray(parsed.items)) {
          throw new Error('Arquivo JSON inválido. O formato deve conter uma lista de itens.');
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Falha ao ler arquivo.'));
    reader.readAsText(file);
  });
}
