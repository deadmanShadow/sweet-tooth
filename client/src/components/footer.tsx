import Image from "next/image";
import Link from "next/link";
import { FaFacebookF } from "react-icons/fa6";
import { IoLogoInstagram } from "react-icons/io5";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background mt-auto">
      <div className="container mx-auto px-2 py-2 md:px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo1.png"
                alt="Sweet Tooth Logo"
                width={80}
                height={80}
                className="object-contain mt-4"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              &copy; 2026 Sweet Tooth. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="https://www.instagram.com/sweetooth_00"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <IoLogoInstagram className="h-6 w-6" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link
              href="https://www.facebook.com/profile.php?id=100075885886794"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <FaFacebookF className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
