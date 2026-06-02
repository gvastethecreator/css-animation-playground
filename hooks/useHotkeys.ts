import { useEffect, useRef } from 'react';

type HotkeyCallback = (event: KeyboardEvent) => void;
type HotkeyMap = { [key: string]: HotkeyCallback };

export function useHotkeys(hotkeyMap: HotkeyMap, deps: unknown[] = []) {
  const hotkeyMapRef = useRef(hotkeyMap);

  useEffect(() => {
    hotkeyMapRef.current = hotkeyMap;
  }, [hotkeyMap, ...deps]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const map = hotkeyMapRef.current;
      const keys = Object.keys(map);

      for (const key of keys) {
        const parts = key.toLowerCase().split('+');
        const eventKey = event.key.toLowerCase();

        const requiredKey = parts.pop();
        if (requiredKey !== eventKey) continue;

        const meta = parts.includes('meta') || parts.includes('cmd') || parts.includes('win');
        const ctrl = parts.includes('ctrl');
        const shift = parts.includes('shift');
        const alt = parts.includes('alt');

        if (
          meta === (event.metaKey || event.ctrlKey) &&
          (meta || ctrl === event.ctrlKey) &&
          shift === event.shiftKey &&
          alt === event.altKey
        ) {
          event.preventDefault();
          map[key](event);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
