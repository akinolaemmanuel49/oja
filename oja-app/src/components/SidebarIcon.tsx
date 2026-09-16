import { SidebarCloseIcon, SidebarOpenIcon } from "lucide-react";

type SidebarToggleProps = {
  isOpen: boolean;
  className?: string;
};

export const SidebarIcon = ({ isOpen, className }: SidebarToggleProps) => {
  return isOpen ? (
    <SidebarCloseIcon className={className} aria-label="Toggle Sidebar Close" />
  ) : (
    <SidebarOpenIcon className={className} aria-label="Toggle Sidebar Open" />
  );
};
