import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 text-center bg-snow">
      <h1 className="font-display text-[48px] uppercase m-0">404</h1>
      <p className="text-stone m-0">Nie znaleziono strony / Page not found</p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link href="/" className="btn btn-primary">
          PL — Start
        </Link>
        <Link href="/en" className="btn btn-ghost">
          EN — Home
        </Link>
      </div>
    </div>
  )
}
