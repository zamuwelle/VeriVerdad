import { useState, useRef, useEffect } from 'react'
import { useTitle } from '../hooks/useTitle'
import { useParams, useNavigate } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Sidebar } from '../components/Sidebar'
import { UpArrowIcon, EditIcon, CopyIcon, Chevron, SearchIcon, GameControllerIcon } from '../components/Icons'
import { sendMessage, getConversation } from '../api'

const getTime = d => new Date(d || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export const CodeBlock = ({ language, value }) => {
	const [copied, setCopied] = useState(false)
	const handleCopy = () => (navigator.clipboard.writeText(value), setCopied(true), setTimeout(() => setCopied(false), 2000))
	return (
		<div className="relative my-3 rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg)] text-xs">
			<div className="flex items-center justify-between px-3 py-1.5 bg-[var(--color-surface)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-mono">
				<span>{language || 'text'}</span>
				<button type="button" onClick={handleCopy} title={copied ? 'Copied!' : 'Copy'} className="hover:opacity-80 text-[var(--color-text)] cursor-pointer">
					<CopyIcon style={{ width: '14px', height: '14px' }} />
				</button>
			</div>
			<SyntaxHighlighter language={language || 'text'} style={oneDark} customStyle={{ margin: 0, padding: '12px', fontSize: '12px', borderRadius: 0 }}>
				{value}
			</SyntaxHighlighter>
		</div>
	)
}

export const Thinking = ({ reasoning, thinkTime, isThinkingActive = false }) => {
	const [isOpen, setIsOpen] = useState(false)
	return (
		<div className="my-2 select-none">
			<button type="button" onClick={() => setIsOpen(!isOpen)} className="group flex items-center gap-2 py-1.5 px-2.5 rounded-lg hover:opacity-80 text-[var(--color-text-muted)] text-xs cursor-pointer">
				<img src="/logo.png" alt="" className="h-4 w-auto object-contain" />
				<span className="font-medium">{isThinkingActive ? 'Thinking...' : `Thought for ${thinkTime || '2 seconds'}`}</span>
				<span className="opacity-0 group-hover:opacity-100">
					<Chevron open={isOpen} />
				</span>
			</button>
			{isOpen && (
				<div className="mt-2 pl-3.5 border-l-2 border-[var(--color-border)]">
					<div className="text-xs text-[var(--color-text-muted)] space-y-1.5 py-1 leading-relaxed whitespace-pre-wrap">
						{reasoning || 'Analyzing response steps...'}
					</div>
				</div>
			)}
		</div>
	)
}

export const Component = () => {
	const { conversationId: routeId } = useParams()
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const [messages, setMessages] = useState([])
	const [input, setInput] = useState('')
	const [editingId, setEditingId] = useState(null)
	const [editText, setEditText] = useState('')
	const [interactiveChoice, setInteractiveChoice] = useState(null)
	const [conversationId, setConversationId] = useState(routeId || null)
	const scrollContainerRef = useRef(null)
	const textareaRef = useRef(null)
	const requestStartTimeRef = useRef(null)

	useTitle(conversationId ? `Veribot — Chat ${conversationId}` : 'Veribot — VeriVerdad')

	const scroll = () => setTimeout(() => scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight }), 20)

	useEffect(() => {
		if (routeId) {
			setConversationId(routeId)
			getConversation(routeId).then(res => {
				const list = res?.messages || res?.data?.messages || (Array.isArray(res?.data) ? res.data : [])
				setMessages(list.map((m, i) => {
					const prev = list[i - 1]
					const diff = prev?.created_at && m.created_at ? Math.max(1, Math.round((new Date(m.created_at) - new Date(prev.created_at)) / 1000)) : 1
					return {
						...m,
						timestamp: getTime(m.created_at),
						thinkTime: `${diff} second${diff === 1 ? '' : 's'}`,
						hasVerify: m.content?.includes('[VERIFY]'),
						hasOfferQuiz: m.content?.includes('[OFFER_QUIZ]'),
						content: m.content?.replace('[VERIFY]', '')?.replace('[OFFER_QUIZ]', '')?.replace(/\[CHOICES:[^\]]+\]/, '')?.trim() || ''
					}
				}))
			})
		} else {
			setConversationId(null)
			setMessages([])
			setInteractiveChoice(null)
		}
	}, [routeId])

	useEffect(() => {
		messages.length && scroll()
	}, [messages.length])

	const chatMutation = useMutation({
		mutationFn: ({ message, id, verify }) => sendMessage(message, id, verify),
		onSuccess: res => {
			queryClient.invalidateQueries({ queryKey: ['chats'] })
			if (res.data.conversation_id) (setConversationId(res.data.conversation_id), !routeId && navigate(`/veribot/${res.data.conversation_id}`, { replace: true }))
			const raw = res.data.reply || ''
			const hasVerify = raw.includes('[VERIFY]')
			const hasOfferQuiz = raw.includes('[OFFER_QUIZ]')
			const choicesMatch = raw.match(/\[CHOICES:\s*([\s\S]+?)\]/)
			const reply = raw.replace('[VERIFY]', '').replace('[OFFER_QUIZ]', '').replace(/\[CHOICES:\s*[\s\S]+?\]/, '').trim()
			const totalTime = res.data.usage?.total_time
			const elapsed = totalTime ? Math.max(1, Math.round(totalTime)) : Math.max(1, Math.round((Date.now() - (requestStartTimeRef.current || Date.now())) / 1000))
			setMessages(prev => [...prev, {
				id: crypto.randomUUID(),
				role: 'assistant',
				content: reply,
				reasoning: res.data.reasoning,
				thinkTime: `${elapsed} second${elapsed === 1 ? '' : 's'}`,
				timestamp: getTime(res.data.created_at),
				hasVerify,
				hasOfferQuiz
			}])
			if (choicesMatch) setInteractiveChoice({ title: 'Pick an answer', options: choicesMatch[1].split('|').map(o => o.trim()) })
			else setInteractiveChoice(null)
			setTimeout(() => scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' }), 10)
		}
	})

	const sendPrompt = (textToSend, verify = false) => {
		const text = textToSend || input.trim()
		if (!text || chatMutation.isPending) return
		chatMutation.reset()
		if (!textToSend) {
			setInput('')
			textareaRef.current && (textareaRef.current.style.height = 'auto')
		}
		requestStartTimeRef.current = Date.now()
		setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: text, timestamp: getTime() }])
		chatMutation.mutate({ message: text, id: conversationId, verify })
	}

	const saveEditing = id => editText.trim() && sendPrompt(editText.trim())

	const renderInputCard = placeholderText => (
		<div className="w-full bg-[var(--color-surface)] rounded-2xl p-3.5 space-y-3 border border-[var(--color-border)]">
			<textarea ref={textareaRef} value={input} onChange={e => (setInput(e.target.value), textareaRef.current && (textareaRef.current.style.height = 'auto', textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`))} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendPrompt())} placeholder={placeholderText} rows={2} className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm p-1 pr-2 text-[var(--color-text)] placeholder-[var(--color-text-faint)] resize-none min-h-[44px] max-h-[200px]" />
			<div className="flex items-center justify-end">
				<button type="button" onClick={() => sendPrompt()} disabled={!input.trim() || chatMutation.isPending} className="p-1.5 bg-[var(--color-primary)] hover:opacity-80 text-white rounded-lg disabled:opacity-20 cursor-pointer">
					<UpArrowIcon className="w-4 h-4" />
				</button>
			</div>
		</div>
	)

	return (
		<div className="h-screen flex flex-col lg:flex-row bg-[var(--color-bg)] text-[var(--color-text)] overflow-hidden">
			<Sidebar />

			<main className="flex-1 flex flex-col h-full overflow-hidden relative">
				<div ref={scrollContainerRef} className="flex-1 w-full overflow-y-auto">
					{!messages.length ? (
						<div className="flex flex-col items-center justify-center min-h-full p-4 md:p-8 max-w-3xl mx-auto w-full">
							<img src="/mascot.png" alt="" className="w-24 h-24 sm:w-28 sm:h-28 object-contain mb-4 select-none" />
							<h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] tracking-tight mb-8 text-center">How can Veribot help you today?</h2>
							{renderInputCard("Ask Veribot to check a claim...")}
						</div>
					) : (
						<div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto w-full">
							{messages.map(msg => (
								<div key={msg.id} className="group flex flex-col space-y-1">
									<div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
										<div onDoubleClick={() => msg.role === 'user' && (setEditingId(msg.id), setEditText(msg.content))} className={`max-w-[88%] rounded-lg px-4 py-2.5 text-sm text-[var(--color-text)] ${editingId === msg.id ? 'border border-[var(--color-border)]' : msg.role === 'user' ? 'bg-[var(--color-surface)] cursor-pointer select-none' : ''}`}>
											{editingId === msg.id ? (
												<textarea autoFocus value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), saveEditing(msg.id))} rows={1} style={{ fieldSizing: 'content' }} className="w-full min-w-[280px] bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 text-sm text-[var(--color-text)] resize-none" />
											) : (
												<>
													{msg.role === 'assistant' && msg.reasoning && <Thinking reasoning={msg.reasoning} thinkTime={msg.thinkTime} />}
													<ReactMarkdown
														remarkPlugins={[remarkGfm]}
														components={{
															a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] underline hover:opacity-80" />,
															table: ({ node, ...props }) => <div className="overflow-x-auto my-2"><table {...props} className="w-full border-collapse border border-[var(--color-border)] text-xs" /></div>,
															th: ({ node, ...props }) => <th {...props} className="border border-[var(--color-border)] bg-[var(--color-bg)] p-2 font-semibold text-left text-[var(--color-text)]" />,
															td: ({ node, ...props }) => <td {...props} className="border border-[var(--color-border)] p-2 text-[var(--color-text)]" />,
															ul: ({ node, ...props }) => <ul {...props} className="list-disc ml-4 space-y-1 my-1" />,
															ol: ({ node, ...props }) => <ol {...props} className="list-decimal ml-4 space-y-1 my-1" />,
															p: ({ node, ...props }) => <p {...props} className="whitespace-pre-wrap leading-relaxed my-1" />,
															code: ({ node, className, children, ...props }) => {
																const match = /language-(\w+)/.exec(className || '')
																return match ? (
																	<CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
																) : (
																	<code {...props} className="bg-[var(--color-bg)] text-[var(--color-primary)] px-1 py-0.5 rounded text-xs border border-[var(--color-border)]">
																		{children}
																	</code>
																)
															}
														}}
													>
														{msg.content}
													</ReactMarkdown>

													{msg.role === 'assistant' && msg.id === messages.slice().reverse().find(m => m.role === 'assistant')?.id && msg.hasVerify && (
														<div className="pt-1.5">
															<button type="button" onClick={() => sendPrompt('Verify this claim with real sources and evidence.', true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] hover:opacity-80 text-xs font-medium text-[var(--color-text)] cursor-pointer">
																<SearchIcon style={{ width: '14px', height: '14px' }} />
																<span>Verify this claim with web sources</span>
															</button>
														</div>
													)}

													{msg.role === 'assistant' && msg.id === messages.slice().reverse().find(m => m.role === 'assistant')?.id && msg.hasOfferQuiz && (
														<div className="pt-1.5">
															<button type="button" onClick={() => sendPrompt('Test my instincts on this with a quick quiz question.')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] hover:opacity-80 text-xs font-medium text-[var(--color-text)] cursor-pointer">
																<GameControllerIcon style={{ width: '14px', height: '14px' }} />
																<span>Test your instincts (Quiz)</span>
															</button>
														</div>
													)}
												</>
											)}
										</div>
										{editingId === msg.id && (
											<div className="flex justify-end gap-2 text-xs mt-1">
												<button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded text-[var(--color-text)] hover:opacity-80 cursor-pointer">Cancel</button>
												<button type="button" onClick={() => saveEditing(msg.id)} disabled={!editText.trim()} className="px-3 py-1.5 rounded bg-[var(--color-primary)] text-white font-medium hover:opacity-80 disabled:opacity-50 cursor-pointer">Save</button>
											</div>
										)}
										{editingId !== msg.id && (
											<div className="flex items-center gap-1 mt-1 px-1 text-[var(--color-text-faint)] opacity-0 group-hover:opacity-100">
												{msg.timestamp && <span className="text-xs pr-1.5">{msg.timestamp}</span>}
												{msg.role === 'user' && <button type="button" onClick={() => (setEditingId(msg.id), setEditText(msg.content))} className="p-1.5 rounded hover:opacity-80 flex items-center justify-center cursor-pointer" style={{ width: '28px', height: '28px' }}><EditIcon style={{ width: '1em', height: '1em', fontSize: '16px' }} /></button>}
												<button type="button" onClick={() => navigator.clipboard.writeText(msg.content)} className="p-1.5 rounded hover:opacity-80 flex items-center justify-center cursor-pointer" style={{ width: '28px', height: '28px' }}><CopyIcon style={{ width: '1em', height: '1em', fontSize: '16px' }} /></button>
											</div>
										)}
									</div>
								</div>
							))}

							{chatMutation.isPending && (
								<div className="flex flex-col items-start max-w-[88%]">
									<div className="p-3 rounded-xl w-full">
										<Thinking isThinkingActive={true} />
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				<div className="p-4 shrink-0 bg-[var(--color-bg)] max-w-3xl w-full mx-auto space-y-3">
					{interactiveChoice && !chatMutation.isPending && (
						<div className="bg-[var(--color-surface)] rounded-xl p-3.5 space-y-2 border border-[var(--color-border)]">
							<div className="flex items-center justify-between px-0.5">
								<span className="text-xs font-semibold text-[var(--color-text)]">{interactiveChoice.title}</span>
								<button type="button" onClick={() => setInteractiveChoice(null)} className="text-[11px] text-[var(--color-text-faint)] hover:opacity-80 cursor-pointer">Dismiss</button>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
								{interactiveChoice.options.map((opt, idx) => (
									<button type="button" key={idx} onClick={() => (setInteractiveChoice(null), sendPrompt(opt))} className="flex items-center gap-2.5 p-2 rounded-lg bg-[var(--color-bg)] hover:opacity-80 border border-[var(--color-border)] text-left text-xs text-[var(--color-text)] cursor-pointer">
										<span className="w-5 h-5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[11px] text-[var(--color-text-muted)] shrink-0">{idx + 1}</span>
										<span className="flex-1 font-medium">{opt}</span>
									</button>
								))}
							</div>
						</div>
					)}

					{chatMutation.error?.response?.data?.message && (
						<div className="text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-border)] rounded-lg py-2 px-3">
							{chatMutation.error.response.data.message}
						</div>
					)}

					{!!messages.length && renderInputCard(interactiveChoice ? "Pick an option above or type here..." : "Reply to Veribot...")}

					<div className="text-center text-[11px] text-[var(--color-text-faint)]">
						<span>AI can make mistakes. Please double-check responses.</span>
					</div>
				</div>
			</main>
		</div>
	)
}