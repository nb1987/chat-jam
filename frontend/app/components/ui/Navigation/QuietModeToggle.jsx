import QuietModeContext from "@frontend/contexts/quiet-mode-context";
import { BellAlertIcon, BellSlashIcon } from "@heroicons/react/24/solid";
import { useContext } from "react";

export default function QuietModeToggle() {
  const { mode, toggleMode } = useContext(QuietModeContext);
  const icon =
    mode === "alert" ? (
      <BellAlertIcon className="h-5 w-5 text-orange-400 cursor-pointer" />
    ) : (
      <BellSlashIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
    );

  return (
    <div className="relative">
      <div onClick={() => toggleMode()} className="focus:outline-none">
        {icon}
      </div>
    </div>
  );
}
