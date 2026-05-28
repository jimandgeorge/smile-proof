import Image from 'next/image';

type BrandLogoProps = {
  size?: 'nav' | 'footer';
  variant?: 'light' | 'dark';
};

export default function BrandLogo({ size = 'nav', variant = 'light' }: BrandLogoProps) {
  const width = size === 'nav' ? 153 : 145;
  const height = Math.round(width * 370 / 2000);

  return (
    <Image
      src={variant === 'light' ? '/SP-Logo-Light.svg' : '/SP-Logo-Web.svg'}
      alt="SmileProof"
      width={width}
      height={height}
      priority={size === 'nav'}
      style={{ display: 'block', height: 'auto' }}
    />
  );
}
