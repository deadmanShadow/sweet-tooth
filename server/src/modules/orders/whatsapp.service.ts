import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cake, Order, OrderItem } from '@prisma/client';

export type OrderWithItemsAndUser = Order & {
  items: (OrderItem & { cake: Cake })[];
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
};

@Injectable()
export class WhatsAppService {
  constructor(private readonly config: ConfigService) {}

  generateOrderMessage(order: OrderWithItemsAndUser): string {
    const itemsList = order.items
      .map(
        (item) =>
          `🍰 *${item.cake.name}* (x${item.quantity}) - $${(
            item.price * item.quantity
          ).toFixed(2)}`,
      )
      .join('\n');

    return `🛍️ *New Order #${order.id.slice(-8).toUpperCase()}*

👤 *Customer Details:*
• *Name:* ${order.user.name}
• *Phone:* ${order.user.phone || 'N/A'}
• *Email:* ${order.user.email}

🛒 *Order Items:*
${itemsList}

💰 *Total Amount: $${order.total.toFixed(2)}*

✅ *Status: PENDING*

Thank you for choosing Sweet Tooth! We'll contact you soon.`;
  }

  getWhatsAppLink(message: string): string {
    const rawPhone = this.config.get<string>('WHATSAPP_PHONE') || '';
    // Clean phone number: remove any non-digit characters (like '+', '-', ' ')
    const phone = rawPhone.replace(/\D/g, '');
    const baseUrl = 'https://wa.me/';
    return `${baseUrl}${phone}?text=${encodeURIComponent(message)}`;
  }
}
