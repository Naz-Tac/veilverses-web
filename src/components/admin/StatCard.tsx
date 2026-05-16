type StatCardProps = {
  label: string;
  value: string;
  subtitle: string;
};

export function StatCard({ label, value, subtitle }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-[#d8c18a] bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.16em] text-[#8d7434]">{label}</p>
      <p className="mt-2 font-serif text-3xl text-[#171717]">{value}</p>
      <p className="mt-2 text-sm text-[#575757]">{subtitle}</p>
    </article>
  );
}
