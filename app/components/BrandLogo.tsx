import Image from 'next/image';

type BrandLogoProps = {
  size?: 'nav' | 'footer';
};

export default function BrandLogo({ size = 'nav' }: BrandLogoProps) {
  const width = size === 'nav' ? 170 : 145;
  const height = Math.round(width * 370 / 2000);

  return (
    <Image
      src="/SP-Logo-Web.svg"
      alt="SmileProof"
      width={width}
      height={height}
      priority={size === 'nav'}
      style={{
        display: 'block',
        height: 'auto',
      }}
    />
  );
}
