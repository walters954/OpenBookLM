"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelRightClose } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotebookClient({
  notebook: initialNotebook,
}: NotebookClientProps) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  return (
    <div className={cn(
      "flex flex-col min-h-[calc(100vh-56px)]",
      rightSidebarOpen ? "w-80" : "w-0"
    )}>
      {/* Sidebar Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="text-gray-400 hover:text-white"
          >
            <PanelLeftClose
              className={`h-4 w-4 transition-all ${
                leftSidebarOpen ? "" : "rotate-180"
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className="text-gray-400 hover:text-white"
          >
            <PanelRightClose
              className={`h-4 w-4 transition-all ${
                rightSidebarOpen ? "" : "rotate-180"
              }`}
            />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300
        ${leftSidebarOpen ? "ml-28" : "ml-0"} 
        ${rightSidebarOpen ? "mr-8" : "mr-0"}`}
      >
        {/* Your existing notebook content here */}
        <div className="p-8">{/* ... rest of your notebook content ... */}</div>
      </div>
    </div>
  );
}
