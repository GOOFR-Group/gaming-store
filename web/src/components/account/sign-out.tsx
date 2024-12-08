import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { clearToken } from "@/lib/auth";

export function SignOut() {
  /**
   * Signs out a user and reloads the current page.
   */
  function handleClick() {
    clearToken();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    localStorage.removeItem("publisherConfig");
    window.location.reload();
  }
  
 
  return (
    <Button variant="ghost" onClick={handleClick}>
      <LogOut /> Sign Out
    </Button>
  );
}
