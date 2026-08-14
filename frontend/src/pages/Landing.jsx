import { useState } from 'react'
import { useTitle } from '../hooks/useTitle'
import { Link } from 'react-router'
import { Chevron, Menu } from '../components/Icons'

const comparison = [
	{
		before: 'Take viral posts at face value just because a creator or idol shared them',
		after: 'Instantly check who posted it, what their motive is, and where the original source lives'
	},
	{
		before: 'Get tricked by recycled clips from 5 years ago framed as breaking news today',
		after: 'Spot outdated media, edited screenshots, and missing context in seconds'
	},
	{
		before: 'React with outrage and hit share without thinking twice',
		after: 'Pause, trace the receipts, and build a habit of double-checking your feed'
	}
]

const featureList = [
	{
		title: 'Unmask Clout & Idol Bias',
		description: 'Understand why we automatically trust people we admire, and learn to catch when that loyalty is being exploited.'
	},
	{
		title: 'Trace the Real Receipts',
		description: 'Stop relying on random commentary clips. Jump past the noise to verify primary sources and actual evidence.'
	},
	{
		title: 'Safe Sandbox Practice',
		description: 'Test your instincts on simulated viral posts, fabricated quotes, and clickbait without making mistakes on your live feed.'
	}
]

const pillars = [
	{ name: 'Currency', question: 'When was this actually created? Is an old clip being recycled for clout?' },
	{ name: 'Relevance', question: 'Does the actual story support the wild headline, or is it pure clickbait?' },
	{ name: 'Authority', question: 'Who is making the claim, and do they actually know what they are talking about?' },
	{ name: 'Accuracy', question: 'Are there receipts, raw documents, or independent reports to back this up?' },
	{ name: 'Purpose', question: 'Is this meant to inform you, sell you something, or just farm outrage?' }
]

const stats = [
	{ value: '5', label: 'Verification Pillars' },
	{ value: '0', label: 'Unchecked Rumors' },
	{ value: 'Free', label: 'Always Free to Use' }
]

const steps = [
	{ title: 'Spot the Suspicious Post', desc: 'Paste a questionable claim, quote screenshot, or article link into VeriVerdad.' },
	{ title: 'Trace the Receipts', desc: 'Walk through quick checks to trace where the content originated and who profits from it.' },
	{ title: 'Share with Confidence', desc: 'Get a clear breakdown of the source validity so you never accidentally pass around fake news again.' }
]

const faqs = [
	{
		q: 'What is Idol Bias?',
		a: 'It is the habit of believing false or unverified claims simply because they were posted by an influencer, celebrity, or personality you like.'
	},
	{
		q: 'Does VeriVerdad just give a true or false answer?',
		a: 'No. VeriVerdad teaches you the actual process of investigating claims so you build detective reflexes you can use anywhere online.'
	},
	{
		q: 'Who can use this?',
		a: 'Anyone who wants to stop getting fooled by viral misinfo, fake quotes, and unverified rumors.'
	}
]

const navItems = [
	{ href: '#comparison', label: 'Before / After' },
	{ href: '#features', label: 'Features' },
	{ href: '#framework', label: 'Framework' },
	{ href: '#how-it-works', label: 'How It Works' },
	{ href: '#faq', label: 'FAQ' }
]

const baseButton = 'inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[var(--color-surface)] bg-[var(--color-primary)] no-underline hover:opacity-80'

