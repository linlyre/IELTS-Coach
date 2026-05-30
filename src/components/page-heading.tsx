import type { ReactNode } from "react";

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <h1 className="font-serif text-4xl font-semibold leading-tight text-[#123D24] sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 text-base leading-7 text-[#5F6B61]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
