import Link from 'next/link'

const steps = [
  {
    n: '1',
    title: 'Upload a statement',
    body: 'PDF from your bank app is enough. If it is password-protected, you enter the password once — it is never stored.',
  },
  {
    n: '2',
    title: 'We read it once',
    body: 'Transactions are extracted and categorised. The file itself is not kept as your archive of record.',
  },
  {
    n: '3',
    title: 'See your month clearly',
    body: 'A plain-language picture of where money went, what changed, and what is worth a second look next month.',
  },
]

const features = [
  {
    title: 'Monthly narrative',
    body: 'Not a dump of charts. A short summary you can actually read.',
  },
  {
    title: 'Spending breakdown',
    body: 'Categories and merchants so “food” and “transport” stop being vague.',
  },
  {
    title: 'Gentle watch-outs',
    body: 'Subscriptions, timing of bills, patterns — framed as observations, not lectures.',
  },
  {
    title: 'Budget that fits real life',
    body: 'Set simple limits and see pace without turning money into a game.',
  },
]

const bankTiers: { label: string; items: string[] }[] = [
  { label: 'Core Singapore banks', items: ['DBS', 'OCBC', 'UOB'] },
  {
    label: 'Also in focus',
    items: ['Standard Chartered', 'HSBC', 'Maybank', 'CIMB', 'Trust', 'GXS'],
  },
  {
    label: 'Wallets & further',
    items: ['YouTrip', 'Revolut', 'Brokers', 'Overseas banks'],
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <header className="border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="text-sm font-semibold tracking-tight text-stone-900">
            FinClarity
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 text-sm text-stone-600 transition hover:text-stone-900"
            >
              Sign in
            </Link>
            <Link
              href="/demo"
              className="rounded-lg bg-stone-900 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              Try demo
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-12 sm:px-6 sm:pb-28 sm:pt-24">
          <p className="mb-4 text-sm font-medium text-green-800/80">Singapore-first · Statement upload</p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl sm:leading-[1.1]">
            Your money is somewhere.
            <span className="mt-2 block text-stone-500">FinClarity shows you where.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Upload bank statements. Get a calm monthly picture — no bank login, no spreadsheet archaeology,
            no financial advice.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-xl bg-green-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-green-800"
            >
              Try the demo
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-5 text-xs text-stone-400">
            Sample month first. Upload when you are ready. Password never stored.
          </p>
        </section>

        {/* How it works */}
        <section className="border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
            <h2 className="text-sm font-medium uppercase tracking-wider text-stone-400">How it works</h2>
            <ol className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-8">
              {steps.map((step) => (
                <li key={step.n}>
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-sm font-medium text-stone-600">
                    {step.n}
                  </div>
                  <h3 className="text-base font-semibold text-stone-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-stone-200 bg-stone-50">
          <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
            <h2 className="text-sm font-medium uppercase tracking-wider text-stone-400">What you get</h2>
            <p className="mt-3 max-w-lg text-2xl font-semibold tracking-tight text-stone-900">
              Clarity you can skim in a minute.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/40"
                >
                  <h3 className="text-base font-semibold text-stone-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Banks */}
        <section className="border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
            <h2 className="text-sm font-medium uppercase tracking-wider text-stone-400">Works with</h2>
            <p className="mt-3 max-w-lg text-2xl font-semibold tracking-tight text-stone-900">
              Built for Singapore money life first.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600">
              Coverage improves by tier. Core local banks are the priority; wallets, brokers, and overseas
              formats expand next.
            </p>
            <div className="mt-10 space-y-8">
              {bankTiers.map((tier) => (
                <div key={tier.label}>
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-400">{tier.label}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {tier.items.map((name) => (
                      <li
                        key={name}
                        className="rounded-full border border-stone-200 bg-stone-50 px-3.5 py-1.5 text-sm text-stone-700"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="border-t border-stone-200 bg-stone-50">
          <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
            <h2 className="text-sm font-medium uppercase tracking-wider text-stone-400">Privacy</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {[
                {
                  t: 'No bank login',
                  d: 'You upload the PDF. We never ask for your online banking password.',
                },
                {
                  t: 'Password stays with you',
                  d: 'Statement passwords are used only to open the file, then discarded.',
                },
                {
                  t: 'Not financial advice',
                  d: 'FinClarity helps you see patterns. It does not tell you what to buy or invest in.',
                },
              ].map((item) => (
                <div key={item.t}>
                  <h3 className="text-base font-semibold text-stone-900">{item.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:py-24">
            <h2 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
              See a sample month first.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-600">
              Explore the demo, then upload a real statement when it feels right.
            </p>
            <Link
              href="/demo"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-green-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-green-800"
            >
              Open the demo
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 text-xs text-stone-400 sm:flex-row sm:items-center sm:justify-between">
          <span>FinClarity</span>
          <span>Not financial advice. For clarity, not compliance theatre.</span>
        </div>
      </footer>
    </div>
  )
}
