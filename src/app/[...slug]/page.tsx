import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { KnobsPanel } from "@/components/dev/knobs-panel";
import { MdxRenderer } from "@/components/mdx/mdx-renderer";
import { readMdxFile } from "@/lib/content";
import { metadataForMdxSource } from "@/lib/mdx-source";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

async function readDocument(slug: string[]) {
  try {
    return await readMdxFile(slug);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      notFound();
    }

    throw error;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const document = await readDocument(slug);
  return metadataForMdxSource(document.source, document.filePath);
}

export default async function Page({
  params,
}: PageProps) {
  const { slug } = await params;
  const document = await readDocument(slug);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <article className="mdx-document text-base flex flex-col gap-6 w-full">
        <MdxRenderer source={document.source} />
      </article>
      {slug.includes("kitchen-sink") && <KnobsPanel />}
    </main>
  );
}
