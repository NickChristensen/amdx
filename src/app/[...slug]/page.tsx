import { notFound } from "next/navigation";
import { AnimationDurationTuner } from "@/components/dev/animation-duration-tuner";
import { MdxRenderer } from "@/components/mdx/mdx-renderer";
import { readMdxFile } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  let source: string;

  try {
    source = (await readMdxFile(slug)).source;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      notFound();
    }

    throw error;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <article className="mdx-document">
        <MdxRenderer source={source} />
      </article>
      {slug.length === 1 && slug[0] === "kitchen-sink" ? (
        <AnimationDurationTuner />
      ) : null}
    </main>
  );
}
