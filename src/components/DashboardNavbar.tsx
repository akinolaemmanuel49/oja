import { LogOut } from "lucide-react";
import { Button } from "@oja/ui";
import { SidebarIcon } from "./SidebarIcon";
import { useLogout } from "@/hooks/useLogout";
import { motion } from "motion/react";

type NavbarProps = {
  onToggleSidebar: () => void;
  isOpen: boolean;
};

export const Navbar = ({ onToggleSidebar, isOpen }: NavbarProps) => {
  const logoutMutation = useLogout();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 z-30">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <SidebarIcon
              isOpen={isOpen}
              className="w-6 h-6"
              aria-label="Toggle Sidebar"
            />
          </Button>

          {/* Desktop sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hidden lg:flex"
          >
            <SidebarIcon isOpen={isOpen} />
          </Button>

          <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ọjà
            </span>{" "}
            Dashboard
          </h1>
        </div>

        {/* Right side navbar */}
        <div className="flex items-center gap-2">
          {logoutMutation.isPending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-red-500"></div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <LogOut
                onClick={() => logoutMutation.mutate()}
                className="h-4 w-4 text-red-500 cursor-pointer"
              />
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
};
