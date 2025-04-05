import { User } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { XIcon } from "lucide-react";
import { 
  Home, 
  Phone, 
  Calendar, 
  Users, 
  History, 
  BookOpen,
  MessageSquareText,
  Settings
} from "lucide-react";

interface SidebarProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-[280px] border-r bg-background transition-transform duration-300 ease-in-out md:sticky md:z-0 md:translate-x-0 md:transition-none md:w-64 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-teal-500 text-transparent bg-clip-text">
              AgriConnect
            </span>
          </Link>
          <button 
            className="absolute right-4 top-4 md:hidden"
            onClick={onClose}
            aria-label="Close Sidebar"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        <SidebarContent user={user} onLinkClick={onClose} />
      </aside>
    </>
  );
}

interface SidebarContentProps {
  user: User;
  onLinkClick: () => void;
}

function SidebarContent({ user, onLinkClick }: SidebarContentProps) {
  const [location] = useLocation();
  
  const navItems = [
    {
      title: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      href: "/",
      allowedRoles: ["farmer", "specialist"],
    },
    {
      title: "My Calls",
      icon: <Phone className="h-5 w-5" />,
      href: "/my-calls",
      allowedRoles: ["farmer", "specialist"],
    },
    {
      title: "Schedule Appointment",
      icon: <Calendar className="h-5 w-5" />,
      href: "/schedule-appointment",
      allowedRoles: ["farmer", "specialist"],
    },
    {
      title: "Find Specialists",
      icon: <Users className="h-5 w-5" />,
      href: "/specialists",
      allowedRoles: ["farmer"],
    },
    {
      title: "Call History",
      icon: <History className="h-5 w-5" />,
      href: "/call-history",
      allowedRoles: ["farmer", "specialist"],
    },
    {
      title: "Knowledge Base",
      icon: <BookOpen className="h-5 w-5" />,
      href: "/knowledge-base",
      allowedRoles: ["farmer", "specialist"],
    },
    {
      title: "AI Assistant",
      icon: <MessageSquareText className="h-5 w-5" />,
      href: "/ai-assistant",
      allowedRoles: ["farmer"],
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/profile",
      allowedRoles: ["farmer", "specialist"],
    },
  ];
  
  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.allowedRoles.includes(user.role)
  );
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6">
      <nav className="flex-1 space-y-1">
        {filteredNavItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            onClick={onLinkClick}
          >
            <div
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                location === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.title}
            </div>
          </Link>
        ))}
      </nav>
      
      <div className="mt-auto py-4">
        <div className="rounded-md bg-muted p-4">
          <h4 className="text-sm font-medium">Need Help?</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Access our support resources or contact our team for assistance.
          </p>
          <Link href="/knowledge-base">
            <div className="mt-3 text-xs font-medium text-primary hover:underline">
              Visit Help Center
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}