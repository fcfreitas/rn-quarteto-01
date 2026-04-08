/**
 * Silhueta estilizada da Ilha de Florianópolis (SC).
 * Elemento decorativo de fundo no header — monochromático, opacidade ~0.15.
 * O SVG é uma aproximação do contorno da ilha com as principais lagoas.
 */
export default function FlorianopolisSilhouette() {
  return (
    <svg
      viewBox="0 0 340 520"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      style={{ opacity: 0.13 }}
    >
      {/* Contorno principal da Ilha */}
      <path
        d="
          M170 10
          C190 12, 210 20, 225 35
          C245 55, 255 80, 260 105
          C268 130, 272 155, 275 180
          C280 210, 278 240, 272 265
          C265 295, 252 320, 238 342
          C222 368, 205 390, 192 415
          C183 432, 178 450, 175 468
          C173 480, 172 490, 170 500
          C168 490, 167 480, 165 468
          C162 450, 157 432, 148 415
          C135 390, 118 368, 102 342
          C88 320, 75 295, 68 265
          C62 240, 60 210, 65 180
          C68 155, 72 130, 80 105
          C85 80, 95 55, 115 35
          C130 20, 150 12, 170 10Z
        "
        fill="#8B35CC"
      />
      {/* Lagoa da Conceição (leste central) */}
      <ellipse cx="215" cy="280" rx="18" ry="38" fill="#1A0A2E" transform="rotate(-15 215 280)" />
      {/* Lagoa do Peri (sul) */}
      <ellipse cx="185" cy="400" rx="12" ry="18" fill="#1A0A2E" transform="rotate(-5 185 400)" />
      {/* Lagoa do Rio Tavares (centro-sul) */}
      <ellipse cx="172" cy="345" rx="9" ry="14" fill="#1A0A2E" />
      {/* Ponta Norte (Ponta das Canas / Jurerê) */}
      <path
        d="M155 42 C148 28, 138 18, 130 12 C122 6, 118 8, 122 18 C126 28, 138 38, 145 50Z"
        fill="#6B28A8"
      />
      {/* Lagoa Pequena (norte) */}
      <ellipse cx="160" cy="95" rx="7" ry="11" fill="#1A0A2E" transform="rotate(10 160 95)" />
    </svg>
  )
}
