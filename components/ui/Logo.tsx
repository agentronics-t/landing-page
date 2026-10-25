// The Agentronics "A": an apex with one long left leg and a crossbar that
// returns into the right leg, in red on a lime rounded square. Traced from the
// brand master (2000×2000); public/home-assets/favicon.svg is the same mark.
export const MARK_PATH = "M458 0L835 660L317 660L368 570L664 570L458 209L119 800L0 800Z";

/** The logo square alone. Colours are baked in: this is the logo, not a themed surface. */
export function Logomark({ className = "logo__mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#D4FF3A" />
      <path transform="translate(8 8.33) scale(.019162)" d={MARK_PATH} fill="#FF4D1F" />
    </svg>
  );
}

/** Mark + wordmark, the home page's `.logo`. `light` is the footer's white wordmark. */
export function Logo({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <a className={light ? "logo logo--light" : "logo"} href={href} aria-label="Agentronics home">
      <Logomark />
      <span>agentronics</span>
    </a>
  );
}
