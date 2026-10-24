import React, { useState, useEffect, useRef } from 'react';
import {
  ChecklistConfig,
  ChecklistItem,
  ColumnCount,
  FontSizeOption,
  PhotoSizeOption,
  ItemSpacingOption,
  CheckboxStyle,
  ImageFitMode,
} from './types/checklist';
import { ChecklistSheet } from './components/ChecklistSheet';
import { CameraModal } from './components/CameraModal';
import { ItemEditorModal } from './components/ItemEditorModal';
import { ChecklistLibraryModal } from './components/ChecklistLibraryModal';
import { PageFitIndicator, calculateA4Fit } from './components/PageFitIndicator';
import {
  getInitialChecklist,
  saveActiveChecklist,
  saveChecklistToLibrary,
} from './utils/storage';
import {
  Printer,
  FolderOpen,
  Plus,
  Settings,
  ListOrdered,
  Eye,
  Camera,
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Info,
  Type,
  LayoutGrid,
  CheckSquare,
  Image as ImageIcon,
} from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<ChecklistConfig>(getInitialChecklist);
  const [activeTab, setActiveTab] = useState<'items' | 'layout'>('items');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Modals state
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [cameraTargetItem, setCameraTargetItem] = useState<ChecklistItem | null>(null);
  const [showPrintTips, setShowPrintTips] = useState(false);

  // Auto-save on every change
  useEffect(() => {
    saveActiveChecklist(config);
  }, [config]);

  // Handle Item Operations
  const handleAddItem = (type: 'photo' | 'simple' = 'photo') => {
    const isPhoto = type === 'photo';
    const photoCount = config.items.filter((i) => (i.type || 'photo') === 'photo').length;
    const simpleCount = config.items.filter((i) => i.type === 'simple').length;

    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      title: isPhoto ? `Novo Item com Foto ${photoCount + 1}` : `Item de Verificação ${simpleCount + 1}`,
      subtitle: '',
      imageUrl: '',
      checked: false,
      type,
    };
    setConfig((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    setEditingItem(newItem);
    setIsEditorOpen(true);
  };

  const handleUpdateItem = (updated: ChecklistItem) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === updated.id ? updated : i)),
    }));
  };

  const handleDeleteItem = (itemId: string) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== itemId),
    }));
  };

  // Mover item para cima ou para baixo DENTRO do seu respectivo bloco (independente)
  const handleMoveItemWithinGroup = (itemId: string, direction: 'up' | 'down') => {
    const item = config.items.find((i) => i.id === itemId);
    if (!item) return;
    const isSimple = item.type === 'simple';
    const groupItems = config.items.filter((i) =>
      isSimple ? i.type === 'simple' : (i.type || 'photo') === 'photo'
    );
    const indexInGroup = groupItems.findIndex((i) => i.id === itemId);
    const targetIndexInGroup = direction === 'up' ? indexInGroup - 1 : indexInGroup + 1;
    if (targetIndexInGroup < 0 || targetIndexInGroup >= groupItems.length) return;

    const newGroup = [...groupItems];
    const temp = newGroup[indexInGroup];
    newGroup[indexInGroup] = newGroup[targetIndexInGroup];
    newGroup[targetIndexInGroup] = temp;

    const otherItems = config.items.filter((i) =>
      isSimple ? (i.type || 'photo') === 'photo' : i.type === 'simple'
    );
    const combined = isSimple ? [...otherItems, ...newGroup] : [...newGroup, ...otherItems];
    setConfig((prev) => ({ ...prev, items: combined }));
  };

  // Converter item entre Bloco com Foto e Bloco sem Foto
  const handleToggleItemType = (itemId: string) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((i) => {
        if (i.id !== itemId) return i;
        const newType = i.type === 'simple' ? 'photo' : 'simple';
        return {
          ...i,
          type: newType,
          imageUrl: newType === 'simple' ? '' : i.imageUrl,
        };
      }),
    }));
  };

  const handleToggleCheck = (itemId: string) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === itemId ? { ...i, checked: !i.checked } : i
      ),
    }));
  };

  const handleToggleItemSpan = (itemId: string) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === itemId ? { ...i, layoutSpan: i.layoutSpan === 2 ? 1 : 2 } : i
      ),
    }));
  };

  const handleClearAllChecks = () => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((i) => ({ ...i, checked: false })),
    }));
  };

  // Quick photo upload from file picker
  const handleQuickUploadPhoto = (itemId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setConfig((prev) => ({
          ...prev,
          items: prev.items.map((i) =>
            i.id === itemId ? { ...i, imageUrl: e.target?.result as string } : i
          ),
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Camera capture
  const handleOpenCameraForItem = (item: ChecklistItem) => {
    setCameraTargetItem(item);
    setIsCameraOpen(true);
  };

  const handleCameraCaptureConfirm = (imageDataUrl: string) => {
    if (cameraTargetItem) {
      setConfig((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.id === cameraTargetItem.id ? { ...i, imageUrl: imageDataUrl } : i
        ),
      }));
    }
  };

  // Upload do logotipo da empresa
  const handleUploadCompanyLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setConfig((prev) => ({
          ...prev,
          companyLogoUrl: e.target?.result as string,
          showCompanyLogo: true,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Auto-fit function for 1 A4 Page: calibra com precisão considerando logotipo, fotos e itens simples
  const handleAutoFitA4 = () => {
    const photoCount = config.items.filter((i) => (i.type || 'photo') === 'photo').length;
    const simpleCount = config.items.filter((i) => i.type === 'simple').length;
    const hasCompanyHeader = config.showCompanyLogo || config.showCompanyName;

    let newColumns: ColumnCount = config.columns;
    let newFontSize: FontSizeOption = config.fontSize;
    let newPhotoSize: PhotoSizeOption = config.photoSize;
    let newItemSpacing: ItemSpacingOption = config.itemSpacing;
    let newNotesLines = config.notesLines;
    let newSimpleColumns = config.simpleColumns || 2;

    // Ajuste das colunas para os itens simples (sem foto)
    if (simpleCount > 6) {
      newSimpleColumns = 3;
    } else if (simpleCount > 3) {
      newSimpleColumns = 2;
    } else {
      newSimpleColumns = 2;
    }

    if (hasCompanyHeader) {
      if (photoCount <= 8 && simpleCount <= 4) {
        newColumns = 2;
        newFontSize = 'lg';
        newPhotoSize = 'md';
        newItemSpacing = 'balanced';
        newNotesLines = 2;
      } else if (photoCount <= 11) {
        newColumns = 2;
        newFontSize = 'base';
        newPhotoSize = 'md';
        newItemSpacing = 'compact';
        newNotesLines = 2;
      } else if (photoCount <= 13) {
        newColumns = 2;
        newFontSize = 'base';
        newPhotoSize = 'sm';
        newItemSpacing = 'compact';
        newNotesLines = 1;
      } else if (photoCount <= 18) {
        newColumns = 3;
        newFontSize = 'base';
        newPhotoSize = 'sm';
        newItemSpacing = 'compact';
        newNotesLines = 1;
      } else {
        newColumns = 3;
        newFontSize = 'sm';
        newPhotoSize = 'sm';
        newItemSpacing = 'compact';
        newNotesLines = 1;
      }
    } else {
      if (photoCount <= 10 && simpleCount <= 4) {
        newColumns = 2;
        newFontSize = 'lg';
        newPhotoSize = 'md';
        newItemSpacing = 'balanced';
        newNotesLines = 2;
      } else if (photoCount <= 13) {
        newColumns = 2;
        newFontSize = 'base';
        newPhotoSize = 'sm';
        newItemSpacing = 'compact';
        newNotesLines = 2;
      } else if (photoCount <= 18) {
        newColumns = 3;
        newFontSize = 'base';
        newPhotoSize = 'sm';
        newItemSpacing = 'compact';
        newNotesLines = 1;
      } else {
        newColumns = 3;
        newFontSize = 'sm';
        newPhotoSize = 'sm';
        newItemSpacing = 'compact';
        newNotesLines = 1;
      }
    }

    setConfig((prev) => ({
      ...prev,
      columns: newColumns,
      fontSize: newFontSize,
      photoSize: newPhotoSize,
      itemSpacing: newItemSpacing,
      notesLines: newNotesLines,
      simpleColumns: newSimpleColumns,
    }));
  };

  const handlePrint = () => {
    setShowPrintTips(true);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handleNewEmpty = () => {
    const blank: ChecklistConfig = {
      id: `checklist-${Date.now()}`,
      title: 'MEU NOVO CHECKLIST',
      subtitle: 'Instruções para conferência e preenchimento manual',
      columns: 2,
      fontSize: 'lg',
      photoSize: 'md',
      itemSpacing: 'balanced',
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
        signatureLabel: 'Assinatura:',
        showLocation: true,
        locationLabel: 'Setor:',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        { id: `item-1`, title: 'Item 01', subtitle: 'Descrição do primeiro item', imageUrl: '', checked: false },
        { id: `item-2`, title: 'Item 02', subtitle: 'Descrição do segundo item', imageUrl: '', checked: false },
        { id: `item-3`, title: 'Item 03', subtitle: 'Descrição do terceiro item', imageUrl: '', checked: false },
        { id: `item-4`, title: 'Item 04', subtitle: 'Descrição do quarto item', imageUrl: '', checked: false },
      ],
    };
    setConfig(blank);
    saveChecklistToLibrary(blank);
  };

  // Alternador inteligente de colunas que calibra proporções para nunca truncar texto
  const handleSwitchColumns = (cols: ColumnCount) => {
    setConfig((prev) => {
      if (cols === 3) {
        return {
          ...prev,
          columns: 3,
          // Em 3 colunas, adapta o tamanho da foto para dar mais espaço ao texto completo
          photoSize: prev.photoSize === 'lg' ? 'md' : prev.photoSize,
        };
      }
      return {
        ...prev,
        columns: 2,
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 print:min-h-0 print:bg-white print:p-0 print:m-0 print:block">
      {/* 1. TOP BAR: Conforme contrato de 3 zonas da diretriz */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Zona 1: Nome da Ferramenta */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0">
            A4
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-none whitespace-nowrap">
              Checklist A4 com Fotos
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
              Otimizado para caber em 1 página e com alta legibilidade
            </p>
          </div>
        </div>

        {/* Zona 2: Controles Rápidos de Colunas e Acessibilidade */}
        <div className="hidden md:flex items-center gap-2">
          {/* Alternador de 2 ou 3 Colunas */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => handleSwitchColumns(2)}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                config.columns === 2
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2 Colunas
            </button>
            <button
              onClick={() => handleSwitchColumns(3)}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                config.columns === 3
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3 Colunas
            </button>
          </div>

          {/* Atalho de Tamanho de Fonte para Idosos */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
              <Type className="w-3 h-3" />
              Fonte:
            </span>
            <button
              onClick={() => setConfig((p) => ({ ...p, fontSize: 'base' }))}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                config.fontSize === 'base'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setConfig((p) => ({ ...p, fontSize: 'lg' }))}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                config.fontSize === 'lg'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grande
            </button>
            <button
              onClick={() => setConfig((p) => ({ ...p, fontSize: 'xl' }))}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                config.fontSize === 'xl'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Extra Grande
            </button>
          </div>
        </div>

        {/* Zona 3: Ações Principais: Biblioteca e Imprimir */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLibraryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Salvar, abrir ou importar outros checklists"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Biblioteca</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            title="Imprimir folha A4 ou salvar como PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Folha A4</span>
          </button>
        </div>
      </header>

      {/* Dica de Impressão Rápida */}
      {showPrintTips && (
        <div className="no-print bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Dica de Impressão:</strong> Na tela de impressão do navegador, marque <em>"Gráficos de segundo plano"</em> e defina a Margem como <em>"Padrão"</em> ou <em>"Mínima"</em> para manter tudo em 1 página exata.
            </span>
          </div>
          <button
            onClick={() => setShowPrintTips(false)}
            className="text-amber-800 hover:text-amber-950 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. ÁREA DE TRABALHO: Dividida entre Editor (Esquerda) e Visualizador A4 (Direita) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden print:overflow-visible print:block print:w-full print:h-auto print:p-0 print:m-0">
        {/* PAINEL LATERAL ESQUERDO: Edição e Configurações */}
        <aside className="no-print w-full lg:w-[420px] bg-white border-r border-slate-200 flex flex-col shrink-0 lg:h-[calc(100vh-53px)]">
          {/* Indicador de Encaixe na Página A4 */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/70">
            <PageFitIndicator config={config} onAutoFit={handleAutoFitA4} />
          </div>

          {/* Abas do Painel */}
          <div className="flex border-b border-slate-200 bg-white">
            <button
              onClick={() => setActiveTab('items')}
              className={`flex-1 py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'items'
                  ? 'border-slate-900 text-slate-900 bg-slate-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              Itens do Checklist ({config.items.length})
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={`flex-1 py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'layout'
                  ? 'border-slate-900 text-slate-900 bg-slate-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Ajustes de Layout & Folha
            </button>
          </div>

          {/* Conteúdo da Aba ITENS: 2 Blocos Independentes */}
          {activeTab === 'items' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Barra de Ação de Itens */}
              <div className="p-2.5 border-b border-slate-100 flex items-center justify-between text-xs bg-slate-50">
                <span className="text-xs font-bold text-slate-700">
                  Gerenciar Itens do Checklist
                </span>
                <button
                  onClick={handleClearAllChecks}
                  className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  title="Desmarcar todos os quadradinhos para impressão limpa"
                >
                  Limpar Marcações
                </button>
              </div>

              {/* Lista com Rolagem dividida em 2 blocos independentes */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {/* 1. SEÇÃO INDEPENDENTE: ITENS COM FOTO */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-slate-800" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                        1. Bloco com Fotos
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddItem('photo')}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-2xs"
                    >
                      <Plus className="w-3 h-3" />
                      + Item com Foto
                    </button>
                  </div>

                  {config.items.filter(i => (i.type || 'photo') === 'photo').length === 0 ? (
                    <div className="p-3 text-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-500">
                      Nenhum item com foto. Clique em "+ Item com Foto" para adicionar.
                    </div>
                  ) : (
                    config.items
                      .filter(i => (i.type || 'photo') === 'photo')
                      .map((item, idx, groupArr) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all group"
                        >
                          {/* Miniatura da Foto com object-contain */}
                          <div className="w-11 h-11 rounded bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative p-0.5 shadow-2xs">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className={`w-full h-full ${
                                  config.imageFitMode === 'cover' ? 'object-cover' : 'object-contain'
                                }`}
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                                <Camera className="w-3.5 h-3.5" />
                                <span className="text-[7.5px] font-bold">FOTO</span>
                              </div>
                            )}

                            {/* Ações de foto em overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                              <label
                                className="cursor-pointer p-1 text-white hover:text-amber-300"
                                title="Carregar foto do arquivo"
                              >
                                <Upload className="w-3 h-3" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleQuickUploadPhoto(item.id, e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>
                              <button
                                onClick={() => handleOpenCameraForItem(item)}
                                className="p-1 text-white hover:text-amber-300"
                                title="Tirar foto com câmera"
                              >
                                <Camera className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Dados do Item - Numeração independente começando em 01 */}
                          <div className="flex-1 min-w-0 pr-1">
                            <div className="flex items-start gap-1">
                              <span className="text-xs font-bold text-slate-400 font-mono shrink-0 pt-0.5">
                                #{String(idx + 1).padStart(2, '0')}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="text-xs font-bold text-slate-900 break-words leading-tight">
                                    {item.title}
                                  </p>
                                  {item.aspectRatio && item.aspectRatio !== '1:1' && (
                                    <span className="text-[9px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1 py-0.2 rounded">
                                      {item.aspectRatio}
                                    </span>
                                  )}
                                </div>
                                {item.subtitle && (
                                  <p className="text-[10.5px] text-slate-500 break-words mt-0.5 leading-tight">
                                    {item.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Controles de Reordenação e Edição */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              onClick={() => handleMoveItemWithinGroup(item.id, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                              title="Mover para cima no bloco com fotos"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveItemWithinGroup(item.id, 'down')}
                              disabled={idx === groupArr.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                              title="Mover para baixo no bloco com fotos"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setIsEditorOpen(true);
                              }}
                              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                              title="Editar item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                              title="Excluir item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {/* 2. SEÇÃO INDEPENDENTE: ITENS SEM FOTO (ASSINALAR À CANETA) */}
                <div className="space-y-2 pt-2 border-t-2 border-slate-300">
                  <div className="flex items-center justify-between pb-1 border-b border-emerald-200">
                    <div className="flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                        2. Bloco sem Fotos (Assinalar à Caneta)
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddItem('simple')}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 rounded-md hover:bg-emerald-200 transition-colors shadow-2xs"
                    >
                      <Plus className="w-3 h-3" />
                      + Item sem Foto
                    </button>
                  </div>

                  {config.items.filter(i => i.type === 'simple').length === 0 ? (
                    <div className="p-3 text-center rounded-lg border border-dashed border-emerald-200 text-xs text-emerald-700 bg-emerald-50/40">
                      Nenhum item sem foto. Clique em "+ Item sem Foto" para adicionar tarefas rápidas.
                    </div>
                  ) : (
                    config.items
                      .filter(i => i.type === 'simple')
                      .map((item, idx, groupArr) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2 rounded-lg border border-emerald-200 bg-emerald-50/30 hover:border-emerald-300 transition-all group"
                        >
                          {/* Ícone de Marcação */}
                          <div className="w-11 h-11 rounded bg-white border border-emerald-300 overflow-hidden shrink-0 flex flex-col items-center justify-center p-0.5 shadow-2xs text-emerald-700">
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                            <span className="text-[7.5px] font-black uppercase">SEM FOTO</span>
                          </div>

                          {/* Dados do Item - Numeração independente começando em 01 */}
                          <div className="flex-1 min-w-0 pr-1">
                            <div className="flex items-start gap-1">
                              <span className="text-xs font-bold text-emerald-700 font-mono shrink-0 pt-0.5">
                                #{String(idx + 1).padStart(2, '0')}
                              </span>
                              <p className="text-xs font-bold text-slate-900 break-words leading-tight flex-1">
                                {item.title}
                              </p>
                            </div>
                            {item.subtitle && (
                              <p className="text-[10.5px] text-slate-600 break-words mt-0.5 pl-6 leading-tight">
                                {item.subtitle}
                              </p>
                            )}
                          </div>

                          {/* Controles de Reordenação e Edição */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              onClick={() => handleMoveItemWithinGroup(item.id, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                              title="Mover para cima no bloco sem fotos"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveItemWithinGroup(item.id, 'down')}
                              disabled={idx === groupArr.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                              title="Mover para baixo no bloco sem fotos"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setIsEditorOpen(true);
                              }}
                              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                              title="Editar item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                              title="Excluir item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Conteúdo da Aba LAYOUT & FOLHA */}
          {activeTab === 'layout' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Logotipo e Identificação da Empresa */}
              <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Logotipo & Empresa no Topo
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showCompanyLogo}
                      onChange={(e) => setConfig((p) => ({ ...p, showCompanyLogo: e.target.checked }))}
                      className="rounded text-slate-900"
                    />
                    <span>Ativar Logo</span>
                  </label>
                </div>

                {/* Upload do Logotipo */}
                {config.showCompanyLogo && (
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded border border-slate-300 bg-white p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                      {config.companyLogoUrl ? (
                        <img src={config.companyLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">Sem Logo</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <label className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 cursor-pointer shadow-2xs transition-colors">
                        <Upload className="w-3 h-3" />
                        Trocar Logotipo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleUploadCompanyLogo(e.target.files[0]);
                          }}
                        />
                      </label>
                      {config.companyLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setConfig((p) => ({ ...p, companyLogoUrl: '' }))}
                          className="px-2 py-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Nome da Empresa ao lado do Logotipo */}
                <div className="space-y-1 pt-1 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">
                      Nome da Empresa / Estabelecimento:
                    </label>
                    <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showCompanyName}
                        onChange={(e) => setConfig((p) => ({ ...p, showCompanyName: e.target.checked }))}
                        className="rounded text-slate-900"
                      />
                      <span>Exibir</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={config.companyName || ''}
                    onChange={(e) => setConfig((p) => ({ ...p, companyName: e.target.value }))}
                    placeholder="Gauchão Restaurante e Cozinha Industrial"
                    className="w-full text-xs font-semibold rounded-lg border border-slate-300 px-3 py-2 text-slate-900 bg-white focus:outline-hidden focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Título e Subtítulo da Folha */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Título do Checklist
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Título do Checklist"
                  className="w-full text-xs font-bold rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => setConfig((p) => ({ ...p, subtitle: e.target.value }))}
                  placeholder="Subtítulo ou instruções para preenchimento"
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              {/* Número de Colunas (2 ou 3) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Número de Colunas na Folha A4
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    Texto 100% completo (sem ...)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSwitchColumns(2)}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      config.columns === 2
                        ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>2 Colunas</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      Recomendado para até 12 itens
                    </span>
                  </button>

                  <button
                    onClick={() => handleSwitchColumns(3)}
                    className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      config.columns === 3
                        ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>3 Colunas</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      Para listas com 13 a 18 itens
                    </span>
                  </button>
                </div>
              </div>

              {/* Tamanho da Foto */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tamanho das Fotos no Papel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['sm', 'md', 'lg'] as PhotoSizeOption[]).map((size) => {
                    const labels = { sm: 'Pequena', md: 'Média', lg: 'Grande' };
                    return (
                      <button
                        key={size}
                        onClick={() => setConfig((p) => ({ ...p, photoSize: size }))}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          config.photoSize === size
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {labels[size]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Enquadramento das Fotos dentro do Quadradinho */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Enquadramento da Foto no Quadrado
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    Ajustado como o logotipo
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setConfig((p) => ({ ...p, imageFitMode: 'contain' }))}
                    className={`p-2 rounded-lg border text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${
                      (config.imageFitMode || 'contain') === 'contain'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>Ajustar Foto Inteira</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      Sem cortes, cabe perfeitamente
                    </span>
                  </button>
                  <button
                    onClick={() => setConfig((p) => ({ ...p, imageFitMode: 'cover' }))}
                    className={`p-2 rounded-lg border text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${
                      config.imageFitMode === 'cover'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>Preencher Quadrado</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      Corta bordas excedentes
                    </span>
                  </button>
                </div>
              </div>

              {/* Tamanho da Fonte (Acessibilidade Idosos) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tamanho do Texto (Legibilidade para Idosos)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['sm', 'base', 'lg', 'xl'] as const).map((size) => {
                    const labels: Record<FontSizeOption, string> = {
                      sm: 'Compacta (12px)',
                      base: 'Normal (14px)',
                      lg: 'Grande (16px)',
                      xl: 'Extra (18px)',
                    };
                    return (
                      <button
                        key={size}
                        onClick={() => setConfig((p) => ({ ...p, fontSize: size }))}
                        className={`py-2 px-1 text-[11px] font-bold rounded-lg border transition-all text-center ${
                          config.fontSize === size
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {labels[size]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Espaçamento entre Itens */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Espaçamento entre os Itens
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['compact', 'balanced', 'spacious'] as ItemSpacingOption[]).map((sp) => {
                    const labels = { compact: 'Compacto', balanced: 'Equilibrado', spacious: 'Amplo' };
                    return (
                      <button
                        key={sp}
                        onClick={() => setConfig((p) => ({ ...p, itemSpacing: sp }))}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          config.itemSpacing === sp
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {labels[sp]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Estilo da Caixa de Assinalar */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Estilo da Caixa de Assinalar
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setConfig((p) => ({ ...p, checkboxStyle: 'standard' }))}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                      config.checkboxStyle === 'standard'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Quadrado 24px
                  </button>
                  <button
                    onClick={() => setConfig((p) => ({ ...p, checkboxStyle: 'large' }))}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                      config.checkboxStyle === 'large'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Quadrado 32px
                  </button>
                  <button
                    onClick={() => setConfig((p) => ({ ...p, checkboxStyle: 'conforming' }))}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                      config.checkboxStyle === 'conforming'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    [C] / [NC] Duplo
                  </button>
                </div>
              </div>

              {/* Quadro do Cabeçalho: DATA e ASSINATURA (Economiza espaço A4) */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Quadro DATA & ASSINATURA (Canto Direito)
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.headerSignBox?.show !== false}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          headerSignBox: {
                            ...prev.headerSignBox,
                            show: e.target.checked,
                          },
                        }))
                      }
                      className="rounded text-slate-900"
                    />
                    <span>Ativar Quadro</span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Localizado ao lado do título para não gastar linhas inteiras de altura. Contém campo de Data e espaço para assinar a mão.
                </p>
              </div>

              {/* Bloco de Verificação Rápida (Itens Sem Foto / Assinalar à Caneta) */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                    Bloco Sem Foto (Assinalar à Caneta)
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    Separado por Linha Grossa
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    Título deste Bloco Separado:
                  </label>
                  <input
                    type="text"
                    value={config.simpleSectionTitle || ''}
                    onChange={(e) => setConfig((p) => ({ ...p, simpleSectionTitle: e.target.value }))}
                    placeholder="VERIFICAÇÕES OPERACIONAIS & ROTINA (ASSINALAR À CANETA)"
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 text-slate-900 focus:outline-hidden focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Colunas do Bloco Sem Foto:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((cols) => (
                      <button
                        key={cols}
                        type="button"
                        onClick={() => setConfig((p) => ({ ...p, simpleColumns: cols as 1 | 2 | 3 }))}
                        className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all ${
                          (config.simpleColumns || 2) === cols
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {cols} {cols === 1 ? 'Coluna' : 'Colunas'}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Dica: Escolha 1, 2 ou 3 colunas para distribuir os itens sem foto de forma alinhada na folha A4.
                  </p>
                </div>
              </div>

              {/* Área de Observações no Rodapé - Fácil de Ligar e Desligar */}
              <div className="space-y-3 pt-2 border-t border-slate-200 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                      Campo de Observações no Rodapé
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {config.showNotesArea ? 'Ativo na folha' : 'Removido (economiza espaço)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfig((p) => ({ ...p, showNotesArea: !p.showNotesArea }))}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      config.showNotesArea
                        ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                        : 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {config.showNotesArea ? '✕ Remover Campo' : '+ Ativar Observações'}
                  </button>
                </div>

                {config.showNotesArea && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Título do Campo:
                      </label>
                      <input
                        type="text"
                        value={config.notesTitle}
                        onChange={(e) => setConfig((p) => ({ ...p, notesTitle: e.target.value }))}
                        className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 text-slate-800 bg-white"
                        placeholder="Observações / Ocorrências:"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-700 font-semibold">Linhas pautadas:</span>
                      <select
                        value={config.notesLines}
                        onChange={(e) =>
                          setConfig((p) => ({ ...p, notesLines: Number(e.target.value) }))
                        }
                        className="text-xs rounded border border-slate-300 py-1 px-2.5 text-slate-800 bg-white"
                      >
                        <option value={1}>1 linha</option>
                        <option value={2}>2 linhas</option>
                        <option value={3}>3 linhas</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* ÁREA PRINCIPAL DIREITA: Pré-visualização da Folha A4 Real */}
        <main className="flex-1 overflow-y-auto bg-slate-200/80 p-4 sm:p-8 flex flex-col items-center print:bg-white print:p-0 print:m-0 print:overflow-visible print:w-full print:max-w-none print:shadow-none print:border-none print:block">
          {/* Barra de Ferramentas de Zoom da Folha (Apenas em tela) */}
          <div className="no-print w-full max-w-[794px] mb-3 flex items-center justify-between gap-2 px-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800">Visualização Folha A4:</span>
              <span className="text-slate-500">210mm x 297mm</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                className="p-1 rounded bg-white hover:bg-slate-100 text-slate-700 shadow-2xs border border-slate-300"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-xs w-10 text-center font-bold text-slate-700">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                className="p-1 rounded bg-white hover:bg-slate-100 text-slate-700 shadow-2xs border border-slate-300"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="px-2 py-1 text-[11px] font-bold rounded bg-white hover:bg-slate-100 text-slate-700 shadow-2xs border border-slate-300"
                title="Zoom 100%"
              >
                100%
              </button>
            </div>
          </div>

          {/* O Documento A4 Real */}
          <div
            className="w-full flex justify-center transition-all duration-200 print:w-full print:m-0 print:p-0 print:block print:transform-none"
            style={{
              transform: zoomLevel === 100 ? 'none' : `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
            }}
          >
            <div className="a4-preview-container bg-white rounded-xs shadow-2xl relative print:w-full print:max-w-none print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none">
              <ChecklistSheet
                config={config}
                interactive={true}
                onEditItem={(item) => {
                  setEditingItem(item);
                  setIsEditorOpen(true);
                }}
                onQuickUploadPhoto={handleQuickUploadPhoto}
                onOpenCameraForItem={handleOpenCameraForItem}
                onDeleteItem={handleDeleteItem}
                onToggleCheck={handleToggleCheck}
                onToggleItemSpan={handleToggleItemSpan}
                onUploadLogo={handleUploadCompanyLogo}
                onToggleNotesArea={() =>
                  setConfig((prev) => ({
                    ...prev,
                    showNotesArea: !prev.showNotesArea,
                  }))
                }
              />
            </div>
          </div>
        </main>
      </div>

      {/* MODAL DE CAPTURA COM CÂMERA LOCAL */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => {
          setIsCameraOpen(false);
          setCameraTargetItem(null);
        }}
        onCapture={handleCameraCaptureConfirm}
        itemName={cameraTargetItem?.title}
      />

      {/* MODAL DE EDIÇÃO DE ITEM */}
      <ItemEditorModal
        isOpen={isEditorOpen}
        item={editingItem}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingItem(null);
        }}
        onSave={handleUpdateItem}
        onDelete={handleDeleteItem}
        onOpenLiveCamera={(item) => {
          setIsEditorOpen(false);
          setCameraTargetItem(item);
          setIsCameraOpen(true);
        }}
      />

      {/* MODAL DA BIBLIOTECA DE CHECKLISTS */}
      <ChecklistLibraryModal
        isOpen={isLibraryOpen}
        currentConfig={config}
        onClose={() => setIsLibraryOpen(false)}
        onSelectChecklist={(selected) => setConfig(selected)}
        onNewEmptyChecklist={handleNewEmpty}
      />
    </div>
  );
}
