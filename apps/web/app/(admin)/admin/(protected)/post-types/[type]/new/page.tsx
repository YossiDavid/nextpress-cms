import { prisma } from '@nextpress/db';
import { notFound } from 'next/navigation';
import { PostEditor } from '@/components/admin/PostEditor';

interface Props { params: Promise<{ type: string }>; }

export default async function NewPostPage({ params }: Props) {
  const { type } = await params;
  const postType = await prisma.postType.findUnique({
    where: { slug: type },
    include: { fields: { orderBy: { order: 'asc' } } },
  });
  if (!postType) notFound();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{postType.name} חדש</h1>
      <PostEditor postType={postType} fields={postType.fields} />
    </div>
  );
}
