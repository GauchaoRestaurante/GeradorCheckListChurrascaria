import React from 'react';
import { ChecklistConfig, ChecklistItem } from '../types/checklist';
import { Edit2, Camera, Upload, Trash2, CheckSquare, Maximize2, Sparkles } from 'lucide-react';

interface ChecklistSheetProps {
  config: ChecklistConfig;
  interactive?: boolean;
  onEditItem?: (item: ChecklistItem) => void;
  onQuickUploadPhoto?: (itemId: string, file: File) => void;
  onOpenCameraForItem?: (item: ChecklistItem) => void;
  onDeleteItem?: (itemId: string) => void;
  onToggleCheck?: (itemId: string) => void;
  onToggleItemSpan?: (itemId: string) => void;
  onUpdateHeaderField?: (field: keyof ChecklistConfig, value: any) => void;
  onUploadLogo?: (file: File) => void;
  onToggleNotesArea?: () => void;
  printableOnly?: boolean;
}

export const ChecklistSheet: React.FC<ChecklistSheetProps> = ({
  config,
  interactive = true,
  onEditItem,
  onQuickUploadPhoto,
  onOpenCameraForItem,
  onDeleteItem,
  onToggleCheck,
  onToggleItemSpan,
  onUploadLogo,
  onToggleNotesArea,
  printableOnly = false,
}) => {
  const {
    title,
    subtitle,
    companyLogoUrl,
    showCompanyLogo,
    companyName,
    showCompanyName,
    columns,
    fontSize,
    photoSize,
    imageFitMode = 'contain',
    itemSpacing,
    checkboxStyle,
    showItemNumbers,
    highContrast,
    headerSignBox = { show: true, dateLabel: 'DATA:', signatureLabel: 'ASSINATURA:' },
    showSimpleSection = true,
    simpleSectionTitle,
    simpleColumns = 2,
    showNotesArea,
    notesTitle,
    notesLines,
    headerFields,
    items,
  } = config;

  // Separação entre itens com foto e itens rápidos (apenas assinalar)
  const photoItems = items.filter((item) => (item.type || 'photo') === 'photo');
  const simpleItems = items.filter((item) => item.type === 'simple');

  // Detecção de 3 colunas para calibração de proporções
  const isThreeCols = columns === 3;

  // Tipografia ajustada dinamicamente: em 3 colunas ou 2 colunas o texto NUNCA é truncado com '...'
  const fontClasses = isThreeCols
    ? {
        sm: {
          title: 'text-[10px] sm:text-[11px] font-bold leading-tight break-words',
          subtitle: 'text-[9px] sm:text-[9.5px] text-slate-600 leading-tight break-words',
          number: 'text-[10px] sm:text-[11px] font-bold text-slate-500 leading-tight',
        },
        base: {
          title: 'text-[11px] sm:text-xs font-bold leading-tight break-words',
          subtitle: 'text-[9.5px] sm:text-[10px] text-slate-600 leading-tight break-words',
          number: 'text-[11px] sm:text-xs font-bold text-slate-500 leading-tight',
        },
        lg: {
          title: 'text-xs sm:text-[13px] font-bold leading-tight break-words',
          subtitle: 'text-[10px] sm:text-[11px] text-slate-600 leading-tight break-words',
          number: 'text-xs sm:text-[13px] font-bold text-slate-500 leading-tight',
        },
        xl: {
          title: 'text-[13px] sm:text-sm font-bold leading-tight break-words',
          subtitle: 'text-[11px] sm:text-xs text-slate-600 leading-tight break-words',
          number: 'text-[13px] sm:text-sm font-bold text-slate-500 leading-tight',
        },
      }[fontSize]
    : {
        sm: {
          title: 'text-[11px] sm:text-xs font-bold leading-tight break-words',
          subtitle: 'text-[10px] text-slate-600 leading-tight break-words',
          number: 'text-[11px] sm:text-xs font-bold text-slate-500 leading-tight',
        },
        base: {
          title: 'text-xs sm:text-[13px] font-bold leading-tight break-words',
          subtitle: 'text-[10px] sm:text-[11px] text-slate-600 leading-tight break-words',
          number: 'text-xs sm:text-[13px] font-bold text-slate-500 leading-tight',
        },
        lg: {
          title: 'text-[13px] sm:text-sm font-bold leading-tight break-words',
          subtitle: 'text-[10.5px] sm:text-[11.5px] text-slate-600 leading-tight break-words',
          number: 'text-[13px] sm:text-sm font-bold text-slate-500 leading-tight',
        },
        xl: {
          title: 'text-sm sm:text-base font-bold leading-tight break-words',
          subtitle: 'text-xs sm:text-[13px] text-slate-600 leading-tight break-words',
          number: 'text-sm sm:text-base font-bold text-slate-500 leading-tight',
        },
      }[fontSize];

  // Proporções das fotos adaptadas: dimensões generosas para total visibilidade dos detalhes inspecionados
  // Proporções das fotos adaptadas: a imagem estende-se e ocupa a área útil do card de forma proporcional
  const photoDimensions = isThreeCols
    ? {
        sm: 'w-[76px] h-[76px] min-w-[76px]',
        md: 'w-[90px] h-[90px] min-w-[90px]',
        lg: 'w-[104px] h-[104px] min-w-[104px]',
      }[photoSize]
    : {
        sm: 'w-[112px] h-[112px] min-w-[112px]',
        md: 'w-[136px] h-[136px] min-w-[136px] sm:w-[144px] sm:h-[144px] sm:min-w-[144px]',
        lg: 'w-[155px] h-[155px] min-w-[155px]',
      }[photoSize];

  // Proporções das fotos por proporção selecionada (1:1, 16:9, 4:3, 9:16)
  const getItemPhotoClasses = (item: ChecklistItem) => {
    const ratio = item.aspectRatio || '1:1';

    if (isThreeCols) {
      switch (ratio) {
        case '16:9':
          return 'w-[105px] h-[59px] min-w-[105px] aspect-video';
        case '9:16':
          return 'w-[54px] h-[96px] min-w-[54px] aspect-[9/16]';
        case '4:3':
          return 'w-[96px] h-[72px] min-w-[96px] aspect-[4/3]';
        case '1:1':
        default:
          return `${photoDimensions} aspect-square`;
      }
    }

    // 2 colunas: A foto estende-se para ocupar a área útil do quadro (cabem 2 itens certinhos por linha)
    switch (ratio) {
      case '16:9':
        return 'w-[160px] h-[90px] min-w-[160px] aspect-video';
      case '9:16':
        return 'w-[80px] h-[142px] min-w-[80px] aspect-[9/16]';
      case '4:3':
        return 'w-[144px] h-[108px] min-w-[144px] aspect-[4/3]';
      case '1:1':
      default:
        return `${photoDimensions} aspect-square`;
    }
  };

  // Spacing classes between items
  const spacingClasses = {
    compact: 'gap-1.5 p-1',
    balanced: 'gap-2 p-1.5',
    spacious: 'gap-2.5 p-2',
  }[itemSpacing];

  // Grid deterministic (sem classes 'sm:' que dependem da viewport do navegador, respeitando fielmente a folha A4)
  const gridColsClass = columns === 3 ? 'grid-cols-3 print:grid-cols-3' : 'grid-cols-2 print:grid-cols-2';
  const simpleColsClass = {
    1: 'grid-cols-1 print:grid-cols-1',
    2: 'grid-cols-2 print:grid-cols-2',
    3: 'grid-cols-3 print:grid-cols-3',
  }[simpleColumns || 2] || 'grid-cols-2 print:grid-cols-2';

  // Checkbox size classes
  const checkboxBoxClasses = {
    standard: 'w-6 h-6 min-w-6 min-h-6 border-2 border-slate-900 rounded-sm',
    large: 'w-8 h-8 min-w-8 min-h-8 border-[2.5px] border-slate-900 rounded-md',
    conforming: 'w-6 h-6 min-w-6 min-h-6 border-2 border-slate-900 rounded-sm',
  }[checkboxStyle];

  const handleFileInputChange = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onQuickUploadPhoto) {
      onQuickUploadPhoto(itemId, e.target.files[0]);
    }
  };

  return (
    <div
      className={`a4-print-sheet bg-white text-slate-900 mx-auto flex flex-col justify-between select-text print:p-0 print:m-0 print:border-none print:shadow-none print:rounded-none ${
        printableOnly ? '' : 'p-4 sm:p-6 rounded-none sm:rounded-lg'
      }`}
      style={{
        width: '100%',
        maxWidth: printableOnly ? '198mm' : '794px',
        minHeight: printableOnly ? '280mm' : 'auto',
      }}
    >
      {/* CABEÇALHO SUPERIOR COMPACTO DO CHECKLIST (ECONOMIZA ESPAÇO A4) */}
      <div className="border-b-2 border-slate-900 pb-2 mb-2 shrink-0">
        <div className="flex items-center justify-between gap-3">
          {/* LADO ESQUERDO: Empresa + Logotipo + Título e Subtítulo */}
          <div className="flex-1 min-w-0 pr-2">
            {(showCompanyLogo || showCompanyName) && (
              <div className="flex items-center gap-2.5 mb-1.5">
                {showCompanyLogo && companyLogoUrl && (
                  <div className="relative group/logo shrink-0">
                    <img
                      src={companyLogoUrl}
                      alt={companyName || 'Logotipo da Empresa'}
                      className="h-9 sm:h-11 w-auto max-w-[120px] object-contain rounded-xs border border-slate-200 p-0.5 bg-white shadow-2xs"
                    />
                    {interactive && !printableOnly && onUploadLogo && (
                      <label
                        title="Clique para trocar o logotipo da empresa"
                        className="no-print absolute inset-0 bg-black/65 opacity-0 group-hover/logo:opacity-100 transition-opacity rounded-xs flex items-center justify-center cursor-pointer text-white"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) onUploadLogo(e.target.files[0]);
                          }}
                        />
                      </label>
                    )}
                  </div>
                )}

                {showCompanyName && (
                  <div className="leading-tight">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 block">
                      {companyName || 'Gauchão Restaurante e Cozinha Industrial'}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                      Controle de Qualidade & Boas Práticas
                    </span>
                  </div>
                )}
              </div>
            )}

            <div>
              <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 leading-tight">
                {title || 'CHECKLIST DE INSPEÇÃO'}
              </h1>
              {subtitle && (
                <p className="text-[11px] sm:text-xs font-medium text-slate-600 mt-0.5 leading-snug">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* LADO DIREITO: QUADRO REDUZIDO DE DATA E ASSINATURA PARA PREENCHIMENTO MANUAL */}
          {headerSignBox?.show !== false && (
            <div className="w-48 sm:w-56 shrink-0 border-2 border-slate-900 rounded-md bg-white p-2 flex flex-col justify-between shadow-2xs">
              {/* Linha DATA */}
              <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-1.5">
                <span className="font-black text-slate-900 text-[11px] sm:text-xs uppercase tracking-wider">
                  {headerSignBox?.dateLabel || 'DATA:'}
                </span>
                <span className="text-slate-400 font-mono text-[11px] sm:text-xs tracking-wider">
                  ____ / ____ / ________
                </span>
              </div>
              {/* Linha ASSINATURA com altura adequada para assinar a mão */}
              <div className="flex flex-col justify-between pt-0.5 min-h-[30px]">
                <span className="font-black text-slate-900 text-[10px] sm:text-[11px] uppercase tracking-wider block">
                  {headerSignBox?.signatureLabel || 'ASSINATURA:'}
                </span>
                <div className="border-b border-slate-400 w-full mt-4"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 1. BLOCO PRINCIPAL: ITENS COM FOTO [FOTO ESTENDIDA] - [ASSINALAR] - [NOME] */}
      {photoItems.length > 0 && (
        <div
          className={`grid ${spacingClasses} flex-1 content-start`}
          style={{
            gridTemplateColumns: columns === 3 ? 'repeat(3, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))',
          }}
        >
          {photoItems.map((item, index) => {
            const itemNum = String(index + 1).padStart(2, '0');
            const photoBoxClasses = getItemPhotoClasses(item);
            const itemImageFit = item.imageFit || imageFitMode;

            return (
              <div
                key={item.id}
                className={`a4-item-card group relative flex items-center gap-2.5 border ${
                  highContrast ? 'border-slate-900 bg-white' : 'border-slate-300 bg-white'
                } rounded-md p-1.5 transition-colors hover:border-slate-900 hover:bg-slate-50 col-span-1 print:col-span-1`}
              >
                {/* 1. FOTO DO ITEM QUE SE ESTENDE E OCUPA A ÁREA DISPONÍVEL DO QUADRO */}
                <div
                  className={`relative ${photoBoxClasses} rounded bg-white border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center p-0.5 shadow-2xs self-center`}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full ${
                        itemImageFit === 'cover' ? 'object-cover' : 'object-contain'
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                      <Camera className="w-4 h-4" />
                      <span className="text-[8px] mt-0.5 font-bold">FOTO</span>
                    </div>
                  )}

                  {/* Ações interativas sobre a foto (Apenas tela, ocultas na impressão) */}
                  {interactive && !printableOnly && (
                    <div className="no-print absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <label
                        title="Carregar foto local"
                        className="cursor-pointer p-1 rounded bg-white text-slate-900 hover:bg-slate-200"
                      >
                        <Upload className="w-3 h-3" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileInputChange(item.id, e)}
                        />
                      </label>
                      {onOpenCameraForItem && (
                        <button
                          title="Tirar foto com a câmera"
                          onClick={() => onOpenCameraForItem(item)}
                          className="p-1 rounded bg-white text-slate-900 hover:bg-slate-200"
                        >
                          <Camera className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. ESPAÇO PARA ASSINALAR COM CANETA */}
                <div className="shrink-0 flex flex-col items-center justify-center">
                  {checkboxStyle === 'conforming' ? (
                    <div className="flex flex-col gap-1 text-[10px] font-bold text-slate-700">
                      <div className="flex items-center gap-1">
                        <div className="checklist-checkbox w-5 h-5 border-2 border-slate-900 rounded-xs bg-white flex items-center justify-center print:border-2 print:border-black print:bg-white" />
                        <span className="text-[10px] font-bold text-slate-900">C</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="checklist-checkbox w-5 h-5 border-2 border-slate-900 rounded-xs bg-white flex items-center justify-center print:border-2 print:border-black print:bg-white" />
                        <span className="text-[10px] font-bold text-slate-900">NC</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => interactive && onToggleCheck && onToggleCheck(item.id)}
                      className={`checklist-checkbox ${checkboxBoxClasses} bg-white flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors shrink-0 print:border-2 print:border-black print:bg-white print:visible print:inline-flex`}
                      title="Espaço para assinalar com caneta"
                    >
                      {item.checked && (
                        <span className="text-slate-950 font-black text-sm sm:text-base leading-none print:text-black">
                          ✕
                        </span>
                      )}
                    </button>
                  )}
                </div>

                {/* 3. NOME E DESCRIÇÃO DO ITEM - SEMPRE COMPLETO, DISTÂNCIA ENXUTA */}
                <div className="flex-1 min-w-0 pr-0.5">
                  <div className="flex items-baseline gap-1.5">
                    {showItemNumbers && (
                      <span className={`${fontClasses.number} tabular-nums shrink-0 font-bold`}>
                        {itemNum}.
                      </span>
                    )}
                    <h2 className={`${fontClasses.title} text-slate-950 break-words flex-1`}>
                      {item.title}
                    </h2>
                  </div>
                  {item.subtitle && (
                    <p className={`${fontClasses.subtitle} break-words mt-[2px]`}>
                      {item.subtitle}
                    </p>
                  )}
                </div>

                {/* Controles de edição em tela (ocultos na impressão) */}
                {interactive && !printableOnly && (
                  <div className="no-print absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/95 backdrop-blur-xs p-0.5 rounded shadow-xs border border-slate-200 z-20">
                    {onEditItem && (
                      <button
                        onClick={() => onEditItem(item)}
                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                        title="Editar nome / foto deste item"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                    {onDeleteItem && (
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                        title="Remover item"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. BLOCO DE ITENS SEM FOTO (APENAS ASSINALAR À CANETA) */}
      {simpleItems.length > 0 && (
        <div className="mt-2.5 pt-1.5 border-t-[2.5px] border-slate-900 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-950">
              {simpleSectionTitle || 'VERIFICAÇÕES OPERACIONAIS & ROTINA (ASSINALAR À CANETA)'}
            </span>
          </div>

          <div
            className="grid gap-x-3 gap-y-1"
            style={{
              gridTemplateColumns: `repeat(${simpleColumns || 2}, minmax(0, 1fr))`,
            }}
          >
            {simpleItems.map((item, idx) => {
              const itemNum = String(idx + 1).padStart(2, '0');
              return (
                <div
                  key={item.id}
                  className="a4-item-card group relative flex items-center gap-2 px-1 py-1 transition-colors hover:bg-slate-50/70 rounded-xs"
                >
                  {/* Quadradinho pequeno para assinalar à caneta */}
                  <button
                    type="button"
                    onClick={() => interactive && onToggleCheck && onToggleCheck(item.id)}
                    className={`checklist-checkbox ${checkboxBoxClasses} bg-white flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors shrink-0 print:border-2 print:border-black print:bg-white print:visible print:inline-flex`}
                    title="Espaço para assinalar com caneta"
                  >
                    {item.checked && (
                      <span className="text-slate-950 font-black text-sm sm:text-base leading-none print:text-black">
                        ✕
                      </span>
                    )}
                  </button>

                  {/* Nome e subtítulo (fonte normal sem negrito) */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-baseline gap-1.5">
                      {showItemNumbers && (
                        <span className="tabular-nums shrink-0 text-xs text-slate-500 font-normal">
                          {itemNum}.
                        </span>
                      )}
                      <h3 className="text-slate-800 break-words leading-tight flex-1 text-xs sm:text-sm font-normal">
                        {item.title}
                      </h3>
                    </div>
                    {item.subtitle && (
                      <p className="break-words text-[10px] sm:text-[11px] text-slate-500 font-normal mt-[1px]">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Ações em tela */}
                  {interactive && !printableOnly && (
                    <div className="no-print absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 backdrop-blur-xs p-0.5 rounded shadow-xs border border-slate-200">
                      {onEditItem && (
                        <button
                          onClick={() => onEditItem(item)}
                          className="p-1 text-slate-600 hover:text-slate-900 rounded"
                          title="Editar item"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                      {onDeleteItem && (
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1 text-rose-600 hover:text-rose-800 rounded"
                          title="Remover item"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RODAPÉ: OBSERVAÇÕES / OCORRÊNCIAS */}
      {showNotesArea ? (
        <div className="mt-2 pt-1.5 border-t-2 border-slate-900 shrink-0 relative group/notes print:mt-1.5 print:pt-1.5 print:pb-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {notesTitle}
            </span>
            {interactive && !printableOnly && onToggleNotesArea && (
              <button
                type="button"
                onClick={onToggleNotesArea}
                className="no-print opacity-0 group-hover/notes:opacity-100 text-[10px] font-bold text-rose-600 hover:text-rose-800 transition-opacity bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
                title="Remover este campo de observações para economizar espaço"
              >
                ✕ Remover Campo
              </button>
            )}
          </div>
          <div className="space-y-2 print:space-y-1.5">
            {Array.from({ length: notesLines }).map((_, idx) => (
              <div key={idx} className="border-b border-dashed border-slate-600 h-4 w-full print:border-slate-900" />
            ))}
          </div>
        </div>
      ) : (
        interactive && !printableOnly && onToggleNotesArea && (
          <div className="no-print mt-2 pt-1 border-t border-dashed border-slate-300 text-center">
            <button
              type="button"
              onClick={onToggleNotesArea}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 px-3 rounded hover:bg-slate-100 inline-flex items-center gap-1.5"
            >
              + Adicionar Campo de Observações no Rodapé
            </button>
          </div>
        )
      )}
    </div>
  );
};
