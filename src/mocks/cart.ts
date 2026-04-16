export interface MockCartItem {
  id: number
  userId: number
  title: string
  price: string
  image: string
  condition: string
  quantity: number
}

export const mockCartItems: MockCartItem[] = [
  {
    id: 1,
    userId: 1,
    title: 'iPhone 14 Pro Max 256G 紫色 99新 无磕碰无划痕',
    price: '6999',
    image: 'https://picsum.photos/id/1/200/200',
    condition: '99新',
    quantity: 1,
  },
  {
    id: 2,
    userId: 1,
    title: 'AirPods Pro 2 全新未拆封 国行正品',
    price: '1599',
    image: 'https://picsum.photos/id/119/200/200',
    condition: '全新',
    quantity: 1,
  },
  {
    id: 3,
    userId: 2,
    title: 'MacBook Pro 14寸 M2 Pro 16+512G 银色',
    price: '12999',
    image: 'https://picsum.photos/id/45/200/200',
    condition: '95新',
    quantity: 1,
  },
]
