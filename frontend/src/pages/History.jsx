import { useState } from 'react'
import { useTitle } from '../hooks/useTitle'
import { Link, useLocation, useNavigate } from 'react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TrashIcon } from '../components/Icons'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { getConversations, deleteConversation, updateConversation } from '../api'
import { Sidebar } from '../components/Sidebar'

const toTitleCase = str => str ? str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : ''

export const Component = () => {
	useTitle('History — VeriVerdad')
	const location = useLocation()
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const [editingId, setEditingId] = useState(null)
	const [editTitle, setEditTitle] = useState('')
	const [deleteTarget, setDeleteTarget] = useState(null)

	const { data: chats = [] } = useQuery({
		queryKey: ['chats'],
		queryFn: () => getConversations().then(res => res.data?.data || res.data || [])
	})

	const deleteMutation = useMutation({
		mutationFn: deleteConversation,
		onSuccess: (_, id) => (queryClient.invalidateQueries({ queryKey: ['chats'] }), location.pathname === `/veribot/${id}` && navigate('/veribot', { replace: true }))
	})

	const renameMutation = useMutation({
		mutationFn: ({ id, title }) => updateConversation(id, title),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats'] })
	})

	const saveRename = id => (editTitle.trim() && renameMutation.mutate({ id, title: editTitle.trim() }), setEditingId(null))

	return (
		<>
			<div className="min-h-screen flex flex-col lg:flex-row bg-[var(--color-bg)] text-[var(--color-text)]">
				<Sidebar />
				<main className="flex-1 md:px-32 pt-16">
					<h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight mb-8 text-center">History</h1>
					<div className="flex flex-col gap-0.5 overflow-y-auto flex-1">
					{ ! Array.isArray(chats) || chats.length === 0 ? <p className='text-center'>No recent conversation yet</p> :
						chats.map(chat => {
						const isChatActive = location.pathname === `/veribot/${chat.id}`
						const chatTitle = toTitleCase(chat.title || chat.first_message || 'Untitled Chat')
						return (
							<div key={chat.id} className={`group flex items-center justify-between px-3.5 py-2 hover:opacity-80 text-2xl p-2 md:px-16 border border-[var(--color-border)] ${isChatActive ? 'bg-[var(--color-bg)] text-[var(--color-text)] font-semibold' : 'text-[var(--color-text)] bg-transparent font-normal'}`}>
								{editingId === chat.id ? (
									<input type="text" autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)} onBlur={() => saveRename(chat.id)} onKeyDown={e => e.key === 'Enter' && saveRename(chat.id)} className="bg-transparent border border-[var(--color-border)] rounded px-1.5 py-0.5 text-xs text-[var(--color-text)] outline-none flex-1 w-full" />
								) : (
									<Link to={`/veribot/${chat.id}`} onDoubleClick={() => (setEditingId(chat.id), setEditTitle(chatTitle))} className="truncate flex-1 no-underline text-inherit select-none">
										<p className='text-2xl'>{chatTitle}</p>
									</Link>
								)}
								<button type="button" onClick={e => (e.stopPropagation(), e.preventDefault(), setDeleteTarget({ id: chat.id, title: chatTitle }))} className="opacity-0 group-hover:opacity-100 p-0.5 hover:opacity-80 text-[var(--color-text-faint)] cursor-pointer shrink-0">
									<TrashIcon style={{ width: '32px', height: '32px' }} />
								</button>
							</div>
						)
					})}
				</div>
				</main>
			</div>

			<ConfirmationModal
				isOpen={!!deleteTarget}
				onClose={() => setDeleteTarget(null)}
				onConfirm={() => (deleteMutation.mutate(deleteTarget.id), setDeleteTarget(null))}
				title="Delete Chat"
				message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
				confirmText="Delete"
				cancelText="Cancel"
			/>
		</>
	)
}