export const Component = () => {
	useTitle('VeriVerdad — Stop Scrolling Past Fake News. Start Spotting It.')
	const [menuOpen, setMenuOpen] = useState(false)

	return (
		<div className="min-h-screen flex flex-col bg-[var(--color-surface)] text-[var(--color-text)] w-full">
			<header className="relative bg-[var(--color-primary)] text-[var(--color-surface)] border-b border-[var(--color-border)] w-full z-50">
				<div className="max-w-[1040px] mx-auto h-16 px-4 md:px-8 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<img src="/logo.png" alt="" className="h-8 w-auto object-contain" />
						<span className="text-sm sm:text-base font-bold tracking-wider text-white">VERIVERDAD</span>
					</div>

					<nav className="hidden lg:flex items-center gap-7">
						{navItems.map(item => (
							<a key={item.href} href={item.href} className="text-[var(--color-text-faint)] no-underline text-sm font-medium hover:opacity-80">{item.label}</a>
						))}
						<Link to="/login" className="text-white no-underline text-sm font-semibold hover:opacity-80">Sign In</Link>
					</nav>

					<button
						type="button"
						onClick={() => setMenuOpen(!menuOpen)}
						className="lg:hidden p-2 bg-transparent border-none cursor-pointer flex items-center justify-center text-white hover:opacity-80"
					>
						<Menu open={menuOpen} />
					</button>
				</div>

				{menuOpen && (
					<nav className="lg:hidden border-t border-[var(--color-border)] bg-[var(--color-primary)] px-4 md:px-8 py-5 flex flex-col items-center gap-5">
						{navItems.map(item => (
							<a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="text-[var(--color-text-faint)] no-underline text-sm font-medium hover:opacity-80">{item.label}</a>
						))}
						<Link to="/login" onClick={() => setMenuOpen(false)} className="pt-3 border-t border-white/10 w-full text-center text-white no-underline text-sm font-semibold hover:opacity-80">Sign In</Link>
					</nav>
				)}
			</header>

			<main className="flex-1 flex flex-col w-full">
				<section className="py-8 sm:py-16 px-4 sm:px-8 bg-[var(--color-bg)] flex justify-center" id="hero">
					<div className="max-w-[1040px] w-full flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
						<div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4">
							<h1 className="text-2xl sm:text-4xl md:text-[48px] leading-tight font-bold text-[var(--color-text)] tracking-tight">Stop Scrolling Past Fake News. Start Spotting It.</h1>
							<p className="text-sm sm:text-base leading-relaxed text-[var(--color-text-muted)] max-w-[560px]">We all scroll past viral claims, rage bait, and fake quotes every day. VeriVerdad gives you the digital detective skills to check the receipts before hitting share.</p>
							<div className="flex gap-4 items-center mt-2">
								<Link to="/login" className={baseButton}>Start Verifying</Link>
							</div>
						</div>
						<div className="flex-1 flex justify-center w-full max-w-[320px]">
							<div className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] p-4 sm:p-6 flex flex-col items-center text-center">
								<img src="/mascot.png" alt="" className="w-28 h-28 sm:w-40 sm:h-40 object-contain" />
								<div className="mt-2">
									<h3 className="text-base font-bold text-[var(--color-text)]">Veribot</h3>
									<p className="text-xs text-[var(--color-text-muted)] mt-0.5">Your Digital Detective Sidekick</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="py-8 sm:py-16 px-4 sm:px-8 bg-[var(--color-surface)] flex justify-center" id="comparison">
					<div className="max-w-[1040px] w-full flex flex-col items-center gap-6 sm:gap-10">
						<div className="text-center max-w-[640px]">
							<h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">Upgrade Your Internet Instincts</h2>
							<p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-2">See how your scroll habits change when you start looking for receipts instead of taking headlines at face value.</p>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
							<div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 sm:p-6 flex flex-col gap-4">
								<div className="flex items-center gap-2">
									<span className="w-2.5 h-2.5 rounded-full bg-[var(--color-text-muted)] inline-block"></span>
									<h3 className="text-base font-bold text-[var(--color-text)]">Before VeriVerdad</h3>
								</div>
								<ul className="list-none p-0 flex flex-col gap-3 text-xs sm:text-sm text-[var(--color-text-muted)]">
									{comparison.map((item, idx) => (
										<li key={idx} className="flex items-start gap-2">
											<span className="font-bold">✕</span>
											<span>{item.before}</span>
										</li>
									))}
								</ul>
							</div>
							<div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 sm:p-6 flex flex-col gap-4">
								<div className="flex items-center gap-2">
									<span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] inline-block"></span>
									<h3 className="text-base font-bold text-[var(--color-text)]">With VeriVerdad</h3>
								</div>
								<ul className="list-none p-0 flex flex-col gap-3 text-xs sm:text-sm text-[var(--color-text-muted)]">
									{comparison.map((item, idx) => (
										<li key={idx} className="flex items-start gap-2">
											<span className="font-bold">✓</span>
											<span>{item.after}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</section>

				<section className="py-8 sm:py-16 px-4 sm:px-8 bg-[var(--color-bg)] flex justify-center" id="features">
					<div className="max-w-[1040px] w-full flex flex-col items-center gap-6 sm:gap-10">
						<h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] text-center max-w-[600px]">Built for the Next Generation of Truth-Seekers</h2>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full">
							{featureList.map((feature, idx) => (
								<article key={idx} className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 sm:p-6 flex flex-col gap-2">
									<h3 className="text-sm font-bold text-[var(--color-text)]">{feature.title}</h3>
									<p className="text-xs sm:text-sm text-[var(--color-text-muted)]">{feature.description}</p>
								</article>
							))}
						</div>
					</div>
				</section>

				<section className="py-8 sm:py-16 px-4 sm:px-8 bg-[var(--color-surface)] flex justify-center" id="framework">
					<div className="max-w-[720px] w-full flex flex-col items-center gap-6">
						<h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] text-center">The 5 Checks for Every Source (CRAAP)</h2>
						<div className="flex flex-col gap-0 w-full border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg)]">
							{pillars.map((pillar, idx) => (
								<div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-3 px-4 sm:px-6 border-b border-[var(--color-border)] last:border-b-0">
									<span className="text-xs sm:text-sm font-bold text-[var(--color-text)] sm:w-24 shrink-0">{pillar.name}</span>
									<p className="text-xs sm:text-sm text-[var(--color-text-muted)]">{pillar.question}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="py-8 sm:py-12 px-4 sm:px-8 bg-[var(--color-primary)] text-white flex justify-center" id="stats">
					<div className="max-w-[960px] w-full grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
						{stats.map((stat, idx) => (
							<div key={idx} className="flex flex-col items-center text-center p-2">
								<span className="text-2xl sm:text-4xl font-bold text-white">{stat.value}</span>
								<span className="text-xs sm:text-sm text-[var(--color-text-faint)] mt-1">{stat.label}</span>
							</div>
						))}
					</div>
				</section>

				<section className="py-8 sm:py-16 px-4 sm:px-8 bg-[var(--color-surface)] flex justify-center" id="how-it-works">
					<div className="max-w-[1040px] w-full flex flex-col items-center gap-6 sm:gap-10">
						<h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] text-center">3 Steps to Verify Any Claim</h2>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full">
							{steps.map((step, idx) => (
								<div key={idx} className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 sm:p-6 flex flex-col gap-2">
									<h3 className="text-sm font-bold text-[var(--color-text)]">{step.title}</h3>
									<p className="text-xs sm:text-sm text-[var(--color-text-muted)]">{step.desc}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="py-8 sm:py-16 px-4 sm:px-8 bg-[var(--color-bg)] flex justify-center" id="faq">
					<div className="max-w-[800px] w-full flex flex-col items-center gap-6">
						<h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] text-center">Frequently Asked Questions</h2>
						<div className="flex flex-col gap-3 w-full">
							{faqs.map((faq, idx) => (
								<details key={idx} className="bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden group">
									<summary className="flex justify-between items-center w-full py-3 px-4 sm:px-6 cursor-pointer text-left gap-4 list-none [&::-webkit-details-marker]:hidden">
										<span className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">{faq.q}</span>
										<span className="flex items-center justify-center shrink-0 group-open:rotate-180">
											<Chevron />
										</span>
									</summary>
									<p className="text-xs sm:text-sm leading-relaxed text-[var(--color-text-muted)] px-4 sm:px-6 pb-3 text-left">{faq.a}</p>
								</details>
							))}
						</div>
					</div>
				</section>

				<section className="py-8 sm:py-16 px-4 sm:px-8 bg-[var(--color-surface)] flex justify-center text-center" id="cta">
					<div className="max-w-[720px] w-full flex flex-col items-center gap-4">
						<h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">Think Twice Before You Hit Share</h2>
						<p className="text-xs sm:text-sm text-[var(--color-text-muted)] max-w-[480px]">Sharpen your digital detective skills and help stop the spread of viral misinformation.</p>
						<Link to="/login" className={baseButton}>Try VeriVerdad</Link>
					</div>
				</section>
			</main>

			<footer className="px-4 md:px-8 lg:px-8 pt-10 md:pt-12 pb-6 bg-[var(--color-primary)] text-[var(--color-text-faint)]">
				<div className="max-w-[1040px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pb-8 border-b border-[var(--color-surface)]/10">
					<div className="flex flex-col items-center md:items-start gap-2">
						<div className="flex items-center gap-2">
							<img src="/logo.png" alt="" className="h-6 w-auto object-contain" />
							<h3 className="text-sm font-bold text-[var(--color-surface)] tracking-wider">VERIVERDAD</h3>
						</div>
						<p className="text-xs text-[var(--color-text-faint)]">Verify before you share.</p>
					</div>

					<div className="flex flex-col items-center md:items-start gap-2">
						<h4 className="text-xs font-semibold text-[var(--color-surface)] uppercase tracking-wider">Explore</h4>
						<ul className="list-none p-0 flex flex-col items-center md:items-start gap-1 text-xs">
							<li><a href="https://github.com/zamuwelle/VeriVerdad" target="_blank" rel="noreferrer" className="text-[var(--color-text-faint)] no-underline hover:opacity-80">GitHub</a></li>
							<li><a href="#comparison" className="text-[var(--color-text-faint)] no-underline hover:opacity-80">Before / After</a></li>
							<li><a href="#framework" className="text-[var(--color-text-faint)] no-underline hover:opacity-80">Framework</a></li>
							<li><a href="#features" className="text-[var(--color-text-faint)] no-underline hover:opacity-80">Features</a></li>
						</ul>
					</div>

					<div className="flex flex-col items-center md:items-start gap-2">
						<h4 className="text-xs font-semibold text-[var(--color-surface)] uppercase tracking-wider">Hackathon</h4>
						<p className="text-xs leading-relaxed text-[var(--color-text-faint)] text-center md:text-left">Built for the UNESCO Youth Hackathon 2026</p>
					</div>
				</div>

				<div className="max-w-[1040px] mx-auto pt-8 px-4 overflow-hidden">
					<div className="w-fit max-w-full mx-auto text-[14vw] md:text-[11vw] lg:text-[8vw] font-black leading-[0.8] tracking-[-0.07em] text-[var(--color-surface)] whitespace-nowrap">
						VERIVERDAD
					</div>
				</div>

				<div className="max-w-[1040px] mx-auto mt-8 text-center text-xs text-[var(--color-text-faint)]">
					<p>Built with 🩶 by the VeriVerdad Team</p>
				</div>
			</footer>
		</div>
	)
}