import React, { useState, useEffect } from 'react';
import { ChecklistItem, ItemType, ItemAspectRatio, ItemLayoutSpan, ImageFitMode } from '../types/checklist';
import { X, Upload, Camera, Trash2, Check, Image as ImageIcon, CheckSquare, Sparkles, Maximize2, Crop } from 'lucide-react';
import { createSvgThumbnail } from '../utils/presets';

interface ItemEditorModalProps {
  isOpen: boolean;
  item: ChecklistItem | null;
  onClose: () => void;
  onSave: (updatedItem: ChecklistItem) => void;
  onDelete?: (itemId: string) => void;
  onOpenLiveCamera: (item: ChecklistItem) => void;
}

const PRESET_ICONS = [
  { label: 'Extintor', type: 'triangle', bg: '#fee2e2', stroke: '#b91c1c' },
  { label: 'Ferramentas', type: 'wrench', bg: '#f1f5f9', stroke: '#1e293b' },
  { label: 'Chaves', type: 'key', bg: '#ede9fe', stroke: '#6d28d9' },
  { label: 'Óleo / Fluidos', type: 'oil', bg: '#fef3c7', stroke: '#b45309' },
  { label: 'Pneu / Rodas', type: 'wheel', bg: '#f1f5f9', stroke: '#1e293b' },
  { label: 'Bateria', type: 'battery', bg: '#e0f2fe', stroke: '#0369a1' },
  { label: 'Manômetro', type: 'gauge', bg: '#fef9c3', stroke: '#a16207' },
  { label: 'Socorro / Saúde', type: 'medical', bg: '#ecfdf5', stroke: '#047857' },
  { label: 'Veículo / Geral', type: 'car', bg: '#f3f4f6', stroke: '#374151' },
];

export const ItemEditorModal: React.FC<ItemEditorModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
  onDelete,
  onOpenLiveCamera,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [type, setType] = useState<ItemType>('photo');
  const [layoutSpan, setLayoutSpan] = useState<ItemLayoutSpan>(1);
  const [aspectRatio, setAspectRatio] = useState<ItemAspectRatio>('1:1');
  const [imageFit, setImageFit] = useState<ImageFitMode>('contain');

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setSubtitle(item.subtitle || '');
      setImageUrl(item.imageUrl || '');
      setType(item.type || 'photo');
      setLayoutSpan(item.layoutSpan || 1);
      setAspectRatio(item.aspectRatio || '1:1');
      setImageFit(item.imageFit || 'contain');
    } else {
      setTitle('');
      setSubtitle('');
      setImageUrl('');
      setType('photo');
      setLayoutSpan(1);
      setAspectRatio('1:1');
      setImageFit('contain');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...item,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      imageUrl: type === 'photo' ? imageUrl : '',
      type,
      layoutSpan: type === 'photo' ? layoutSpan : 1,
      aspectRatio: type === 'photo' ? aspectRatio : '1:1',
      imageFit: type === 'photo' ? imageFit : 'contain',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-base font-bold text-slate-900">
            Editar Item do Checklist
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto">
          {/* Seletor de Tipo: Com Foto vs Apenas Assinalar */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Tipo do Item no Checklist
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setType('photo')}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  type === 'photo'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-4 h-4 text-slate-800" />
                Item com Foto
              </button>
              <button
                type="button"
                onClick={() => setType('simple')}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  type === 'simple'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                Apenas Assinalar (Sem Foto)
              </button>
            </div>
          </div>

          {/* Nome do Item */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nome do Item (Obrigatório)
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Extintor de Incêndio, Higienização de Bancadas..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-hidden"
            />
          </div>

          {/* Descrição / Instrução Secundária */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Descrição / Observação Secundária (Opcional)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ex: Conferir no início do turno com atenção redobrada"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-hidden"
            />
          </div>

          {/* Informação sobre Item Sem Foto */}
          {type === 'simple' && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 flex items-start gap-2.5">
              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Bloco de Verificação Rápida</p>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  Este item aparecerá no bloco inferior separado, com um quadradinho limpo para ser assinalado à caneta, ocupando menos espaço e aproveitando ao máximo a folha A4.
                </p>
              </div>
            </div>
          )}

          {/* Foto e Configurações de Tamanho/Destaque (Apenas se type === 'photo') */}
          {type === 'photo' && (
            <div className="space-y-4">
              {/* Formato / Proporção da Foto (16:9, 9:16, 1:1, 4:3) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Crop className="w-3.5 h-3.5 text-slate-800" />
                    Proporção da Foto
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Ajuste conforme sua imagem
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: '16:9', label: '16:9', desc: 'Panorâmica' },
                    { id: '9:16', label: '9:16', desc: 'Vertical' },
                    { id: '1:1', label: '1:1', desc: 'Quadrada' },
                    { id: '4:3', label: '4:3', desc: 'Padrão' },
                  ].map((ratio) => (
                    <button
                      key={ratio.id}
                      type="button"
                      onClick={() => setAspectRatio(ratio.id as ItemAspectRatio)}
                      className={`py-1.5 px-2 text-center rounded-lg border transition-all ${
                        aspectRatio === ratio.id
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">{ratio.label}</div>
                      <div className={`text-[9px] ${aspectRatio === ratio.id ? 'text-slate-300' : 'text-slate-500'}`}>
                        {ratio.desc}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Enquadramento da Imagem (contain vs cover) */}
                <div className="pt-1.5 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-700">Enquadramento:</span>
                    <span className="text-[10px] text-slate-500">
                      {imageFit === 'contain' ? 'Sem cortes (proporcional)' : 'Preenche todo o espaço'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setImageFit('contain')}
                      className={`py-1 px-2 text-xs font-bold rounded border transition-all ${
                        imageFit === 'contain'
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      Conter (Proporcional)
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageFit('cover')}
                      className={`py-1 px-2 text-xs font-bold rounded border transition-all ${
                        imageFit === 'cover'
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      Preencher (Cover)
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload e Pré-visualização da Imagem */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Arquivo da Imagem & Pré-visualização
                </label>

                <div className="flex items-start gap-3">
                  {/* Thumbnail Preview com proporção dinâmica */}
                  <div
                    className={`rounded-lg border-2 border-slate-300 bg-white p-1 overflow-hidden shrink-0 flex items-center justify-center relative shadow-2xs transition-all ${
                      aspectRatio === '16:9'
                        ? 'w-36 h-20'
                        : aspectRatio === '9:16'
                        ? 'w-16 h-28'
                        : aspectRatio === '4:3'
                        ? 'w-28 h-21'
                        : 'w-24 h-24'
                    }`}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={title}
                        className={`w-full h-full ${imageFit === 'cover' ? 'object-cover' : 'object-contain'}`}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 text-center p-1">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-[9px] font-bold mt-0.5">Sem Imagem</span>
                      </div>
                    )}
                  </div>

                  {/* Botões de Ação para Imagem */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        Carregar Imagem Local
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => onOpenLiveCamera(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Tirar com Câmera
                      </button>

                      {imageUrl && (
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          Remover
                        </button>
                      )}
                    </div>

                    {/* Ícones Rápidos caso não tenha foto */}
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1 font-medium">
                        Ou selecione um ícone rápido ilustrativo:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {PRESET_ICONS.map((icon, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setImageUrl(
                                createSvgThumbnail(icon.label, icon.type, icon.bg, icon.stroke)
                              )
                            }
                            className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            {icon.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(item.id);
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir Item
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
