import { ViralMode, GenerationResult, ContentPack, ContentTone, ToolType } from '../lib/types';
import { generateContent } from './aiService';

// --- Types ---

export interface QueueStatus {
  position: number;
  totalInQueue: number;
  estimatedWaitTime: number; // in seconds
}

export interface LimitStatus {
  userRequestsToday: number;
  globalRequestsToday: number;
  userLimit: number;
  globalLimit: number;
  isUserLimited: boolean;
  isGlobalLimited: boolean;
  resetTimeRemaining: number; // ms until next day
}

export interface CooldownStatus {
  isCoolingDown: boolean;
  remainingTime: number; // ms
}

// --- Constants ---

const USER_DAILY_LIMIT = 2;
const GLOBAL_DAILY_LIMIT = 50;
const COOLDOWN_MS = 10000; // 10 seconds
const CACHE_KEY = 'hook_studio_cache';
const LIMITS_KEY = 'hook_studio_limits';
const GLOBAL_LIMITS_KEY = 'hook_studio_global_limits';

// --- State ---

let isProcessing = false;
const queue: Array<{
  params: [string, ViralMode, ContentPack, ContentTone, ToolType];
  resolve: (result: GenerationResult) => void;
  reject: (error: any) => void;
  onStatusUpdate: (status: QueueStatus) => void;
}> = [];

// --- Helpers ---

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getCache(): Record<string, GenerationResult> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (e) {
    console.error("Cache read error:", e);
    return {};
  }
}

function setCache(key: string, result: GenerationResult) {
  try {
    const cache = getCache();
    cache[key] = result;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error("Cache write error:", e);
  }
}

function getRequestKey(input: string, mode: ViralMode, pack: ContentPack, tone: ContentTone, tool: ToolType) {
  // Use a simple string key instead of btoa to avoid Unicode issues with Russian/Uzbek characters
  return `key_${input}_${mode}_${pack}_${tone}_${tool}`;
}

function getUserLimits() {
  try {
    const limits = localStorage.getItem(LIMITS_KEY);
    const today = getTodayKey();
    const parsed = limits ? JSON.parse(limits) : { date: today, count: 0, lastRequest: 0 };
    
    if (parsed.date !== today) {
      return { date: today, count: 0, lastRequest: parsed.lastRequest };
    }
    return parsed;
  } catch (e) {
    return { date: getTodayKey(), count: 0, lastRequest: 0 };
  }
}

function setUserLimits(count: number, lastRequest: number) {
  try {
    const today = getTodayKey();
    localStorage.setItem(LIMITS_KEY, JSON.stringify({ date: today, count, lastRequest }));
  } catch (e) {
    console.error("Limits write error:", e);
  }
}

// Global limits simulation (using localStorage for demo purposes)
function getGlobalLimits() {
  try {
    const limits = localStorage.getItem(GLOBAL_LIMITS_KEY);
    const today = getTodayKey();
    const parsed = limits ? JSON.parse(limits) : { date: today, count: 0 };
    
    if (parsed.date !== today) {
      return { date: today, count: 0 };
    }
    return parsed;
  } catch (e) {
    return { date: getTodayKey(), count: 0 };
  }
}

function setGlobalLimits(count: number) {
  try {
    const today = getTodayKey();
    localStorage.setItem(GLOBAL_LIMITS_KEY, JSON.stringify({ date: today, count }));
  } catch (e) {
    console.error("Global limits write error:", e);
  }
}

function getResetTimeRemaining() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
}

// --- Public API ---

export function getSystemStatus(): { limits: LimitStatus; cooldown: CooldownStatus } {
  const user = getUserLimits();
  const global = getGlobalLimits();
  const now = Date.now();
  const cooldownRemaining = Math.max(0, user.lastRequest + COOLDOWN_MS - now);

  return {
    limits: {
      userRequestsToday: user.count,
      globalRequestsToday: global.count,
      userLimit: USER_DAILY_LIMIT,
      globalLimit: GLOBAL_DAILY_LIMIT,
      isUserLimited: user.count >= USER_DAILY_LIMIT,
      isGlobalLimited: global.count >= GLOBAL_DAILY_LIMIT,
      resetTimeRemaining: getResetTimeRemaining()
    },
    cooldown: {
      isCoolingDown: cooldownRemaining > 0,
      remainingTime: cooldownRemaining
    }
  };
}

export async function enqueueRequest(
  input: string,
  mode: ViralMode,
  pack: ContentPack,
  tone: ContentTone,
  tool: ToolType,
  onStatusUpdate: (status: QueueStatus) => void
): Promise<GenerationResult> {
  // 1. Check Cache
  const key = getRequestKey(input, mode, pack, tone, tool);
  const cache = getCache();
  if (cache[key]) {
    console.log("Returning cached result");
    return cache[key];
  }

  // 2. Check Limits
  const status = getSystemStatus();
  if (status.limits.isUserLimited) throw new Error('USER_LIMIT_REACHED');
  if (status.limits.isGlobalLimited) throw new Error('GLOBAL_LIMIT_REACHED');
  if (status.cooldown.isCoolingDown) throw new Error('COOLDOWN_ACTIVE');

  // 3. Add to Queue
  return new Promise((resolve, reject) => {
    queue.push({
      params: [input, mode, pack, tone, tool],
      resolve,
      reject,
      onStatusUpdate
    });
    
    updateQueueStatuses();
    processQueue();
  });
}

function updateQueueStatuses() {
  queue.forEach((item, index) => {
    item.onStatusUpdate({
      position: index + 1,
      totalInQueue: queue.length,
      estimatedWaitTime: (index + 1) * 3 // Estimate 3 seconds per request
    });
  });
}

async function processQueue() {
  if (isProcessing || queue.length === 0) return;

  isProcessing = true;
  const item = queue.shift()!;
  updateQueueStatuses();

  try {
    const [input, mode, pack, tone, tool] = item.params;
    
    // Final limit check before processing
    const status = getSystemStatus();
    if (status.limits.isUserLimited) throw new Error('USER_LIMIT_REACHED');
    if (status.limits.isGlobalLimited) throw new Error('GLOBAL_LIMIT_REACHED');

    const result = await generateContent(input, mode, pack, tone, tool);
    
    // Update Cache
    const key = getRequestKey(input, mode, pack, tone, tool);
    setCache(key, result);

    // Update Limits
    const user = getUserLimits();
    const global = getGlobalLimits();
    setUserLimits(user.count + 1, Date.now());
    setGlobalLimits(global.count + 1);

    item.resolve(result);
  } catch (error) {
    item.reject(error);
  } finally {
    isProcessing = false;
    processQueue();
  }
}
