import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sendMessage, ChatMessage } from '@/services/chatService';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '@/context/SettingsContext';

export function ChatAssistant() {
  const { t } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const response = await sendMessage(userMsg, messages);
    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="absolute bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[320px] h-[450px] flex flex-col"
          >
            <Card className="flex-1 flex flex-col bg-bg-card border-border-custom shadow-2xl overflow-hidden rounded-2xl">
              {/* Header */}
              <div className="p-3 border-b border-border-custom bg-bg-surface flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-accent-custom flex items-center justify-center text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">{t.aiAssistant}</h3>
                    <p className="text-[9px] text-text-secondary uppercase tracking-widest font-bold">{t.online}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-text-muted hover:text-text-primary" onClick={() => setIsOpen(false)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3" ref={scrollRef}>
                  {messages.length === 0 && (
                    <div className="text-center py-6 space-y-1">
                      <p className="text-text-secondary text-xs font-bold">{t.chatWelcome}</p>
                      <p className="text-text-muted text-[10px]">{t.chatSubtitle}</p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] p-2.5 rounded-xl text-[11px] leading-relaxed",
                          msg.role === 'user'
                            ? "bg-accent-custom text-white rounded-tr-none"
                            : "bg-bg-surface text-text-primary border border-border-custom rounded-tl-none"
                        )}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-bg-surface border border-border-custom p-2.5 rounded-xl rounded-tl-none">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-custom" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-3 border-t border-border-custom bg-bg-surface">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder={t.chatPlaceholder}
                    className="h-9 text-xs bg-bg-deep border-border-custom text-text-primary focus:ring-accent-custom/20 rounded-lg"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <Button type="submit" size="icon" className="h-9 w-9 bg-accent-custom hover:opacity-90 shrink-0 rounded-lg" disabled={isLoading || !input.trim()}>
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        className={cn(
          "w-12 h-12 rounded-full shadow-2xl transition-all duration-300",
          isOpen ? "bg-bg-surface text-text-primary rotate-90" : "bg-accent-custom text-white hover:scale-110"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </Button>
    </div>
  );
}
