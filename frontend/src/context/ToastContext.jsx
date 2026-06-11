import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext({ notify: () => {} });

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message, type = "info") => {
    const id = ++idCounter;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3500);
  }, []);

  const color = {
    info: "border-accent-blue",
    success: "border-accent-green",
    error: "border-accent-red",
  };

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-fade-in rounded-2xl border-l-4 bg-bg-elevated px-4 py-3 text-sm text-text-primary shadow-soft ${
              color[t.type] || color.info
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
