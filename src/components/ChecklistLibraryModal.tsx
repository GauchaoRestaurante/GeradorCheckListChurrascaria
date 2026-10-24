import React, { useState } from 'react';
import { ChecklistConfig } from '../types/checklist';
import {
  X,
  FolderOpen,
  Plus,
  Download,
  Upload,
  Copy,
  Trash2,
  FileCheck,
  Calendar,
} from 'lucide-react';
import {
  getSavedChecklists,
  saveChecklistToLibrary,
  deleteChecklistFromLibrary,
  exportChecklistToJson,
  readJsonFile,
} from '../utils/storage';
import {
  PRESET_GAUCHAO_RESTAURANTE,
  PRESET_VEHICLE_CHECKLIST,
  PRESET_TOOLS_CHECKLIST,
  PRESET_3_COLUMNS_CHECKLIST,
} from '../utils/presets';

interface ChecklistLibraryModalProps {
  isOpen: boolean;
  currentConfig: ChecklistConfig;
  onClose: () => void;
  onSelectChecklist: (config: ChecklistConfig) => void;
  onNewEmptyChecklist: () => void;
}

export const ChecklistLibraryModal: React.FC<ChecklistLibraryModalProps> = ({
  isOpen,
  currentConfig,
  onClose,
  onSelectChecklist,
  onNewEmptyChecklist,
}) => {
  const [library, setLibrary] = useState<ChecklistConfig[]>(getSavedChecklists());
  const [saveTitle, setSaveTitle] = useState('');
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const refreshLibrary = () => {
    setLibrary(getSavedChecklists());
  };

  const handleSaveCurrentAsNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTitle.trim()) return;

    const newConfig: ChecklistConfig = {
      ...currentConfig,
      id: `checklist-${Date.now()}`,
      title: saveTitle.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveChecklistToLibrary(newConfig);
    setLibrary(getSavedChecklists());
    setSaveTitle('');
    setIsSavingNew(false);
    onSelectChecklist(newConfig);
    setStatusMsg({ text: 'Checklist salvo na biblioteca com sucesso!', type: 'success' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Deseja realmente excluir o checklist "${title}"?`)) {
      const updated = deleteChecklistFromLibrary(id);
      setLibrary(updated);
    }
  };

  const handleDuplicate = (config: ChecklistConfig) => {
    const duplicated: ChecklistConfig = {
      ...config,
      id: `checklist-${Date.now()}`,
      title: `${config.title} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveChecklistToLibrary(duplicated);
    setLibrary(getSavedChecklists());
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await readJsonFile(file);
      imported.id = `imported-${Date.now()}`;
      saveChecklistToLibrary(imported);
      setLibrary(getSavedChecklists());
      onSelectChecklist(imported);
      setStatusMsg({ text: 'Checklist importado com sucesso!', type: 'success' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao importar arquivo.');
    }
  };

  const handleLoadPreset = (preset: ChecklistConfig) => {
    const clone = {
      ...preset,
      id: `checklist-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveChecklistToLibrary(clone);
    refreshLibrary();
    onSelectChecklist(clone);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <FolderOpen className="w-5 h-5 text-slate-800" />
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Biblioteca de Checklists
              </h3>
              <p className="text-xs text-slate-500">
                Gerencie, salve cópias ou importe modelos salvos no navegador
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Notification feedback */}
          {statusMsg && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          {/* Top Actions: Novo, Salvar Atual, Importar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onNewEmptyChecklist();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar Novo em Branco
              </button>

              <button
                onClick={() => setIsSavingNew(!isSavingNew)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Salvar Cópia Atual...
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                Importar (.json)
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleImportFile}
                />
              </label>

              <button
                onClick={() => exportChecklistToJson(currentConfig)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                title="Exportar arquivo para backup no computador"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar Atual
              </button>
            </div>
          </div>

          {/* Form para salvar novo nome */}
          {isSavingNew && (
            <form onSubmit={handleSaveCurrentAsNew} className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-blue-950">
                Nome para o novo checklist:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Ex: Checklist Almoxarifado, Inspeção Caminhão..."
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  className="flex-1 rounded-lg border border-blue-300 px-3 py-1.5 text-xs text-slate-900 bg-white focus:outline-hidden focus:border-blue-700"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
                >
                  Confirmar e Salvar
                </button>
              </div>
            </form>
          )}

          {/* Lista de Checklists Salvos */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Meus Checklists Salvos ({library.length})
            </h4>

            <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {library.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Nenhum checklist salvo ainda.
                </div>
              ) : (
                library.map((item) => {
                  const isActive = item.id === currentConfig.id;
                  const formattedDate = new Date(item.updatedAt || item.createdAt).toLocaleDateString('pt-BR');

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 flex items-center justify-between gap-4 transition-colors ${
                        isActive ? 'bg-slate-50 border-l-4 border-slate-900' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-slate-700 shrink-0" />
                          <h5 className="text-sm font-bold text-slate-900 truncate">
                            {item.title}
                          </h5>
                          {isActive && (
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                              Ativo agora
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>{item.items.length} itens</span>
                          <span>·</span>
                          <span>{item.columns} colunas</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formattedDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            onSelectChecklist(item);
                            onClose();
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          Abrir
                        </button>
                        <button
                          onClick={() => handleDuplicate(item)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Duplicar checklist"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => exportChecklistToJson(item)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Exportar arquivo"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 text-rose-500 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir checklist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Modelos Prontos de Referência */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Modelos Prontos de Fábrica (1 Página A4)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <button
                onClick={() => handleLoadPreset(PRESET_GAUCHAO_RESTAURANTE)}
                className="text-left p-3 rounded-xl border-2 border-slate-900 bg-slate-50 hover:bg-white hover:shadow-xs transition-all"
              >
                <span className="text-xs font-bold text-slate-950 block truncate">
                  Gauchão Restaurante
                </span>
                <span className="text-[11px] text-slate-600 mt-0.5 block">
                  12 itens · Boas Práticas & Cozinha
                </span>
              </button>

              <button
                onClick={() => handleLoadPreset(PRESET_VEHICLE_CHECKLIST)}
                className="text-left p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-400 transition-all"
              >
                <span className="text-xs font-bold text-slate-900 block truncate">
                  Veículo & Segurança
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  12 itens · 2 colunas ideais
                </span>
              </button>

              <button
                onClick={() => handleLoadPreset(PRESET_TOOLS_CHECKLIST)}
                className="text-left p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-400 transition-all"
              >
                <span className="text-xs font-bold text-slate-900 block truncate">
                  Oficina & Ferramentas
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  10 itens · 2 colunas legíveis
                </span>
              </button>

              <button
                onClick={() => handleLoadPreset(PRESET_3_COLUMNS_CHECKLIST)}
                className="text-left p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-400 transition-all"
              >
                <span className="text-xs font-bold text-slate-900 block truncate">
                  Geral Compacto
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  15 itens · 3 colunas
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
