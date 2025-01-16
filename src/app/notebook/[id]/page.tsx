"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Settings, Share, ChevronRight, X, Upload, Link as LinkIcon, Youtube } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { ModelSelector } from "@/components/model-selector"
import { AudioLoading } from "@/components/audio-loading"
import { WebsiteURLInput } from "@/components/website-url-input"

export default function NotebookPage({ params }: { params: { id: string } }) {
  const [audioLoaded, setAudioLoaded] = useState(false)
  const [showWebsiteInput, setShowWebsiteInput] = useState(false)
  const [addSourceOpen, setAddSourceOpen] = useState(false)

  const handleWebsiteSubmit = (url: string) => {
    // Handle the URL submission here
    console.log('Submitted URL:', url)
    setShowWebsiteInput(false)
    setAddSourceOpen(false)
  }

  const sources = [
    {
      id: 'eta',
      title: 'Entrepreneurship Through Acquisition: ...',
      type: 'document'
    },
    {
      id: 'nomad',
      title: 'Nomad AI',
      type: 'document'
    },
    {
      id: 'text',
      title: 'Pasted Text',
      type: 'text'
    }
  ]

  const notes = [
    {
      id: 1,
      title: "Acquiring a Business: A Guide to Search Funds and...",
      description: "Okay, here is a timeline of events and a cast of characters based on the provided sources. Timeline o..."
    },
    {
      id: 2,
      title: "Mergers & Acquisitions, Entrepreneurship, and AI",
      description: "Okay, here is a detailed briefing document summarizing the provided sources, focusing on key themes, ideas..."
    }
  ]

  return (
    <main className="min-h-screen bg-[#1C1C1C]">
      <nav className="border-b border-[#2A2A2A]">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-semibold text-white">Untitled notebook</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Share className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Sources Panel */}
        <div className="w-72 border-r border-[#2A2A2A] p-4 bg-[#1C1C1C]">
          <h2 className="text-sm font-medium text-white mb-4">Sources</h2>
          <Dialog open={addSourceOpen} onOpenChange={setAddSourceOpen}>
            <DialogTrigger asChild>
              <Button className="w-full mb-4" variant="outline">
                + Add source
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-[#1A1A1A] border-[#2A2A2A]">
              {showWebsiteInput ? (
                <WebsiteURLInput 
                  onBack={() => setShowWebsiteInput(false)}
                  onSubmit={handleWebsiteSubmit}
                />
              ) : (
                <>
                  <DialogHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <img src="/notebooklm-logo.png" alt="NotebookLM" className="h-8" />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setAddSourceOpen(false)}
                        className="hover:bg-[#2A2A2A]"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <DialogTitle className="text-2xl">Add sources</DialogTitle>
                    <p className="text-gray-400">
                      Sources let NotebookLM base its responses on the information that matters most to you.
                      <br />
                      (Examples: marketing plans, course reading, research notes, meeting transcripts, sales documents, etc.)
                    </p>
                  </DialogHeader>

                  <div className="border border-dashed border-[#3A3A3A] rounded-lg p-8 text-center space-y-4">
                    <div className="flex justify-center">
                      <Upload className="h-8 w-8 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-lg">Upload sources</p>
                      <p className="text-sm text-gray-400">
                        Drag & drop or <span className="text-blue-500">choose file</span> to upload
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Supported file types: PDF, txt, Markdown, Audio (e.g. mp3)
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2 p-4 rounded-lg bg-[#2A2A2A] hover:bg-[#3A3A3A] cursor-pointer">
                      <img src="/google-drive.png" alt="Google Drive" className="h-6" />
                      <p className="text-sm">Google Drive</p>
                    </div>
                    <div 
                      className="space-y-2 p-4 rounded-lg bg-[#2A2A2A] hover:bg-[#3A3A3A] cursor-pointer"
                      onClick={() => setShowWebsiteInput(true)}
                    >
                      <LinkIcon className="h-6 w-6" />
                      <p className="text-sm">Website</p>
                    </div>
                    <div className="space-y-2 p-4 rounded-lg bg-[#2A2A2A] hover:bg-[#3A3A3A] cursor-pointer">
                      <Youtube className="h-6 w-6" />
                      <p className="text-sm">YouTube</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className="flex-shrink-0">Source limit</span>
                    <div className="w-full h-1 bg-[#2A2A2A] rounded-full">
                      <div className="w-1/3 h-full bg-blue-500 rounded-full" />
                    </div>
                    <span className="flex-shrink-0">3 / 50</span>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
          
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className={`w-full justify-start text-sm`}
              onClick={() => setSelectedSources(['all'])}
            >
              Select all sources
            </Button>
            {sources.map((source) => (
              <Button
                key={source.id}
                variant="ghost"
                className={`w-full justify-start text-sm`}
              >
                {source.title}
              </Button>
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col bg-[#1C1C1C]">
          <div className="flex-1 p-4 overflow-auto">
            <Card className="p-4 mb-4 bg-[#2A2A2A] border-[#3A3A3A]">
              <h3 className="font-medium text-white mb-2">Untitled notebook</h3>
              <p className="text-sm text-gray-400">
                The provided texts describe two distinct businesses. Morgan & Westfield is a mergers and acquisitions (M&A) firm offering services to help businesses buy and sell, providing resources such as podcasts, books, and expert consultations. Nomad AI offers AI-powered financial tools and services specifically for small and medium-sized businesses (SMBs) in the consumer packaged goods (CPG) sector, including predictive modeling and automated reporting features at various subscription levels.
              </p>
            </Card>
          </div>
          
          <div className="border-t border-[#2A2A2A] p-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="How does the M&A process impact small business owners?"
                className="flex-1 rounded-md border border-[#3A3A3A] bg-[#2A2A2A] px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button className="bg-blue-500 hover:bg-blue-600">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-2">
              <ModelSelector />
            </div>
          </div>
        </div>

        {/* Studio Panel */}
        <div className="w-80 border-l border-[#2A2A2A] p-4 bg-[#1C1C1C]">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-white">Audio Overview</h2>
              <Button variant="ghost" size="icon" className="h-4 w-4">
                <span className="sr-only">Info</span>
                ℹ️
              </Button>
            </div>
            <Card className="p-4 text-center bg-[#2A2A2A] border-[#3A3A3A]">
              {!audioLoaded ? (
                <>
                  <p className="text-sm text-gray-400">Click to load the conversation.</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setAudioLoaded(true)}
                  >
                    Load
                  </Button>
                </>
              ) : (
                <AudioLoading />
              )}
            </Card>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-white">Notes</h2>
              <Button variant="ghost" size="icon" className="h-4 w-4">
                ⋮
              </Button>
            </div>
            <Button className="w-full mb-4" variant="outline">
              + Add note
            </Button>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button variant="outline" size="sm">Study guide</Button>
              <Button variant="outline" size="sm">Briefing doc</Button>
              <Button variant="outline" size="sm">FAQ</Button>
              <Button variant="outline" size="sm">Timeline</Button>
            </div>
            <div className="space-y-3">
              {notes.map((note) => (
                <Card key={note.id} className="p-3 bg-[#2A2A2A] border-[#3A3A3A]">
                  <h3 className="text-sm font-medium text-white mb-1">{note.title}</h3>
                  <p className="text-xs text-gray-400">{note.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
