import { useRef, useEffect } from 'react';

function useElementArrayRefs<T extends HTMLElement>(length: number) {
  const refs = useRef<Array<T | null>>([]);

  useEffect(() => {
    // Resize the refs array if necessary
    refs.current = refs.current.slice(0, length);
    while (refs.current.length < length) {
      refs.current.push(null);
    }
  }, [length]);

  // Return both the refs array and a function to set refs
  return [
    refs.current,
    (index: number) => (el: T | null) => {
      refs.current[index] = el;
    }
  ] as const;
}

export default useElementArrayRefs;