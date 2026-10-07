import Image from "next/image";

/** Credito de autoria. El JPG tiene fondo negro: mix-blend-screen lo integra sobre el fondo oscuro. */
export function VluxCredit() {
  return (
    <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-steel-500/80">
      <Image
        src="/brand/vlux/app-icon-neon-con-vlux.jpg"
        alt="VLUX"
        width={512}
        height={640}
        className="h-9 w-auto opacity-80 mix-blend-screen"
      />
      <span>Desarrollado por VLUX</span>
    </p>
  );
}
