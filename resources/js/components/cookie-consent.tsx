import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if consent has already been given or rejected
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    if (!isVisible) return null;

    const acceptAll = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const rejectAll = () => {
        localStorage.setItem('cookie-consent', 'rejected');
        setIsVisible(false);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="max-w-4xl bg-background border shadow-xl rounded-xl p-6 pointer-events-auto flex flex-col sm:flex-row items-start sm:items-center gap-6 relative overflow-hidden">
                <button 
                    onClick={rejectAll} 
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 shrink-0 hidden sm:flex">
                    <Cookie className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 pr-6 sm:pr-0">
                    <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                        <Cookie className="h-5 w-5 text-primary sm:hidden" />
                        We value your privacy
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                    </p>
                </div>
                <div className="flex flex-row gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <Button variant="outline" onClick={rejectAll} className="w-full sm:w-auto">
                        Reject All
                    </Button>
                    <Button onClick={acceptAll} className="w-full sm:w-auto">
                        Accept All
                    </Button>
                </div>
            </div>
        </div>
    );
}
