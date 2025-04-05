import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

interface ToasterProps {
  toasts?: Toast[];
}

export function Toaster({ toasts = [] }: ToasterProps) {
  return (
    <div className="fixed bottom-0 right-0 z-50 w-full md:max-w-md p-4 md:p-6 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}

function Toast({
  id,
  title,
  description,
  variant = "default",
  duration = 5000,
}: Toast) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div
      className={`pointer-events-auto w-full rounded-lg border shadow-lg transition-all animate-in slide-in-from-bottom-5 fade-in
        ${
          variant === "destructive"
            ? "bg-destructive text-destructive-foreground"
            : variant === "success"
            ? "bg-green-600 text-white"
            : "bg-background text-foreground"
        }
      `}
    >
      <div className="p-4 relative flex items-start gap-4">
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          {description && (
            <p className="text-sm mt-1 opacity-90">{description}</p>
          )}
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className={`rounded-full p-1 opacity-70 hover:opacity-100 
            ${
              variant === "destructive" || variant === "success"
                ? "hover:bg-white/10"
                : "hover:bg-muted"
            }
          `}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Create a container for toast messages
const toastMessages: Toast[] = [];
let listeners: ((toasts: Toast[]) => void)[] = [];

const addToast = (toast: Omit<Toast, "id">) => {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast = { ...toast, id };
  toastMessages.push(newToast);
  listeners.forEach((listener) => listener([...toastMessages]));

  // Auto-remove after duration
  setTimeout(() => {
    const index = toastMessages.findIndex((t) => t.id === id);
    if (index !== -1) {
      toastMessages.splice(index, 1);
      listeners.forEach((listener) => listener([...toastMessages]));
    }
  }, toast.duration || 5000);
};

// Hook to use toast
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>(toastMessages);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((listener) => listener !== setToasts);
    };
  }, []);

  return {
    toasts,
    toast: (props: Omit<Toast, "id">) => addToast(props),
  };
};