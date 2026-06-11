import { Link } from "@tanstack/react-router";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function AuthMenu() {
  const { user, signOut } = useAuth();
  if (!user) {
    return (
      <Link to="/auth" aria-label="Account"><User className="h-[18px] w-[18px]" /></Link>
    );
  }
  const name = (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "Account";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Account"><User className="h-[18px] w-[18px]" /></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-none">
        <DropdownMenuLabel className="font-display text-base">{name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => signOut()} className="text-xs tracking-luxury">
          <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}