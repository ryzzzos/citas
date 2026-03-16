import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
          Citas
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="/marketplace" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
            Negocios
          </Link>
          <Link href="/dashboard" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
            Mi panel
          </Link>
          <Link
            href="/auth/login"
            className="rounded-full bg-zinc-900 px-4 py-1.5 text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Iniciar sesión
          </Link>
        </nav>
      </div>
    </header>
  );
}
