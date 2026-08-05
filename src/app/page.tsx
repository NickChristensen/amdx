import Link from "next/link";
import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MDX_MEDIA_DIR, listMdxRoutes } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Page() {
  const routes = await listMdxRoutes();

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <header>
        <div className="flex items-center gap-3 text-muted-foreground">
          <FileText className="size-5" />
          <span className="text-sm font-medium">AMDX</span>
        </div>
        <div className="mt-3 max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight">
            Agent MDX reports
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Rendering files from <code>{MDX_MEDIA_DIR}</code> on request.
          </p>
        </div>
      </header>

      {routes.length === 0 ? (
        <Card className="mt-8 p-6 text-sm text-muted-foreground">
          <p>
            No <code>.mdx</code> files found yet.
          </p>
        </Card>
      ) : (
        <section className="mt-8 grid gap-3">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <span className="font-mono">{route.title}</span>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
