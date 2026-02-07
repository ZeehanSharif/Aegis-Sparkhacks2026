export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-neutral-950 text-slate-200">
      {/* Noise overlay */}
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%270%200%20256%20256%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter%20id=%27n%27%3E%3CfeTurbulence%20type=%27fractalNoise%27%20baseFrequency=%270.9%27%20numOctaves=%274%27%20stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect%20width=%27100%25%27%20height=%27100%25%27%20filter=%27url(%23n)%27/%3E%3C/svg%3E')] bg-repeat bg-[length:128px_128px]" />
      {/* Vignette overlay */}
      <div className="fixed inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(5,5,5,0.7)_100%)]" />
      <div className="relative z-[2] px-6 py-6">{children}</div>
    </div>
  );
}
