import { Sidebar } from '../components/Sidebar'

export const Component = () => (
	<div className="min-h-screen flex flex-col lg:flex-row bg-[var(--color-bg)] text-[var(--color-text)]">
		<Sidebar />
		<main className="flex-1 p-6">
			<h1 className="text-xl font-bold text-[var(--color-text)]">Veribot</h1>
		</main>
	</div>
)