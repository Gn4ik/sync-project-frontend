import { useEffect, useRef, ReactNode } from 'react';
import './Popup.css';

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    position?: 'left' | 'right';
    triggerRef: React.RefObject<HTMLElement>;
}

const Popup = ({ isOpen, onClose, children, position = 'right', triggerRef }: PopupProps) => {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, triggerRef]);

    if (!isOpen) return null;

    return (
        <div ref={popupRef} className={`popup ${position}`} data-testid="popup-content">
            {children}
        </div>
    );
};

export default Popup;