import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RobotIcon, LogoutIcon, HistoryIcon, Chevron, TrashIcon } from '../components/Icons'
import { ConfirmationModal } from './ConfirmationModal'
import { logout, getConversations, deleteConversation, updateConversation } from '../api'

const navItems = [
	{ path: '/veribot', label: 'Veribot', Icon: RobotIcon },
	{ path: '/history', label: 'History', Icon: HistoryIcon },
]

const toTitleCase = str => str ? str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : ''

export const Sidebar = () => {
	const location = useLocation()
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const [open, setOpen] = useState(false)
	const [showLogoutModal, setShowLogoutModal] = useState(false)
	const [deleteTarget, setDeleteTarget] = useState(null)
	const [recentsOpen, setRecentsOpen] = useState(true)
	const [editingId, setEditingId] = useState(null)
	const [editTitle, setEditTitle] = useState('')

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
			{open && <div onClick={() => setOpen(false)} className="lg:hidden fixed inset-0 z-30 bg-[var(--color-primary)] opacity-50" />}

			<header className="lg:hidden flex items-center justify-between p-4 bg-[var(--color-primary)] text-white border-b border-[var(--color-border)]">
				<div className="flex items-center gap-3">
					<img src="/logo.png" alt="" className="h-7 w-auto object-contain" />
					<span className="text-sm font-bold tracking-wider">VERIVERDAD</span>
				</div>
				<button type="button" onClick={() => setOpen(!open)} aria-label="Toggle menu" className="p-1 text-white hover:opacity-80 cursor-pointer">
					<svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24">
						{open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />}
					</svg>
				</button>
			</header>

			<aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col justify-between ${open ? 'flex' : 'hidden lg:flex'}`}>
				<div className="flex flex-col gap-6 p-6 flex-1 overflow-hidden">
					<div className="hidden lg:flex items-center gap-3 shrink-0">
						<img src="/logo.png" alt="" className="h-8 w-auto object-contain" />
						<span className="text-sm font-bold tracking-wider text-[var(--color-primary)]">VERIVERDAD</span>
					</div>

					<nav className="flex flex-col gap-1 flex-1 overflow-hidden">
						{navItems.map(item => {
							const isActive = location.pathname === item.path
							return (
								<div key={item.path} className="flex flex-col gap-1">
									<Link to={item.path} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold no-underline hover:opacity-80 ${isActive ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)] bg-transparent'}`}>
										<item.Icon className="w-5 h-5 shrink-0" />
										<span>{item.label}</span>
									</Link>
								</div>
							)
						})}
					</nav>

					<div className="flex flex-col gap-1 pt-2 flex-1 overflow-hidden">
						<div className="flex items-center px-3 py-1 text-xs text-[var(--color-text-muted)] select-none">
							<button type="button" onClick={() => setRecentsOpen(!recentsOpen)} className="group flex items-center gap-1 hover:opacity-80 cursor-pointer">
								<span className="font-medium">Recents</span>
								<span className="opacity-0 group-hover:opacity-100">
									<Chevron open={recentsOpen} />
								</span>
							</button>
						</div>

						{recentsOpen && (
							<div className="flex flex-col gap-0.5 overflow-y-auto flex-1">
								{(Array.isArray(chats) ? chats : []).map(chat => {
									const isChatActive = location.pathname === `/veribot/${chat.id}`
									const chatTitle = toTitleCase(chat.title || chat.first_message || 'Untitled Chat')
									return (
										<div key={chat.id} className={`group flex items-center justify-between rounded-full px-3.5 py-2 text-xs hover:opacity-80 ${isChatActive ? 'bg-[var(--color-bg)] text-[var(--color-text)] font-semibold' : 'text-[var(--color-text)] bg-transparent font-normal'}`}>
											{editingId === chat.id ? (
												<input type="text" autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)} onBlur={() => saveRename(chat.id)} onKeyDown={e => e.key === 'Enter' && saveRename(chat.id)} className="bg-transparent border border-[var(--color-border)] rounded px-1.5 py-0.5 text-xs text-[var(--color-text)] outline-none flex-1 w-full" />
											) : (
												<Link to={`/veribot/${chat.id}`} onDoubleClick={() => (setEditingId(chat.id), setEditTitle(chatTitle))} onClick={() => setOpen(false)} className="truncate flex-1 no-underline text-inherit select-none">
													{chatTitle}
												</Link>
											)}
											<button type="button" onClick={e => (e.stopPropagation(), e.preventDefault(), setDeleteTarget({ id: chat.id, title: chatTitle }))} className="opacity-0 group-hover:opacity-100 p-0.5 hover:opacity-80 text-[var(--color-text-faint)] cursor-pointer shrink-0">
												<TrashIcon style={{ width: '14px', height: '14px' }} />
											</button>
										</div>
									)
								})}
							</div>
						)}
					</div>
				</div>

				<div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg)] shrink-0">
					<button type="button" onClick={() => setShowLogoutModal(true)} className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-[var(--color-primary)] border border-[var(--color-border)] bg-[var(--color-surface)] rounded-lg hover:opacity-80 cursor-pointer">
						<LogoutIcon className="w-4 h-4 shrink-0" />
						<span>Sign Out</span>
					</button>
				</div>
			</aside>

			<ConfirmationModal
				isOpen={showLogoutModal}
				onClose={() => setShowLogoutModal(false)}
				onConfirm={() => logout().then(() => navigate('/login', { replace: true }))}
				title="Sign Out"
				message="Are you sure you want to log out of your account?"
				confirmText="Sign Out"
				cancelText="Cancel"
			/>

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