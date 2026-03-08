import { MessageSquare, Building2, ChevronRight, ChevronLeft, ShieldAlert } from 'lucide-react';

const NavSidebar = ({ activePanel, onToggleSecondary, isOpen }) => {
    const navItems = [
        { id: 'knowledge', icon: MessageSquare, label: 'Knowledge' },
        { id: 'pulse', icon: ShieldAlert, label: 'Janata Pulse' },
        { id: 'organizations', icon: Building2, label: 'Organizations' },
    ];

    return (
        <div className="w-20 h-full bg-white border-r border-orange-100 flex flex-col items-center py-8 z-50 shadow-xl">
            <div className="flex-1 flex flex-col gap-6">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onToggleSecondary(item.id)}
                        className={`p-4 rounded-2xl transition-all group relative ${activePanel === item.id
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                            : 'text-gray-400 hover:bg-orange-50 hover:text-orange-500'
                            }`}
                        title={item.label}
                    >
                        <item.icon size={28} strokeWidth={2.5} />

                        {/* Tooltip */}
                        <div className="absolute left-full ml-4 px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60]">
                            {item.label}
                        </div>

                        {activePanel === item.id && (
                            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        )}
                    </button>
                ))}
            </div>

            <button
                onClick={() => onToggleSecondary(activePanel)}
                className="p-3 text-gray-400 hover:text-orange-600 transition-colors"
                title={isOpen ? "Close Panel" : "Open Panel"}
            >
                {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
            </button>
        </div>
    );
};

export default NavSidebar;
