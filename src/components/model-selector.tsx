"use client"

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const models = [
  { id: 'llama', name: 'LLama 70B' },
  { id: 'claude', name: 'Claude 3.5 Sonnet' },
  { id: 'openai', name: 'OpenAI o1' },
  { id: 'custom', name: 'Bring Your Own' },
]

export function ModelSelector() {
  const [selectedModel, setSelectedModel] = useState(models[0])
  const [showCustomModal, setShowCustomModal] = useState(false)

  const handleModelSelect = (model: typeof models[0]) => {
    if (model.id === 'custom') {
      setShowCustomModal(true)
    } else {
      setSelectedModel(model)
    }
  }

  return (
    <>
      <div className="flex items-center space-x-2 text-xs text-gray-400">
        <span>3 sources</span>
        <span className="mx-2">•</span>
        <div className="relative inline-block">
          {models.map((model) => (
            <Button
              key={model.id}
              variant="ghost"
              size="sm"
              className={`px-2 py-1 text-xs ${
                selectedModel.id === model.id ? 'bg-[#2A2A2A]' : ''
              }`}
              onClick={() => handleModelSelect(model)}
            >
              {model.name}
              {model.id === 'custom' && <ChevronRight className="ml-1 h-3 w-3 inline" />}
            </Button>
          ))}
        </div>
      </div>

      <Dialog open={showCustomModal} onOpenChange={setShowCustomModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bring Your Own AI Model</DialogTitle>
            <DialogDescription>
              Configure your custom AI model settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Model Endpoint URL</label>
              <input
                type="text"
                placeholder="https://api.your-model.com/v1"
                className="w-full rounded-md border border-[#3A3A3A] bg-[#2A2A2A] px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <input
                type="password"
                placeholder="sk-..."
                className="w-full rounded-md border border-[#3A3A3A] bg-[#2A2A2A] px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Model Name</label>
              <input
                type="text"
                placeholder="gpt-4-turbo"
                className="w-full rounded-md border border-[#3A3A3A] bg-[#2A2A2A] px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button className="w-full mt-4">
              Save Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
