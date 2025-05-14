"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import ReactMarkdown from "react-markdown"

interface MDXEditorProps {
  value: string
  onChange: (value: string) => void
}

export function MDXEditor({ value, onChange }: MDXEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("editor")
  const [content, setContent] = useState(value || "")

  useEffect(() => {
    setContent(value || "")
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setContent(newValue)
    onChange(newValue)
  }

  return (
    <div className="border rounded-md">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Vista previa</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="editor" className="p-0">
          <Textarea
            value={content}
            onChange={handleChange}
            className="min-h-[400px] border-0 rounded-none focus-visible:ring-0 resize-y"
            placeholder="Escribe el contenido en formato Markdown..."
          />
        </TabsContent>

        <TabsContent value="preview" className="p-4 min-h-[400px] prose max-w-none dark:prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </TabsContent>
      </Tabs>
    </div>
  )
}
