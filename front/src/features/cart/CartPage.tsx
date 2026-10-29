'use client'

import { useQuery } from '@tanstack/react-query'
import { Minus, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { getProducts } from '@/shared/api/products'
import { useCart } from '@/shared/lib/cart-context'
import { useStorefront } from '@/shared/lib/storefront-context'
import { SiteFooter } from '@/shared/ui/SiteFooter'
import { SiteHeader } from '@/shared/ui/SiteHeader'

const noProducts: Awaited<ReturnType<typeof getProducts>>['products'] = []

export function CartPage() {
	const { lines, hydrated, setQuantity, removeItem } = useCart()
	const { formatPrice, productName, variantLabel, t } = useStorefront()
	const { data, isPending, isError } = useQuery({
		queryKey: ['products', 'cart'],
		queryFn: () => getProducts(),
	})

	const products = data?.products ?? noProducts
	const items = lines.flatMap(line => {
		const product = products.find(item => item.id === line.productId)
		const variant = product?.variants.find(item => item.id === line.variantId)
		return product && variant ? [{ line, product, variant }] : []
	})
	const cartCount = items.reduce((sum, item) => sum + item.line.quantity, 0)
	const total = items.reduce(
		(sum, item) => sum + item.product.price * item.line.quantity,
		0,
	)

	useEffect(() => {
		if (!hydrated || !data) return

		for (const line of lines) {
			const product = products.find(item => item.id === line.productId)
			const variant = product?.variants.find(item => item.id === line.variantId)
			if (!variant || variant.stock <= 0) {
				removeItem(line.variantId)
			} else if (line.quantity > variant.stock) {
				setQuantity(line.variantId, variant.stock)
			}
		}
	}, [data, hydrated, lines, products, removeItem, setQuantity])

	return (
		<>
			<SiteHeader />
			<main className='mx-auto min-h-[70vh] w-full max-w-[1400px] px-4 py-10 sm:px-8 sm:py-16 lg:px-12'>
				<div className='mb-9 border-b border-neutral-200 pb-7'>
					<p className='mb-3 text-[10px] uppercase tracking-[0.18em] text-neutral-500'>
						{t('selection')}
					</p>
					<h1 className='text-3xl font-light tracking-[0.08em] sm:text-5xl'>
						{t('cart')} ({cartCount})
					</h1>
				</div>
				{isPending || !hydrated ? (
					<p className='py-20 text-center text-sm text-neutral-500'>
						{t('loadingCart')}
					</p>
				) : isError ? (
					<p className='py-20 text-center text-sm text-neutral-500'>
						{t('cartError')}
					</p>
				) : items.length === 0 ? (
					<div className='py-16 text-center'>
						<p className='text-2xl font-light'>{t('emptyCart')}</p>
						<p className='mt-3 text-sm text-neutral-500'>
							{t('emptyCartHint')}
						</p>
						<Link
							className='mt-7 inline-block border-b border-black pb-2 text-[10px] uppercase tracking-[0.14em]'
							href='/catalog'
						>
							{t('goToCatalog')}
						</Link>
					</div>
				) : (
					<div className='grid gap-10 lg:grid-cols-[1fr_340px]'>
						<div>
							<div className='hidden grid-cols-[1fr_130px_130px] border-b border-neutral-200 pb-3 text-[10px] uppercase tracking-[0.12em] text-neutral-500 sm:grid'>
								<span>{t('product')}</span>
								<span>{t('quantity')}</span>
								<span className='text-right'>{t('amount')}</span>
							</div>
							<ul>
								{items.map(({ line, product, variant }) => {
									const image = product.images[0]
									return (
										<li
											className='animate-dropdown grid grid-cols-[86px_1fr] gap-4 border-b border-neutral-200 py-5 sm:grid-cols-[100px_1fr_130px_130px] sm:items-center'
											key={line.variantId}
										>
											<Link
												aria-label={`Открыть ${product.name}`}
												className='aspect-[0.8] bg-[#eeece6] bg-cover bg-center'
												href={`/product/${product.id}`}
												style={{
													backgroundImage: image
														? `url("${image.url}")`
														: undefined,
												}}
											/>
											<div>
												<Link
													className='text-sm hover:underline'
													href={`/product/${product.id}`}
												>
													{productName(product)}
												</Link>
												<p className='mt-2 text-xs text-[#777d72]'>
													{[
														variantLabel(variant.size),
														variantLabel(variant.color),
													]
														.filter(Boolean)
														.join(' · ')}
												</p>
												<p className='mt-1 text-xs text-neutral-500'>
													{formatPrice(product.price)}
												</p>
												<button
													className='mt-3 inline-flex items-center gap-1 text-[10px] text-neutral-500 sm:hidden'
													onClick={() => removeItem(line.variantId)}
												>
													<Trash2 size={13} /> {t('delete')}
												</button>
											</div>
											<div className='col-start-2 flex w-fit items-center gap-4 border border-neutral-200 px-2 py-1.5 sm:col-start-auto'>
												<button
													aria-label={t('decrease')}
													onClick={() =>
														setQuantity(line.variantId, line.quantity - 1)
													}
												>
													<Minus size={13} />
												</button>
												<span className='min-w-3 text-center text-xs'>
													{line.quantity}
												</span>
												<button
													aria-label={t('increase')}
													disabled={line.quantity >= variant.stock}
													onClick={() =>
														setQuantity(line.variantId, line.quantity + 1)
													}
												>
													<Plus size={13} />
												</button>
											</div>
											<div className='hidden items-center justify-end gap-3 sm:flex'>
												<span className='text-sm'>
													{formatPrice(product.price * line.quantity)}
												</span>
												<button
													aria-label={`${t('delete')} ${productName(product)}`}
													onClick={() => removeItem(line.variantId)}
												>
													<Trash2 size={15} className='text-neutral-500' />
												</button>
											</div>
										</li>
									)
								})}
							</ul>
						</div>
						<aside className='h-fit border border-neutral-200 p-5 sm:p-6'>
							<h2 className='text-xl font-light'>{t('total')}</h2>
							<div className='mt-5 flex justify-between border-t border-neutral-200 pt-4 text-sm'>
								<span>{t('itemsTotal')}</span>
								<span>{formatPrice(total)}</span>
							</div>
							<p className='mt-4 text-xs leading-5 text-neutral-500'>
								{t('checkoutLater')}
							</p>
							<button
								className='mt-6 w-full bg-black py-4 text-[10px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-60'
								disabled
							>
								{t('checkoutSoon')}
							</button>
							<Link
								className='mt-4 block text-center text-[10px] uppercase tracking-[0.12em] underline underline-offset-4 transition-opacity hover:opacity-55'
								href='/catalog'
							>
								{t('continueShopping')}
							</Link>
						</aside>
					</div>
				)}
			</main>
			<SiteFooter />
		</>
	)
}
