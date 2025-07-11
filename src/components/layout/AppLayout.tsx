import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileTabBar } from "./MobileTabBar";
import { Bell, Settings, User, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, profile, signOut } = useAuth();
  const [defaultOpen, setDefaultOpen] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      // iPad breakpoint is typically around 768px to 1024px
      // We'll default to collapsed for tablet/iPad sizes (768px - 1023px)
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      setDefaultOpen(!isTablet);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 px-4 lg:px-8">
            {/* Left Section - Menu & Search */}
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="lg:hidden" />
              
              {/* Search - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-2 max-w-sm flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects, tasks..."
                    className="pl-10 h-9 bg-muted/50"
                  />
                </div>
              </div>

              {/* Mobile Title */}
              <div className="md:hidden">
                <h1 className="text-lg font-semibold text-foreground">
                  Phase-Gate
                </h1>
              </div>
            </div>

            {/* Right Section - Actions & Profile */}
            <div className="flex items-center gap-2">
              {/* Search button for mobile */}
              <Button variant="ghost" size="sm" className="md:hidden">
                <Search className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center rounded-full"
                >
                  3
                </Badge>
              </Button>

              {/* Settings - Hidden on mobile */}
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Settings className="h-5 w-5" />
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/01.png" alt={profile?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {profile?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{profile?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem className="sm:hidden">Settings</DropdownMenuItem>
                  <DropdownMenuItem>Preferences</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={signOut}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-x-hidden bg-muted/30">
            <div className="h-full px-4 py-6 lg:px-8 pb-20 lg:pb-6">
              {children}
            </div>
          </main>

          {/* Mobile Tab Bar */}
          <div className="lg:hidden">
            <MobileTabBar />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}