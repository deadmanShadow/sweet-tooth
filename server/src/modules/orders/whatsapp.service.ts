import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cake, CustomRequest, Order, OrderItem } from '@prisma/client';

export type OrderWithItemsAndUser = Order & {
  items: (OrderItem & { cake: Cake })[];
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
};

@Injectable()
export class WhatsAppService {
  constructor(private readonly config: ConfigService) {}

  generateOrderMessage(order: OrderWithItemsAndUser): string {
    const itemsList = order.items
      .map(
        (item) =>
          `• ${item.cake.name} (x${item.quantity}) - ${item.price * item.quantity} BDT`,
      )
      .join('\n');

    const customerName = order.user?.name || order.customerName || 'Guest';
    const customerPhone = order.user?.phone || order.customerPhone || 'N/A';
    const customerAddress = order.customerAddress || 'N/A';
    const locationStr =
      order.location === 'INSIDE' ? 'Inside Cumilla' : 'Outside Cumilla';
    const subtotal = order.total - order.deliveryFee;

    return `🧁 *New Cake Order Request*

🆔 Order ID: #${order.id.slice(-8).toUpperCase()}

━━━━━━━━━━━━━━━
📦 *Order Details:*

${itemsList}

━━━━━━━━━━━━━━━
💰 *Pricing:*
Subtotal: ${subtotal} BDT
Delivery Fee: ${order.deliveryFee} BDT
Total: ${order.total} BDT

━━━━━━━━━━━━━━━
🚚 *Delivery Information:*
Name: ${customerName}
Phone: ${customerPhone}
Address: ${customerAddress}
Location: ${locationStr}

━━━━━━━━━━━━━━━
📝 *Note:*
Please confirm this order and provide delivery time.

Thank you! 😊`;
  }

  generateCustomRequestMessage(request: CustomRequest): string {
    const imagesList =
      request.images.length > 0
        ? `📸 Images attached in form`
        : '📸 No images attached';

    return `🎂 *Custom Cake Request*

━━━━━━━━━━━━━━━
👤 *Customer Info:*
Name: ${request.customerName}
Phone: ${request.customerPhone}

━━━━━━━━━━━━━━━
🧁 *Cake Details:*
Type: ${request.type}
Flavor: ${request.flavor}
Weight: ${request.pounds} pounds
Size: ${request.size}

━━━━━━━━━━━━━━━
✨ *Special Features:*
${request.features || 'None'}

━━━━━━━━━━━━━━━
📝 *Description:*
${request.description || 'No description provided'}

━━━━━━━━━━━━━━━
${imagesList}

Please review and let me know the price & availability.

Thank you! 😊`;
  }

  getWhatsAppLink(message: string): string {
    const rawPhone = this.config.get<string>('WHATSAPP_PHONE') || '';
    // Clean phone number: remove any non-digit characters (like '+', '-', ' ')
    const phone = rawPhone.replace(/\D/g, '');
    const baseUrl = 'https://wa.me/';
    return `${baseUrl}${phone}?text=${encodeURIComponent(message)}`;
  }
}
