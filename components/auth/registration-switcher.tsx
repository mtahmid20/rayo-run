"use client";

import { useState } from "react";

import { AthleteForm } from "@/components/auth/athlete-form";
import { ParticipantForm } from "@/components/auth/participant-form";

const options = [
  {
    id: "athlete",
    label: "Athlete",
    title: "Athlete application",
    description:
      "For individual runners, cyclists, and endurance athletes applying to the ambassador program.",
  },
  {
    id: "club",
    label: "Club",
    title: "Club application",
    description:
      "For crews and run clubs applying to bring Rayo into their activations and community.",
  },
] as const;

type RegistrationOption = (typeof options)[number]["id"];

export function RegistrationSwitcher() {
  const [active, setActive] = useState<RegistrationOption>("athlete");
  const activeOption = options.find((option) => option.id === active) ?? options[0];

  return (
    <div>
      <div className="mb-6 flex gap-2 rounded-md bg-[var(--black-3)] p-1">
        {options.map((option) => {
          const isActive = option.id === active;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setActive(option.id)}
              className={
                isActive
                  ? "flex-1 rounded-md bg-[var(--yellow)] px-4 py-3 text-sm font-medium text-black"
                  : "flex-1 rounded-md px-4 py-3 text-sm text-[var(--muted-2)] transition hover:text-[var(--white)]"
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mb-6">
        <h3 className="font-display text-4xl tracking-[0.03em] text-[var(--white)]">
          {activeOption.title}
        </h3>
        <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--muted-2)]">
          {activeOption.description}
        </p>
      </div>

      {active === "athlete" ? <AthleteForm /> : <ParticipantForm />}
    </div>
  );
}
