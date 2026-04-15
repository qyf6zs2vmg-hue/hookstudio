import { HistoryItem } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Settings, Zap, Wand2, Search, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

interface SidebarProps {
  history: HistoryItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

export function Sidebar({ history, activeId, onSelect, onDelete, onNew, onOpenSettings, onOpenHelp }: SidebarProps) {
  const { t } = useSettings();

  return (
    <div className="flex flex-col h-full bg-bg-deep border-r border-border-custom w-64 md:w-[280px]">
      <div className="p-8 pb-10">
        <div className="text-2xl font-black tracking-tighter flex items-center gap-2 text-text-primary">
          <div className="w-8 h-8 rounded-lg bg-accent-custom flex items-center justify-center text-white text-lg">H</div>
          HookStudio<span className="text-accent-custom">AI</span>
        </div>
      </div>

      <div className="px-6 mb-8">
        <Button 
          onClick={onNew}
          className="w-full py-7 bg-text-primary text-bg-deep hover:bg-text-primary/90 font-black rounded-2xl transition-all shadow-lg uppercase tracking-widest text-xs"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.newChat}
        </Button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
          {t.history}
        </div>
        
        <ScrollArea className="flex-1">
          <div className="space-y-1 pb-6 px-4">
            {history.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-text-muted text-xs font-bold uppercase tracking-widest opacity-50">{t.noHistory}</p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "group relative flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all rounded-xl",
                    activeId === item.id 
                      ? "bg-accent-muted text-accent-custom" 
                      : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                  )}
                  onClick={() => onSelect(item.id)}
                >
                  <div className={cn(
                    "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    activeId === item.id ? "bg-accent-custom/20" : "bg-bg-surface group-hover:bg-bg-deep"
                  )}>
                    {item.tool === 'generator' && <Zap className="w-3.5 h-3.5" />}
                    {item.tool === 'improver' && <Wand2 className="w-3.5 h-3.5" />}
                    {item.tool === 'analyzer' && <Search className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate tracking-tight">{item.title}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-accent-custom/10 hover:text-accent-custom transition-all rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="p-6 border-t border-border-custom space-y-3">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-text-secondary hover:text-text-primary hover:bg-bg-surface h-12 rounded-xl px-4 font-bold text-sm"
          onClick={onOpenHelp}
        >
          <HelpCircle className="w-4 h-4 mr-3 text-accent-custom" />
          {t.help}
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-text-secondary hover:text-text-primary hover:bg-bg-surface h-12 rounded-xl px-4 font-bold text-sm"
          onClick={onOpenSettings}
        >
          <Settings className="w-4 h-4 mr-3" />
          {t.settings}
        </Button>
      </div>
    </div>
  );
}
