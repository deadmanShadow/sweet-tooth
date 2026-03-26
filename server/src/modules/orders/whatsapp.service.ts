import { Injectable } from '@nestjs/common';
import { Cake, Order, OrderItem, User } from '@prisma/client';

export type OrderWithItemsAndUser = Order & {
  items: (OrderItem & { cake: Cake })[];
  user: User;
};

@Injectable()
export class WhatsAppService {
  generateOrderMessage(order: OrderWithItemsAndUser): string {
    const itemsList = order.items
      .map(
        (item) =>
          `• ${item.cake.name} x${item.quantity} - $${(
            item.price * item.quantity
          ).toFixed(2)}`,
      )
      .join('\n');

    const message = `*New Order #${order.id.slice(-6).toUpperCase()}*

*Customer Details:*
Name: ${order.user.name}
Email: ${order.user.email}

*Items:*
${itemsList}

*Total: $${order.total.toFixed(2)}*

Thank you for your order!`;

    return encodeURIComponent(message);
  }

  getWhatsAppLink(message: string): string {
    const phone = process.env.WHATSAPP_PHONE;
    const baseUrl = 'https://wa.me/';
    return `${baseUrl}${phone}?text=${encodeURIComponent(message)}`;
  }
}
