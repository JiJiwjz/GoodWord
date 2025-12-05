import { cn } from "../../utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-400 ml-1">{label}</label>
      )}
      <div className="relative group">
        <input
          className={cn(
            "w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 pl-11",
            "text-slate-200 placeholder:text-slate-600",
            "focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
            "transition-all duration-200",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
    </div>
  );
}
