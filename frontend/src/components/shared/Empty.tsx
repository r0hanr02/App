const Empty = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 450 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background decorative dots */}
      <circle cx="174" cy="91" r="6" className="fill-muted-foreground/20" />

      <circle cx="295" cy="80" r="5" className="fill-muted-foreground/20" />

      <circle cx="305" cy="105" r="8" className="fill-muted-foreground/20" />

      <circle cx="171" cy="176" r="7" className="fill-muted-foreground/20" />

      {/* Main back circle */}
      <circle cx="237" cy="119" r="47" className="fill-muted-foreground/15" />

      {/* Left sphere */}
      <ellipse
        cx="199"
        cy="131"
        rx="29"
        ry="29"
        className="fill-muted-foreground/25"
      />

      {/* Top sphere */}
      <ellipse
        cx="236"
        cy="113"
        rx="37"
        ry="40"
        className="fill-muted-foreground/20"
      />

      {/* Right sphere */}
      <ellipse
        cx="270"
        cy="135"
        rx="31"
        ry="32"
        className="fill-muted-foreground/25"
      />

      {/* Center search button */}
      <circle cx="236" cy="161" r="29" className="fill-foreground/20" />

      {/* Search icon */}
      <circle
        cx="235"
        cy="159"
        r="10"
        className="stroke-background"
        strokeWidth="2.5"
      />

      <path
        d="M243 167L250 174"
        className="stroke-background"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Empty;
