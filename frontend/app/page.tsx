'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-900 text-base tracking-tight">GeM Tender Copilot</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#who-its-for" className="hover:text-slate-900 transition-colors">Who it&apos;s for</a>
          </nav>
          <Link
            href="/auth"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-700 to-blue-800 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/40 border border-blue-400/40 text-blue-100 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-blue-300 rounded-full"></span>
            Built for MSMEs, consultants &amp; agencies on GeM
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-6">
            Win Government Tenders.<br />
            <span className="text-blue-200">Without the Guesswork.</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            GeM Tender Copilot finds tenders that match your business, checks your eligibility, flags missing documents, and drafts your proposal — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors text-base"
            >
              Get Started Free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 border border-blue-400/40 text-blue-100 font-medium px-6 py-3 rounded-lg hover:bg-blue-700/60 transition-colors text-base"
            >
              See how it works
            </a>
          </div>
          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap gap-6 justify-center text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              MSME-focused
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              GeM tender data
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              No submission risk
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Draft-ready exports
            </div>
          </div>
        </div>
      </section>

      {/* Problem statement */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-3 block">The Problem</span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-5 leading-tight">
                Government tenders are a huge opportunity — but most MSMEs miss them
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                GeM has thousands of live tenders worth crores — but most small businesses don&apos;t know which ones they actually qualify for. Checking eligibility manually takes hours, and one missing document can disqualify a winning bid.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Most businesses either miss deadlines, apply to the wrong tenders, or get rejected due to incomplete documentation.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: '⏱', label: 'Hours lost manually checking eligibility' },
                { icon: '📋', label: 'Disqualified for missing documents at the last minute' },
                { icon: '🎯', label: 'Applying to tenders that were never a real fit' },
                { icon: '😰', label: 'Confusing bid formats and compliance language' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-slate-700 text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-3 block">How It Works</span>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">From profile to proposal in four steps</h2>
          <p className="text-slate-500 text-base mb-14 max-w-xl mx-auto">Set up once, then let the copilot do the heavy lifting every time a matching tender appears.</p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Set up your profile',
                desc: 'Enter your company details, certifications, and upload your key documents once.',
                color: 'bg-blue-600',
              },
              {
                step: '02',
                title: 'Discover tenders',
                desc: 'See a curated list of GeM tenders matched to your category, turnover, and certifications.',
                color: 'bg-blue-600',
              },
              {
                step: '03',
                title: 'Analyze eligibility',
                desc: 'Run a full eligibility check. See pass/fail for every criterion and what documents you\'re missing.',
                color: 'bg-blue-600',
              },
              {
                step: '04',
                title: 'Generate & export',
                desc: 'Auto-draft your bid proposal. Review, edit, and export a submission-ready bid pack.',
                color: 'bg-blue-600',
              },
            ].map((item, i) => (
              <div key={i} className="relative text-left">
                {i < 3 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px border-t-2 border-dashed border-blue-200 -translate-x-1/2 z-0" />
                )}
                <div className="relative z-10">
                  <div className={`${item.color} text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-4`}>
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-base">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-3 block">Features</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Everything you need to compete</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base">Designed specifically for MSMEs navigating Government e-Marketplace procurement.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
                title: 'Smart Match Scoring',
                desc: 'Tenders ranked by your fit — based on category, turnover, certifications, and operating history.',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ),
                title: 'Eligibility Matrix',
                desc: 'A clear pass/fail breakdown for every eligibility criterion — no more reading 40-page tender PDFs.',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                ),
                title: 'Document Gap Analysis',
                desc: 'Know exactly which certificates and proofs are missing before you start preparing your bid.',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                ),
                title: 'Auto-Draft Proposals',
                desc: 'Generate a structured bid proposal with company overview, methodology, and past experience pre-filled.',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                ),
                title: 'Export-Ready Bid Packs',
                desc: 'Download your complete proposal document pack — ready to review and submit through GeM.',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Deadline Tracking',
                desc: 'Visual deadline indicators so you always know which tenders need urgent attention.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section id="who-its-for" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-3 block">Who It&apos;s For</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Built for businesses like yours</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'MSMEs & Small Businesses',
                desc: 'Registered on Udyam with GSTIN? You\'re already eligible for many GeM tenders. Discover which ones are the right fit.',
                badge: 'Udyam Registered',
              },
              {
                title: 'IT & Service Agencies',
                desc: 'From IT consulting to digital services — GeM has hundreds of government contracts annually in your category.',
                badge: 'IT Services',
              },
              {
                title: 'Consultants & Vendors',
                desc: 'Whether you\'re a one-person consultancy or a 50-person firm, the copilot adapts to your profile and capacity.',
                badge: 'Any Size',
              },
            ].map((item, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-4">
                  {item.badge}
                </span>
                <h3 className="font-semibold text-slate-900 mb-2 text-base">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6 bg-blue-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to find your first matching tender?
          </h2>
          <p className="text-blue-200 text-base mb-8 max-w-xl mx-auto">
            Set up your company profile in under 5 minutes and see tenders matched to your business today.
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-3.5 rounded-lg hover:bg-blue-50 transition-colors text-base"
          >
            Get Started — It&apos;s Free
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-800 text-sm">GeM Tender Copilot</span>
          </div>
          <p className="text-slate-400 text-xs">
            &copy; {new Date().getFullYear()} GeM Tender Copilot. For preparation purposes only — does not submit tenders on your behalf.
          </p>
          <div className="flex gap-5 text-sm text-slate-400">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
