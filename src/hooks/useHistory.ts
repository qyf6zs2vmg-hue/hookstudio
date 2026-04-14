import { useState, useEffect } from 'react';
import { GenerationResult, HistoryItem } from '../lib/types';

const STORAGE_KEY = 'hook_studio_history';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (result: GenerationResult) => {
    const newItem: HistoryItem = {
      id: result.id,
      title: result.idea.length > 30 ? result.idea.substring(0, 30) + '...' : result.idea,
      timestamp: result.timestamp,
      idea: result.idea,
      mode: result.mode,
      tool: result.tool
    };

    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    
    // Also save the full result
    localStorage.setItem(`result_${result.id}`, JSON.stringify(result));
  };

  const deleteFromHistory = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    localStorage.removeItem(`result_${id}`);
  };

  const getResult = (id: string): GenerationResult | null => {
    const saved = localStorage.getItem(`result_${id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  return { history, saveToHistory, deleteFromHistory, getResult };
}
