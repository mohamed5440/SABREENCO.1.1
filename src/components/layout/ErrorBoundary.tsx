import React, { ErrorInfo, ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public props: Props;
  public state: State = {
    hasError: false,
    error: null,
  };

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 text-right">
          <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-10 text-center space-y-8">
            <div className="w-20 h-20 bg-primary/5 rounded-xl flex items-center justify-center text-primary mx-auto border border-primary/20 shrink-0">
              <RefreshCw size={40} />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-medium text-gray-800 tracking-normal">
                يرجى إعادة المحاولة
              </h2>
              <p className="text-gray-500 font-medium leading-[1.7]">
                نواجه انقطاعاً مؤقتاً في الخدمة. من فضلك قم بتنشيط الصفحة
                للمتابعة.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-medium text-base transition-all duration-300 flex items-center justify-center gap-3 active:scale-95"
            >
              <RefreshCw size={20} />
              تنشيط الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
