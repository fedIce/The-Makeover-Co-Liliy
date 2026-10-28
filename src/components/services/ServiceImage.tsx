import Image from "next/image";

export default function ServiceImage({
  src,
  alt,
  className = "",
  objectPosition = "object-center",
  sizes = "(max-width: 1024px) 100vw, 40vw",
}: {
  src: string;
  alt: string;
  className?: string;
  objectPosition?: string;
  sizes?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover ${objectPosition}`}
        sizes={sizes}
      />
    </div>
  );
}
