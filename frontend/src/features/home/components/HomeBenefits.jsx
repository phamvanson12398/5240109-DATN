import React from "react";
import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const BENEFIT_ICONS = {
  truck: Truck,
  shield: ShieldCheck,
  return: RotateCcw,
  support: Headphones,
};

function HomeBenefits({ benefits = [] }) {
  return (
    <section className="bg-[#FAFAFA] pb-10" aria-label="Lợi ích dịch vụ">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <div className="grid overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_12px_30px_rgba(17,24,39,0.04)] sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = BENEFIT_ICONS[benefit.icon] || ShieldCheck;

            return (
              <article
                key={benefit.id}
                className="flex items-start gap-4 border-b border-[#E5E7EB] p-5 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAFAFA] text-[#111827]">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#111827]">{benefit.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[#6B7280]">{benefit.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default React.memo(HomeBenefits);
