import { User } from "@shared/schema";
import { Button } from "../ui/button";
import { MenuIcon, BellIcon, LogOut, User as UserIcon } from "lucide-react";
import { Link } from "wouter";

interface HeaderProps {
  user: User;
  onMenuClick: () => void;
  onLogout: () => void;
}

export default function Header({ user, onMenuClick, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <button
          className="mr-4 md:hidden"
          onClick={onMenuClick}
          aria-label="Toggle Menu"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        
        <div className="flex items-center gap-2 md:hidden">
          <span className="font-semibold text-lg bg-gradient-to-r from-green-600 to-teal-500 text-transparent bg-clip-text">
            AgriConnect
          </span>
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
          </Button>
          
          <div className="border-l h-8 mx-2 opacity-20" />
          
          <div className="flex items-center gap-2">
            <Link href="/profile">
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}