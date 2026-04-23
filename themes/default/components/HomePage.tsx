import Link from "next/link"
import { prisma } from "@nextpress/db"
import { AddToCart } from "../../../apps/web/components/frontend/AddToCart"

export async function HomePage() {
	const [titleOpt, descOpt, posts, products] = await Promise.all([
		prisma.option.findUnique({ where: { key: "site_title" } }),
		prisma.option.findUnique({ where: { key: "site_description" } }),
		prisma.post.findMany({
			where: { postType: { slug: "post" }, status: "PUBLISHED" },
			include: { fieldValues: true },
			take: 6,
			orderBy: { publishedAt: "desc" },
		}),
		prisma.post.findMany({
			where: { postType: { slug: "product" }, status: "PUBLISHED" },
			include: { fieldValues: true },
			take: 4,
			orderBy: { createdAt: "desc" },
		}),
	])

	const siteTitle = titleOpt?.value ?? "NextPress"
	const siteDesc = descOpt?.value ?? "CMS מודרני ב-Next.js"

	return (
		<main className="min-h-screen">
			{/* Hero */}
			<section className="bg-gradient-to-b from-muted/50 to-background py-20 px-6 text-center">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-5xl font-bold tracking-tight mb-4">
						{siteTitle} Original Theme
					</h1>
					<p className="text-xl text-muted-foreground">{siteDesc}</p>
				</div>
			</section>

			<div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
				{/* Recent Posts */}
				{posts.length > 0 && (
					<section>
						<h2 className="text-2xl font-semibold mb-6">
							פוסטים אחרונים
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{posts.map((post) => {
								const excerpt = post.fieldValues.find(
									(fv) => fv.fieldSlug === "excerpt",
								)?.value
								return (
									<Link
										key={post.id}
										href={`/${post.slug}`}
										className="block border border-border rounded-xl p-5 hover:bg-muted/50 transition-colors"
									>
										<h3 className="text-lg font-semibold mb-2">
											{post.title}
										</h3>
										{excerpt && (
											<p className="text-sm text-muted-foreground line-clamp-3">
												{excerpt}
											</p>
										)}
									</Link>
								)
							})}
						</div>
					</section>
				)}

				{/* Featured Products */}
				{products.length > 0 && (
					<section>
						<h2 className="text-2xl font-semibold mb-6">
							מוצרים מומלצים
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{products.map((product) => {
								const price = product.fieldValues.find(
									(fv) => fv.fieldSlug === "price",
								)?.value
								const image = product.fieldValues.find(
									(fv) => fv.fieldSlug === "images",
								)?.value
								return (
									<div
										key={product.id}
										className="border border-border rounded-xl overflow-hidden bg-card flex flex-col"
									>
										{image ? (
											<img
												src={image}
												alt={product.title}
												className="w-full h-40 object-cover"
											/>
										) : (
											<div className="w-full h-40 bg-muted flex items-center justify-center text-3xl text-muted-foreground">
												🛍️
											</div>
										)}
										<div className="p-4 flex flex-col flex-1 gap-2">
											<Link
												href={`/${product.slug}`}
												className="font-medium hover:underline line-clamp-2"
											>
												{product.title}
											</Link>
											{price && (
												<p className="text-sm font-bold">
													₪{Number(price).toFixed(2)}
												</p>
											)}
											<div className="mt-auto">
												<AddToCart
													item={{
														productId: product.id,
														name: product.title,
														price: price
															? Number(price)
															: 0,
														...(image
															? { image }
															: {}),
													}}
												/>
											</div>
										</div>
									</div>
								)
							})}
						</div>
					</section>
				)}
			</div>
		</main>
	)
}
