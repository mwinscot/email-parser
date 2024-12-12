'use client'

import { useState, useCallback } from 'react'
import { Mail, Copy, Send, Trash } from 'lucide-react'

interface GeneratedEmails {
  [key: string]: string
}

export default function EmailParser() {
  const [sourceEmail, setSourceEmail] = useState<string>('')
  const [emailTemplate, setEmailTemplate] = useState<string>('')
  const [extractedEmails, setExtractedEmails] = useState<string[]>([])
  const [generatedEmails, setGeneratedEmails] = useState<GeneratedEmails>({})

  const extractEmails = useCallback((text: string): string[] => {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
    const found = text.match(emailRegex) || []
    return [...new Set(found)]
  }, [])

  const getEmailContext = useCallback((email: string): string => {
    const paragraphs = sourceEmail.split('\n\n')
    const relevantParagraph = paragraphs.find(p => p.includes(email)) || ''
    return relevantParagraph
  }, [sourceEmail])

  const parseSourceEmail = useCallback((): void => {
    const emails = extractEmails(sourceEmail)
    setExtractedEmails(emails)
    
    const initialEmails: GeneratedEmails = {}
    emails.forEach(email => {
      initialEmails[email] = ''
    })
    setGeneratedEmails(initialEmails)
  }, [sourceEmail, extractEmails])

  const generateEmail = useCallback((recipientEmail: string): void => {
    const processed = emailTemplate
      .replace('[EMAIL]', recipientEmail)
      .replace('[CONTEXT]', getEmailContext(recipientEmail))
    
    setGeneratedEmails(prev => ({
      ...prev,
      [recipientEmail]: processed
    }))
  }, [emailTemplate, getEmailContext])

  const copyToClipboard = useCallback(async (email: string, content: string): Promise<void> => {
    const fullEmail = `To: ${email}\n\n${content}`
    try {
      await navigator.clipboard.writeText(fullEmail)
      alert('Email copied to clipboard!')
    } catch {
      // Remove the error parameter entirely since we're not using it
      alert('Failed to copy email. Please copy manually.')
    }
  }, [])

  const openInMailClient = useCallback((email: string, content: string): void => {
    const mailtoLink = `mailto:${email}?body=${encodeURIComponent(content)}`
    window.location.href = mailtoLink
  }, [])

  const removeEmail = useCallback((emailToRemove: string): void => {
    setExtractedEmails(prev => prev.filter(email => email !== emailToRemove))
    setGeneratedEmails(prev => {
      const updated = { ...prev }
      delete updated[emailToRemove]
      return updated
    })
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
            <Mail className="w-8 h-8 text-blue-500" />
            Email Parser and Composer
          </h2>
        </div>

        <div className="p-8">
          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Source Email */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Source Email
              </label>
              <textarea
                className="w-full p-4 border-2 border-gray-200 rounded-lg h-96 
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          text-gray-700 text-base"
                value={sourceEmail}
                onChange={(e) => setSourceEmail(e.target.value)}
                placeholder="Paste the source email here"
              />
              <button
                onClick={parseSourceEmail}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg
                         text-lg font-medium hover:bg-blue-600 transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Extract Email Addresses
              </button>
            </div>
            
            {/* Email Template */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Email Template
              </label>
              <textarea
                className="w-full p-4 border-2 border-gray-200 rounded-lg h-96
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          text-gray-700 text-base"
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                placeholder="Enter your email template. Use [EMAIL] for recipient address and [CONTEXT] for the surrounding context from the source email."
              />
            </div>
          </div>

          {/* Results Section */}
          {extractedEmails.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Extracted Emails ({extractedEmails.length})
              </h3>
              <div className="space-y-6">
                {extractedEmails.map((email) => (
                  <div key={email} className="bg-gray-50 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-medium text-gray-800">{email}</h4>
                      <div className="flex gap-3">
                        <button
                          onClick={() => generateEmail(email)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg
                                   text-sm font-medium hover:bg-blue-600 transition-colors"
                        >
                          Generate
                        </button>
                        <button
                          onClick={() => removeEmail(email)}
                          className="text-red-500 hover:text-red-600 transition-colors
                                   p-2 rounded-lg hover:bg-red-50"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {generatedEmails[email] && (
                      <div className="space-y-4">
                        <div className="border-2 border-gray-200 rounded-lg p-4 bg-white
                                    whitespace-pre-wrap text-gray-700">
                          {generatedEmails[email]}
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => copyToClipboard(email, generatedEmails[email])}
                            className="flex items-center gap-2 bg-gray-600 text-white
                                     px-4 py-2 rounded-lg text-sm font-medium
                                     hover:bg-gray-700 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            Copy
                          </button>
                          <button
                            onClick={() => openInMailClient(email, generatedEmails[email])}
                            className="flex items-center gap-2 bg-green-500 text-white
                                     px-4 py-2 rounded-lg text-sm font-medium
                                     hover:bg-green-600 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            Open in Mail
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}